<template>
    <GridLayout>
        <template #sidebar>
            <WikiPagesTree />
        </template>

        <template #default>
            <ErrorMessage v-if="error">{{ error }}</ErrorMessage>

            <WikiNoPage v-if="noPage" />

            <div v-if="!entry && !noPage" class="mt-4">
                <Loading>Loading entry…</Loading>
            </div>

            <DeleteDialog
                v-if="deleteDialogOpen && deleteDialogOpen.entry"
                :text='"Do you really want to delete the wiki page \"" + deleteDialogOpen.entry.title + "\"?"'
                :dialogOpen="true"
                :deleting="deleting"
                @submit="deleteEntry"
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
            <ConfirmDialog
                :dialogOpen="convertToTaskDialog"
                title="Convert wiki page to task"
                color="warning"
                :progressing="convertingToTask"
                submitIcon="bolt"
                submitTitle="Convert"
                cancelIcon="xmark"
                cancelTitle="Cancel"
                @submit="convertWikiPageToTask"
                @cancel="convertToTaskDialog = false"
            >
                Do you really want to convert this wiki page to a task?
                As of now, this operation cannot be undone.
            </ConfirmDialog>

            <div v-if="entry && !noPage">
                <h1>{{ entry.title }}</h1>

                <div class="d-flex flex-wrap flex-lg-nowrap mb-4 row-gap-3">
                    <div class="flex-grow-1 me-4">
                        <div class="tabs">
                            <ul class="nav nav-tabs">
                                <Tab
                                    icon="image"
                                    title="Content"
                                    :active="tabState === TabStates.Content"
                                    @click="tabState = TabStates.Content"
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
                                    icon="paperclip"
                                    title="Attachments"
                                    :badge="attachments.length > 0 ? attachments.length.toString() : null"
                                    :active="tabState === TabStates.Attachments"
                                    @click="tabState = TabStates.Attachments"
                                />
                            </ul>
                        </div>
                    </div>

                    <div class="hstack gap-2">
                        <Dropdown buttonClass="btn-text-lg" icon="gears" title="Actions">
                            <DropdownItem icon="bolt" title="Convert to task" @click="convertToTaskDialog = true" />
                        </Dropdown>
                        <Button
                            class="btn-text-lg"
                            icon="pen"
                            title="Edit"
                            color="light"
                            @click="$router.push({ name: 'wikiPageEdit', params: { entryId: entry.id } });"
                        />
                        <Button
                            class="btn-text-lg"
                            icon="trash"
                            title="Delete"
                            color="danger"
                            @click="deleteDialogOpen = { entry }"
                        />
                    </div>
                </div>

                <div v-if="tabState === TabStates.Content">
                    <article v-html="entry.renderedMarkdown" />
                </div>

                <div v-else-if="tabState === TabStates.Markdown">
                    <div class="highlightedCode">
                        <span class="language">Markdown</span>
                        <pre><code v-html="entry.highlightedMarkdown" class="language-markdown" /></pre>
                    </div>
                </div>

                <div v-else-if="tabState === TabStates.Metadata">
                    <div class="row g-2">
                        <div class="col-12 col-md-6">
                            <div class="icon-link">
                                <i class="fas fa-clock" />
                                Creation Time
                            </div>
                            <div>{{ new Date(entry.creationTime).toLocaleString() }}</div>
                        </div>
                        <div class="col-12 col-md-6">
                            <div class="icon-link">
                                <i class="fas fa-clock" />
                                Modification Time
                            </div>
                            <div>{{ new Date(entry.modificationTime).toLocaleString() }}</div>
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
                            <tr v-for="attachment in attachments" :key="attachment.id">
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
                                        <Button
                                            icon="eye"
                                            tooltip="View"
                                            size="small"
                                            fixedWidth
                                            color="primary"
                                            @click="openAttachment(attachment, false)"
                                        />
                                        <Button
                                            icon="download"
                                            tooltip="Download"
                                            size="small"
                                            fixedWidth
                                            color="success"
                                            @click="openAttachment(attachment, true)"
                                        />
                                        <Button
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
import Button from "@/components/Button.vue";
import Tab from "@/components/Tab.vue";
import ErrorMessage from "@/components/ErrorMessage.vue";
import Loading from "@/components/Loading.vue";
import AttachmentUploadForm from "@/components/general/AttachmentUploadForm.vue";
import {getIconForMimeType} from "@/helper/mime-type-icons.js";
import DeleteDialog from "@/components/DeleteDialog.vue";
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import Dropdown from "@/components/Dropdown.vue";
import DropdownItem from "@/components/DropdownItem.vue";
import GridLayout from "@/components/layout/GridLayout.vue";
import WikiNoPage from "@/components/wiki/WikiNoPage.vue";

