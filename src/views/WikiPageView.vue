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

            <div v-if="entry" class="modal" :class="{'is-active': deleteDialogOpen}">
                <div class="modal-background" />
                <div class="modal-content">
                    <article class="panel is-danger">
                        <p class="panel-heading">Really delete?</p>
                        <div class="panel-block">
                            <p>Do you really want to delete the wiki page "{{ entry.title }}"?</p>
                        </div>
                        <div class="panel-block">
                            <fieldset :disabled="deleting">
                                <div class="buttons">
                                    <Button
                                        icon="trash"
                                        title="Delete"
                                        color="danger"
                                        :loading="deleting"
                                        @click="deleteEntry"
                                    />
                                    <Button
                                        icon="xmark"
                                        title="Cancel"
                                        color="light"
                                        @click="deleteDialogOpen = false"
                                    />
                                </div>
                            </fieldset>
                        </div>
                    </article>
                </div>
            </div>

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
                                    :loading="entryMetadata === null"
                                    @click="tabState = TabStates.Metadata"
                                />
                                <Tab
                                    icon="paperclip"
                                    title="Attachments"
                                    :active="tabState === TabStates.Attachments"
                                    @click="tabState = TabStates.Attachments"
                                />
                                <Tab
                                    icon="gears"
                                    title="Settings"
                                    :active="tabState === TabStates.Settings"
                                    @click="tabState = TabStates.Settings"
                                />
                            </ul>
                        </div>
                    </div>

                    <div class="column is-narrow">
                        <div class="buttons">
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
                                @click="deleteDialogOpen = true"
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
                    <div v-if="!entryMetadata">
                        <Loading>Loading metadata…</Loading>
                    </div>
                    <div v-if="entryMetadata" class="fixed-grid has-4-cols">
                        <div class="grid">
                            <div class="cell">
                                <div class="icon-text">
                                    <span class="icon">
                                        <i class="fas fa-clock" />
                                    </span>
                                    <span class="has-text-link-bold">Creation Time</span>
                                </div>
                                <p>{{ new Date(entryMetadata.creationTime).toLocaleString() }}</p>
                            </div>
                            <div class="cell">
                                <div class="icon-text">
                                    <span class="icon">
                                        <i class="fas fa-clock" />
                                    </span>
                                    <span class="has-text-link-bold">Modification Time</span>
                                </div>
                                <p>{{ new Date(entryMetadata.modificationTime).toLocaleString() }}</p>
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
                </div>

                <div v-if="tabState === TabStates.Settings">
                    <div class="icon-text is-background-warning-20 p-2">
                        <span class="icon">
                            <i class="fas fa-person-digging" />
                        </span>
                        <span>Not yet implemented.</span>
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
    Attachments: Symbol('Attachments'),
    Settings: Symbol('Settings')
};
</script>

<script setup>
import axios from "@/axios.js";
import {ref, watch} from 'vue';
import {useRoute, useRouter} from "vue-router";
import WikiPagesTree from "@/components/WikiPagesTree.vue";
import Button from "@/components/Button.vue";
import Tab from "@/components/Tab.vue";
import ErrorMessage from "@/components/ErrorMessage.vue";
import Loading from "@/components/Loading.vue";
import {getIconForMimeType} from "@/helper/mime-type-icons.js";

const route = useRoute();
const router = useRouter();

const error = ref(null);
const entry = ref(null);
const entryMetadata = ref(null);
const attachments = ref([]);

const tabState = ref(TabStates.Content);

const deleteDialogOpen = ref(false);
const deleting = ref(false);

watch(() => route.params.entryId, fetchData, { immediate: true });

function fetchData(id) {
    error.value = null;
    entry.value = null;
    entryMetadata.value = null;
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

    axios
        .get('/entries/' + id + '/metadata')
        .then(response => {
            entryMetadata.value = response.data;
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
            deleteDialogOpen.value = false;
            deleting.value = false;
        });
}

function handleError(e) {
    if (e.response) {
        error.value = e.response.data.message;
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
    let url = '/api/attachments/' + attachment.id + '/file';

    if (download) {
        url += '?download=1';
    }

    window.open(url, '_blank');
}
</script>

<style lang="scss" scoped>
.modal-content, .modal-card {
    overflow: unset; // fix Bulma cutting the box-shadow by "overflow: auto"
}

.table.attachments {
    td:nth-child(1) {
        width: 32px;
    }
    td:nth-child(5) {
        $countButtons: 2;

        width: calc($countButtons * 32px + ($countButtons - 1) * 0.25rem);
    }

    .is-grouped {
        gap: 0.25rem; // reduce gap between buttons
    }
}
</style>
