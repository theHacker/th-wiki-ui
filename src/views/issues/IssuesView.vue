<template>
    <GridLayout>
        <template v-if="showFilters" #sidebar>
            <div class="card">
                <div class="card-header">
                    <div class="hstack gap-2">
                        <SearchInput v-model="filter.search" />
                        <Button
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

                            <div class="hstack gap-3">
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

                            <select v-model="sorting.sortFunctionTitle" class="form-select">
                                <option v-for="sortFunction in sortFunctions" :value="sortFunction.title">
                                    {{ sortFunction.title }}
                                </option>
                            </select>
                        </div>
                        <div class="col-12 col-sm-6 col-lg-12 col-xl-6">
                            <div class="form-check">
                                <input
                                    v-model="sorting.sortInverse"
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
                                        v-model="filter.showDone"
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
                                        v-model="filter.showOnlyDue"
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
                                <Loading />
                            </div>
                            <ProjectSelect
                                v-if="projects !== null"
                                v-model="filter.projectId"
                                :projects="projects"
                                nullOption="– All projects –"
                            />
                        </div>
                        <div class="col-12 col-sm-6 col-lg-12 col-xl-6">
                            <label class="form-label">Type</label>

                            <div v-if="issueTypes === null">
                                <Loading />
                            </div>
                            <select v-if="issueTypes !== null" v-model="filter.issueTypeId" class="form-select">
                                <option :value="null">– All types –</option>
                                <option v-for="type in issueTypes" :value="type.id">
                                    {{ type.title }}
                                </option>
                            </select>
                        </div>

                        <div class="col-12 col-sm-6 col-lg-12 col-xl-6">
                            <label class="form-label">Priority</label>

                            <div v-if="issuePriorities === null">
                                <Loading />
                            </div>
                            <select v-if="issuePriorities !== null" v-model="filter.issuePriorityId" class="form-select">
                                <option :value="null">– All priorities –</option>
                                <option v-for="priority in issuePriorities" :value="priority.id">
                                    {{ priority.title }}
                                </option>
                            </select>
                        </div>
                        <div class="col-12 col-sm-6 col-lg-12 col-xl-6">
                            <label class="form-label">Status</label>

                            <div v-if="issueStatuses === null">
                                <Loading />
                            </div>
                            <select v-if="issueStatuses !== null" v-model="filter.issueStatusId" class="form-select">
                                <option :value="null">– All statuses –</option>
                                <option v-for="status in issueStatuses" :value="status.id">
                                    {{ status.title }}
                                </option>
                            </select>
                        </div>

                        <div class="col-12 mt-md-4">
                            <Button
                                icon="xmark"
                                title="Clear all filters"
                                color="danger"
                                :disabled="!isFilterSet()"
                                @click="clearFilter"
                            />
                        </div>
                    </fieldset>
                </div>
            </div>
        </template>

        <template #default>
            <div class="d-flex flex-wrap flex-lg-nowrap mb-2 row-gap-2 gap-2">
                <div class="hstack gap-2 flex-grow-1">
                    <div class="btn-group">
                        <Button
                            icon="filter"
                            tooltip="Show filters"
                            fixedWidth
                            :active="showFilters"
                            @click="showFilters = !showFilters"
                        />
                    </div>

                    <SearchInput v-model="filter.search" />
                </div>

                <div class="hstack gap-2 w-100 w-lg-auto">
                    <div class="btn-group">
                        <Button
                            icon="key"
                            tooltip="Show keys"
                            fixedWidth
                            :active="showKeys"
                            @click="showKeys = !showKeys"
                        />
                        <Button
                            icon="icons"
                            tooltip="Show icons only"
                            fixedWidth
                            :active="showIcons"
                            @click="showIcons = !showIcons"
                        />
                        <Button
                            icon="table-cells"
                            tooltip="Dense table"
                            fixedWidth
                            :active="denseTable"
                            @click="denseTable = !denseTable"
                        />
                    </div>

                    <div class="btn-group">
                        <Button
                            icon="check"
                            tooltip="Show done issues"
                            fixedWidth
                            :active="filter.showDone"
                            @click="filter.showDone = !filter.showDone"
                        />
                    </div>

                    <div class="ms-auto ms-lg-2" />

                    <Button
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
                    <Loading>Loading issues…</Loading>
                </div>

                <span v-if="!loading && isFilterSet()">
                    <b>{{ issuesFiltered.length }}</b> {{ issuesFiltered.length !== 1 ? 'issues' : 'issue'}} filtered.
                </span>
                <span v-if="!loading">
                    <b>{{ issues.length }}</b> {{ issues.length !== 1 ? 'issues' : 'issue'}} total.
                </span>
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
                        v-for="issue in issuesFilteredAndSorted"
                        :key="issue.id"
                        :class="{ overdue: isOverdue(issue), done: issue.issueStatus.doneStatus }"
                    >
                        <td>
                            <span class="icon-link">
                                <span :class="{'d-inline': showIcons, 'd-none': !showIcons }">
                                    <i
                                        :class="`fas fa-${issue.issueType.icon} text-${issue.issueType.iconColor}`"
                                        :title="issue.issueType.title"
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
                            <RouterLink
                                :to="{ name: 'issue', params: { issueId: issue.id } }"
                                class="title"
                            >
                                {{ issue.title }}
                            </RouterLink>

                            <span
                                v-if="issue.dueDate"
                                class="ms-2"
                                :title="isOverdue(issue) ? `overdue since ${issue.dueDate}` : `due ${issue.dueDate}`"
                            >
                                <i class="fas fa-clock" :class="getDueColor(issue)" />
                            </span>
                        </td>
                        <td>
                            <span class="icon-link">
                                <span :class="{'d-inline': showIcons, 'd-none': !showIcons }">
                                    <i
                                        v-if="issue.issuePriority.showIconInList"
                                        :class="`fas fa-${issue.issuePriority.icon} text-${issue.issuePriority.iconColor}`"
                                        :title="issue.issuePriority.title"
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
                                        :class="`fas fa-${issue.issueStatus.icon} text-${issue.issueStatus.iconColor}`"
                                        :title="`${issue.issueStatus.title} (${issue.progress}%)`"
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
                    <tr v-if="issuesFilteredAndSorted.length === 0">
                        <td colspan="5" class="text-center">
                            <i>No issues.</i>
                        </td>
                    </tr>
                </tbody>
            </table>
            <div v-if="issuesFilteredAndSorted.length === 0 && isFilterSet()" class="d-flex justify-content-center mt-4">
                <Button
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
import Button from "@/components/Button.vue";
import SearchInput from "@/components/SearchInput.vue";
import Loading from "@/components/Loading.vue";
import {computed, ref} from "vue";
import GridLayout from "@/components/layout/GridLayout.vue";
import {isOverdue, getDueColor} from "@/views/issues/issue-functions.js";
import axios from "@/axios.js";
import {handleError} from "@/helper/graphql-error-handling.js";
import ProjectSelect from "@/components/general/ProjectSelect.vue";

