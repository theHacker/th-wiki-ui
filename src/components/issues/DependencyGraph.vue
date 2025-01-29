<template>
    <div>
        <Loading v-if="issueLinkTypes === null || involvedIssues === null|| involvedIssueLinks === null" />
        <div v-html="dependencyGraphSvg" class="dependencyGraph text-center" />
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
        .get(`/issue-link-types`)
        .then(response => {
            issueLinkTypes.value = response.data;
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
        const issueLinksOnThisLevel = [];
        const issueLinkRequests = issueIdsToLoad
            .map(issueId => axios.get(`/issue-links?issueId=${issueId}`)); // TODO load in one request -> API only allows to fetch one at a time for now

        const issueLinkResponses = await Promise.all(issueLinkRequests)
        for (let response of issueLinkResponses) {
            issueLinksOnThisLevel.push(...response.data); // issueLinksOnThisLevel may contain duplicates!
        }

        issueIdsToLoad = [];
        for (let issueLink of issueLinksOnThisLevel) {
            // Remember to load the issue later (issueIdsToFetch is a Set, so we don't need to check for duplicates)
            issueIdsToFetch.add(issueLink.issue1Id);
            issueIdsToFetch.add(issueLink.issue2Id);

            // Add links (filter out duplicates)
            if (!issueLinkIdsAlreadyProcessed.has(issueLink.id)) {
                issueLinks.push(issueLink);
                issueLinkIdsAlreadyProcessed.add(issueLink.id);
            }

            // Take the next issues and use them to fetch their links on the next level
            // Don't load an already processed one again!
            if (!issueIdsAlreadyProcessed.has(issueLink.issue1Id)) {
                issueIdsToLoad.push(issueLink.issue1Id);
                issueIdsAlreadyProcessed.add(issueLink.issue1Id);
            }
            if (!issueIdsAlreadyProcessed.has(issueLink.issue2Id)) {
                issueIdsToLoad.push(issueLink.issue2Id);
                issueIdsAlreadyProcessed.add(issueLink.issue2Id);
            }
        }
    }
    involvedIssueLinks.value = issueLinks;

    // Load issues involved
    const issueRequests = issueIdsToFetch
        .values()
        .map(issueId => axios.get(`/issues/${issueId}`)); // TODO load in one request, only fetch fields=id,issueKey,title -> API only allows to fetch one at a time for now, no field selection

    const issueResponses = await Promise.all(issueRequests);

    const issues = {};
    for (let response of issueResponses) {
        issues[response.data.id] = response.data;
    }
    involvedIssues.value = issues;
}

function escapeMermaid(str) {
    return str
        .replaceAll('&', '&amp;') // HTML entities
        .replaceAll('"', '&quot;') // " delimits the node's caption
        .replaceAll('#', '#35;'); // # is the Mermaid escaper, see https://mermaid.js.org/syntax/flowchart.html#special-characters-that-break-syntax
}

const dependencyGraphSvg = computedAsync(async () => {
    // Can only be computed, if all needed data is present
    if (issueLinkTypes === null || involvedIssues === null|| involvedIssueLinks === null) {
        return null;
    }

    const thisIssue = involvedIssues.value[props.issueId];

    // Build mermaid source
    //
    // Implementation note:
    // In Mermaid it's no error to define a node twice (only the last definition is taken). We use that for now.

    let dependencyGraphMermaid = 'flowchart LR\n';

    const nodes = new Set(); // remember which nodes are already in the Mermaid source

    function addIssueNode(issue) {
        if (nodes.has(issue.issueKey)) return;

        dependencyGraphMermaid += '  ' + issue.issueKey + '["<small>' + issue.issueKey + '</small>\n' + escapeMermaid(issue.title) + '"]\n';
        nodes.add(issue.issueKey);
    }

    addIssueNode(thisIssue)
    dependencyGraphMermaid += '  style ' + thisIssue.issueKey + ' stroke: #00ff00, fill: #0f1f0f\n';

    let edgeIndex = 0;
    for (let issueLink of involvedIssueLinks.value) {
        const issue1 = involvedIssues.value[issueLink.issue1Id];
        const issue2 = involvedIssues.value[issueLink.issue2Id];

        addIssueNode(issue1);
        addIssueNode(issue2);

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
