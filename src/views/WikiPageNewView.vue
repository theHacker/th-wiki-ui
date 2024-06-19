<template>
    <div class="columns">
        <div class="column is-8 is-offset-2">
            <h1 class="title">New wiki page</h1>

            <ErrorMessage v-if="error">{{ error }}</ErrorMessage>

            <WikiPageEditForm
                v-model="entry"
                submitLabel="Create"
                :saving="saving"
                :fieldErrors="fieldErrors"
                @submit="save"
                @cancel="cancel"
            />
        </div>
    </div>
</template>

<script setup>
import axios from "@/axios.js";
import {ref} from 'vue';
import {useRouter} from "vue-router";
import WikiPageEditForm from "@/components/WikiPageEditForm.vue";
import ErrorMessage from "@/components/ErrorMessage.vue";

const router = useRouter();

const saving = ref(false);
const error = ref(null);
const fieldErrors = ref({});

const entry = ref({
    title: '',
    parentId: null,
    content: ''
    // TODO new field folder
});

function save() {
    saving.value = true;
    fieldErrors.value = {};
    error.value = null;

    axios
        .post('/entries', {
            ...entry.value,
            type: 'wiki'
        })
        .then(response => {
            router.push({ name: 'wikiPage', params: { entryId: response.data.id } });
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
