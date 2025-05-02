<template>
    <GridLayout>
        <DeleteDialog
            v-if="deleteDialogOpen"
            :dialogOpen="true"
            :deleting="deleting"
            @submit="deleteTag"
            @cancel="deleteDialogOpen = null"
        >
            Do you really want to delete the tag
            <TagBadge
                class="mx-1"
                :scope="deleteDialogOpen.tag.scope" :scopeIcon="deleteDialogOpen.tag.scopeIcon" :scopeColor="deleteDialogOpen.tag.scopeColor"
                :title="deleteDialogOpen.tag.title" :titleIcon="deleteDialogOpen.tag.titleIcon" :titleColor="deleteDialogOpen.tag.titleColor"
            />?
        </DeleteDialog>

        <h1>Tags</h1>

        <ErrorMessage v-if="errors.length > 0" :title="errors.length > 1 ? 'Errors' : 'Error'">
            <ul>
                <li v-for="(error, index) in errors" :key="index">{{ error }}</li>
            </ul>
        </ErrorMessage>

        <div class="row g-3">
            <div class="col-12 col-lg-10 offset-lg-1 col-xl-8 offset-xl-2">
                <div class="d-flex mb-2 row-gap-2 gap-2">
                    <div class="hstack gap-2 w-100">
                        <div class="btn-group">
                            <BaseButton
                                icon="palette"
                                tooltip="Show colors"
                                fixedWidth
                                :active="showColors"
                                @click="showColors = !showColors"
                            />
                            <BaseButton
                                icon="comment"
                                tooltip="Show description"
                                fixedWidth
                                :active="showDescription"
                                @click="showDescription = !showDescription"
                            />
                            <BaseButton
                                icon="table-cells"
                                tooltip="Dense table"
                                fixedWidth
                                :active="denseTable"
                                @click="denseTable = !denseTable"
                            />
                        </div>

                        <div class="btn-group">
                            <BaseButton
                                icon="maximize"
                                tooltip="Expand all projects"
                                fixedWidth
                                @click="expandAllGroups"
                            />
                            <BaseButton
                                icon="minimize"
                                tooltip="Collapse all projects"
                                fixedWidth
                                @click="collapseAllGroups"
                            />
                        </div>

                        <div class="ms-auto" />

                        <BaseButton
                            class="btn-text"
                            icon="plus"
                            title="New tag"
                            color="primary"
                            @click="$router.push({name: 'adminTagNew'})"
                        />
                    </div>
                </div>

                <LoadingIndicator v-if="loading" />

                <table
                    v-if="!loading"
                    class="table table-responsive table-hover align-middle tags"
                    :class="{showColors: showColors, 'table-sm': denseTable}"
                >
                    <thead>
                        <tr>
                            <th>Project / Tag</th>
                            <th class="columnIcon">Scope Icon</th>
                            <th class="columnColor" :class="{'d-table-cell': showColors, 'd-none': !showColors }">Scope Color</th>
                            <th class="columnIcon">Title Icon</th>
                            <th class="columnColor" :class="{'d-table-cell': showColors, 'd-none': !showColors }">Title Color</th>
                            <th :class="{'d-table-cell': showDescription, 'd-none': !showDescription }">Description</th>
                            <th class="columnCommands">Commands</th>
                        </tr>
                    </thead>
                    <tbody class="table-group-divider">
                        <template
                            v-for="group in tagsByProject"
                            :key="group.project?.id"
                        >
                            <tr
                                class="cursor-pointer user-select-none"
                                @click="toggleGroup(group)"
                            >
                                <td :colspan="3 + (showColors ? 2 : 0) + (showDescription ? 1 : 0)">
                                    <i
                                        class="me-2 fas fa-fw"
                                        :class="isGroupExpanded(group) ? 'fa-chevron-down' : 'fa-chevron-right'"
                                    />

                                    <span class="icon-link">
                                        <i v-if="group.project !== null" class="fas fa-rocket" />
                                        <i v-else class="fas fa-globe" />

                                        <b>
                                            <span v-if="group.project !== null">{{ group.project.title }}</span>
                                            <i v-else>Global tags</i>
                                        </b>

                                        <small class="ps-1 text-secondary-emphasis">
                                            {{ group.tags.length }} {{ group.tags.length !== 1 ? 'tags' : 'tag' }}
                                        </small>
                                    </span>
                                </td>
                                <td>
                                    <BaseButton
                                        class="btn-text"
                                        icon="plus"
                                        :title="group.project !== null ? 'Project tag' : 'Global tag'"
                                        size="small"
                                        color="primary"
                                        @click="$router.push({ name: 'adminTagNew', params: { projectId: group.project?.id } })"
                                    />
                                </td>
                            </tr>
                            <tr
                                v-show="isGroupExpanded(group)"
                                v-for="tag in group.tags"
                                :key="tag.id"
                            >
                                <td>
                                    <span class="px-3" />
                                    <TagBadge
                                        :scope="tag.scope" :scopeIcon="tag.scopeIcon" :scopeColor="tag.scopeColor"
                                        :title="tag.title" :titleIcon="tag.titleIcon" :titleColor="tag.titleColor"
                                    />
                                </td>
                                <td class="columnIcon">
                                    <code v-if="tag.scopeIcon">{{ tag.scopeIcon }}</code>
                                    <small v-else class="fst-italic text-secondary">– no icon –</small>
                                </td>
                                <td class="columnColor" :class="{'d-table-cell': showColors, 'd-none': !showColors }">
                                    <code v-if="tag.scopeColor">{{ tag.scopeColor }}</code>
                                    <small v-else class="fst-italic text-secondary">– no color –</small>
                                </td>
                                <td class="columnIcon">
                                    <code v-if="tag.titleIcon">{{ tag.titleIcon }}</code>
                                    <small v-else class="fst-italic text-secondary">– no icon –</small>
                                </td>
                                <td class="columnColor" :class="{'d-table-cell': showColors, 'd-none': !showColors }">
                                    <code>{{ tag.titleColor }}</code>
                                </td>
                                <td :class="{'d-table-cell': showDescription, 'd-none': !showDescription }">
                                    <span v-if="tag.description">{{ tag.description }}</span>
                                    <small v-else class="fst-italic text-secondary">– no description –</small>
                                </td>
                                <td class="columnCommands">
                                    <div class="hstack gap-1">
                                        <BaseButton
                                            icon="magnifying-glass"
                                            tooltip="Search usages"
                                            size="small"
                                            fixedWidth
                                            color="success"
                                            @click="console.log('Not yet supported. Will come later when there is global search over wiki pages and issues.')"
                                        />
                                        <BaseButton
                                            icon="pen"
                                            tooltip="Edit"
                                            size="small"
                                            fixedWidth
                                            color="light"
                                            @click="$router.push({name: 'adminTagEdit', params: { tagId: tag.id }})"
                                        />
                                        <BaseButton
                                            icon="trash"
                                            tooltip="Delete"
                                            size="small"
                                            fixedWidth
                                            color="danger"
                                            @click="deleteDialogOpen = { tag }"
                                        />
                                    </div>
                                </td>
                            </tr>
                        </template>
                        <tr v-if="tags.length === 0">
                            <td colspan="9" class="text-center">
                                <i>No tags.</i>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </GridLayout>
