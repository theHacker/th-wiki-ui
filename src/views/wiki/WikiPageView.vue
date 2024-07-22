<template>
    <div class="columns">
        <div class="column is-3">
            <WikiPagesTree />
        </div>

        <div class="column is-9">
            <ErrorMessage v-if="error">{{ error }}</ErrorMessage>

            <div v-if="!entry" class="mt-4">
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
                text="Do you really want to convert this wiki page to a task? As of now, this operation cannot be undone."
                color="warning"
                :progressing="convertingToTask"
                submitIcon="bolt"
                submitTitle="Convert"
                cancelIcon="xmark"
                cancelTitle="Cancel"
                @submit="convertWikiPageToTask"
                @cancel="convertToTaskDialog = false"
            />

            <div v-if="entry">
                <h1 class="title">{{ entry.title }}</h1>

                <div class="columns">
                    <div class="column">
                        <div class="tabs">
                            <ul>
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
                                    :active="tabState === TabStates.Attachments"
                                    @click="tabState = TabStates.Attachments"
                                />
                            </ul>
                        </div>
                    </div>

                    <div class="column is-narrow">
                        <div class="buttons">
                            <Dropdown icon="gears" title="Actions">
                                <DropdownItem icon="bolt" title="Convert to task" @click="convertToTaskDialog = true" />
                            </Dropdown>
                            <Button
                                icon="pen"
                                title="Edit"
                                color="light"
                                @click="$router.push({ name: 'wikiPageEdit', params: { entryId: entry.id } });"
                            />
                            <Button
                                icon="trash"
                                title="Delete"
                                color="danger"
                                @click="deleteDialogOpen = { entry }"
                            />
                        </div>
                    </div>
                </div>

                <div v-if="tabState === TabStates.Content" class="content">
                    <div v-html="entry.renderedMarkdown" />
                </div>

                <div v-else-if="tabState === TabStates.Markdown" class="markdown">
                    <pre><code v-html="entry.highlightedMarkdown" class="hljs language-markdown" /></pre>
                </div>

                <div v-else-if="tabState === TabStates.Metadata">
                    <div class="fixed-grid has-4-cols">
                        <div class="grid">
                            <div class="cell">
                                <div class="icon-text">
                                    <span class="icon">
                                        <i class="fas fa-clock" />
                                    </span>
                                    <span class="has-text-link-bold">Creation Time</span>
                                </div>
                                <p>{{ new Date(entry.creationTime).toLocaleString() }}</p>
                            </div>
                            <div class="cell">
                                <div class="icon-text">
                                    <span class="icon">
                                        <i class="fas fa-clock" />
                                    </span>
                                    <span class="has-text-link-bold">Modification Time</span>
                                </div>
                                <p>{{ new Date(entry.modificationTime).toLocaleString() }}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div v-if="tabState === TabStates.Attachments">
                    <table class="attachments table is-fullwidth is-hoverable">
                        <thead>
                            <tr>
                                <th>Icon</th>
                                <th>Filename</th>
                                <th>Description</th>
                                <th>Size</th>
                                <th>Commands</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="attachment in attachments">
                                <td>
                                   <span class="icon">
                                       <i :class="attachmentIconClass(attachment)" />
                                   </span>
                                </td>
                                <td>
                                    {{ attachment.filename }}
                                </td>
                                <td>{{ attachment.description }}</td>
                                <td>{{ attachment.size }}</td>
                                <td>
                                    <div class="field is-grouped">
                                        <div class="control">
                                            <Button
                                                icon="eye"
                                                tooltip="View"
                                                size="small"
                                                color="primary"
                                                @click="openAttachment(attachment, false)"
                                            />
                                        </div>
                                        <div class="control">
                                            <Button
                                                icon="download"
                                                tooltip="Download"
                                                size="small"
                                                color="success"
                                                @click="openAttachment(attachment, true)"
                                            />
                                        </div>
                                        <div class="control">
                                            <Button
                                                icon="trash"
                                                tooltip="Delete"
                                                size="small"
                                                color="danger"
                                                @click="deleteDialogOpen = { attachment }"
                                            />
                                        </div>
                                    </div>
                                </td>
                            </tr>
                            <tr v-if="attachments.length === 0">
                                <td colspan="5" class="has-text-centered">
                                    <i>No attachments.</i>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <div class="block">
                        <AttachmentUploadForm
                            v-model="addAttachmentModel"
                            :uploading="uploadingAttachment"
                            @submit="uploadAttachment"
                            @cancel="resetAttachmentForm"
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import {Marked} from 'marked';
import hljs from 'highlight.js/lib/core';
import markdown from 'highlight.js/lib/languages/markdown';

import 'highlight.js/styles/night-owl.css';

const marked = new Marked();

hljs.registerLanguage('markdown', markdown);

function renderMarkdown(markdown) {
    return marked.parse(markdown); // TODO Warning: We don't have any protection against malicious HTML! See https://marked.js.org/#installation
}

function highlightMarkdown(markdown) {
    return hljs.highlight(markdown, { language: 'markdown' }).value;
}

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

const route = useRoute();
const router = useRouter();

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

    axios
        .get('/entries/' + id)
        .then(response => {
            entry.value = {
                ...response.data,
                renderedMarkdown: renderMarkdown(response.data.content),
                highlightedMarkdown: highlightMarkdown(response.data.content)
            };
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

    .is-grouped {
        gap: 0.25rem; // reduce gap between buttons
    }
}
</style>
