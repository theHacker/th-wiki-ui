<template>
    <GridLayout>
        <template #sidebar>
            <WikiPagesTree ref="wikiPagesTree" @onNodeDragDrop="onTreeNodeDragDrop" />
        </template>

        <template #default>
            <ErrorMessage v-if="errors.length > 0" :title="errors.length > 1 ? 'Errors' : 'Error'">
                <ul>
                    <li v-for="error in errors">{{ error }}</li>
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
                :submitDisabled="moveDialog.sourceWikiPage.id === null || moveDialog.sourceWikiPage.id === moveDialog.targetWikiPage.id"
                cancelIcon="xmark"
                cancelTitle="Cancel"
                @submit="moveWikiPage(moveDialog.sourceWikiPage.id, moveDialog.targetWikiPage.id)"
                @cancel="moveDialog = null"
            >
                <fieldset
                    :disabled="moveDialog.moving"
                    class="row my-3 align-items-center"
                >
                    <div class="col-auto">
                        Do you want to move the wiki page
                        "<b>{{ moveDialog.sourceWikiPage.title }}</b>"
                        to have "<b>{{ moveDialog.targetWikiPage.title }}</b>" as its new parent?
                    </div>
                </fieldset>
            </ConfirmDialog>

            <DeleteDialog
                v-if="deleteDialogOpen && deleteDialogOpen.wikiPage"
                :text='"Do you really want to delete the wiki page \"" + deleteDialogOpen.wikiPage.title + "\"?"'
                :dialogOpen="true"
                :deleting="deleting"
                @submit="deleteWikiPage"
                @cancel="deleteDialogOpen = null"
            />
            <DeleteDialog
                v-if="deleteDialogOpen && deleteDialogOpen.attachment"
                :text='"Do you really want to delete the attachment \"" + deleteDialogOpen.attachment.filename + "\"?"'
                :dialogOpen="true"
                :deleting="deleting"
                @submit="deleteAttachment(deleteDialogOpen.attachment)"
                @cancel="deleteDialogOpen = null"
            />

            <div v-if="wikiPage && !noPage">
                <h1>{{ wikiPage.title }}</h1>

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
                                    :badge="wikiPage.attachments.length > 0 ? wikiPage.attachments.length.toString() : null"
                                    :active="tabState === TabStates.Attachments"
                                    @click="tabState = TabStates.Attachments"
                                />
                            </ul>
                        </div>
                    </div>

                    <div class="hstack gap-2">
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
                            @click="deleteDialogOpen = { wikiPage }"
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

                <div v-if="tabState === TabStates.Attachments">
                    <table class="table table-responsive table-hover align-middle mb-5 attachments">
                        <thead>
                            <tr>
                                <th>Icon</th>
                                <th>Filename</th>
                                <th>Description</th>
                                <th>Size</th>
                                <th>Commands</th>
                            </tr>
                        </thead>
                        <tbody class="table-group-divider">
                            <tr v-for="attachment in wikiPage.attachments" :key="attachment.id">
                                <td>
                                   <i :class="attachmentIconClass(attachment)" />
                                </td>
                                <td>
                                    {{ attachment.filename }}
                                </td>
                                <td>{{ attachment.description }}</td>
                                <td>{{ attachment.size }}</td>
                                <td>
                                    <div class="hstack gap-1">
                                        <BaseButton
                                            icon="eye"
                                            tooltip="View"
                                            size="small"
                                            fixedWidth
                                            color="primary"
                                            @click="openAttachment(attachment, false)"
                                        />
                                        <BaseButton
                                            icon="download"
                                            tooltip="Download"
                                            size="small"
                                            fixedWidth
                                            color="success"
                                            @click="openAttachment(attachment, true)"
                                        />
                                        <BaseButton
                                            icon="trash"
                                            tooltip="Delete"
                                            size="small"
                                            fixedWidth
                                            color="danger"
                                            @click="deleteDialogOpen = { attachment }"
                                        />
                                    </div>
                                </td>
                            </tr>
                            <tr v-if="wikiPage.attachments.length === 0">
                                <td colspan="5" class="text-center">
                                    <i>No attachments.</i>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <AttachmentUploadForm
                        v-model="addAttachmentModel"
                        :uploading="uploadingAttachment"
                        @submit="uploadAttachment"
                        @cancel="resetAttachmentForm"
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
import AttachmentUploadForm from "@/components/general/AttachmentUploadForm.vue";
import {getIconForMimeType} from "@/helper/mime-type-icons.js";
import DeleteDialog from "@/components/DeleteDialog.vue";
import GridLayout from "@/components/layout/GridLayout.vue";
import WikiNoPage from "@/components/wiki/WikiNoPage.vue";
import {handleError} from "@/helper/graphql-error-handling.js";
import {blobToBase64, base64ToBlob} from "@/helper/base64.js";
import ProjectSelect from "@/components/general/ProjectSelect.vue";
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import {Tree} from "@/helper/tree.js";

