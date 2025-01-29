<template>
    <div v-html="dependencyGraphSvg" class="dependencyGraph" />
</template>

<script setup>
import {computedAsync} from "@vueuse/core";
import {renderMarkdown} from "@/markdown.js";

const props = defineProps({
    issue: {
        type: Object
    },
    issueLinkTypes: {
        type: Array
    },
    issueLinks: {
        type: Array
    },
    allIssues: {
        type: Array
    }
});

const dependencyGraphSvg = computedAsync(async () => {
    // Can only be computed, if all needed data is present
    if (props.issue === null || props.issueLinkTypes === null || props.issueLinks === null || props.allIssues === null) {
        return null;
    }

    // Build mermaid source
    //
    // Implementation note:
    // In Mermaid it's no error to define a node twice (only the last definition is taken). We use that for now.

    let dependencyGraphMermaid = 'flowchart LR\n';

    const escapeMermaid = str => str
        .replaceAll('&', '&amp;') // HTML entities
        .replaceAll('"', '&quot;') // " delimits the node's caption
        .replaceAll('#', '#35;'); // # is the Mermaid escaper, see https://mermaid.js.org/syntax/flowchart.html#special-characters-that-break-syntax

    dependencyGraphMermaid += '  ' + props.issue.issueKey + '["' + props.issue.issueKey + ':\n' + escapeMermaid(props.issue.title) + '"]\n';
    dependencyGraphMermaid += '  style ' + props.issue.issueKey + ' stroke: #00ff00, fill: #0f1f0f\n';

    let edgeIndex = 0;
    for (let issueLink of props.issueLinks) {
        const issue1 = props.allIssues.find(it => it.id === issueLink.issue1Id);
        const issue2 = props.allIssues.find(it => it.id === issueLink.issue2Id);

        dependencyGraphMermaid += '  ' + issue1.issueKey + '["<small>' + issue1.issueKey + '</small>\n' + escapeMermaid(issue1.title) + '"]\n';
        dependencyGraphMermaid += '  ' + issue2.issueKey + '["<small>' + issue2.issueKey + '</small>\n' + escapeMermaid(issue2.title) + '"]\n';

        const issueLinkType = props.issueLinkTypes.find(it => it.id === issueLink.issueLinkTypeId);

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