</template>

<script setup>
import GridLayout from "@/components/layout/GridLayout.vue";
import LoadingIndicator from "@/components/LoadingIndicator.vue";
import BaseButton from "@/components/BaseButton.vue";
import {computed, ref} from "vue";
import axios from "@/axios.js";
import {handleError} from "@/helper/graphql-error-handling.js";
import TagBadge from "@/components/TagBadge.vue";
import DeleteDialog from "@/components/DeleteDialog.vue";
import ErrorMessage from "@/components/ErrorMessage.vue";
import {sortTags} from "@/helper/sort-tags.js";

const tags = ref([]);
const loading = ref(true);

const errors = ref([]);

const showColors = ref(false);
const showDescription = ref(true);
const denseTable = ref(false);

const expandedProjectIds = ref([]);

const deleteDialogOpen = ref(null);
const deleting = ref(false);

fetchData();

const tagsByProject = computed(() => {
    const groups = Object.values(
        tags.value.reduce((accumulator, tag) => {
            const projectId = tag.project?.id || null;

            if (!accumulator[projectId]) {
                accumulator[projectId] = {
                    project: tag.project,
                    tags: []
                };
            }

            accumulator[projectId].tags.push(tag);
            return accumulator;
        }, {})
    );

    groups.sort((a, b) => {
        if (a.project === null) return -1;
        if (b.project === null) return 1;

        return a.project.title.localeCompare(b.project.title);
    });

    for (let group of groups) {
        sortTags(group.tags);
    }

    return groups;
});

function fetchData() {
    axios
        .graphql(
            `
                query Tags {
                    tags {
                        id
                        project {
                            id
                            title
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
            loading.value = false;
            tags.value = data.tags;

            expandAllGroups();
        })
        .catch(e => {
            errors.value = handleError(e).genericErrors;
        });
}

function isGroupExpanded(group) {
    const id = _groupToId(group);

    return expandedProjectIds.value.includes(id);
}

function toggleGroup(group) {
    const id = _groupToId(group);

    if (isGroupExpanded(group)) {
        expandedProjectIds.value = expandedProjectIds.value.filter(it => it !== id);
    } else {
        expandedProjectIds.value.push(id);
    }
}

function collapseAllGroups() {
    expandedProjectIds.value = [];
}

function expandAllGroups() {
    expandedProjectIds.value = tagsByProject.value.map(group => _groupToId(group));
}

function _groupToId(group) {
    return group.project?.id || null;
}

function deleteTag() {
    deleting.value = true;
    errors.value = [];

    axios
        .graphql(
            `
                mutation DeleteTag($tagId: ID!) {
                    deleteTag(id: $tagId) {
                        id
                    }
                }
            `,
            { tagId: deleteDialogOpen.value.tag.id }
        )
        .then(() => {
            fetchData();
        })
        .catch(e => {
            errors.value = handleError(e).genericErrors;
        })
        .finally(() => {
            deleteDialogOpen.value = null;
            deleting.value = false;
        });
}
</script>

<style lang="scss" scoped>
.table.tags {

    .columnColor {
        width: 175px;
    }
    .columnTitle {
        width: 125px;
    }
    .columnCommands {
        $countButtons: 3;

        width: calc($countButtons * 32px + ($countButtons - 1) * 0.25rem);
    }
}
</style>
