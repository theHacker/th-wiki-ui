<template>
    <GridLayout>
        <template #sidebar>
            <WikiPagesTree ref="wikiPagesTree" @onNodeDragDrop="onTreeNodeDragDrop" />
        </template>

        <template #default>
            <ErrorMessage v-if="errors.length > 0" :title="errors.length > 1 ? 'Errors' : 'Error'">
                <ul>
                    <li v-for="(error, index) in errors" :key="index">{{ error }}</li>
                </ul>
            </ErrorMessage>

            <WikiNoPage v-if="noPage" />

            <div v-if="!wikiPage && !noPage" class="mt-4">
                <LoadingIndicator>Loading wiki page…</LoadingIndicator>
            </div>

            <ConfirmDialog
                v-if="moveDialog"
                color="success"
                title="Move wiki page"
                :dialogOpen="true"
                :progressing="moveDialog.moving"
                submitIcon="arrow-right-long"
                submitTitle="Move"
                :submitDisabled="!isMovingAllowed(moveDialog.sourceWikiPageId, moveDialog.targetWikiPageId)"
                cancelIcon="xmark"
                cancelTitle="Cancel"
                @submit="moveWikiPage(moveDialog.sourceWikiPageId, moveDialog.targetWikiPageId)"
                @cancel="moveDialog = null"
            >
                <fieldset
                    :disabled="moveDialog.moving"
                    class="row my-3 align-items-center"
                >
                    <div class="col-auto">
                        Wiki page "<b>{{ moveDialog.sourceWikiPageTitle }}</b>" will get
                    </div>
                    <div class="col-auto my-3">
                        <select
                            v-model="moveDialog.targetWikiPageId"
                            class="form-select"
                        >
                            <option :value="null">(no parent)</option>
                            <option
                                v-for="wikiPage in allWikiPagesTree.toLinearArray()"
                                :key="wikiPage.id"
                                :value="wikiPage.id"
                            >
                                {{ optionIndent(wikiPage) }}{{ wikiPage.title }}
                            </option>
                        </select>
                    </div>
                    <div class="col-auto">
                        as its new parent.
                    </div>
                </fieldset>
            </ConfirmDialog>

            <DeleteDialog
                v-if="deleteDialogOpen"
                :dialogOpen="true"
                :deleting="deleting"
                @submit="deleteWikiPage"
                @cancel="deleteDialogOpen = false"
            >
                Do you really want to delete the wiki page "<b>{{ wikiPage.title }}</b>"?
            </DeleteDialog>

            <TagsDialog
                v-model="assignedTagIdsInDialog"
                :dialogOpen="manageTagsDialogOpen"
                :globalTags="availableGlobalTags"
                :saving="manageTagsDialogSaving"
                @submit="updateTags"
                @cancel="manageTagsDialogOpen = false"
            />

            <div v-if="wikiPage && !noPage">
                <BaseHeading :tags="wikiPage.tags">
                    {{ wikiPage.title }}
                </BaseHeading>

                <div class="d-flex flex-wrap flex-lg-nowrap mb-4 row-gap-3">
                    <div class="flex-grow-1 me-4">
                        <div class="tabs">
                            <ul class="nav nav-tabs">
                                <TabItem
                                    icon="image"
                                    title="Content"
                                    :active="tabState === TabStates.Content"
                                    @click="tabState = TabStates.Content"
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

                    <div class="hstack gap-2">
                        <BaseDropdown buttonClass="btn-text-lg" icon="gears" title="Actions">
                            <BaseDropdownItem
                                icon="tags"
                                title="Manage tags"
                                fixedWidth
                                @click="openTagsDialog"
                            />
                            <BaseDropdownItem
                                icon="arrow-right-long"
                                title="Move"
                                fixedWidth
                                @click="onMoveAction"
                            />
                        </BaseDropdown>

                        <BaseButton
                            class="btn-text-lg"
                            icon="pen"
                            title="Edit"
                            color="light"
                            @click="$router.push({ name: 'wikiPageEdit', params: { wikiPageId: wikiPage.id } });"
                        />
                        <BaseButton
                            class="btn-text-lg"
                            icon="trash"
                            title="Delete"
                            color="danger"
                            @click="deleteDialogOpen = true"
                        />
                    </div>
                </div>

                <div v-if="tabState === TabStates.Content">
                    <article v-html="wikiPage.renderedMarkdown" />
                </div>

                <div v-else-if="tabState === TabStates.Markdown">
                    <div class="highlightedCode">
                        <span class="language">Markdown</span>
                        <pre><code v-html="wikiPage.highlightedMarkdown" class="language-markdown" /></pre>
                    </div>
                </div>

                <div v-else-if="tabState === TabStates.Metadata">
                    <div class="row g-2">
                        <div class="col-12 col-md-6">
                            <div class="icon-link">
                                <i class="fas fa-clock" />
                                Creation Time
                            </div>
                            <div>{{ new Date(wikiPage.creationTime).toLocaleString() }}</div>
                        </div>
                        <div class="col-12 col-md-6">
                            <div class="icon-link">
                                <i class="fas fa-clock" />
                                Modification Time
                            </div>
                            <div>{{ new Date(wikiPage.modificationTime).toLocaleString() }}</div>
                        </div>
                    </div>
                </div>

                <div v-show="tabState === TabStates.Attachments">
                    <AttachmentsTab
                        :wikiPageId="wikiPage.id"
                        @loadingStarted="attachmentsLoading = true"
                        @loadingFinished="attachmentsLoading = false"
                        @attachmentUploaded="wikiPagesTree.refreshTree()"
                        @attachmentDeleted="wikiPagesTree.refreshTree()"
                        @attachmentsCountUpdated="count => attachmentsCount = count"
                    />
                </div>
            </div>
        </template>
    </GridLayout>
