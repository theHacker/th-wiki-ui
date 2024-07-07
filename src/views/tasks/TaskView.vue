<template>
    <div class="columns">
        <div class="column is-8 is-offset-2">
            <ErrorMessage v-if="error">{{ error }}</ErrorMessage>

            <div v-if="!entry" class="mt-4">
                <Loading>Loading entry…</Loading>
            </div>

            <DeleteDialog
                v-if="deleteDialogOpen && deleteDialogOpen.entry"
                :text='"Do you really want to delete the task \"" + deleteDialogOpen.entry.title + "\"?"'
                :dialog-open="true"
                :deleting="deleting"
                @submit="deleteEntry"
                @cancel="deleteDialogOpen = null"
            />

            <h1 class="title">{{ entry.title }}</h1>

            <div v-if="entry">
                <div class="columns">
                    <div class="column">
                        <div class="tabs">
                            <ul>
                                <Tab
                                    icon="list-check"
                                    title="Task"
                                    :active="tabState === TabStates.Task"
                                    @click="tabState = TabStates.Task"
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
                                @click="$router.push({ name: 'taskEdit', params: { entryId: entry.id } });"
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

                <div v-if="tabState === TabStates.Task">
                    <div class="columns">
                        <div class="column is-6">
                            <div>
                                <input class="checkbox mr-2" type="checkbox" :checked="entry.done" disabled />
                                <span v-if="entry.progress === 0">Task is not yet started.</span>
                                <span v-else-if="entry.progress < 100">Task is in progress.</span>
                                <span v-else-if="entry.progress === 100">Task is done.</span>
                            </div>

                            <div>
                                <progress
                                    class="progress is-primary mr-1"
                                    :value="entry.progress"
                                    max="100"
                                >{{ entry.progress }}%</progress> {{ entry.progress }}%
                            </div>
                        </div>

                        <div class="column is-6">
                            <div v-if="entry.dueDate === null">Task has no due date.</div>
                            <div v-else>Task is due {{ new Date(entry.dueDate).toLocaleDateString() }}.</div>

                            <div
                                v-if="isOverdue(entry)"
                                class="has-text-danger has-text-weight-semibold"
                            >Task is overdue.</div>
                        </div>
                    </div>

                    <h2 v-if="entry.content !== ''" class="subtitle">Content</h2>

                    <div class="content">
                        <div v-html="entry.renderedMarkdown" />
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
    Task: Symbol('Task')
};
</script>

<script setup>
import axios from "@/axios.js";
import {ref, watch} from 'vue';
import {useRoute, useRouter} from "vue-router";
import ErrorMessage from "@/components/ErrorMessage.vue";
import Loading from "@/components/Loading.vue";
import Button from "@/components/Button.vue";
import Tab from "@/components/Tab.vue";
import DeleteDialog from "@/components/DeleteDialog.vue";

const route = useRoute();
const router = useRouter();

const error = ref(null);
const entry = ref(null);

const tabState = ref(TabStates.Task);

const deleteDialogOpen = ref(null);
const deleting = ref(false);

watch(() => route.params.entryId, fetchData, { immediate: true });

function isOverdue(entry) {
    if (entry.dueDate === null) return false;
    if (entry.done) return false;

    return (Date.parse(entry.dueDate) < Date.now());
}

function fetchData(id) {
    error.value = null;
    entry.value = null;

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
}

function deleteEntry() {
    deleting.value = true;
    error.value = null;

    axios
        .delete('/entries/' + entry.value.id)
        .then(() => {
            router.push({ name: 'tasks' });
        })
        .catch(handleError)
        .finally(() => {
            deleteDialogOpen.value = null;
            deleting.value = false;
        });
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
</script>
