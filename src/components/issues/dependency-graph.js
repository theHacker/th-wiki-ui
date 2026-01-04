/**
 * Generates the issue dependency graph in form of source code for a Mermaid chart.
 *
 * @param {string} centeredIssueId centered issue's ID
 * @param {Object.<string, *>} issues issues to plot, key is the issue.id
 * @param {Array<*>} issueLinks issue links to plot
 * @param {Array<*>} issueLinkTypes all issue link types
 * @param {Boolean} pruneDoneIssues whether to prune issues that are done
 * @returns {string} Mermaid source code
 */
function generateDependencyGraphMermaid(centeredIssueId, issues, issueLinks, issueLinkTypes, pruneDoneIssues) {
    if (pruneDoneIssues) {
        const result = pruneDone(centeredIssueId, issues, issueLinks);

        issues = result.issues;
        issueLinks = result.issueLinks;
    }

    const centeredIssue = issues[centeredIssueId];

    let mermaidSource = 'flowchart LR\n';

    const nodes = new Set(); // remember which nodes are already in the Mermaid source

    function addIssueNode(issue, colorize) {
        if (nodes.has(issue.issueKey)) return;

        let title = escapeMermaid(issue.title);
        if (issue.issueStatus.doneStatus) {
            title = `<s>${title}</s>`;
        }

        mermaidSource += '  ' + issue.issueKey + '["<small>' + issue.issueKey + '</small>\n' + title + '"]\n';
        nodes.add(issue.issueKey);

        if (colorize) {
            const defaultColor = '#ccc'; // Mermaid's default color

            let fillColor = bootstrapColorToRGBColor(issue.issueType.iconColor) || defaultColor;
            fillColor = darkenColor(fillColor, .75);

            let strokeColor =
                (issue.issuePriority.showIconInList ? bootstrapColorToRGBColor(issue.issuePriority.iconColor) : null)
                || defaultColor;

            mermaidSource += `  style ${issue.issueKey} stroke: ${strokeColor}, fill: ${fillColor}` + '\n';
        }
    }

    addIssueNode(centeredIssue, false)
    mermaidSource += '  style ' + centeredIssue.issueKey + ' stroke: #00ff00, fill: #0f1f0f\n';

    let edgeIndex = 0;
    for (let issueLink of issueLinks) {
        const issue1 = issues[issueLink.issue1.id];
        const issue2 = issues[issueLink.issue2.id];

        addIssueNode(issue1, true);
        addIssueNode(issue2, true);

        const issueLinkType = issueLinkTypes.find(it => it.id === issueLink.issueLinkType.id);

        let linkStyle, linkColor;
        if (issueLinkType.type === 'subtask') {
            linkStyle = '-- is subtask for -->';
            linkColor = 'limegreen';
        } else if (issueLinkType.type === 'blocker') {
            linkStyle = '-- blocks -->';
            linkColor = 'crimson';
        } else if (issueLinkType.type === 'cause') {
            linkStyle = '-- causes -->';
            linkColor = 'yellow';
        } else if (issueLinkType.type === 'relates') {
            // linkStyle = '.. relates to ..';
            linkStyle = '<-. relates to .->'; // without arrows on both sides does not work (Mermaid bug?)
            linkColor = 'aqua';
        } else if (issueLinkType.type === 'duplicate') {
            linkStyle = '-. duplicates .->';
            linkColor = 'violet';
        }

        mermaidSource += `  ${issue1.issueKey} ${linkStyle} ${issue2.issueKey}` + '\n';
        mermaidSource += `  linkStyle ${edgeIndex++} stroke: ${linkColor}, color: ${linkColor}` + '\n';
    }

    return mermaidSource;
}

/**
 * Prunes all issues that are marked done.
 * That can result in whole sub-trees pruned.
 *
 * @param {string} centeredIssueId centered issue's ID (that issue will never be pruned)
 * @param {Object.<string, *>} issues issues to plot, key is the issue.id
 * @param {Array<*>} issueLinks issue links to plot
 * @returns {{issues: *, issueLinks: *}} pruned versions of input parameters
 */