</template>

<script>
const TabStates = {
    Content: Symbol('Content'),
    Markdown: Symbol('Markdown'),
    Metadata: Symbol('Metadata'),
    Attachments: Symbol('Attachments')
};
</script>

<script setup>
import axios from "@/axios.js";
import {ref, watch} from 'vue';
import {useRoute, useRouter} from "vue-router";
import {renderMarkdown, highlightMarkdown} from "@/markdown";
import WikiPagesTree from "@/components/wiki/WikiPagesTree.vue";
import BaseButton from "@/components/BaseButton.vue";
import TabItem from "@/components/TabItem.vue";
import ErrorMessage from "@/components/ErrorMessage.vue";
import LoadingIndicator from "@/components/LoadingIndicator.vue";
import DeleteDialog from "@/components/DeleteDialog.vue";
import GridLayout from "@/components/layout/GridLayout.vue";
import WikiNoPage from "@/components/wiki/WikiNoPage.vue";
import {handleError} from "@/helper/graphql-error-handling.js";
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import {Tree} from "@/helper/tree.js";
import BaseDropdownItem from "@/components/BaseDropdownItem.vue";
import BaseDropdown from "@/components/BaseDropdown.vue";
import BaseHeading from "@/components/BaseHeading.vue";
import TagsDialog from "@/components/tags/TagsDialog.vue";
import AttachmentsTab from "@/components/general/AttachmentsTab.vue";
import {syncStateToHash} from "@/helper/hash-state.js";

const route = useRoute();
const router = useRouter();

const noPage = ref(true);

const errors = ref([]);
const wikiPage = ref(null);
const attachmentsLoading = ref(false);
const attachmentsCount = ref(0);

const wikiPagesTree = ref(null);
const allWikiPagesTree = ref(null);

const tabState = ref(TabStates.Content);

const deleteDialogOpen = ref(false);
const deleting = ref(false);

const moveDialog = ref(null);

const availableGlobalTags = ref([]);
const manageTagsDialogOpen = ref(false);
const manageTagsDialogSaving = ref(false);
const assignedTagIdsInDialog = ref([]);

watch(() => route.params.wikiPageId, fetchData, { immediate: true });

syncStateToHash([
    { type: 'enum', ref: tabState, enumObject: TabStates }
]);

