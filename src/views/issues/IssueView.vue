<template>
    <GridLayout>
        <ErrorMessage v-if="error">{{ error }}</ErrorMessage>

        <div :class="{'container-xl g-0': !fullWidth}">
            <div v-if="issue" class="row">
                <div class="col-12">
                    <h1 class="mb-0">{{ issue.title }}</h1>
                    <div class="mb-heading hstack gap-2">
                        <div>
                            <small>{{ issue.issueKey }}</small>
                        </div>
                    </div>

                    <div class="d-flex flex-wrap flex-lg-nowrap mb-4 row-gap-3">
                        <div class="flex-grow-1 me-4">
                            <div class="tabs">
                                <ul class="nav nav-tabs">
                                    <Tab
                                        icon="image"
                                        title="Description"
                                        :active="tabState === TabStates.Description"
                                        @click="tabState = TabStates.Description"
                                    />
                                    <Tab
                                        icon="file-text"
                                        title="Markdown"
                                        :active="tabState === TabStates.Markdown"
                                        @click="tabState = TabStates.Markdown"
                                    />
                                    <Tab
                                        icon="tags"
                                        title="Metadata"
                                        :active="tabState === TabStates.Metadata"
                                        @click="tabState = TabStates.Metadata"
                                    />
                                    <Tab
                                        icon="paperclip"
                                        title="Attachments"
                                        :active="tabState === TabStates.Attachments"
                                        @click="tabState = TabStates.Attachments"
                                    />
                                </ul>
                            </div>
                        </div>

                        <div class="hstack align-items-start gap-2">
                            <Button
                                class="d-none d-xl-block"
                                icon="arrows-left-right-to-line"
                                tooltip="Use full width"
                                :active="fullWidth"
                                color="light"
                                @click="fullWidth = !fullWidth"
                            />

                            <Dropdown buttonClass="btn-text-lg" icon="circle-arrow-right" title="Change status" color="success">
                                <DropdownItem
                                    v-for="issueStatus in issueStatuses"
                                    :icon="issueStatus.icon"
                                    :iconColor="issueStatus.iconColor"
                                    :title="issueStatus.title"
                                    fixedWidth
                                    :disabled="issueStatus.id === issue.issueStatusId"
                                    @click="changeIssueStatus(issue.id, issueStatus.id)"
                                />
                            </Dropdown>

                            <Button
                                class="btn-text-lg"
                                icon="pen"
                                title="Edit"
                                color="light"
                                @click="console.log('Not yet implemented.')"
                            />
                            <Button
                                class="btn-text-lg"
                                icon="trash"
                                title="Delete"
                                color="danger"
                                @click="console.log('Not yet implemented.')"
                            />
                        </div>
                    </div>
                </div>

                <div class="col-12 col-lg-9 order-1 order-lg-0">
                    <div v-if="tabState === TabStates.Description">
                        <article v-html="issue.renderedMarkdown" />
                    </div>

                    <div v-else-if="tabState === TabStates.Markdown">
                        <pre><code v-html="issue.highlightedMarkdown" class="hljs language-markdown" /></pre>
                    </div>

                    <div v-else-if="tabState === TabStates.Metadata">
                        <div class="row g-2">
                            <div class="col-12 col-md-6">
                                <div class="icon-link">
                                    <i class="fas fa-clock" />
                                    Creation Time
                                </div>
                                <div>{{ new Date(issue.creationTime).toLocaleString() }}</div>
                            </div>
                            <div class="col-12 col-md-6">
                                <div class="icon-link">
                                    <i class="fas fa-clock" />
                                    Modification Time
                                </div>
                                <div>{{ new Date(issue.modificationTime).toLocaleString() }}</div>
                            </div>
                        </div>
                    </div>

                    <div v-else-if="tabState === TabStates.Attachments">
                        <p>TODO</p>
                    </div>
                </div>

                <div class="col-12 col-lg-3 order-0 order-lg-1 mb-3 mb-lg-0">
                    <div class="card">
                        <div class="card-header text-bg-info">
                            <i class="fas fa-circle-info pe-1" />
                            Fields
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-6 mb-2">
                                    <div><b>Key</b></div>

                                    <div>{{ issue.issueKey }}</div>
                                </div>

                                <div class="col-6 mb-2">
                                    <div><b>Project</b></div>

                                    <div :title="issue.project.description">
                                        {{ issue.project.title }}
                                    </div>
                                </div>

                                <div class="col-6 mb-2">
                                    <div><b>Type</b></div>

                                    <div class="icon-link">
                                        <component :is="renderIcon(issueTypes, it => issue.issueTypeId === it.id )" />
                                        {{ issue.issueType.title }}
                                    </div>
                                </div>

                                <div class="col-6 mb-2">
                                    <div><b>Status</b></div>

                                    <div class="icon-link">
                                        <component :is="renderIcon(issueStatuses, it => issue.issueStatusId === it.id )" />
                                        <span :title="issue.issueStatus.description">
                                            {{ issue.issueStatus.title }}
                                        </span>
                                    </div>
                                </div>

                                <div class="col-6 mb-2">
                                    <div><b>Priority</b></div>

                                    <div class="icon-link">
                                        <component :is="renderIcon(issuePriorities, it => issue.issuePriorityId === it.id )" />
                                        {{ issue.issuePriority.title }}
                                    </div>
                                </div>

                                <div class="col-6 mb-2">
                                    <div><b>Progress</b></div>

                                    <div v-if="issue.progress != null">{{ issue.progress }}%</div>
                                    <div v-else class="fst-italic">– none –</div>
                                    <div v-if="issue.progress != null" class="progress" style="height: 3px;">
                                        <div
                                            class="progress-bar bg-success"
                                            :style="{width: `${issue.progress}%`}"
                                        />
                                    </div>
                                </div>

                                <div class="col-6 mb-2">
                                    <div><b>Due date</b></div>

                                    <div v-if="issue.dueDate" :class="isOverdue(issue) ? 'text-danger fw-bold' : null">
                                        {{ new Date(issue.dueDate).toLocaleDateString() }}

                                        <span v-if="isOverdue(issue)" title="overdue">
                                            <i class="fas fa-clock" />
                                        </span>
                                    </div>
                                    <div v-else class="fst-italic">– none –</div>
                                </div>

                                <div class="col-6 mb-2">
                                    <div><b>Done time</b></div>

                                    <div v-if="issue.doneTime">
                                        <time
                                            :datetime="issue.doneTime"
                                            :title="new Date(issue.doneTime).toLocaleString()"
                                        >
                                            {{ new Date(issue.doneTime).toLocaleDateString() }}
                                        </time>
                                    </div>
                                    <div v-else class="fst-italic">– none –</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </GridLayout>
