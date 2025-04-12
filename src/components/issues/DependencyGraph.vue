<template>
    <div>
        <LoadingIndicator v-if="issueLinkTypes === null || involvedIssues === null|| involvedIssueLinks === null" />
        <div v-html="dependencyGraphSvg" class="dependencyGraph text-center" />
    </div>
</template>

<script setup>
import LoadingIndicator from "@/components/LoadingIndicator.vue";
import {computedAsync} from "@vueuse/core";
import {renderMarkdown} from "@/markdown";
import {onMounted, ref, watch} from "vue";
import axios from "@/axios.js";

const props = defineProps({
    issueId: {
        type: String,
        required: true
    },
    depth: {
        type: Number,
        default: 1
    }
});

const issueLinkTypes = ref(null);
const involvedIssues = ref(null);
const involvedIssueLinks = ref(null);

watch(
    [() => props.issueId, () => props.depth],
    fetchData,
    { immediate: true }
);

onMounted(() => {
    axios
        .graphql(`
            query IssueLinkTypesForDependencyGraph {
                issueLinkTypes {
                    id
                    type
                    wording
                    wordingInverse
                }
            }
        `)
        .then(data => {
            issueLinkTypes.value = data.issueLinkTypes;
        });
});

async function fetchData() {
    involvedIssues.value = null;
    involvedIssueLinks.value = null;

    const issueIdsToFetch = new Set();
    issueIdsToFetch.add(props.issueId);

    // Load links involved, if requested over multiple levels
    const issueLinks = [];

    // Remember what issueId (nodes) and issueLinkIds (edges) we already added
    const issueIdsAlreadyProcessed = new Set();
    const issueLinkIdsAlreadyProcessed = new Set();

    let issueIdsToLoad = [props.issueId];
    for (let level = 1; level <= props.depth; level++) {
        // issueLinksOnThisLevel may contain duplicates!
        const issueLinksOnThisLevel = await axios
            .graphql(
                `
                    query IssuesAndLinksForDependencyGraph($issueIds: [ID!]!) {
                        issues(ids: $issueIds) {
                            issueLinks {
                                id
                                issue1 {
                                    id
                                }
                                issue2 {
                                    id
                                }
                                issueLinkType {
                                    id
                                }
                            }
                        }
                    }
                `,
                { issueIds: issueIdsToLoad }
            )
            .then(data => data.issues.flatMap(issue => issue.issueLinks));

        issueIdsToLoad = [];
        for (let issueLink of issueLinksOnThisLevel) {
            // Remember to load the issue later (issueIdsToFetch is a Set, so we don't need to check for duplicates)
            issueIdsToFetch.add(issueLink.issue1.id);
            issueIdsToFetch.add(issueLink.issue2.id);

            // Add links (filter out duplicates)
            if (!issueLinkIdsAlreadyProcessed.has(issueLink.id)) {
                issueLinks.push(issueLink);
                issueLinkIdsAlreadyProcessed.add(issueLink.id);
            }

            // Take the next issues and use them to fetch their links on the next level
            // Don't load an already processed one again!
            if (!issueIdsAlreadyProcessed.has(issueLink.issue1.id)) {
                issueIdsToLoad.push(issueLink.issue1.id);
                issueIdsAlreadyProcessed.add(issueLink.issue1.id);
            }
            if (!issueIdsAlreadyProcessed.has(issueLink.issue2.id)) {
                issueIdsToLoad.push(issueLink.issue2.id);
                issueIdsAlreadyProcessed.add(issueLink.issue2.id);
            }
        }
    }
    involvedIssueLinks.value = issueLinks;

    // Load issues involved
    involvedIssues.value = await axios
        .graphql(
            `
                query IssuesForDependencyGraph($issueIds: [ID!]!) {
                    issues(ids: $issueIds) {
                        id
                        issueNumber # TODO issueKey
                        project {
                            prefix
                        }
                        issueType {
                            iconColor
                        }
                        issuePriority {
                            iconColor
                            showIconInList
                        }
                        issueStatus {
                            doneStatus
                        }
                        title
                    }
                }
            `,
            { issueIds: [...issueIdsToFetch] }
        )
        .then(data => {
            const issues = {};
            for (let issue of data.issues) {
                issue.issueKey = `${issue.project.prefix}-${issue.issueNumber}`;
                issues[issue.id] = issue;
            }

            return issues;
        });
}

