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
                        <BaseDropdown buttonClass="btn-text-lg" icon="gears" title="Actions">
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
                    <div class="d-flex flex-wrap flex-lg-nowrap mb-2 row-gap-2 gap-2">
                        <div class="hstack gap-2 w-100 w-lg-auto">
                            <div class="btn-group">
                                <BaseButton
                                    icon="table-list"
                                    tooltip="Show table"
                                    fixedWidth
                                    :active="attachmentsView === AttachmentsView.Table"
                                    @click="attachmentsView = AttachmentsView.Table"
                                />
                                <BaseButton
                                    icon="image"
                                    tooltip="Show thumbnails"
                                    fixedWidth
                                    :active="attachmentsView === AttachmentsView.Thumbnails"
                                    @click="attachmentsView = AttachmentsView.Thumbnails"
                                />
                            </div>
                        </div>
                    </div>

                    <table
                        v-if="attachmentsView === AttachmentsView.Table"
                        class="table table-responsive table-hover align-middle mb-5 attachments"
                    >
                        <thead>
                            <tr>
                                <th>Icon</th>
                                <th>Filename</th>
                                <th>Description</th>
                                <th>MIME Type</th>
                                <th>Size</th>
                                <th>Dimensions</th>
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
                                <td>
                                    <code>{{ attachment.mimeType }}</code>
                                </td>
                                <td>
                                    <span :title="`${attachment.size} bytes`">
                                        {{ formatBytes(attachment.size) }}
                                    </span>
                                </td>
                                <td>
                                    <template v-if="attachment.imageSize">
                                        {{ attachment.imageSize.width }}×{{ attachment.imageSize.height }}
                                    </template>
                                </td>
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

                    <div v-if="attachmentsView === AttachmentsView.Thumbnails" class="pt-3 pb-4">
                        <div v-if="wikiPage.attachments.length === 0">
                            <i>No attachments.</i>
                        </div>
                        <div class="row g-2 row-cols-1 row-cols-md-2 row-cols-xl-3 row-cols-xxl-4">
                            <div class="col" v-for="attachment in wikiPage.attachments" :key="attachment.id">
                                <div class="card h-100">
                                    <div class="card-body">
                                        <h5 class="card-title">
                                            <i :class="attachmentIconClass(attachment)" />
                                            {{ attachment.filename }}
                                        </h5>
                                        <div class="card-title text-center my-3">
                                            <span v-if="!attachment.imageSize" class="fa-stack fa-6x opacity-50" title="No image">
                                                <i class="fas fa-ban fa-flip-horizontal fa-stack-2x opacity-25" />
                                                <i class="fas fa-image fa-stack-1x" />
                                            </span>
                                            <a v-if="attachment.imageSize" target="_blank" :href="attachmentsThumbnails[attachment.id]">
                                                <img
                                                    :src="attachmentsThumbnails[attachment.id]"
                                                    class="img-thumbnail border-0"
                                                    alt="Thumbnail"
                                                />
                                            </a>
                                        </div>
                                        <p class="card-text">
                                            {{ attachment.description }}
                                        </p>
                                    </div>
                                    <div class="card-footer">
                                        <div class="hstack gap-2">
                                            <small class="text-body-secondary">
                                                <code class="ms-n2">{{ attachment.mimeType }}</code><br />
                                                <span :title="`${attachment.size} bytes`">
                                                    {{ formatBytes(attachment.size) }}
                                                </span>
                                                <template v-if="attachment.imageSize">
                                                    · {{ attachment.imageSize.width }}×{{ attachment.imageSize.height }}
                                                </template>
                                            </small>

                                            <div class="ms-auto" />

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
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

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

const AttachmentsView = {
    Table: Symbol('Table'),
    Thumbnails: Symbol('Thumbnails')
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
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import {Tree} from "@/helper/tree.js";
import BaseDropdownItem from "@/components/BaseDropdownItem.vue";
import BaseDropdown from "@/components/BaseDropdown.vue";
import {formatBytes} from "@/helper/format-bytes.js";

const route = useRoute();
const router = useRouter();

const noPage = ref(true);

const errors = ref([]);
const wikiPage = ref(null);

const wikiPagesTree = ref(null);
const allWikiPagesTree = ref(null);

const attachmentsView = ref(AttachmentsView.Table);
const attachmentsThumbnails = ref({});

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
                            imageSize {
                                width
                                height
                            }
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

                const imageAttachmentIds = data.wikiPage.attachments
                    .filter(a => a.imageSize)
                    .map(a => a.id);

                loadAttachmentThumbnails(imageAttachmentIds);
            }
        })
        .catch(e => {
            errors.value = handleError(e).genericErrors;
        });
}

function loadAttachmentThumbnails(attachmentIds) {
    // Note: There is no thumbnail available yet, so we just load the whole thing.
    axios
        .graphql(
            `
                query AttachmentThumbnails($attachmentIds: [ID!]!) {
                    attachments(ids: $attachmentIds) {
                        id
                        dataBase64
                        mimeType
                    }
                }
            `,
            { attachmentIds }
        )
        .then(data => {
            data.attachments.forEach(attachment => {
                const blob = base64ToBlob(attachment.dataBase64, attachment.mimeType);

                attachmentsThumbnails.value[attachment.id] = URL.createObjectURL(blob);
            });
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
                            imageSize {
                                width
                                height
                            }
                        }
                    }
                }
            `,
            { input }
        )
        .then(data => {
            resetAttachmentForm();

            wikiPage.value.attachments.push(data.createAttachment.attachment);

            if (data.createAttachment.attachment.imageSize) {
                loadAttachmentThumbnails([data.createAttachment.attachment.id]);
            }
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

function queryAttachmentData(attachment) {
    return axios
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
            return data.attachment;
        })
        .catch(e => {
            errors.value = handleError(e).genericErrors;
        });
}

async function openAttachment(attachment, download) {
    const attachmentWithData = await queryAttachmentData(attachment);
    const blob = base64ToBlob(attachmentWithData.dataBase64, attachmentWithData.mimeType);

    // Hacky solution to trigger the download client-side

    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.target = '_blank';
    if (download) {
        a.download = attachmentWithData.filename;
    }

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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
</script>

<style lang="scss" scoped>
.table.attachments {

    td:nth-child(1) {
        width: 32px;
    }
    td:nth-child(3) {
        width: 25%;
    }
    td:nth-child(7) {
        $countButtons: 3;

        width: calc($countButtons * 32px + ($countButtons - 1) * 0.25rem);
    }
}
</style>
