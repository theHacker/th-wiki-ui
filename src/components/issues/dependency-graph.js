/**
 * Generates the issue dependency graph in form of source code for a Mermaid chart.
 *
 * @param {string} centeredIssueId centered issue's ID
 * @param {Object.<string, *>} issues issues to plot, key is the issue.id
 * @param {Array<*>} issueLinks issue links to plot
 * @param {Array<*>} issueLinkTypes all issue link types
 * @returns {string} Mermaid source code
 */
function generateDependencyGraphMermaid(centeredIssueId, issues, issueLinks, issueLinkTypes) {
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
