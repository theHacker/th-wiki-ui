<template>
    <GridLayout>
        <ErrorMessage v-if="error">{{ error }}</ErrorMessage>

        <DeleteDialog
            v-if="deleteDialogOpen && deleteDialogOpen.issue"
            :text='`Do you really want to delete the issue ${deleteDialogOpen.issue.issueKey} "${deleteDialogOpen.issue.title}"?`'
            :dialogOpen="true"
            :deleting="deleting"
            @submit="deleteIssue(deleteDialogOpen.issue.id)"
            @cancel="deleteDialogOpen = null"
        />

        <DeleteDialog
            v-if="deleteDialogOpen && deleteDialogOpen.issueLink"
            :text='`Do you really want to delete the issue link "${deleteDialogOpen.issueLink.caption} ${deleteDialogOpen.issueLink.issueKey}: ${deleteDialogOpen.issueLink.title}"?`'
            :dialogOpen="true"
            :deleting="deleting"
            @submit="deleteIssueLink(deleteDialogOpen.issueLink.id)"
            @cancel="deleteDialogOpen = null"
        />

        <ConfirmDialog
            v-if="moveToAnotherProjectDialog"
            color="success"
            title="Move to another project"
            :dialogOpen="true"
            :progressing="movingToAnotherProject"
            submitIcon="truck-arrow-right"
            submitTitle="Move"
            :submitDisabled="moveToProjectId === null"
            cancelIcon="xmark"
            cancelTitle="Cancel"
            @submit="moveToProject(issue.id, moveToProjectId)"
            @cancel="moveToAnotherProjectDialog = null"
        >
            <div>
                Moving an issue will assign a new issue key.<br />
                The current key <b>{{ issue.issueKey }}</b> will be lost.
            </div>
            <fieldset
                :disabled="movingToAnotherProject"
                class="row my-3 align-items-center"
            >
                <div class="col-auto">
                    <label class="col-form-label">New project</label>
                </div>
                <div class="col-auto">
                    <select
                        v-model="moveToProjectId"
                        class="form-select"
                    >
                        <option
                            v-for="project in projects"
                            :value="project.id"
                            :disabled="project.id === issue.projectId"
                        >
                            {{ project.title }}
                        </option>
                    </select>
                </div>
            </fieldset>
            <div v-if="moveToProjectId !== null">
                Estimated new issue key will be
                <b>{{ projects.find(it => it.id === moveToProjectId).prefix }}-{{ projects.find(it => it.id === moveToProjectId).nextIssueNumber }}</b>.
            </div>
        </ConfirmDialog>

        <ConfirmDialog
            v-if="addIssueLinkDialog"
            color="success"
            title="Link to another issue"
            size="large"
            :dialogOpen="true"
            :progressing="linkingIssue"
            submitIcon="diagram-predecessor"
            submitTitle="Link"
            :submitDisabled="addIssueLinkSubmitDisabled"
            cancelIcon="xmark"
            cancelTitle="Cancel"
            @submit="linkIssues(issue.id, addIssueLinkDialog.issueLinkType, addIssueLinkDialog.otherIssueId)"
            @cancel="addIssueLinkDialog = null"
        >
            <fieldset
                :disabled="false"
                class="row g-2 align-items-center"
            >
                <div class="col-auto">
                    This issue
                </div>
                <div class="col-auto">
                    <select
                        v-model="addIssueLinkDialog.issueLinkType"
                        class="form-select"
                    >
                        <template v-for="issueLinkType in issueLinkTypes">
                            <option
                                :value="{ id: issueLinkType.id, inverse: false }"
                            >{{ issueLinkType.wording }}</option>
                            <option
                                v-if="issueLinkType.wordingInverse"
                                :value="{ id: issueLinkType.id, inverse: true }"
                            >{{ issueLinkType.wordingInverse }}</option>
                        </template>
                    </select>
                </div>
                <div class="col-auto">
                    <select
                        v-model="addIssueLinkDialog.otherIssueId"
                        class="form-select"
                    >
                        <template v-for="issueInAllIssues in allIssues">
                            <option
                                :value="issueInAllIssues.id"
                                :disabled="issueInAllIssues.id === issue.id"
                            >{{ issueInAllIssues.issueKey }}: {{ issueInAllIssues.title }}</option>
                        </template>
                    </select>
                </div>
                <div class="col-auto">.</div>
            </fieldset>
        </ConfirmDialog>

        <div :class="{'container-xl g-0': !fullWidth}">
            <div v-if="!issue || !issueLinks" class="mt-4">
                <Loading>Loading issue…</Loading>
            </div>

            <div v-if="issue && issueLinks" class="row">
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
                                        icon="diagram-predecessor"
                                        title="Links"
                                        :badge="issueLinks.length > 0 ? issueLinks.length.toString() : null"
                                        :active="tabState === TabStates.Links"
                                        @click="tabState = TabStates.Links"
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

                            <Dropdown buttonClass="btn-text-lg" icon="gears" title="Actions">
                                <DropdownItem
                                    icon="truck-arrow-right"
                                    title="Move to another project"
                                    fixedWidth
                                    @click="moveToProjectId = null; moveToAnotherProjectDialog = true;"
                                />
                                <DropdownItem
                                    icon="diagram-predecessor"
                                    title="Link to another issue"
                                    fixedWidth
                                    @click="addNewIssueLink"
                                />
                            </Dropdown>

                            <Button
                                class="btn-text-lg"
                                icon="pen"
                                title="Edit"
                                color="light"
                                @click="$router.push({ name: 'issueEdit', params: { issueId: issue.id } })"
                            />
                            <Button
                                class="btn-text-lg"
                                icon="trash"
                                title="Delete"
                                color="danger"
                                @click="deleteDialogOpen = { issue }"
                            />
                        </div>
                    </div>
                </div>

                <div :class="hideFieldsPanel ? 'col-12' : 'col-12 col-lg-9 order-1 order-lg-0'">
                    <div v-if="tabState === TabStates.Description">
                        <article v-html="issue.renderedMarkdown" />
                    </div>

                    <div v-else-if="tabState === TabStates.Markdown">
                        <div class="highlightedCode">
                            <span class="language">Markdown</span>
                            <pre><code v-html="issue.highlightedMarkdown" class="language-markdown" /></pre>
                        </div>
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

                    <div v-else-if="tabState === TabStates.Links">
                        <div class="tabs mb-4 mt-lg-n4">
                            <ul class="nav nav-tabs">
                                <Tab
                                    icon="table-list"
                                    title="Table"
                                    :active="linksTabState === LinksTabStates.Table"
                                    @click="linksTabState = LinksTabStates.Table"
                                />
                                <Tab
                                    icon="chart-diagram"
                                    title="Dependency graph"
                                    :active="linksTabState === LinksTabStates.Graph"
                                    @click="linksTabState = LinksTabStates.Graph"
                                />
                            </ul>
                        </div>

                        <div v-if="linksTabState === LinksTabStates.Table">
                            <template v-for="linkGroup in linkGroups">
                                <h2 class="fs-5">This issue {{ linkGroup.caption }}</h2>
                                <table class="table table-responsive table-sm table-hover align-middle mb-5 linkGroup">
                                    <thead>
                                        <tr>
                                            <th>Type</th>
                                            <th>Key</th>
                                            <th>Title</th>
                                            <th>Commands</th>
                                        </tr>
                                    </thead>
                                    <tbody class="table-group-divider">
                                        <tr v-for="link in linkGroup.links">
                                            <td>
                                                <i :class="`fas fa-${linkGroup.icon} text-${linkGroup.iconColor}`" />
                                            </td>
                                            <td>
                                                <span class="pe-2">{{ link.issueKey }}</span>
                                            </td>
                                            <td>
                                                <RouterLink :to="{ name: 'issue', params: { issueId: link.issueId } }">
                                                    {{ link.title }}
                                                </RouterLink>
                                            </td>
                                            <td>
                                                <Button
                                                    icon="trash"
                                                    tooltip="Delete"
                                                    size="small"
                                                    fixedWidth
                                                    color="danger"
                                                    @click="openDeleteIssueLinkDialog(linkGroup.caption, link)"
                                                />
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </template>

                            <p v-if="issueLinks.length === 0">No links.</p>
                        </div>

                        <div v-else-if="linksTabState === LinksTabStates.Graph">
                            <div class="d-flex gap-2">
                                <label for="rangeDependencyGraphDepth" class="form-label text-nowrap">
                                    Render dependency graph to depth
                                </label>
                                <input
                                    v-model.number="dependencyGraphDepth"
                                    id="rangeDependencyGraphDepth"
                                    type="range"
                                    class="form-range w-50 w-sm-25"
                                    min="0"
                                    max="10"
                                />
                                <span>{{ dependencyGraphDepth }}</span>
                            </div>

                            <DependencyGraph :issueId="issue.id" :depth="dependencyGraphDepth" class="mb-5" />
                        </div>

                        <Button
                            icon="plus"
                            title="Add link"
                            color="success"
                            @click="addNewIssueLink"
                        />
                    </div>

                    <div v-else-if="tabState === TabStates.Attachments">
                        <p>TODO</p>
                    </div>
                </div>

                <div :class="hideFieldsPanel ? 'd-none' : 'col-12 col-lg-3 order-0 order-lg-1 mb-3 mb-lg-0'">
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

                                        <span v-if="!issue.done" :title="isOverdue(issue) ? 'overdue' : null">
                                            <i class="fas fa-clock" :class="getDueColor(issue)" />
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
    Links: Symbol('Links'),
    Attachments: Symbol('Attachments')
};

