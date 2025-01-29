<template>
    <div>
        <Loading v-if="issueLinkTypes === null || involvedIssues === null" />
        <div v-html="dependencyGraphSvg" class="dependencyGraph" />
    </div>
</template>

<script setup>
import Loading from "@/components/Loading.vue";
import {computedAsync} from "@vueuse/core";
import {renderMarkdown} from "@/markdown.js";
import {onMounted, ref, watch} from "vue";
import axios from "@/axios.js";

const props = defineProps({
    issueId: {
        type: String,
        required: true
    }
});

const issueLinkTypes = ref(null);
const issueLinks = ref(null);
const involvedIssues = ref(null);

watch(() => props.issueId, fetchData, { immediate: true });

onMounted(() => {
    axios
        .get(`/issue-link-types`)
        .then(response => {
            issueLinkTypes.value = response.data;
        });
});

async function fetchData() {
    issueLinks.value = null;
    involvedIssues.value = null;

    // Load links
    const issueLinksResponse = await axios.get(`/issue-links?issueId=${props.issueId}`);
    issueLinks.value = issueLinksResponse.data;

    // What issues to load?
    const issueIdsToFetch = new Set();
    issueIdsToFetch.add(props.issueId);

    for (let issueLink of issueLinks.value) {
        issueIdsToFetch.add(issueLink.issue1Id);
        issueIdsToFetch.add(issueLink.issue2Id);
    }

    // Load issues involved
    // TODO load in one request -> API only allows to fetch one at a time for now
    const issueRequests = issueIdsToFetch
        .values()
        .map(issueId => axios.get(`/issues/${issueId}?fields=id,issueKey,title`));

    Promise
        .all(issueRequests)
        .then(responses => {
            const issues = {};
            for (let response of responses) {
                issues[response.data.id] = response.data;
            }

            involvedIssues.value = issues;
        });
}

function escapeMermaid(str) {
    return str
        .replaceAll('&', '&amp;') // HTML entities
        .replaceAll('"', '&quot;') // " delimits the node's caption
        .replaceAll('#', '#35;'); // # is the Mermaid escaper, see https://mermaid.js.org/syntax/flowchart.html#special-characters-that-break-syntax
}

const dependencyGraphSvg = computedAsync(async () => {
    // Can only be computed, if all needed data is present
    if (involvedIssues.value === null || issueLinkTypes.value === null) {
        return null;
    }

    const issue = involvedIssues.value[props.issueId];

    // Build mermaid source
    //
    // Implementation note:
    // In Mermaid it's no error to define a node twice (only the last definition is taken). We use that for now.

    let dependencyGraphMermaid = 'flowchart LR\n';

    dependencyGraphMermaid += '  ' + issue.issueKey + '["<small>' + issue.issueKey + '</small>\n' + escapeMermaid(issue.title) + '"]\n';
    dependencyGraphMermaid += '  style ' + issue.issueKey + ' stroke: #00ff00, fill: #0f1f0f\n';

    let edgeIndex = 0;
    for (let issueLink of issueLinks.value) {
        const issue1 = involvedIssues.value[issueLink.issue1Id];
        const issue2 = involvedIssues.value[issueLink.issue2Id];

        dependencyGraphMermaid += '  ' + issue1.issueKey + '["<small>' + issue1.issueKey + '</small>\n' + escapeMermaid(issue1.title) + '"]\n';
        dependencyGraphMermaid += '  ' + issue2.issueKey + '["<small>' + issue2.issueKey + '</small>\n' + escapeMermaid(issue2.title) + '"]\n';

        const issueLinkType = issueLinkTypes.value.find(it => it.id === issueLink.issueLinkTypeId);

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