const route = useRoute();
const router = useRouter();

const noPage = ref(true);

const errors = ref([]);
const wikiPage = ref(null);

const wikiPagesTree = ref(null);
const allWikiPagesTree = ref(null);

const addAttachmentModel = ref({
    file: null,
    description: ''
});
const uploadingAttachment = ref(false);

const tabState = ref(TabStates.Content);

const deleteDialogOpen = ref(null);
const deleting = ref(false);

const moveDialog = ref(null);

watch(() => route.params.wikiPageId, fetchData, { immediate: true });

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
                query WikiPageAndTree($wikiPageId: ID!) {
                    wikiPage(id: $wikiPageId) {
                        id
                        title
                        content
                        creationTime
                        modificationTime
                        parent {
                            id
                        }
                        attachments {
                            id
                            filename
                            description
                            size
                            mimeType
                        }
                    }
                    wikiPages {
                        id
                        title
                        parent {
                            id
                        }
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
            router.push({ name: 'wiki' });
        })
        .catch(e => {
            errors.value = handleError(e).genericErrors;
        })
        .finally(() => {
            deleteDialogOpen.value = null;
            deleting.value = false;
        });
}

async function uploadAttachment() {
    const wikiPageId = wikiPage.value.id;

    if (!wikiPageId) return;

    errors.value = [];
    uploadingAttachment.value = true;

    const file = addAttachmentModel.value.file;
    const dataBase64 = await blobToBase64(file);

    const input = {
        wikiPageId,
        filename: file.name,
        description: addAttachmentModel.value.description,
        dataBase64,
        mimeType: (file.type !== '') ? file.type : null
    }

    axios
        .graphql(
            `
                mutation CreateAttachment($input: CreateAttachmentInput!) {
                    createAttachment(input: $input) {
                        attachment {
                            id
                            filename
                            description
                            size
                            mimeType
                        }
                    }
                }
            `,
            { input }
        )
        .then(data => {
            resetAttachmentForm();

            wikiPage.value.attachments.push(data.createAttachment.attachment);
        })
        .catch(e => {
            errors.value = handleError(e).genericErrors;
        })
        .finally(() => {
            uploadingAttachment.value = false;
        });
}

function resetAttachmentForm() {
    addAttachmentModel.value = {
        file: null,
        description: ''
    };
}

function attachmentIconClass(attachment) {
    const icon = getIconForMimeType(attachment.mimeType);

    return `fas fa-${icon}`;
}

function openAttachment(attachment, download) {
    axios
        .graphql(
            `
                query OpenAttachment($attachmentId: ID!) {
                    attachment(id: $attachmentId) {
                        filename
                        dataBase64
                        mimeType
                    }
                }
            `,
            { attachmentId: attachment.id }
        )
        .then(data => {
            const att = data.attachment;
            const blob = base64ToBlob(att.dataBase64, att.mimeType);

            // Hacky solution to trigger the download client-side

            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.target = '_blank';
            if (download) {
                a.download = att.filename;
            }

            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        })
        .catch(e => {
            errors.value = handleError(e).genericErrors;
        });
}

function deleteAttachment(attachment) {
    deleting.value = true;
    errors.value = [];

    axios
        .graphql(
            `
                mutation DeleteAttachment($attachmentId: ID!) {
                    deleteAttachment(id: $attachmentId) {
                        id
                    }
                }
            `,
            { attachmentId: attachment.id }
        )
        .then(data => {
            wikiPage.value.attachments = wikiPage.value.attachments
                .filter(a => a.id !== data.deleteAttachment.id);
        })
        .catch(e => {
            errors.value = handleError(e).genericErrors;
        })
        .finally(() => {
            deleteDialogOpen.value = null;
            deleting.value = false;
        });
}

function onTreeNodeDragDrop(sourceWikiPageId, targetWikiPageId) {
    const sourceWikiPage = allWikiPagesTree.value.nodesById[sourceWikiPageId];
    const targetWikiPage = allWikiPagesTree.value.nodesById[targetWikiPageId];

    moveDialog.value = {
        sourceWikiPage,
        targetWikiPage,
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
                        mutation UpdateWikiPage($input: UpdateWikiPageInput!) {
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
            moveDialog.value = null;

            wikiPagesTree.value.refreshTree();
        })
        .catch(e => {
            errors.value = handleError(e).genericErrors;
        });
}
</script>

<style lang="scss" scoped>
.table.attachments {

    td:nth-child(1) {
        width: 32px;
    }
    td:nth-child(5) {
        $countButtons: 3;

        width: calc($countButtons * 32px + ($countButtons - 1) * 0.25rem);
    }
}
</style>