const LinksTabStates = {
    Table: Symbol('Table'),
    Graph: Symbol('Graph')
};

const issueLinkTypeIcons = {
    subtask: 'sitemap',
    blocker: 'road-barrier',
    cause: 'bolt',
    relates: 'right-left',
    duplicate: 'copy'
};
</script>

<script setup>
import GridLayout from "@/components/layout/GridLayout.vue";
import {computed, ref, watch} from "vue";
import {useRoute, useRouter} from "vue-router";
import {getDueColor, renderIcon} from "@/views/issues/issue-functions.js";
import {highlightMarkdown, renderMarkdown} from "@/markdown";
import ErrorMessage from "@/components/ErrorMessage.vue";
import Dropdown from "@/components/Dropdown.vue";
import DropdownItem from "@/components/DropdownItem.vue";
import Tab from "@/components/Tab.vue";
import Button from "@/components/Button.vue";
import Loading from "@/components/Loading.vue";
import DeleteDialog from "@/components/DeleteDialog.vue";
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import DependencyGraph from "@/components/issues/DependencyGraph.vue";
import {isOverdue} from "@/views/issues/issue-functions.js";
import axios from "@/axios.js";

const route = useRoute();
const router = useRouter();

const projects = ref(null);
const issueTypes = ref(null);
const issuePriorities = ref(null);
const issueStatuses = ref(null);
const issueLinkTypes = ref(null);
const allIssues = ref(null); // TODO move to a separate component (and load only on demand)

