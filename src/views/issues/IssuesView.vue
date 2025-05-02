<template>
    <GridLayout>
        <template v-if="showFilters" #sidebar>
            <div class="card">
                <div class="card-header">
                    <div class="hstack gap-2">
                        <SearchInput v-model="quickSearch.search" />
                        <BaseButton
                            class="btn-text-xxl"
                            icon="plus"
                            title="New issue"
                            color="primary"
                            @click="$router.push({name: 'issueNew'})"
                        />
                    </div>
                </div>

                <div class="card-body">
                    <fieldset class="row g-3">
                        <div class="col-12">
                            <label class="form-label">Display</label>

                            <div class="hstack gap-3 flex-wrap">
                                <div class="form-check">
                                    <input
                                        v-model="showKeys"
                                        id="checkboxShowKeys"
                                        class="form-check-input"
                                        type="checkbox"
                                    />
                                    <label class="form-check-label" for="checkboxShowKeys">
                                        Show keys
                                    </label>
                                </div>
                                <div class="form-check">
                                    <input
                                        v-model="showIcons"
                                        id="checkboxShowIcons"
                                        class="form-check-input"
                                        type="checkbox"
                                    />
                                    <label class="form-check-label" for="checkboxShowIcons">
                                        Show icons only
                                    </label>
                                </div>
                                <div class="form-check">
                                    <input
                                        v-model="showTags"
                                        id="checkboxShowTags"
                                        class="form-check-input"
                                        type="checkbox"
                                    />
                                    <label class="form-check-label" for="checkboxShowTags">
                                        Show tags
                                    </label>
                                </div>
                                <div class="form-check">
                                    <input
                                        v-model="denseTable"
                                        id="checkboxDenseTable"
                                        class="form-check-input"
                                        type="checkbox"
                                    />
                                    <label class="form-check-label" for="checkboxDenseTable">
                                        Dense table
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div class="col-12">
                            <label class="form-label">Sorting</label>
                        </div>

                        <div class="col-12 col-sm-6 col-lg-12 col-xl-6">
                            <label class="form-label">Sort function</label>

                            <select v-model="quickSearch.sortFunctionKey" class="form-select">
                                <option
                                    v-for="sortFunction in sortFunctions"
                                    :key="sortFunction.key"
                                    :value="sortFunction.key"
                                >
                                    {{ sortFunction.title }}
                                </option>
                            </select>
                        </div>
                        <div class="col-12 col-sm-6 col-lg-12 col-xl-6">
                            <div class="form-check">
                                <input
                                    v-model="quickSearch.sortInverse"
                                    id="checkboxSortInverse"
                                    class="form-check-input"
                                    type="checkbox"
                                />
                                <label class="form-check-label" for="checkboxSortInverse">
                                    Sort inverse
                                </label>
                            </div>
                        </div>

                        <div class="col-12">
                            <label class="form-label">Filters</label>

                            <div class="hstack gap-3">
                                <div class="form-check">
                                    <input
                                        v-model="quickSearch.showDone"
                                        id="checkboxShowDone"
                                        class="form-check-input"
                                        type="checkbox"
                                    />
                                    <label class="form-check-label" for="checkboxShowDone">
                                        Show done issues
                                    </label>
                                </div>
                                <div class="form-check">
                                    <input
                                        v-model="quickSearch.showOnlyDue"
                                        id="checkboxShowOnlyDue"
                                        class="form-check-input"
                                        type="checkbox"
                                    />
                                    <label class="form-check-label" for="checkboxShowOnlyDue">
                                        Show only due issues
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div class="col-12 col-sm-6 col-lg-12 col-xl-6">
                            <label class="form-label">Project</label>

                            <div v-if="projects === null">
                                <LoadingIndicator />
                            </div>
                            <ProjectSelect
                                v-if="projects !== null"
                                v-model="quickSearch.projectId"
                                :projects="projects"
                                nullOption="– All projects –"
                            />
                        </div>
                        <div class="col-12 col-sm-6 col-lg-12 col-xl-6">
                            <label class="form-label">Type</label>

                            <div v-if="issueTypes === null">
                                <LoadingIndicator />
                            </div>
                            <select v-if="issueTypes !== null" v-model="quickSearch.issueTypeId" class="form-select">
                                <option :value="null">– All types –</option>
                                <option v-for="type in issueTypes" :key="type.id" :value="type.id">
                                    {{ type.title }}
                                </option>
                            </select>
                        </div>

                        <div class="col-12 col-sm-6 col-lg-12 col-xl-6">
                            <label class="form-label">Priority</label>

                            <div v-if="issuePriorities === null">
                                <LoadingIndicator />
                            </div>
                            <select v-if="issuePriorities !== null" v-model="quickSearch.issuePriorityId" class="form-select">
                                <option :value="null">– All priorities –</option>
                                <option v-for="priority in issuePriorities" :key="priority.id" :value="priority.id">
                                    {{ priority.title }}
                                </option>
                            </select>
                        </div>
                        <div class="col-12 col-sm-6 col-lg-12 col-xl-6">
                            <label class="form-label">Status</label>

                            <div v-if="issueStatuses === null">
                                <LoadingIndicator />
                            </div>
                            <select v-if="issueStatuses !== null" v-model="quickSearch.issueStatusId" class="form-select">
                                <option :value="null">– All statuses –</option>
                                <option v-for="status in issueStatuses" :key="status.id" :value="status.id">
                                    {{ status.title }}
                                </option>
                            </select>
                        </div>

                        <div class="col-12 mt-md-4">
                            <div class="hstack gap-2 flex-wrap">
                                <BaseButton
                                    icon="check"
                                    title="Apply quick search"
                                    color="success"
                                    @click="query = quickSearchToQuery(quickSearch, projects, issueTypes, issuePriorities, issueStatuses)"
                                />

                                <BaseButton
                                    icon="xmark"
                                    title="Clear search query"
                                    color="danger"
                                    :disabled="query === ''"
                                    @click="clearFilter"
                                />
                            </div>
                        </div>
                    </fieldset>
                </div>
            </div>
        </template>

        <template #default>
            <ErrorMessage v-if="errors.length > 0" :title="errors.length > 1 ? 'Errors' : 'Error'">
                <ul>
                    <li v-for="(error, index) in errors" :key="index">{{ error }}</li>
                </ul>
            </ErrorMessage>

            <div class="d-flex flex-wrap flex-lg-nowrap mb-2 row-gap-2 gap-2">
                <div class="hstack gap-2 flex-grow-1">
                    <div class="btn-group">
                        <BaseButton
                            icon="filter"
                            tooltip="Show filters"
                            fixedWidth
                            :active="showFilters"
                            @click="showFilters = !showFilters"
                        />
                    </div>

                    <SearchInput v-model="query" />
                </div>

                <div class="hstack gap-2 w-100 w-lg-auto">
                    <div class="btn-group">
                        <BaseButton
                            icon="key"
                            tooltip="Show keys"
                            fixedWidth
                            :active="showKeys"
                            @click="showKeys = !showKeys"
                        />
                        <BaseButton
                            icon="icons"
                            tooltip="Show icons only"
                            fixedWidth
                            :active="showIcons"
                            @click="showIcons = !showIcons"
                        />
                        <BaseButton
                            icon="tags"
                            tooltip="Show tags"
                            fixedWidth
                            :active="showTags"
                            @click="showTags = !showTags"
                        />
                        <BaseButton
                            icon="table-cells"
                            tooltip="Dense table"
                            fixedWidth
                            :active="denseTable"
                            @click="denseTable = !denseTable"
                        />
                    </div>

                    <div class="ms-auto ms-lg-2" />

                    <BaseButton
                        class="btn-text"
                        icon="plus"
                        title="New issue"
                        color="primary"
                        @click="$router.push({name: 'issueNew'})"
                    />
                </div>
            </div>

            <div class="mt-2 mb-2">
                <div v-if="loading" class="mt-4">
                    <LoadingIndicator>Loading issues…</LoadingIndicator>
                </div>

                <div v-if="!loading">
                    <div v-if="queryError" class="text-danger">
                        {{ queryError }}
                    </div>
                    <div v-else>
                        <b>{{ issuesResultingFromQuery.length }}</b> {{ issuesResultingFromQuery.length !== 1 ? 'issues' : 'issue'}} filtered.
                        <b>{{ issues.length }}</b> {{ issues.length !== 1 ? 'issues' : 'issue'}} total.
                    </div>
                </div>
            </div>

            <table
                v-if="!loading"
                class="table table-responsive table-hover align-middle"
                :class="{showIcons: showIcons, 'table-sm': denseTable}"
            >
                <thead>
                    <tr>
                        <th>Type</th>
                        <th :class="{'d-table-cell': showKeys, 'd-none': !showKeys }">Key</th>
                        <th>Title</th>
                        <th>Priority</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    <tr
                        v-for="issue in issuesResultingFromQuery"
                        :key="issue.id"
                        :class="{ overdue: isOverdue(issue), done: issue.issueStatus.doneStatus }"
                    >
                        <td>
                            <span class="icon-link">
                                <span :class="{'d-inline': showIcons, 'd-none': !showIcons }">
                                    <i
                                        :class="`fas fa-${issue.issueType.icon}`"
                                        :title="issue.issueType.title"
                                        v-bind="parseColor(issue.issueType.iconColor)"
                                    />
                                </span>
                                <span :class="{'d-inline': !showIcons, 'd-none': showIcons }">
                                    {{ issue.issueType.title }}
                                </span>
                            </span>
                        </td>
                        <td :class="{'d-table-cell': showKeys, 'd-none': !showKeys }">
                            {{ issue.issueKey }}
                        </td>
                        <td>
                            <div class="hstack align-items-start gap-1 flex-wrap">
                                <RouterLink
                                    :to="{ name: 'issue', params: { issueId: issue.id } }"
                                    class="title"
                                >
                                    {{ issue.title }}
                                </RouterLink>

                                <span
                                    v-if="issue.dueDate"
                                    class="ms-1"
                                    :title="isOverdue(issue) ? `overdue since ${issue.dueDate}` : `due ${issue.dueDate}`"
                                >
                                    <i class="fas fa-clock" :class="getDueColor(issue)" />
                                </span>

                                <template v-if="showTags && issue.tags.length > 0">
                                    <TagBadge
                                        v-for="(tag, index) in issue.tags"
                                        :key="tag.id"
                                        :class="{ 'ms-1': index === 0 }"
                                        :scope="tag.scope"
                                        :scopeIcon="tag.scopeIcon"
                                        :scopeColor="tag.scopeColor"
                                        :title="tag.title"
                                        :titleIcon="tag.titleIcon"
                                        :titleColor="tag.titleColor"
                                        :tooltip="tag.description"
                                    />
                                </template>
                            </div>
                        </td>
                        <td>
                            <span class="icon-link">
                                <span :class="{'d-inline': showIcons, 'd-none': !showIcons }">
                                    <i
                                        v-if="issue.issuePriority.showIconInList"
                                        :class="`fas fa-${issue.issuePriority.icon}`"
                                        :title="issue.issuePriority.title"
                                        v-bind="parseColor(issue.issuePriority.iconColor)"
                                    />
                                </span>
                                <span :class="{'d-inline': !showIcons, 'd-none': showIcons }">
                                    {{ issue.issuePriority.title }}
                                </span>
                            </span>
                        </td>
                        <td>
                            <span class="icon-link">
                                <span :class="{'d-inline': showIcons, 'd-none': !showIcons }">
                                    <i
                                        :class="`fas fa-${issue.issueStatus.icon}`"
                                        :title="`${issue.issueStatus.title} (${issue.progress}%)`"
                                        v-bind="parseColor(issue.issueStatus.iconColor)"
                                    />
                                </span>
                                <span :class="{'d-inline': !showIcons, 'd-none': showIcons }">
                                    {{ issue.issueStatus.title }}
                                </span>
                            </span>
                            <div v-if="issue.progress != null" class="progress" style="height: 3px;">
                                <div
                                    class="progress-bar bg-success"
                                    :style="{width: `${issue.progress}%`}"
                                />
                            </div>
                        </td>
                    </tr>
                    <tr v-if="issuesResultingFromQuery.length === 0">
                        <td colspan="5" class="text-center">
                            <i>No issues.</i>
                        </td>
                    </tr>
                </tbody>
            </table>
            <div
                v-if="issuesResultingFromQuery.length === 0 && query !== ''"
                class="d-flex justify-content-center mt-4"
            >
                <BaseButton
                    icon="xmark"
                    title="Clear all filters"
                    color="danger"
                    @click="clearFilter"
                />
            </div>
        </template>
    </GridLayout>
