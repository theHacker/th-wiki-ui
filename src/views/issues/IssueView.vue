<template>
    <GridLayout>
        <ErrorMessage v-if="errors.length > 0" :title="errors.length > 1 ? 'Errors' : 'Error'">
            <ul>
                <li v-for="(error, index) in errors" :key="index">{{ error }}</li>
            </ul>
        </ErrorMessage>

        <DeleteDialog
            v-if="deleteDialogOpen && deleteDialogOpen.issue"
            :dialogOpen="true"
            :deleting="deleting"
            @submit="deleteIssue(deleteDialogOpen.issue.id)"
            @cancel="deleteDialogOpen = null"
        >
            Do you really want to delete the issue
            <b><i>{{deleteDialogOpen.issue.issueKey}}</i></b> "<b>{{deleteDialogOpen.issue.title}}</b>"?
        </DeleteDialog>

        <DeleteDialog
            v-if="deleteDialogOpen && deleteDialogOpen.issueLink"
            :dialogOpen="true"
            :deleting="deleting"
            @submit="deleteIssueLink(deleteDialogOpen.issueLink.id)"
            @cancel="deleteDialogOpen = null"
        >
            Do you really want to delete the issue link
            "<i>{{deleteDialogOpen.issueLink.caption}}</i> <b><i>{{deleteDialogOpen.issueLink.issueKey}}</i></b>:
            <b>{{deleteDialogOpen.issueLink.title}}</b>"?
        </DeleteDialog>

        <ConfirmDialog
            v-if="moveToAnotherProjectDialog"
            color="success"
            title="Move to another project"
            :dialogOpen="true"
            :progressing="movingToAnotherProject"
            submitIcon="truck-arrow-right"
            submitTitle="Move"
            :submitDisabled="moveToProjectId === null || movingProjectDisallowedBecauseOfProjectTags"
            cancelIcon="xmark"
            cancelTitle="Cancel"
            @submit="moveToProject(issue.id, moveToProjectId)"
            @cancel="moveToAnotherProjectDialog = null"
        >
            <BaseAlert v-if="movingProjectDisallowedBecauseOfProjectTags" color="info" icon="circle-info" class="mb-0">
                This issue cannot be moved, because it contains one or more project tags.
            </BaseAlert>
            <template v-else>
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
                        <ProjectSelect
                            v-model="moveToProjectId"
                            :projects="projects"
                            :disabledOption="project => project.id === issue.project.id"
                        />
                    </div>
                </fieldset>
                <div v-if="moveToProjectId !== null">
                    Estimated new issue key will be
                    <b>{{ projects.find(it => it.id === moveToProjectId).prefix }}-{{ projects.find(it => it.id === moveToProjectId).nextIssueNumber }}</b>.
                </div>
            </template>
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
                        <template v-for="issueLinkType in issueLinkTypes" :key="issueLinkType.id">
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
                        <template v-for="issueInAllIssues in allIssues" :key="issueInAllIssues.id">
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

        <TagsDialog
            v-model="assignedTagIdsInDialog"
            :dialogOpen="manageTagsDialogOpen"
            :globalTags="availableGlobalTags"
            :projectTags="availableProjectTags"
            :showProjectTags="true"
            :saving="manageTagsDialogSaving"
            @submit="updateTags"
            @cancel="manageTagsDialogOpen = false"
        />

        <div :class="{'container-xl g-0': !fullWidth}">
            <div v-if="!issue" class="mt-4">
                <LoadingIndicator>Loading issue…</LoadingIndicator>
            </div>

            <div v-if="issue" class="row">
                <div class="col-12">
                    <BaseHeading :smallText="issue.issueKey" :tags="issue.tags">
                        {{ issue.title }}
                    </BaseHeading>

                    <div class="d-flex flex-wrap flex-lg-nowrap mb-4 row-gap-3">
                        <div class="flex-grow-1 me-4">
                            <div class="tabs">
                                <ul class="nav nav-tabs">
                                    <TabItem
                                        icon="image"
                                        title="Description"
                                        :active="tabState === TabStates.Description"
                                        @click="tabState = TabStates.Description"
                                    />
                                    <TabItem
                                        icon="file-text"
                                        title="Markdown"
                                        :active="tabState === TabStates.Markdown"
                                        @click="tabState = TabStates.Markdown"
                                    />
                                    <TabItem
                                        icon="tags"
                                        title="Metadata"
                                        :active="tabState === TabStates.Metadata"
                                        @click="tabState = TabStates.Metadata"
                                    />
                                    <TabItem
                                        icon="diagram-predecessor"
                                        title="Links"
                                        :badge="issue.issueLinks.length > 0 ? issue.issueLinks.length.toString() : null"
                                        :active="tabState === TabStates.Links"
                                        @click="tabState = TabStates.Links"
                                    />
                                    <TabItem
                                        icon="paperclip"
                                        title="Attachments"
                                        :badge="!attachmentsLoading && attachmentsCount > 0 ? attachmentsCount.toString() : null"
                                        :active="tabState === TabStates.Attachments"
                                        :loading="attachmentsLoading"
                                        @click="tabState = TabStates.Attachments"
                                    />
                                </ul>
                            </div>
                        </div>

                        <div class="hstack align-items-start gap-2">
                            <BaseButton
                                class="d-none d-xl-block"
                                icon="arrows-left-right-to-line"
                                tooltip="Use full width"
                                :active="fullWidth"
                                color="light"
                                @click="fullWidth = !fullWidth"
                            />

                            <BaseDropdown buttonClass="btn-text-lg" icon="circle-arrow-right" title="Change status" color="success">
                                <BaseDropdownItem
                                    v-for="issueStatus in issueStatuses"
                                    :key="issueStatus.id"
                                    :icon="issueStatus.icon"
                                    :iconColor="issueStatus.iconColor"
                                    :title="issueStatus.title"
                                    fixedWidth
                                    :disabled="issueStatus.id === issue.issueStatus.id"
                                    @click="changeIssueStatus(issue.id, issueStatus.id)"
                                />
                            </BaseDropdown>

                            <div class="btn-group d-none d-xxl-block">
                                <BaseButton
                                    icon="tags"
                                    tooltip="Manage tags"
                                    fixedWidth
                                    @click="openTagsDialog"
                                />
                                <BaseButton
                                    icon="truck-arrow-right"
                                    tooltip="Move to another project"
                                    fixedWidth
                                    @click="moveToProjectId = null; moveToAnotherProjectDialog = true;"
                                />
                                <BaseButton
                                    icon="diagram-predecessor"
                                    tooltip="Link to another issue"
                                    fixedWidth
                                    @click="addNewIssueLink"
                                />
                            </div>

                            <BaseDropdown class="d-block d-xxl-none" buttonClass="btn-text-lg" icon="gears" title="Actions">
                                <BaseDropdownItem
                                    icon="tags"
                                    title="Manage tags"
                                    fixedWidth
                                    @click="openTagsDialog"
                                />
                                <BaseDropdownItem
                                    icon="truck-arrow-right"
                                    title="Move to another project"
                                    fixedWidth
                                    @click="moveToProjectId = null; moveToAnotherProjectDialog = true;"
                                />
                                <BaseDropdownItem
                                    icon="diagram-predecessor"
                                    title="Link to another issue"
                                    fixedWidth
                                    @click="addNewIssueLink"
                                />
                            </BaseDropdown>

                            <BaseButton
                                class="btn-text-lg"
                                icon="pen"
                                title="Edit"
                                color="light"
                                @click="$router.push({ name: 'issueEdit', params: { issueId: issue.id } })"
                            />
                            <BaseButton
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
                                <TabItem
                                    icon="table-list"
                                    title="Table"
                                    :active="linksTabState === LinksTabStates.Table"
                                    @click="linksTabState = LinksTabStates.Table"
                                />
                                <TabItem
                                    icon="chart-diagram"
                                    title="Dependency graph"
                                    :active="linksTabState === LinksTabStates.Graph"
                                    @click="linksTabState = LinksTabStates.Graph"
                                />
                            </ul>
                        </div>

                        <div v-if="linksTabState === LinksTabStates.Table">
                            <template v-for="linkGroup in linkGroups" :key="linkGroup.caption">
                                <h2 class="fs-5">
                                    <i
                                        :class="`fas fa-${linkGroup.icon}`"
                                        v-bind="parseColor(linkGroup.iconColor, false)"
                                    />
                                    This issue {{ linkGroup.caption }}
                                </h2>
                                <table class="table table-responsive table-sm table-hover align-middle mb-5 linkGroup">
                                    <thead>
                                        <tr>
                                            <th>Type</th>
                                            <th>Key</th>
                                            <th>Title</th>
                                            <th>Priority</th>
                                            <th>Status</th>
                                            <th>Commands</th>
                                        </tr>
                                    </thead>
                                    <tbody class="table-group-divider">
                                        <tr
                                            v-for="link in linkGroup.links"
                                            :key="link.issueLinkId"
                                            :class="{ done: link.issueStatus.doneStatus }"
                                        >
                                            <td>
                                                <i
                                                    :class="`fas fa-${link.issueType.icon}`"
                                                    :title="link.issueType.title"
                                                    v-bind="parseColor(link.issueType.iconColor, false)"
                                                />
                                            </td>
                                            <td>
                                                <span class="pe-2">{{ link.issueKey }}</span>
                                            </td>
                                            <td>
                                                <RouterLink
                                                    :to="{ name: 'issue', params: { issueId: link.issueId } }"
                                                    class="title"
                                                >
                                                    {{ link.title }}
                                                </RouterLink>
                                            </td>
                                            <td>
                                                <i
                                                    :class="`fas fa-${link.issuePriority.icon}`"
                                                    :title="link.issuePriority.title"
                                                    v-bind="parseColor(link.issuePriority.iconColor, false)"
                                                />
                                            </td>
                                            <td>
                                                <i
                                                    :class="`fas fa-${link.issueStatus.icon}`"
                                                    :title="link.issueStatus.title"
                                                    v-bind="parseColor(link.issueStatus.iconColor, false)"
                                                />
                                            </td>
                                            <td>
                                                <BaseButton
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

                            <p v-if="issue.issueLinks.length === 0">No links.</p>
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

                        <BaseButton
                            icon="plus"
                            title="Add link"
                            color="success"
                            @click="addNewIssueLink"
                        />
                    </div>

                    <div v-show="tabState === TabStates.Attachments">
                        <AttachmentsTab
                            :issueId="issue.id"
                            @loadingStarted="attachmentsLoading = true"
                            @loadingFinished="attachmentsLoading = false"
                            @attachmentsCountUpdated="count => attachmentsCount = count"
                        />
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
                                        <i
                                            :class="`fas fa-${issue.issueType.icon}`"
                                            :title="issue.issueType.title"
                                            v-bind="parseColor(issue.issueType.iconColor, false)"
                                        />
                                        {{ issue.issueType.title }}
                                    </div>
                                </div>

                                <div class="col-6 mb-2">
                                    <div><b>Status</b></div>

                                    <div class="icon-link">
                                        <i
                                            :class="`fas fa-${issue.issueStatus.icon}`"
                                            :title="issue.issueStatus.title"
                                            v-bind="parseColor(issue.issueStatus.iconColor, false)"
                                        />
                                        <span :title="issue.issueStatus.description">
                                            {{ issue.issueStatus.title }}
                                        </span>
                                    </div>
                                </div>

                                <div class="col-6 mb-2">
                                    <div><b>Priority</b></div>

                                    <div class="icon-link">
                                        <i
                                            :class="`fas fa-${issue.issuePriority.icon}`"
                                            :title="issue.issuePriority.title"
                                            v-bind="parseColor(issue.issuePriority.iconColor, false)"
                                        />
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

                                        <span v-if="!issue.issueStatus.doneStatus" :title="isOverdue(issue) ? 'overdue' : null">
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
import {computed, onMounted, ref, watch} from "vue";
import {useRoute, useRouter} from "vue-router";
import {getDueColor} from "@/views/issues/issue-functions.js";
import {highlightMarkdown, renderMarkdownAndReplaceIssueLinks} from "@/markdown";
import ErrorMessage from "@/components/ErrorMessage.vue";
import BaseDropdown from "@/components/BaseDropdown.vue";
import BaseDropdownItem from "@/components/BaseDropdownItem.vue";
import TabItem from "@/components/TabItem.vue";
import BaseButton from "@/components/BaseButton.vue";
import LoadingIndicator from "@/components/LoadingIndicator.vue";
import DeleteDialog from "@/components/DeleteDialog.vue";
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import DependencyGraph from "@/components/issues/DependencyGraph.vue";
import {isOverdue} from "@/views/issues/issue-functions.js";
import axios from "@/axios.js";
import {handleError} from "@/helper/graphql-error-handling.js";
import ProjectSelect from "@/components/general/ProjectSelect.vue";
import {parseColor} from "@/helper/color.js";
import BaseHeading from "@/components/BaseHeading.vue";
import TagsDialog from "@/components/tags/TagsDialog.vue";
import BaseAlert from "@/components/BaseAlert.vue";
import AttachmentsTab from "@/components/general/AttachmentsTab.vue";
import {syncStateToHash} from "@/helper/hash-state.js";
import UserPreferences from "@/helper/local-storage.js";