const error = ref(null);
const issue = ref(null);
const issueLinks = ref(null);

const fullWidth = ref(false);
const dependencyGraphDepth = ref(1);

const tabState = ref(TabStates.Description);
const linksTabState = ref(LinksTabStates.Table);

const deleteDialogOpen = ref(null);
const deleting = ref(false);

const moveToAnotherProjectDialog = ref(false);
const moveToProjectId = ref(null);
const movingToAnotherProject = ref(false);

const addIssueLinkDialog = ref(null);
const linkingIssue = ref(false);

const hideFieldsPanel = computed(() => {
    // Hide the field panel when fullWidth mode is on, and Dependency Graph is visible, so there is more space
    return fullWidth.value === true && tabState.value === TabStates.Links && linksTabState.value === LinksTabStates.Graph;
});

const linkGroups = computed(() => {
    // Can only be computed, if all needed data is present
    if (issue.value === null || issueLinkTypes.value === null || issueLinks.value === null || allIssues.value === null) {
        return [];
    }

    // Loop over issueLinkTypes so have their order (they come by a specific order from the API)
    const groups = [];
    for (let issueLinkType of issueLinkTypes.value) {

        const linksMatchingThisType = issueLinks.value
            .filter(it => it.issueLinkTypeId === issueLinkType.id);

        if (linksMatchingThisType.length === 0) {
            continue;
        }

        if (issueLinkType.wordingInverse) {
            // directed link type

            const linksMatchingForward = linksMatchingThisType.filter(it => it.issue1Id === issue.value.id);
            if (linksMatchingForward.length > 0) {
                const links = linksMatchingForward.map(link => {
                    const linkedIssue = allIssues.value.find(issue => issue.id === link.issue2Id);

                    return {
                        issueLinkId: link.id,
                        issueId: linkedIssue.id,
                        issueKey: linkedIssue.issueKey,
                        title: linkedIssue.title
                    };
                });

                groups.push({
                    caption: issueLinkType.wording,
                    iconColor: 'danger-emphasis',
                    icon: issueLinkTypeIcons[issueLinkType.type],
                    links
                });
            }

            const linksMatchingInverse = linksMatchingThisType.filter(it => it.issue2Id === issue.value.id);
            if (linksMatchingInverse.length > 0) {
                const links = linksMatchingInverse.map(link => {
                    const linkedIssue = allIssues.value.find(issue => issue.id === link.issue1Id);

                    return {
                        issueLinkId: link.id,
                        issueId: linkedIssue.id,
                        issueKey: linkedIssue.issueKey,
                        title: linkedIssue.title
                    };
                });

                groups.push({
                    caption: issueLinkType.wordingInverse,
                    iconColor: 'warning-emphasis',
                    icon: issueLinkTypeIcons[issueLinkType.type],
                    links
                });
            }
        } else {
            // undirected link type

            const linksMatchingAnyDirection = linksMatchingThisType
                .filter(it => it.issue1Id === issue.value.id || it.issue2Id === issue.value.id);
            // Invariant: (linksMatchingAnyDirection equals linksMatchingThisType) && (linksMatchingAnyDirection.length > 0)

            if (linksMatchingAnyDirection.length > 0) {
                const links = linksMatchingAnyDirection.map(link => {
                    const linkedIssue = allIssues.value
                        .find(it => (it.id === link.issue1Id || it.id === link.issue2Id) && it.id !== issue.value.id);

                    return {
                        issueLinkId: link.id,
                        issueId: linkedIssue.id,
                        issueKey: linkedIssue.issueKey,
                        title: linkedIssue.title
                    };
                });

                groups.push({
                    caption: issueLinkType.wording,
                    iconColor: 'warning-emphasis',
                    icon: issueLinkTypeIcons[issueLinkType.type],
                    links
                });
            }
        }
    }

    return groups;
});

