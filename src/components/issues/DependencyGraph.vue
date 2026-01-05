<template>
    <div>
        <LoadingIndicator v-if="issueLinkTypes === null || involvedIssues === null|| involvedIssueLinks === null" />
        <div v-html="dependencyGraphSvg" class="dependencyGraph text-center" />
    </div>
</template>

<script setup>
import LoadingIndicator from "@/components/LoadingIndicator.vue";
import {computedAsync} from "@vueuse/core";
import MarkdownRenderer from "@/markdown/rendering.js";
import {onMounted, ref, watch} from "vue";
import axios from "@/axios.js";
import {generateDependencyGraphMermaid} from "@/components/issues/dependency-graph.js";

const props = defineProps({
    issueId: {
        type: String,
        required: true
    },
    depth: {
        type: Number,
        default: 1
    },
    pruneDoneIssues: {
        type: Boolean,
        default: false
    },
    lineCurveStyle: {
        type: String,
        default: 'basis',
        validator(value, _props) {
            // see https://mermaid.js.org/syntax/flowchart.html#styling-line-curves
            return [
                'basis', 'bumpX', 'bumpY', 'cardinal', 'catmullRom', 'linear',
                'monotoneX', 'monotoneY', 'natural', 'step', 'stepAfter', 'stepBefore'
            ].includes(value);
        },
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

const markdownRenderer = new MarkdownRenderer();
markdownRenderer.enableIssueLookupByAxios(axios);

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
                        issueKey
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
                issues[issue.id] = issue;
            }

            return issues;
        });
}

const dependencyGraphSvg = computedAsync(async () => {
    // Can only be computed, if all needed data is present
    if (issueLinkTypes.value === null || involvedIssues.value === null|| involvedIssueLinks.value === null) {
        return null;
    }

    const dependencyGraphMermaid = generateDependencyGraphMermaid(
        props.issueId,
        involvedIssues.value,
        involvedIssueLinks.value,
        issueLinkTypes.value,
        props.pruneDoneIssues,
        props.lineCurveStyle
    );

    const dependencyGraphMarkdown = '```mermaid\n' + dependencyGraphMermaid + '\n```';
    return await markdownRenderer.renderPlain(dependencyGraphMarkdown);
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
