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

                <pre><code class="language-md">{{ wikiPage.markdown }}</code></pre>
            </div>
        </div>
    </div>
</template>

<script setup>
import axios from "@/axios.js";
import {ref, watch} from 'vue';
import {useRoute} from "vue-router";
import WikiPagesTree from "@/components/WikiPagesTree.vue";

const route = useRoute();

const loading = ref(false);
const error = ref(null);
const wikiPage = ref(null);

watch(() => route.params.wikiPageId, fetchData, { immediate: true });

async function fetchData(id) {
    loading.value = true;
    error.value = null;
    wikiPage.value = null;

    axios
        .get('/wiki-pages/' + id)
        .then(response => {
            wikiPage.value = response.data;
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