function escapeMermaid(str) {
    return str
        .replaceAll('&', '&amp;') // HTML entities
        .replaceAll('"', '&quot;') // " delimits the node's caption
        .replaceAll('#', '#35;'); // # is the Mermaid escaper, see https://mermaid.js.org/syntax/flowchart.html#special-characters-that-break-syntax
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

const dependencyGraphSvg = computedAsync(async () => {
    // Can only be computed, if all needed data is present
    if (issueLinkTypes.value === null || involvedIssues.value === null|| involvedIssueLinks.value === null) {
        return null;
    }

    const thisIssue = involvedIssues.value[props.issueId];

    // Build mermaid source
    //
    // Implementation note:
    // In Mermaid it's no error to define a node twice (only the last definition is taken). We use that for now.

    let dependencyGraphMermaid = 'flowchart LR\n';

    const nodes = new Set(); // remember which nodes are already in the Mermaid source

    function addIssueNode(issue, colorize) {
        if (nodes.has(issue.issueKey)) return;

        let title = escapeMermaid(issue.title);
        if (issue.issueStatus.doneStatus) {
            title = `<s>${title}</s>`;
        }

        dependencyGraphMermaid += '  ' + issue.issueKey + '["<small>' + issue.issueKey + '</small>\n' + title + '"]\n';
        nodes.add(issue.issueKey);

        if (colorize) {
            const defaultColor = '#ccc'; // Mermaid's default color

            let fillColor = bootstrapColorToRGBColor(issue.issueType.iconColor) || defaultColor;
            fillColor = darkenColor(fillColor, .75);

            let strokeColor =
                (issue.issuePriority.showIconInList ? bootstrapColorToRGBColor(issue.issuePriority.iconColor) : null)
                || defaultColor;

            dependencyGraphMermaid += `  style ${issue.issueKey} stroke: ${strokeColor}, fill: ${fillColor}` + '\n';
        }
    }

    addIssueNode(thisIssue, false)
    dependencyGraphMermaid += '  style ' + thisIssue.issueKey + ' stroke: #00ff00, fill: #0f1f0f\n';

    let edgeIndex = 0;
    for (let issueLink of involvedIssueLinks.value) {
        const issue1 = involvedIssues.value[issueLink.issue1.id];
        const issue2 = involvedIssues.value[issueLink.issue2.id];

        addIssueNode(issue1, true);
        addIssueNode(issue2, true);

        const issueLinkType = issueLinkTypes.value.find(it => it.id === issueLink.issueLinkType.id);

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

        dependencyGraphMermaid += `  ${issue1.issueKey} ${linkStyle} ${issue2.issueKey}` + '\n';
        dependencyGraphMermaid += `  linkStyle ${edgeIndex++} stroke: ${linkColor}, color: ${linkColor}` + '\n';
    }

    const dependencyGraphMarkdown = '```mermaid\n' + dependencyGraphMermaid + '\n```';
    return await renderMarkdown(dependencyGraphMarkdown);
});
</script>

<style lang="scss">
// <svg> does not work scoped
.dependencyGraph svg {
    .nodeLabel {
        // Make issue key a little less prominent
        small {
            font-size: 0.7em;
            opacity: .5;
        }

        p {
            text-align: left; // issue key to the left, the title is centered anyway
            line-height: 1.1; // Mermaid does 1.5 hardcoded, we move issue key and title closer together
        }
    }

    .labelBkg {
        // Disable background, .edgeLabel also has a background
        background: none !important; // needs "!important" to override Mermaid's #id selector

        .edgeLabel,
        .edgeLabel p {
            background-color: hsla(0, 0%, 34.4117647059%, .1) !important; // needs "!important" to override Mermaid's #id selector
            font-size: 0.9em;
        }
    }
}
</style>
