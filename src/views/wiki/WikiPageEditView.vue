<template>
    <div class="columns">
        <div class="column is-8 is-offset-2">
            <h1 class="title">Edit wiki page</h1>

            <ErrorMessage v-if="error">{{ error }}</ErrorMessage>

            <div v-if="!entry" class="mt-4">
                <Loading>Loading entry…</Loading>
            </div>

            <WikiPageEditForm
                v-if="entry"
                v-model="entry"
                submitLabel="Update"
                submitCtrlLabel="Apply"
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
import {ref, watch} from 'vue';
import {useRoute, useRouter} from "vue-router";
import WikiPageEditForm from "@/components/wiki/WikiPageEditForm.vue";
import ErrorMessage from "@/components/ErrorMessage.vue";
import Loading from "@/components/Loading.vue";

const route = useRoute();
const router = useRouter();

const saving = ref(false);
const error = ref(null);
const fieldErrors = ref({});

const entry = ref(null);

watch(() => route.params.entryId, fetchData, { immediate: true });

function fetchData(id) {
    saving.value = false;
    fieldErrors.value = {};
    error.value = null;
    entry.value = null;

    axios
        .get('/entries/' + id)
        .then(response => {
            entry.value = response.data;
        })
        .catch(handleError);
}

function save(ctrlDown) {
    saving.value = true;
    fieldErrors.value = {};
    error.value = null;

    axios
        .put('/entries/' + entry.value.id, {
            ...entry.value,
            type: 'wiki'
        })
        .then(response => {
            if (!ctrlDown) {
                router.push({ name: 'wikiPage', params: { entryId: response.data.id } });
            }
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