</template>

<script setup>
import BaseButton from "@/components/BaseButton.vue";
import SearchInput from "@/components/SearchInput.vue";
import LoadingIndicator from "@/components/LoadingIndicator.vue";
import {ref, watch} from "vue";
import GridLayout from "@/components/layout/GridLayout.vue";
import {getDueColor, isOverdue} from "@/views/issues/issue-functions.js";
import axios from "@/axios.js";
import {handleError} from "@/helper/graphql-error-handling.js";
import ProjectSelect from "@/components/general/ProjectSelect.vue";
import {buildSortFunctions, defaultSortFunctionKey, executeQuery, quickSearchToQuery} from "./issue-search.js";
import ErrorMessage from "@/components/ErrorMessage.vue";
import {parseColor} from "@/helper/color.js";
import TagBadge from "@/components/TagBadge.vue";
import {sortTags} from "@/helper/sort-tags.js";

const sortFunctions = ref([]);

const quickSearch = ref({
    search: '',
    projectId: null,
    issueTypeId: null,
    issuePriorityId: null,
    issueStatusId: null,
    showDone: false,
    showOnlyDue: false,
    sortFunctionKey: defaultSortFunctionKey,
    sortInverse: false
});
const query = ref('');

const errors = ref([]);
const issues = ref([]);
const projects = ref(null);
const issueTypes = ref(null);
const issuePriorities = ref(null);
const issueStatuses = ref(null);
const tags = ref(null);