function fetchData(id) {
    errors.value = [];
    wikiPage.value = null;

    if (id == null) {
        noPage.value = true;
        return;
    }

    axios
        .graphql(
            `
                query WikiPageAndTreeAndTags($wikiPageId: ID!) {
                    wikiPage(id: $wikiPageId) {
                        id
                        title
                        content
                        creationTime
                        modificationTime
                        parent {
                            id
                        }
                        tags {
                            id
                            scope
                            scopeIcon
                            scopeColor
                            title
                            titleIcon
                            titleColor
                            description
                        }
                    }
                    wikiPages {
                        id
                        title
                        parent {
                            id
                        }
                    }
                    globalTags {
                        id
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
            { wikiPageId: id }
        )
        .then(async data => {
            if (data.wikiPage === null) {
                errors.value = ["Wiki page does not exist."];
            } else {
                wikiPage.value = {
                    ...data.wikiPage,
                    renderedMarkdown: await renderMarkdown(data.wikiPage.content),
                    highlightedMarkdown: highlightMarkdown(data.wikiPage.content)
                };
                allWikiPagesTree.value = new Tree({
                    items: data.wikiPages,
                    parentIdFunction: n => n.parent?.id || null,
                    sortFunction: (a, b) => a.title.localeCompare(b.title)
                });
                noPage.value = false;

                availableGlobalTags.value = data.globalTags;
            }
        })
        .catch(e => {
            errors.value = handleError(e).genericErrors;
        });
}

function deleteWikiPage() {
    deleting.value = true;
    errors.value = [];

    axios
        .graphql(
            `
                mutation DeleteWikiPage($wikiPageId: ID!) {
                    deleteWikiPage(id: $wikiPageId) {
                        id
                    }
                }
            `,
            { wikiPageId: wikiPage.value.id }
        )
        .then(() => {
            wikiPagesTree.value.refreshTree();

            router.push({ name: 'wiki' });
        })
        .catch(e => {
            errors.value = handleError(e).genericErrors;
        })
        .finally(() => {
            deleteDialogOpen.value = false;
            deleting.value = false;
        });
}

function onTreeNodeDragDrop(sourceWikiPageId, targetWikiPageId) {
    const sourceWikiPage = allWikiPagesTree.value.nodesById[sourceWikiPageId];

    moveDialog.value = {
        sourceWikiPageId,
        sourceWikiPageTitle: sourceWikiPage.title,
        targetWikiPageId,
        moving: false
    };
}

function onMoveAction() {
    const sourceWikiPageId = wikiPage.value.id;
    const targetWikiPageId = wikiPage.value.parent?.id || null;

    moveDialog.value = {
        sourceWikiPageId,
        sourceWikiPageTitle: wikiPage.value.title,
        targetWikiPageId,
        moving: false
    };
}

function moveWikiPage(sourceWikiPageId, targetWikiPageId) {
    moveDialog.value.moving = true;
    errors.value = [];

    // "Moving" is just a shortcut for "Query and update the parentId".
    // There is no designated "move" API.
    axios
        .graphql(
            `
                query WikiPage($wikiPageId: ID!) {
                    wikiPage(id: $wikiPageId) {
                        id
                        title
                        content
                    }
                }
            `,
            { wikiPageId: sourceWikiPageId }
        )
        .then(data => {
            const input = {
                ...data.wikiPage,
                parentId: targetWikiPageId
            };

            return axios
                .graphql(
                    `
                        mutation UpdateWikiPageParent($input: UpdateWikiPageInput!) {
                            updateWikiPage(input: $input) {
                                wikiPage {
                                    id
                                }
                            }
                        }
                    `,
                    { input }
                );
        })
        .then(_data => {
            // Refresh trees.
            // Note: Not perfect, as we have the state twice (here and in wikiPagesTree),
            // we do two identical requests.
            fetchData(wikiPage.value.id);
            wikiPagesTree.value.refreshTree();

            moveDialog.value = null;
        })
        .catch(e => {
            errors.value = handleError(e).genericErrors;
        });
}

function isMovingAllowed(sourceWikiPageId, targetWikiPageId) {
    // Can't move into itself
    if (sourceWikiPageId === targetWikiPageId) {
        return false;
    }

    // Doesn't make sense if it's already the direct parent
    if (allWikiPagesTree.value.isParent(targetWikiPageId, sourceWikiPageId)) {
        return false;
    }

    // Can't create a cycle
    if (allWikiPagesTree.value.isDescendant(targetWikiPageId, sourceWikiPageId)) {
        return false;
    }

    // Fine to move
    return true;
}

function optionIndent(wikiPage) {
    const nbsp = String.fromCharCode(0xa0);
    const indent = nbsp.repeat(5);

    return indent.repeat(wikiPage.level - 1);
}

function openTagsDialog() {
    assignedTagIdsInDialog.value = wikiPage.value.tags.map(it => it.id);
    manageTagsDialogOpen.value = true;
}

function updateTags() {
    manageTagsDialogSaving.value = true;

    // Calculate changes to be applied
    //
    // We use Sets for set operations.
    // Vue properties are arrays for reactivity, Vue does not work well with Sets.

    const tagIdsActual = new Set(wikiPage.value.tags.map(it => it.id));
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
            addTag${index}: addTagToWikiPage(input: {
                wikiPageId: "${wikiPage.value.id}",
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
            removeTag${index}: removeTagFromWikiPage(input: {
                wikiPageId: "${wikiPage.value.id}",
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
            // Refresh wiki page and get finalized tags (fully loaded).
            fetchData(wikiPage.value.id);
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