</template>

<script>
const TabStates = {
    Description: Symbol('Description'),
    Markdown: Symbol('Markdown'),
    Metadata: Symbol('Metadata'),
    Attachments: Symbol('Attachments')
};
</script>

<script setup>
import GridLayout from "@/components/layout/GridLayout.vue";
import {ref, watch} from "vue";
import {useRoute} from "vue-router";
import {renderIcon} from "@/views/issues/issue-functions.js";
import {highlightMarkdown, renderMarkdown} from "@/markdown.js";
import ErrorMessage from "@/components/ErrorMessage.vue";
import Dropdown from "@/components/Dropdown.vue";
import DropdownItem from "@/components/DropdownItem.vue";
import Tab from "@/components/Tab.vue";
import Button from "@/components/Button.vue";
import {isOverdue} from "@/views/issues/issue-functions.js";
import axios from "@/axios.js";

const route = useRoute();

const projects = ref(null);
const issueTypes = ref(null);
const issuePriorities = ref(null);
const issueStatuses = ref(null);

const error = ref(null);
const issue = ref(null);

const fullWidth = ref(false);

const tabState = ref(TabStates.Description);

watch(() => route.params.issueId, fetchData, { immediate: true });

function fetchData(id) {
    error.value = null;
    issue.value = null;

    Promise
        .all([
            axios.get(`/issues/${id}`),
            axios.get(`/projects`),
            axios.get(`/issue-types`),
            axios.get(`/issue-priorities`),
            axios.get(`/issue-statuses`)
        ])
        .then(async responses => {
            projects.value = responses[1].data;
            issueTypes.value = responses[2].data;
            issuePriorities.value = responses[3].data;
            issueStatuses.value = responses[4].data;

            issue.value = await enrichIssue(responses[0].data);
        })
        .catch(handleError);
}

function changeIssueStatus(issueId, newIssueStatusId) {
    error.value = null;

    axios
        .patch(`/issues/${issueId}`, {
            issueStatusId: newIssueStatusId
        })
        .then(async response => {
            issue.value = await enrichIssue(response.data);
        })
        .catch(handleError);
}

/**
 * Enriches a loaded issue with the full objects of issue type, priority, and status,
 * a done flag, and markdown properties. The enriched issue is returned.
 *
 * Call this function only after `projects`, `issueTypes`, `issuePriorities`, and `issueStatuses`
 * are set.
 *
 * @param {Object} issueLoaded issue loaded from an `/issue/{id}` API
 * @returns {Object} enriched issue with additional properties set
 */
async function enrichIssue(issueLoaded) {
    const project = projects.value
        .find(project => project.id === issueLoaded.projectId);
    const issueType = issueTypes.value
        .find(issueType => issueType.id === issueLoaded.issueTypeId);
    const issuePriority = issuePriorities.value
        .find(issuePriority => issuePriority.id === issueLoaded.issuePriorityId);
    const issueStatus = issueStatuses.value
        .find(issueStatus => issueStatus.id === issueLoaded.issueStatusId);

    const done = issueStatus.isDoneStatus;

    return {
        ...issueLoaded,
        project,
        issueType,
        issuePriority,
        issueStatus,
        done,
        renderedMarkdown: await renderMarkdown(issueLoaded.description),
        highlightedMarkdown: highlightMarkdown(issueLoaded.description)
    }
}

function handleError(e) {
    if (e.response) {
        error.value = e.response.data.message || e.response.data.error || 'Unknown error';
    } else if (error.request) {
        error.value = e.request; // untested, see https://axios-http.com/docs/handling_errors
    } else {
        error.value = e.message; // untested, see https://axios-http.com/docs/handling_errors
    }
}
</script>

<style lang="scss" scoped>
// Avoid nasty wrapping of "in progress"
// TODO investigate: Could be a global style, true for all icon+text to not break
.icon-link {
    white-space: nowrap;
}
</style>