const issuesResultingFromQuery = ref([]);
const queryError = ref(null);

const loading = ref(true);

const showFilters = ref(true);

const showKeys = ref(true);
const showIcons = ref(true);
const showTags = ref(true);
const denseTable = ref(false);

watch(
    [ query, issues ],
    () => {
        try {
            issuesResultingFromQuery.value = executeQuery(query.value, issues.value, sortFunctions.value);
            queryError.value = '';
        } catch (e) {
            // We don't change issuesResultingFromQuery, so the previous result is still displayed,
            // in addition to the error message.
            queryError.value = e;
        }
    }
);

axios
    .graphql(
        `
            query Issues {
                issues {
                    id
                    issueNumber # TODO issueKey
                    project {
                        id
                        prefix
                    }
                    issueType {
                        id
                    }
                    issuePriority {
                        id
                    }
                    issueStatus {
                        id
                    }
                    title
                    description # TODO only until we have server-side search functionality
                    progress
                    dueDate
                    creationTime
                    modificationTime
                    doneTime
                    tags {
                        id
                    }
                }
                projects {
                    id
                    prefix
                    title
                }
                issueTypes {
                    id
                    title
                    icon
                    iconColor
                }
                issuePriorities {
                    id
                    title
                    icon
                    iconColor
                    showIconInList
                }
                issueStatuses {
                    id
                    title
                    icon
                    iconColor
                    doneStatus
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
        `
    )
    .then(data => {
        issues.value = data.issues;
        projects.value = data.projects;
        issueTypes.value = data.issueTypes;
        issuePriorities.value = data.issuePriorities;
        issueStatuses.value = data.issueStatuses;
        tags.value = data.tags;

        issues.value.forEach(it => {
            // Synthesize issueKeys (GraphQL API does not offer them (yet))
            it.issueKey = `${it.project.prefix}-${it.issueNumber}`;

            // For convenience, add the full objects to the issue
            // (We could let this populate by GraphQL but this would mean more traffic, we prefer doing this here)

            it.project = projects.value
                .find(project => project.id === it.project.id);
            it.issueType = issueTypes.value
                .find(issueType => issueType.id === it.issueType.id);
            it.issuePriority = issuePriorities.value
                .find(issuePriority => issuePriority.id === it.issuePriority.id);
            it.issueStatus = issueStatuses.value
                .find(issueStatus => issueStatus.id === it.issueStatus.id);

            const tagIds = it.tags.map(tag => tag.id);
            it.tags = tags.value
                .filter(tag => tagIds.includes(tag.id));

            sortTags(it.tags);
        });

        sortFunctions.value = buildSortFunctions(issuePriorities.value, issueStatuses.value, issueTypes.value);

        loading.value = false;
    })
    .catch(e => {
        errors.value = handleError(e).genericErrors;
    });

