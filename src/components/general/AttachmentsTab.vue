<template>
    <ErrorMessage v-if="errors.length > 0" :title="errors.length > 1 ? 'Errors' : 'Error'">
        <ul>
            <li v-for="(error, index) in errors" :key="index">{{ error }}</li>
        </ul>
    </ErrorMessage>

    <div v-if="loading" class="my-4">
        <LoadingIndicator>Loading attachments…</LoadingIndicator>
    </div>

    <DeleteDialog
        v-if="deleteDialogOpen"
        :dialogOpen="true"
        :deleting="deleting"
        @submit="deleteAttachment(deleteDialogOpen.attachment)"
        @cancel="deleteDialogOpen = null"
    >
        Do you really want to delete the attachment "<b>{{ deleteDialogOpen.attachment.filename }}</b>"?
    </DeleteDialog>

    <template v-if="!loading">
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
                <tr v-for="attachment in attachments" :key="attachment.id">
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
                <tr v-if="attachments.length === 0">
                    <td colspan="7" class="text-center">
                        <i>No attachments.</i>
                    </td>
                </tr>
            </tbody>
        </table>

        <div v-if="attachmentsView === AttachmentsView.Thumbnails" class="pt-3 pb-4">
            <div v-if="attachments.length === 0">
                <i>No attachments.</i>
            </div>
            <div class="row g-2 row-cols-1 row-cols-md-2 row-cols-xl-3 row-cols-xxl-4">
                <div class="col" v-for="attachment in attachments" :key="attachment.id">
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
            :uploading="uploading"
            @submit="uploadAttachment"
            @cancel="resetAttachmentForm"
        />
    </template>
</template>

<script>
const AttachmentsView = {
    Table: Symbol('Table'),
    Thumbnails: Symbol('Thumbnails')
};
</script>

<script setup>
import {ref, watch} from "vue";
import BaseButton from "@/components/BaseButton.vue";
import DeleteDialog from "@/components/DeleteDialog.vue";
import AttachmentUploadForm from "@/components/general/AttachmentUploadForm.vue";
import {formatBytes} from "@/helper/format-bytes.js";
import axios from "@/axios.js";
import {base64ToBlob, blobToBase64} from "@/helper/base64.js";
import {handleError} from "@/helper/graphql-error-handling.js";
import {getIconForMimeType} from "@/helper/mime-type-icons.js";
import ErrorMessage from "@/components/ErrorMessage.vue";
import LoadingIndicator from "@/components/LoadingIndicator.vue";
import {UserPreferencesKeys, refSyncStateToUserPreferences} from "@/helper/local-storage.js";

const props = defineProps({
    // provide exactly one of them
    wikiPageId: {
        type: String,
        required: false
    },
    issueId: {
        type: String,
        required: false
    }
});

const emit = defineEmits([
    'loadingStarted',
    'loadingFinished',
    'attachmentUploaded',
    'attachmentDeleted',
    'attachmentsCountUpdated'
]);

const errors = ref([]);

const attachments = ref([]);
const loading = ref(true);

const attachmentsView = refSyncStateToUserPreferences({
    type: 'enum',
    defaultValue: AttachmentsView.Table,
    key: UserPreferencesKeys.AttachmentsView,
    enumObject: AttachmentsView
});

const attachmentsThumbnails = ref({});

const addAttachmentModel = ref({
    file: null,
    filename: '',
    lastModifiedTime: null,
    description: ''
});
const uploading = ref(false);

const deleteDialogOpen = ref(null);
const deleting = ref(false);

watch(
    [
        () => props.wikiPageId,
        () => props.issueId
    ],
    fetchData,
    { immediate: true }
);

function fetchData() {
    errors.value = [];
    attachments.value = [];
    loading.value = true;

    emit('loadingStarted');

    const fields = `
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
    `;

    let loadingPromise;
    if (props.wikiPageId) {
        loadingPromise = axios
            .graphql(
                `
                    query Attachments($wikiPageId: ID!) {
                        wikiPage(id: $wikiPageId) {
                            ${fields}
                        }
                    }
                `,
                { wikiPageId: props.wikiPageId }
            )
            .then(async data => {
                if (data.wikiPage === null) {
                    errors.value = ["Wiki page does not exist."];
                    return [];
                } else {
                    return data.wikiPage.attachments;
                }
            });
    } else if (props.issueId) {
        loadingPromise = axios
            .graphql(
                `
                    query Attachments($issueId: ID!) {
                        issue(id: $issueId) {
                            ${fields}
                        }
                    }
                `,
                { issueId: props.issueId }
            )
            .then(async data => {
                if (data.issue === null) {
                    errors.value = ["Issue does not exist."];
                    return [];
                } else {
                    return data.issue.attachments;
                }
            });
    }

    loadingPromise
        .then(dataAttachments => {
            attachments.value = dataAttachments;

            const imageAttachmentIds = attachments.value
                .filter(a => a.imageSize)
                .map(a => a.id);

            loadAttachmentThumbnails(imageAttachmentIds);
            loading.value = false;
        })
        .catch(e => {
            errors.value = handleError(e).genericErrors;
        })
        .finally(() => {
            emit('attachmentsCountUpdated', attachments.value.length);
            emit('loadingFinished');
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

async function uploadAttachment() {
    if (!props.wikiPageId && !props.issueId) return;

    errors.value = [];
    uploading.value = true;

    const file = addAttachmentModel.value.file;
    const dataBase64 = await blobToBase64(file);

    const input = {
        wikiPageId: props.wikiPageId || null,
        issueId: props.issueId || null,
        filename: addAttachmentModel.value.filename,
        lastModifiedTime: addAttachmentModel.value.lastModifiedTime,
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

            attachments.value.push(data.createAttachment.attachment);

            if (data.createAttachment.attachment.imageSize) {
                loadAttachmentThumbnails([data.createAttachment.attachment.id]);
            }

            emit('attachmentUploaded');
            emit('attachmentsCountUpdated', attachments.value.length);
        })
        .catch(e => {
            errors.value = handleError(e).genericErrors;
        })
        .finally(() => {
            uploading.value = false;
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
            attachments.value = attachments.value
                .filter(a => a.id !== data.deleteAttachment.id);

            emit('attachmentDeleted');
            emit('attachmentsCountUpdated', attachments.value.length);
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
