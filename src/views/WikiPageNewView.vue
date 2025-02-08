<template>
    <div class="columns">
        <div class="column is-8 is-offset-2">
            <h1 class="title">New wiki page</h1>

            <div v-if="error" class="pb-3">
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

            <fieldset :disabled="saving">
                <div class="field">
                    <label class="label">Title</label>
                    <div class="control">
                        <input
                            v-model="wikiPage.title"
                            class="input"
                            :class="{'is-danger': !!fieldErrors.title}"
                            type="text"
                            placeholder="Title"
                        />
                    </div>
                    <p v-if="fieldErrors.title" class="help is-danger">{{ fieldErrors.title }}</p>
                </div>

                <div class="field">
                    <label class="label">Content</label>
                    <div class="control">
                        <textarea
                            v-model="wikiPage.markdown"
                            class="textarea"
                            :class="{'is-danger': !!fieldErrors.markdown}"
                            rows="15"
                            placeholder="Markdown"
                        />
                    </div>
                    <p v-if="fieldErrors.markdown" class="help is-danger">{{ fieldErrors.markdown }}</p>
                    <p class="help">Content will be parsed as Markdown.</p>
                </div>

                <div class="field is-grouped">
                    <div class="control">
                        <Button icon="check" title="Create" color="link" :loading="saving" @click="save" />
                    </div>
                    <div class="control">
                        <Button icon="xmark" title="Cancel" color="link" :light="true" @click="cancel" />
                    </div>
                </div>
            </fieldset>
        </div>
    </div>
</template>

<script setup>
import axios from "@/axios.js";
import {ref} from 'vue';
import {useRouter} from "vue-router";
import Button from "@/components/Button.vue";

const router = useRouter();

const saving = ref(false);
const error = ref(null);
const fieldErrors = ref({});

const wikiPage = ref({
    title: '',
    markdown: ''
});

function save() {
    saving.value = true;
    fieldErrors.value = {};
    error.value = null;

    axios
        .post('/wiki-pages', wikiPage.value)
        .then(response => {
            router.push({ name: 'wikiPage', params: { wikiPageId: response.data.id } });
        })
        .catch(e => {
            handleError(e);
        })
        .finally(() => {
            saving.value = false;
        });
}

function cancel() {
    router.back();
}

function handleError(e) {
    if (e.response && e.response.data && e.response.data.message) {
        const data = e.response.data;
        if (data.field) {
            fieldErrors.value[data.field] = data.message;
        } else {
            error.value = data.message;
        }
    } else if (error.request) {
        error.value = e.request; // untested, see https://axios-http.com/docs/handling_errors
    } else {
        error.value = e.message; // untested, see https://axios-http.com/docs/handling_errors
    }
}
</script>