function clearFilter() {
    query.value = '';
    quickSearch.value = {
        search: '',
        projectId: null,
        issueTypeId: null,
        issuePriorityId: null,
        issueStatusId: null,
        showDone: false,
        showOnlyDue: false,
        sortFunctionKey: defaultSortFunctionKey,
        sortInverse: false
    };
}
</script>

<style lang="scss" scoped>
table.table {

    &:not(.showIcons) {
        th:nth-child(1), td:nth-child(1) {
            width: 10%;
        }
        th:nth-child(2), td:nth-child(2) {
            width: 5%;
        }
        th:nth-child(4), td:nth-child(4) {
            width: 11%;
            text-align: center;
        }
        th:nth-child(5), td:nth-child(5) {
            width: 12%;
        }
    }

    &.showIcons {
        th:nth-child(1), td:nth-child(1) {
            width: 32px;
            text-align: center;
        }
        th:nth-child(2), td:nth-child(2) {
            width: 5%;
        }
        th:nth-child(4), td:nth-child(4) {
            width: 32px;
            text-align: center;
        }
        th:nth-child(5), td:nth-child(5) {
            width: 32px;
            text-align: center;
        }
    }

    // Statuses: format whole rows (for overdue and done tasks)

    tr.overdue {
        td, a {
            color: var(--bs-danger);
            font-weight: bold;
        }
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