const sortFunctions = [
    {
        title: 'Modification time',
        func: (a, b) => -a.modificationTime.localeCompare(b.modificationTime)
    },
    {
        title: 'Due date',
        func: (a, b) => {
            if (a.dueDate && !b.dueDate) {
                return -1;
            }
            else if (!a.dueDate && b.dueDate) {
                return +1;
            }
            else if (!a.dueDate && !b.dueDate) {
                return 0;
            }

            return a.dueDate.localeCompare(b.dueDate);
        }
    },
    {
        title: 'Key',
        func: (a, b) => {
            const projectCmp = a.project.prefix.localeCompare(b.project.prefix);
            if (projectCmp !== 0) {
                return projectCmp;
            }

            return -(a.issueNumber - b.issueNumber);
        }
    },
    {
        title: 'Priority',
        func: (a, b) => {
            const priorityToNumber = issuePriorityId => issuePriorities.value.findIndex(it => it.id === issuePriorityId);

            const aPriority = priorityToNumber(a.issuePriority.id);
            const bPriority = priorityToNumber(b.issuePriority.id);
            return -(aPriority - bPriority);
        }
    },
    {
        title: 'Status',
        func: (a, b) => {
            const statusToNumber = issueStatusId => issueStatuses.value.findIndex(it => it.id === issueStatusId);

            const aStatus = statusToNumber(a.issueStatus.id);
            const bStatus = statusToNumber(b.issueStatus.id);
            return aStatus - bStatus;
        }
    },
    {
        title: 'Type',
        func: (a, b) => {
            const typeToNumber = issueTypeId => issueTypes.value.findIndex(it => it.id === issueTypeId);

            const aType = typeToNumber(a.issueType.id);
            const bType = typeToNumber(b.issueType.id);
            return aType - bType;
        }
    },
    {
        title: 'Title',
        func: (a, b) => a.title.localeCompare(b.title)
    },
    {
        title: 'Creation time',
        func: (a, b) => -a.creationTime.localeCompare(b.creationTime)
    }
];