const route = useRoute();
const router = useRouter();

const noPage = ref(true);

const error = ref(null);
const entry = ref(null);
const attachments = ref([]);

const addAttachmentModel = ref({
    file: null,
    description: ''
});
const uploadingAttachment = ref(false);

const tabState = ref(TabStates.Content);

const deleteDialogOpen = ref(null);
const deleting = ref(false);

const convertToTaskDialog = ref(false);
const convertingToTask = ref(false);

watch(() => route.params.entryId, fetchData, { immediate: true });

function fetchData(id) {
    error.value = null;
    entry.value = null;
    attachments.value = [];

    if (id == null) {
        noPage.value = true;
        return;
    }

    axios
        .get('/entries/' + id)
        .then(async response => {
            entry.value = {
                ...response.data,
                renderedMarkdown: await renderMarkdown(response.data.content),
                highlightedMarkdown: highlightMarkdown(response.data.content)
            };
            noPage.value = false;
        })
        .catch(handleError);

    loadAttachments(id);
}

function loadAttachments(entryId) {
    attachments.value = [];

    axios
        .get('/attachments?entryId=' + entryId)
        .then(response => {
            attachments.value = response.data;
        })
        .catch(handleError);
}

function deleteEntry() {
    deleting.value = true;
    error.value = null;

    axios
        .delete('/entries/' + entry.value.id)
        .then(() => {
            router.push({ name: 'wiki' });
        })
        .catch(handleError)
        .finally(() => {
            deleteDialogOpen.value = null;
            deleting.value = false;
        });
}

function uploadAttachment() {
    const entryId = entry.value.id;

    if (!entryId) return;

    error.value = null;
    uploadingAttachment.value = true;

    const formData = new FormData();
    formData.append("entryId", entryId);
    formData.append("file", addAttachmentModel.value.file);
    formData.append("description", addAttachmentModel.value.description);

    axios
        .post('/attachments', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        .then(() => {
            resetAttachmentForm();
            loadAttachments(entryId);
        })
        .catch(handleError)
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

function handleError(e) {
    if (e.response) {
        error.value = e.response.data.message || e.response.data.error || 'Unknown error';
    } else if (error.request) {
        error.value = e.request; // untested, see https://axios-http.com/docs/handling_errors
    } else {
        error.value = e.message; // untested, see https://axios-http.com/docs/handling_errors
    }
}

function attachmentIconClass(attachment) {
    const icon = getIconForMimeType(attachment.mimeType);

    return `fas fa-${icon}`;
}

function openAttachment(attachment, download) {
    const apiUrl = window.env.API_URL || import.meta.env.VITE_API_URL;
    let url = apiUrl + '/attachments/' + attachment.id + '/file';

    if (download) {
        url += '?download=1';
    }

    window.open(url, '_blank');
}

function deleteAttachment(attachment) {
    deleting.value = true;
    error.value = null;

    axios
        .delete('/attachments/' + attachment.id)
        .then(() => {
            loadAttachments(entry.value.id);
        })
        .catch(handleError)
        .finally(() => {
            deleteDialogOpen.value = null;
            deleting.value = false;
        });
}

function convertWikiPageToTask() {
    const entryId = entry.value.id;

    if (!entryId) return;

    error.value = null;
    convertingToTask.value = true;

    axios
        .patch('/entries/' + entry.value.id, {
            type: 'task'
        })
        .then(response => {
            router.push({ name: 'task', params: { entryId: response.data.id } });
        })
        .catch(e => {
            handleError(e);
        })
        .finally(() => {
            convertToTaskDialog.value = false;
            convertingToTask.value = false;
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