const addIssueLinkSubmitDisabled = computed(() => {
    // Option selected?

    if (addIssueLinkDialog.value?.issueLinkType == null) {
        return true;
    }
    if (addIssueLinkDialog.value?.otherIssueId == null) {
        return true;
    }

    // Check if selected options would lead to an already existing link

    const existingLinks = issueLinks.value
        .filter(it =>
            it.issueLinkTypeId === addIssueLinkDialog.value.issueLinkType.id &&
            (it.issue1Id === addIssueLinkDialog.value.otherIssueId ||
                it.issue2Id === addIssueLinkDialog.value.otherIssueId)
        );
    if (existingLinks.length > 0) {
        return true;
    }

    // All clear

    return false;
});

watch(() => route.params.issueId, fetchData, { immediate: true });

function fetchData(id) {
    error.value = null;
    issue.value = null;

    Promise
        .all([
            axios.get(`/issues/${id}`),
            axios.get(`/issue-links?issueId=${id}`),
            axios.get(`/projects`),
            axios.get(`/issue-types`),
            axios.get(`/issue-priorities`),
            axios.get(`/issue-statuses`),
            axios.get(`/issue-link-types`),
            axios.get(`/issues?fields=id,issueKey,title`)
        ])
        .then(async responses => {
            issueLinks.value = responses[1].data;
            projects.value = responses[2].data;
            issueTypes.value = responses[3].data;
            issuePriorities.value = responses[4].data;
            issueStatuses.value = responses[5].data;
            issueLinkTypes.value = responses[6].data;
            allIssues.value = responses[7].data;

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

function moveToProject(issueId, newProjectId) {
    error.value = null;
    movingToAnotherProject.value = true;

    axios
        .patch(`/issues/${issueId}`, {
            projectId: newProjectId
        })
        .then(async response => {
            issue.value = await enrichIssue(response.data);
        })
        .catch(handleError)
        .finally(() => {
            movingToAnotherProject.value = false;
            moveToAnotherProjectDialog.value = null;
        });
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

function deleteIssue(issueId) {
    deleting.value = true;
    error.value = null;

    axios
        .delete(`/issues/${issueId}`)
        .then(() => {
            router.push({ name: 'issues' });
        })
        .catch(handleError)
        .finally(() => {
            deleteDialogOpen.value = null;
            deleting.value = false;
        });
}

function addNewIssueLink() {
    // Switch to tab (if called from the "Actions" menu)
    tabState.value = TabStates.Links;
    linksTabState.value = LinksTabStates.Table;

    // Open dialog
    addIssueLinkDialog.value = {
        issueLinkType: null,
        otherIssueId: null
    };
}

function linkIssues(issueId, issueLinkType, otherIssueId) {
    error.value = null;
    linkingIssue.value = true;

    axios
        .post(`/issue-links`, {
            issue1Id: (issueLinkType.inverse) ? otherIssueId : issueId,
            issue2Id: (issueLinkType.inverse) ? issueId : otherIssueId,
            issueLinkTypeId: issueLinkType.id
        })
        .then(response => {
            issueLinks.value.push(response.data);
        })
        .catch(handleError)
        .finally(() => {
            addIssueLinkDialog.value = null;
            linkingIssue.value = false;
        });
}

function openDeleteIssueLinkDialog(caption, issueLink) {
    deleteDialogOpen.value = {
        issueLink: {
            id: issueLink.issueLinkId,
            caption,
            issueKey: issueLink.issueKey,
            title: issueLink.title
        }
    }
}

function deleteIssueLink(issueLinkId) {
    deleting.value = true;
    error.value = null;

    axios
        .delete(`/issue-links/${issueLinkId}`)
        .then(() => {
            issueLinks.value = issueLinks.value
                .filter(it => it.id !== issueLinkId);
        })
        .catch(handleError)
        .finally(() => {
            deleteDialogOpen.value = null;
            deleting.value = false;
        });
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

.table.linkGroup {

    td:nth-child(1) {
        width: 32px;
        text-align: center;
    }
    td:nth-child(2) {
        width: 10%;
    }
    td:nth-child(4) {
        $countButtons: 1;

        width: calc($countButtons * 32px + ($countButtons - 1) * 0.25rem);
        text-align: center;
    }
}
</style>
