<template>
    <div class="columns">
        <div class="column is-3">
            <WikiPagesTree />
        </div>

        <div class="column is-9">
            <div v-if="error">
                <article class="message is-warning pb-4">
                    <div class="message-header">
                        <p>
                            <i class="fas fa-circle-info pr-1" />
                            Error
                        </p>
                    </div>
                    <div class="message-body">
                        {{ error }}
                    </div>
                </article>
            </div>

            <div v-if="!entry" class="mt-4">
                <div class="icon-text">
                    <span class="icon">
                        <i class="fas fa-spinner fa-pulse fa-2x" />
                    </span>
                    <span class="pl-2">Loading entry…</span>
                </div>
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
                                <li
                                    :class="{ 'is-active': tabState === TabStates.Content }"
                                    @click="tabState = TabStates.Content"
                                >
                                    <a>
                                        <span class="icon is-small">
                                            <i class="fas fa-image" />
                                        </span>
                                        <span>Content</span>
                                    </a>
                                </li>
                                <li
                                    :class="{ 'is-active': tabState === TabStates.Markdown }"
                                    @click="tabState = TabStates.Markdown"
                                >
                                    <a>
                                        <span class="icon is-small">
                                            <i class="fas fa-file-text" />
                                        </span>
                                        <span>Markdown</span>
                                    </a>
                                </li>
                                <li
                                    :class="{ 'is-active': tabState === TabStates.Metadata }"
                                    @click="tabState = TabStates.Metadata"
                                >
                                    <a>
                                        <span v-if="entryMetadata === null" class="icon">
                                            <i class="fas fa-spinner fa-pulse" />
                                        </span>
                                        <span v-if="entryMetadata !== null" class="icon is-small">
                                            <i class="fas fa-tags" />
                                        </span>
                                        <span>Metadata</span>
                                    </a>
                                </li>
                                <li
                                    :class="{ 'is-active': tabState === TabStates.Attachments }"
                                    @click="tabState = TabStates.Attachments"
                                >
                                    <a>
                                        <span class="icon is-small">
                                            <i class="fas fa-paperclip" />
                                        </span>
                                        <span>Attachments</span>
                                    </a>
                                </li>
                                <li
                                    :class="{ 'is-active': tabState === TabStates.Settings }"
                                    @click="tabState = TabStates.Settings"
                                >
                                    <a>
                                        <span class="icon is-small">
                                            <i class="fas fa-gears" />
                                        </span>
                                        <span>Settings</span>
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div class="column is-narrow">
                        <div class="buttons">
                            <Button icon="pen" title="Edit" color="light" />
                            <Button icon="trash" title="Delete" color="danger" @click="deleteDialogOpen = true" />
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
                        <div class="icon-text">
                            <span class="icon">
                                <i class="fas fa-spinner fa-pulse fa-2x" />
                            </span>
                            <span class="pl-2">Loading metadata…</span>
                        </div>
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
                    <div class="icon-text is-background-warning-20 p-2">
                        <span class="icon">
                            <i class="fas fa-person-digging" />
                        </span>
                        <span>Not yet implemented.</span>
                    </div>
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

const route = useRoute();
const router = useRouter();

const error = ref(null);
const entry = ref(null);
const entryMetadata = ref(null);

const tabState = ref(TabStates.Content);

const deleteDialogOpen = ref(false);
const deleting = ref(false);

watch(() => route.params.entryId, fetchData, { immediate: true });

function fetchData(id) {
    error.value = null;
    entry.value = null;
    entryMetadata.value = null;

    const handleError = (e) => {
        if (e.response) {
            error.value = e.response.data.message;
        } else if (error.request) {
            error.value = e.request; // untested, see https://axios-http.com/docs/handling_errors
        } else {
            error.value = e.message; // untested, see https://axios-http.com/docs/handling_errors
        }
    };

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
}

function deleteEntry() {
    deleting.value = true;
    error.value = null;

    axios
        .delete('/entries/' + entry.value.id)
        .then(() => {
            router.push({ name: 'wiki' });
        })
        .catch(e => {
            if (e.response) {
                error.value = e.response.data.message;
            } else if (error.request) {
                error.value = e.request; // untested, see https://axios-http.com/docs/handling_errors
            } else {
                error.value = e.message; // untested, see https://axios-http.com/docs/handling_errors
            }
        })
        .finally(() => {
            deleteDialogOpen.value = false;
            deleting.value = false;
        });
}
</script>

<style lang="scss" scoped>
.modal-content, .modal-card {
    overflow: unset; // fix Bulma cutting the box-shadow by "overflow: auto"
}
</style>
