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
                            @click="console.log('Not yet implemented.')"
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
                            </div>
                        </div>

                        <div class="col-12 col-sm-6 col-lg-12 col-xl-6">
                            <label class="form-label">Project</label>

                            <div v-if="projects === null">
                                <Loading />
                            </div>
                            <select v-if="projects !== null" v-model="filter.projectId" class="form-select">
                                <option :value="null">– All projects –</option>
                                <option v-for="project in projects" :value="project.id">
                                    {{ project.title }}
                                </option>
                            </select>
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
                        @click="console.log('Not yet implemented.')"
                    />
                </div>
            </div>

            <div v-if="loading" class="mt-4">
                <Loading>Loading issues…</Loading>
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
                        v-for="issue in issuesFiltered"
                        :key="issue.id"
                        :class="{ overdue: isOverdue(issue), done: issue.done }"
                    >
                        <td>
                            <span class="icon-link">
                                <span :class="{'d-inline': showIcons, 'd-none': !showIcons }">
                                    <component :is="renderIcon(issueTypes, it => issue.issueTypeId === it.id )" />
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

                            <span v-if="isOverdue(issue)" class="ms-2" :title="'overdue since ' + issue.dueDate">
                                <i class="fas fa-clock" />
                            </span>
                        </td>
                        <td>
                            <span class="icon-link">
                                <span :class="{'d-inline': showIcons, 'd-none': !showIcons }">
                                    <component
                                        :is="renderIcon(issuePriorities, it => issue.issuePriorityId === it.id && it.showIconInList )"
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
                                    <component
                                        :is="renderIcon(issueStatuses, it => issue.issueStatusId === it.id , issue.progress)"
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
                    <tr v-if="issuesFiltered.length === 0">
                        <td colspan="5" class="text-center">
                            <i>No issues.</i>
                        </td>
                    </tr>
                </tbody>
            </table>
            <div v-if="issuesFiltered.length === 0 && isFilterSet()" class="d-flex justify-content-center mt-4">
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
import {renderIcon, isOverdue} from "@/views/issues/issue-functions.js";
import axios from "@/axios.js";

const filter = ref({
    search: '',
    projectId: null,
    issueTypeId: null,
    issuePriorityId: null,
    issueStatusId: null,
    showDone: true
});

const issues = ref([]);
const projects = ref(null);
const issueTypes = ref(null);
const issuePriorities = ref(null);
const issueStatuses = ref(null);

const loading = ref(true);

const showFilters = ref(true);

const showKeys = ref(false);
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
            if (issue.projectId !== filter.value.projectId) {
                return false;
            }
        }
        if (filter.value.issueTypeId != null) {
            if (issue.issueTypeId !== filter.value.issueTypeId) {
                return false;
            }
        }
        if (filter.value.issuePriorityId != null) {
            if (issue.issuePriorityId !== filter.value.issuePriorityId) {
                return false;
            }
        }
        if (filter.value.issueStatusId != null) {
            if (issue.issueStatusId !== filter.value.issueStatusId) {
                return false;
            }
        }

        if (!filter.value.showDone) {
            if (issue.done) {
                return false;
            }
        }

        return true;
    });
});

Promise
    .all([
        axios.get(`/issues`),
        axios.get(`/projects`),
        axios.get(`/issue-types`),
        axios.get(`/issue-priorities`),
        axios.get(`/issue-statuses`)
    ])
    .then(responses => {
        projects.value = responses[1].data;
        issueTypes.value = responses[2].data;
        issuePriorities.value = responses[3].data;
        issueStatuses.value = responses[4].data;

        // For convenience, add the full objects and a done flag to the issue
        const issuesLoaded = [];
        for (let issue of responses[0].data) {
            const project = projects.value
                .find(project => project.id === issue.projectId);
            const issueType = issueTypes.value
                .find(issueType => issueType.id === issue.issueTypeId);
            const issuePriority = issuePriorities.value
                .find(issuePriority => issuePriority.id === issue.issuePriorityId);
            const issueStatus = issueStatuses.value
                .find(issueStatus => issueStatus.id === issue.issueStatusId);

            const done = issueStatus.isDoneStatus;

            issuesLoaded.push({
                ...issue,
                project,
                issueType,
                issuePriority,
                issueStatus,
                done
            });
        }
        issues.value = issuesLoaded;

        loading.value = false;
    });

function clearFilter() {
    filter.value = {
        search: '',
        projectId: null,
        issueTypeId: null,
        issuePriorityId: null,
        issueStatusId: null,
        showDone: true
    };
}

function isFilterSet() {
    return (
        filter.value.search !== '' ||
        filter.value.projectId !== null ||
        filter.value.issueTypeId !== null ||
        filter.value.issuePriorityId !== null ||
        filter.value.issueStatusId !== null ||
        !filter.value.showDone
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
