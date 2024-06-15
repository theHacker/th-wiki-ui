<template>
    <div class="columns">
        <div class="column is-3">
            <WikiPagesTree />
        </div>

        <div class="column is-9">
            <div v-if="loading">
                <div class="icon-text">
                    <span class="icon">
                        <i class="fas fa-spinner fa-pulse fa-2x" />
                    </span>
                    <span class="pl-2">Loading…</span>
                </div>
            </div>

            <div v-if="error">
                <article class="message is-warning">
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

            <div v-if="wikiPage">
                <h1 class="title">{{ wikiPage.title }}</h1>

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
                                        <span class="icon is-small">
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
                            <Button icon="trash" title="Delete" color="danger" />
                        </div>
                    </div>
                </div>

                <div v-if="tabState === TabStates.Content" class="content">
                    <div v-html="wikiPage.renderedMarkdown" />
                </div>

                <div v-else-if="tabState === TabStates.Markdown" class="markdown">
                    <pre><code v-html="wikiPage.highlightedMarkdown" class="hljs language-markdown" /></pre>
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
                                <p>{{ new Date(wikiPage.creationTime).toLocaleString() }}</p>
                            </div>
                            <div class="cell">
                                <div class="icon-text">
                                    <span class="icon">
                                        <i class="fas fa-clock" />
                                    </span>
                                    <span class="has-text-link-bold">Modification Time</span>
                                </div>
                                <p>{{ new Date(wikiPage.modificationTime).toLocaleString() }}</p>
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
import {useRoute} from "vue-router";
import WikiPagesTree from "@/components/WikiPagesTree.vue";
import Button from "@/components/Button.vue";

const route = useRoute();

const loading = ref(false);
const error = ref(null);
const wikiPage = ref(null);

const tabState = ref(TabStates.Content);

watch(() => route.params.wikiPageId, fetchData, { immediate: true });

function fetchData(id) {
    loading.value = true;
    error.value = null;
    wikiPage.value = null;

    axios
        .get('/wiki-pages/' + id)
        .then(response => {
            wikiPage.value = {
                ...response.data,
                renderedMarkdown: renderMarkdown(response.data.markdown),
                highlightedMarkdown: highlightMarkdown(response.data.markdown)
            };
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
            loading.value = false;
        });
}
</script>