function pruneDone(centeredIssueId, issues, issueLinks) {
    // Gather edges per node in the graph, i.e. the issueLinks for each issue

    const edges = new Map(); // issueId => Set(issueIds linked)
    for (const issueId in issues) {
        edges.set(issueId, new Set());
    }

    for (let issueLink of issueLinks) {
        edges.get(issueLink.issue1.id).add(issueLink.issue2.id);
        edges.get(issueLink.issue2.id).add(issueLink.issue1.id);
    }

    const graph = {
        neighbors(n) {
            return edges.get(n);
        },
    };

    // Algorithm:
    // Let C be the "centered" node.
    // Find all paths (P_1...P_n) from I to C.
    // A node X (!= C) can be pruned from the graph if
    //   - it's done AND
    //   - in ALL found paths P containing X (with P_x = X) have P_i (i in [1, x[) done.
    //
    // The last conditions can be merged as X is on position P_x in the path to:
    // A node X (!= C) can be pruned from the graph if
    //   - in ALL found paths P containing X (with P_x = X) have P_i (i in [1, x]) done.

    // Can be useful to enable debug logs for the algorithm
    function debug(...args) {
        if (false) { // eslint-disable-line no-constant-condition
            console.debug(...args);
        }
    }

    const issueIdsToKeep = new Set();
    issueIdsToKeep.add(centeredIssueId); // Never cut the centered issue

    debug("***************** DEBUG *******************");

    const allPathsByIssueId = new Map(); // issueId => array of paths containing this issueId
    for (const issueId in issues) {
        allPathsByIssueId.set(issueId, []);
    }

    for (const issueId in issues) {
        const paths = findAllPathsInGraph(graph, issueId, centeredIssueId);
        debug(`Paths from ${issueId} to ${centeredIssueId}: ${JSON.stringify(paths)}`);

        for (const path of paths) {
            for (const pathNode of path) {
                allPathsByIssueId.get(pathNode).push(path);
            }
        }
    }

    debug(`allPathsByIssueId = `, allPathsByIssueId);

    for (const issueId in issues) {
        // Check all paths where (issueId) is part of:
        // Are ALL the nodes before+including this issueId (except centered node) in ALL these paths done?
        // If so, this node can be pruned.

        let allPrefixPathsFullyDone = true;
        outer: for (const path of allPathsByIssueId.get(issueId)) {
            for (const pathNode of path) {
                // Ignore centered node, we are finished with this path. All paths lead to centered node as end.
                if (pathNode === centeredIssueId) {
                    break;
                }

                // Found a non-done issue in the path. Then we cannot prune issueId.
                if (!issues[pathNode].issueStatus.doneStatus) {
                    allPrefixPathsFullyDone = false;
                    debug(`Path ${JSON.stringify(path)} contains not-done pathNode ${pathNode}. Cannot prune ${issueId}.`);
                    break outer;
                }

                // Reached issueId in the path (and it was done also).
                // Then this path was fully done up to issueId.
                if (pathNode === issueId) {
                    break;
                }
            }
        }

        if (!allPrefixPathsFullyDone) {
            issueIdsToKeep.add(issueId);
            debug(`Keeping node ${issueId}`);
        }
    }

    debug('RESULT: issueIdsToKeep = ', issueIdsToKeep);
    debug('RESULT: issueIdsToPrune = ', new Set(Object.keys(issues)).difference(issueIdsToKeep));
    debug("***************** /DEBUG ******************");

    // Prune nodes and edges

    return {
        issues: Object.fromEntries(Object.entries(issues).filter(([issueId, _issue]) =>
            issueIdsToKeep.has(issueId)
        )),
        issueLinks: issueLinks.filter(issueLink =>
            issueIdsToKeep.has(issueLink.issue1.id) && issueIdsToKeep.has(issueLink.issue2.id)
        )
    };
}

/**
 * Generic DFS (depth-first search) with strings as nodes.
 * Searches all paths from a start to an end node.
 *
 * @param {{neighbors: (node: string) => Set<string>}} graph - graph with edge function
 * @param {string} start - start node
 * @param {string} end - end node
 * @returns {string[][]} all possible paths from start to end
 */
export function findAllPathsInGraph(graph, start, end) {
    const paths = [];

    function dfs(node, path, visited) {
        if (node === end) {
            paths.push(path);
            return;
        }

        for (const neighbor of graph.neighbors(node)) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                const newPath = [...path, neighbor];
                dfs(neighbor, newPath, new Set(visited));
                visited.delete(neighbor);
            }
        }
    }

    dfs(start, [start], new Set([start]))
    return paths;
}

function escapeMermaid(str) {
    return str
        .replaceAll('&', '&amp;') // HTML entities
        .replaceAll('"', '&quot;') // " delimits the node's caption
        .replaceAll('#', '#35;'); // # is the Mermaid escaper, see https://mermaid.js.org/syntax/flowchart.html#special-characters-that-break-syntax
}

/**
 * Translate Bootstrap colors to CSS colors for use in SVG.
 *
 * This is a hard-coded list for now. Needs to be improved,
 * when user can administer the issue types (with their icon and their color).
 *
 * @param {string} bootstrapColor Bootstrap CSS class for the color
 * @returns {null|string} color in format `#rrggbb` or `null` when the color is unknown.
 */
function bootstrapColorToRGBColor(bootstrapColor) {
    if (bootstrapColor === 'danger-emphasis') {
        return '#ea868f';
    } else if (bootstrapColor === 'danger') {
        return '#dc3545';
    } else if (bootstrapColor === 'success-emphasis') {
        return '#75b798';
    } else if (bootstrapColor === 'success') {
        return '#198754';
    } else if (bootstrapColor === 'info-emphasis') {
        return '#6edff6';
    } else if (bootstrapColor === 'info') {
        return '#0dcaf0';
    } else if (bootstrapColor === 'warning-emphasis') {
        return '#ffda6a';
    } else if (bootstrapColor === 'warning') {
        return '#ffc107';
    }

    return null;
}

/**
 * Darken a color by a certain amount
 *
 * @param {string} color color in format `#rrggbb`
 * @param {number} amount amount to darken the color in range 0 to 1,
 *                        where 0 means "no change", 1 means "darken all to black"
 * @returns {string} color in format `#rrggbb`
 */
function darkenColor(color, amount) {
    let r = parseInt(color.substring(1, 3), 16);
    let g = parseInt(color.substring(3, 5), 16);
    let b = parseInt(color.substring(5, 7), 16);

    const factor = 1 - amount;
    r = coerceIn(Math.round(r * factor), 0, 255);
    g = coerceIn(Math.round(g * factor), 0, 255);
    b = coerceIn(Math.round(b * factor), 0, 255);

    return '#' + r.toString(16).padStart(2, '0') + g.toString(16).padStart(2, '0') + b.toString(16).padStart(2, '0');
}

function coerceIn(value, min, max) {
    if (value < min) {
        return min;
    } else if (value > max) {
        return max;
    } else {
        return value;
    }
}

export { generateDependencyGraphMermaid };