const filter = ref({
    search: '',
    projectId: null,
    issueTypeId: null,
    issuePriorityId: null,
    issueStatusId: null,
    showDone: false,
    showOnlyDue: false
});
const sorting = ref({
    sortFunctionTitle: sortFunctions[0].title,
    sortInverse: false
});

const issues = ref([]);
const projects = ref(null);
const issueTypes = ref(null);
const issuePriorities = ref(null);
const issueStatuses = ref(null);

const loading = ref(true);

const showFilters = ref(true);

const showKeys = ref(true);
const showIcons = ref(true);
const denseTable = ref(false);

const issuesFiltered = computed(() => {

    // Optimization: No filters? Just return everything
    if (!isFilterSet()) {
        return issues.value;
    }

    // Apply filters
    return issues.value.filter(issue => {

        if (filter.value.search != null) {
            if (!issue.title.toLowerCase().includes(filter.value.search.toLowerCase())) {
                return false;
            }
        }

        if (filter.value.projectId != null) {
            if (issue.project.id !== filter.value.projectId) {
                return false;
            }
        }
        if (filter.value.issueTypeId != null) {
            if (issue.issueType.id !== filter.value.issueTypeId) {
                return false;
            }
        }
        if (filter.value.issuePriorityId != null) {
            if (issue.issuePriority.id !== filter.value.issuePriorityId) {
                return false;
            }
        }
        if (filter.value.issueStatusId != null) {
            if (issue.issueStatus.id !== filter.value.issueStatusId) {
                return false;
            }
        }

        if (!filter.value.showDone) {
            if (issue.issueStatus.doneStatus) {
                return false;
            }
        }
        if (filter.value.showOnlyDue) {
            if (!issue.dueDate) {
                return false;
            }
        }

        return true;
    });
});

const issuesFilteredAndSorted = computed(() => {
    const sortFunction = sortFunctions
        .find(it => it.title === sorting.value.sortFunctionTitle)
        .func;

    const sortFunctionToUse = (sorting.value.sortInverse)
        ? (a, b) => -sortFunction(a, b)
        : sortFunction;

    return issuesFiltered.value.toSorted(sortFunctionToUse);
});

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
                    progress
                    dueDate
                    creationTime
                    modificationTime
                    doneTime
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
            }
        `
    )
    .then(data => {
        issues.value = data.issues;
        projects.value = data.projects;
        issueTypes.value = data.issueTypes;
        issuePriorities.value = data.issuePriorities;
        issueStatuses.value = data.issueStatuses;

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
        });

        loading.value = false;
    })
    .catch(e => {
        errors.value = handleError(e).genericErrors;
    });

function clearFilter() {
    filter.value = {
        search: '',
        projectId: null,
        issueTypeId: null,
        issuePriorityId: null,
        issueStatusId: null,
        showDone: true,
        showOnlyDue: false
    };
}

function isFilterSet() {
    return (
        filter.value.search !== '' ||
        filter.value.projectId !== null ||
        filter.value.issueTypeId !== null ||
        filter.value.issuePriorityId !== null ||
        filter.value.issueStatusId !== null ||
        !filter.value.showDone ||
        filter.value.showOnlyDue
    );
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