const route = useRoute();
const router = useRouter();

const projects = ref(null);
const issueStatuses = ref(null);
const issueLinkTypes = ref(null);
const allIssues = ref(null); // TODO move to a separate component (and load only on demand)

const errors = ref([]);
const issue = ref(null);
const attachmentsLoading = ref(false);
const attachmentsCount = ref(0);

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

const availableGlobalTags = ref([]);
const availableProjectTags = ref([]);
const manageTagsDialogOpen = ref(false);
const manageTagsDialogSaving = ref(false);
const assignedTagIdsInDialog = ref([]);

const hideFieldsPanel = computed(() => {
    // Hide the field panel when fullWidth mode is on, and Dependency Graph is visible, so there is more space
    return fullWidth.value === true && tabState.value === TabStates.Links && linksTabState.value === LinksTabStates.Graph;
});

const movingProjectDisallowedBecauseOfProjectTags = computed(() => {
    if (issue.value === null) {
        return true;
    }

    // Has any project tag?
    return issue.value.tags.some(tag => tag.project !== null);
});

const linkGroups = computed(() => {
    // Can only be computed, if all needed data is present
    if (issue.value === null || issueLinkTypes.value === null) {
        return [];
    }

    // Loop over issueLinkTypes so have their order (they come by a specific order from the API)
    const groups = [];
    for (let issueLinkType of issueLinkTypes.value) {

        const linksMatchingThisType = issue.value.issueLinks
            .filter(it => it.issueLinkType.id === issueLinkType.id);

        if (linksMatchingThisType.length === 0) {
            continue;
        }

        if (issueLinkType.wordingInverse) {
            // directed link type

            const linksMatchingForward = linksMatchingThisType.filter(it => it.issue1.id === issue.value.id);
            if (linksMatchingForward.length > 0) {
                const links = linksMatchingForward.map(link => {
                    const linkedIssue = link.issue2;

                    return {
                        issueLinkId: link.id,
                        issueId: linkedIssue.id,
                        issueKey: linkedIssue.issueKey,
                        title: linkedIssue.title,
                        issueType: linkedIssue.issueType,
                        issuePriority: linkedIssue.issuePriority,
                        issueStatus: linkedIssue.issueStatus
                    };
                });

                groups.push({
                    caption: issueLinkType.wording,
                    iconColor: 'danger-emphasis',
                    icon: issueLinkTypeIcons[issueLinkType.type],
                    links
                });
            }

            const linksMatchingInverse = linksMatchingThisType.filter(it => it.issue2.id === issue.value.id);
            if (linksMatchingInverse.length > 0) {
                const links = linksMatchingInverse.map(link => {
                    const linkedIssue = link.issue1;

                    return {
                        issueLinkId: link.id,
                        issueId: linkedIssue.id,
                        issueKey: linkedIssue.issueKey,
                        title: linkedIssue.title,
                        issueType: linkedIssue.issueType,
                        issuePriority: linkedIssue.issuePriority,
                        issueStatus: linkedIssue.issueStatus
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
                .filter(it => it.issue1.id === issue.value.id || it.issue2.id === issue.value.id);
            // Invariant: (linksMatchingAnyDirection equals linksMatchingThisType) && (linksMatchingAnyDirection.length > 0)

            if (linksMatchingAnyDirection.length > 0) {
                const links = linksMatchingAnyDirection.map(link => {
                    const linkedIssue = link.issue1.id === issue.value.id ? link.issue2 : link.issue1;

                    return {
                        issueLinkId: link.id,
                        issueId: linkedIssue.id,
                        issueKey: linkedIssue.issueKey,
                        title: linkedIssue.title,
                        issueType: linkedIssue.issueType,
                        issuePriority: linkedIssue.issuePriority,
                        issueStatus: linkedIssue.issueStatus
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

    const existingLinks = issue.value.issueLinks
        .filter(it =>
            it.issueLinkType.id === addIssueLinkDialog.value.issueLinkType.id &&
            (it.issue1.id === addIssueLinkDialog.value.otherIssueId ||
                it.issue2.id === addIssueLinkDialog.value.otherIssueId)
        );
    if (existingLinks.length > 0) {
        return true;
    }

    // All clear

    return false;
});

watch(() => route.params.issueId, fetchData, { immediate: true });

syncStateToHash([
    { type: 'enum', ref: tabState, enumObject: TabStates },
    { type: 'enum', ref: linksTabState, enumObject: LinksTabStates },
    { type: 'number', ref: dependencyGraphDepth, defaultValue: 1, isValid: (value) => value >= 0 && value <= 10 }
]);

onMounted(() => {
    fullWidth.value = UserPreferences.retrieveBoolean("fullWidth");
});

watch(fullWidth, () => {
    UserPreferences.storeBoolean("fullWidth", fullWidth.value);
});

function fetchData(id) {
    errors.value = [];
    issue.value = null;

    axios
        .graphql(
            `
                query Issue($issueId: ID!) {
                    issue(id: $issueId) {
                        id
                        issueKey
                        project {
                            id
                            title
                            description
                        }
                        issueType {
                            title
                            icon
                            iconColor
                        }
                        issuePriority {
                            title
                            icon
                            iconColor
                        }
                        issueStatus {
                            id
                            title
                            description
                            icon
                            iconColor
                            doneStatus
                        }
                        title
                        description
                        progress
                        dueDate
                        creationTime
                        modificationTime
                        doneTime
                        issueLinks {
                            id
                            issue1 {
                                id
                                issueKey
                                issueType {
                                    title
                                    icon
                                    iconColor
                                }
                                issuePriority {
                                    title
                                    icon
                                    iconColor
                                }
                                issueStatus {
                                    id
                                    title
                                    icon
                                    iconColor
                                    doneStatus
                                }
                                title
                            }
                            issue2 {
                                id
                                issueKey
                                issueType {
                                    title
                                    icon
                                    iconColor
                                }
                                issuePriority {
                                    title
                                    icon
                                    iconColor
                                }
                                issueStatus {
                                    id
                                    title
                                    icon
                                    iconColor
                                    doneStatus
                                }
                                title
                            }
                            issueLinkType {
                                id
                            }
                        }
                        tags {
                            id
                            project {
                                id
                            }
                            scope
                            scopeIcon
                            scopeColor
                            title
                            titleIcon
                            titleColor
                            description
                        }
                    }
                    projects {
                        id
                        prefix
                        title
                        nextIssueNumber
                    }
                    issueStatuses {
                        id
                        title
                        icon
                        iconColor
                    }
                    issueLinkTypes {
                        id
                        type
                        wording
                        wordingInverse
                    }
                    issues {
                        id
                        issueKey
                        title
                    }
                    tags {
                        id
                        project {
                            id
                        }
                        scope
                        scopeIcon
                        scopeColor
                        title
                        titleIcon
                        titleColor
                        description
                    }
                }
            `,
            { issueId: id }
        )
        .then(async data => {
            if (data.issue === null) {
                errors.value = ["Issue does not exist."];
            } else {
                issue.value = {
                    ...data.issue,
                    renderedMarkdown: await renderMarkdownAndReplaceIssueLinks(data.issue.description),
                    highlightedMarkdown: highlightMarkdown(data.issue.description)
                };
                projects.value = data.projects;
                issueStatuses.value = data.issueStatuses;
                issueLinkTypes.value = data.issueLinkTypes;
                allIssues.value = data.issues;

                availableGlobalTags.value = data.tags.filter(it => it.project === null);
                availableProjectTags.value = data.tags.filter(it => it.project?.id === data.issue.project.id);
            }
        })
        .catch(e => {
            errors.value = handleError(e).genericErrors;
        });
}

function changeIssueStatus(issueId, newIssueStatusId) {
    errors.value = [];

    const input = {
        id: issueId,
        issueStatusId: newIssueStatusId
    };

    axios
        .graphql(
            `
                mutation TransitionIssue($input: TransitionIssueInput!) {
                    transitionIssue(input: $input) {
                        issue {
                            issueStatus {
                                id
                                title
                                description
                                icon
                                iconColor
                                doneStatus
                            }
                            modificationTime
                            doneTime
                        }
                    }
                }
            `,
            { input }
        )
        .then(data => {
            issue.value = {
                ...issue.value,
                ...data.transitionIssue.issue
            };
        })
        .catch(e => {
            errors.value = handleError(e).genericErrors;
        });
}

function moveToProject(issueId, newProjectId) {
    errors.value = [];
    movingToAnotherProject.value = true;

    const input = {
        id: issueId,
        projectId: newProjectId
    };

    axios
        .graphql(
            `
                mutation MoveIssue($input: MoveIssueInput!) {
                    moveIssue(input: $input) {
                        issue {
                            id
                        }
                    }
                }
            `,
            { input }
        )
        .then(data => {
            // Close dialog, as we unload the issue
            movingToAnotherProject.value = false;
            moveToAnotherProjectDialog.value = null;

            // Reload everything, because issue.issueLinks and even allIssues is now stale because of changed issue keys
            fetchData(data.moveIssue.issue.id);
        })
        .catch(e => {
            errors.value = handleError(e).genericErrors;
        });
}

function deleteIssue(issueId) {
    deleting.value = true;
    errors.value = [];

    axios
        .graphql(
            `
                mutation DeleteIssue($issueId: ID!) {
                    deleteIssue(id: $issueId) {
                        id
                    }
                }
            `,
            { issueId }
        )
        .then(_data => {
            router.push({ name: 'issues' });
        })
        .catch(e => {
            errors.value = handleError(e).genericErrors;
        })
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
    errors.value = [];
    linkingIssue.value = true;

    const input = {
        issue1Id: (issueLinkType.inverse) ? otherIssueId : issueId,
        issue2Id: (issueLinkType.inverse) ? issueId : otherIssueId,
        issueLinkTypeId: issueLinkType.id
    };

    axios
        .graphql(
            `
                mutation CreateLinkIssue($input: CreateIssueLinkInput!) {
                    createIssueLink(input: $input) {
                        issueLink {
                            id
                            issue1 {
                                id
                                issueKey
                                issueType {
                                    title
                                    icon
                                    iconColor
                                }
                                issuePriority {
                                    title
                                    icon
                                    iconColor
                                }
                                issueStatus {
                                    id
                                    title
                                    icon
                                    iconColor
                                    doneStatus
                                }
                                title
                            }
                            issue2 {
                                id
                                issueKey
                                issueType {
                                    title
                                    icon
                                    iconColor
                                }
                                issuePriority {
                                    title
                                    icon
                                    iconColor
                                }
                                issueStatus {
                                    id
                                    title
                                    icon
                                    iconColor
                                    doneStatus
                                }
                                title
                            }
                            issueLinkType {
                                id
                            }
                        }
                    }
                }
            `,
            { input }
        )
        .then(data => {
            const issueLink = data.createIssueLink.issueLink;

            issue.value.issueLinks.push(issueLink);
        })
        .catch(e => {
            errors.value = handleError(e).genericErrors;
        })
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
    errors.value = [];

    axios
        .graphql(
            `
                mutation DeleteLinkIssue($issueLinkId: ID!) {
                    deleteIssueLink(id: $issueLinkId) {
                        id
                    }
                }
            `,
            { issueLinkId }
        )
        .then(data => {
            issue.value.issueLinks = issue.value.issueLinks
                .filter(it => it.id !== data.deleteIssueLink.id);
        })
        .catch(e => {
            errors.value = handleError(e).genericErrors;
        })
        .finally(() => {
            deleteDialogOpen.value = null;
            deleting.value = false;
        });
}

function openTagsDialog() {
    assignedTagIdsInDialog.value = issue.value.tags.map(it => it.id);
    manageTagsDialogOpen.value = true;
}

function updateTags() {
    manageTagsDialogSaving.value = true;

    // Calculate changes to be applied
    //
    // We use Sets for set operations.
    // Vue properties are arrays for reactivity, Vue does not work well with Sets.

    const tagIdsActual = new Set(issue.value.tags.map(it => it.id));
    const tagIdsDesired = new Set(assignedTagIdsInDialog.value);

    const tagIdsToAdd = tagIdsDesired.difference(tagIdsActual);
    const tagIdsToRemove = tagIdsActual.difference(tagIdsDesired);

    // Shortcut: Nothing to do.

    if (tagIdsToAdd.size === 0 && tagIdsToRemove.size === 0) {
        manageTagsDialogOpen.value = false;
        manageTagsDialogSaving.value = false;
        return;
    }

    // Execute all add/remove operations at once

    const addQueries = [...tagIdsToAdd].map((tagId, index) => (
        `
            addTag${index}: addTagToIssue(input: {
                issueId: "${issue.value.id}",
                tagId: "${tagId}"
            }) {
                tag {
                    id
                }
            }
        `
    ));

    const removeQueries = [...tagIdsToRemove].map((tagId, index) => (
        `
            removeTag${index}: removeTagFromIssue(input: {
                issueId: "${issue.value.id}",
                tagId: "${tagId}"
            }) {
                tag {
                    id
                }
            }
        `
    ));

    const query = `
        mutation UpdateTags {
            ${addQueries.join('\n')}
            ${removeQueries.join('\n')}
        }
    `;

    axios
        .graphql(query)
        .then(_data => {
            // Refresh issue and get finalized tags (fully loaded).
            fetchData(issue.value.id);
        })
        .catch(e => {
            const handledErrors = handleError(e);

            errors.value = handledErrors.genericErrors;
        })
        .finally(() => {
            manageTagsDialogOpen.value = false;
            manageTagsDialogSaving.value = false;
        });
}
</script>

<style lang="scss" scoped>
// Avoid nasty wrapping of "in progress"
// TODO investigate: Could be a global style, true for all icon+text to not break
.icon-link {
    white-space: nowrap;
}

.table.linkGroup {

    td:nth-child(1), td:nth-child(4), td:nth-child(5) {
        width: 32px;
        text-align: center;
    }
    td:nth-child(2) {
        width: 10%;
    }
    td:nth-child(6) {
        $countButtons: 1;

        width: calc($countButtons * 32px + ($countButtons - 1) * 0.25rem);
        text-align: center;
    }

    tr.done {
        td, a {
            color: var(--bs-gray-700);
        }
        .title {
            text-decoration: color-mix(in srgb, var(--bs-gray-400) 40%, transparent) 1px solid line-through;
            filter: grayscale(100%); // make emojis in the text also gray

            &:hover {
                text-decoration-line: underline;
            }
        }
    }
}
</style>
