<template>
    <GridLayout>
        <div class="col-12 col-lg-8 offset-lg-2">
            <h1>Edit task</h1>

            <ErrorMessage v-if="error">{{ error }}</ErrorMessage>

            <div v-if="!entry" class="mt-4">
                <LoadingIndicator>Loading entry…</LoadingIndicator>
            </div>

            <TaskEditForm
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
    </GridLayout>
</template>

<script setup>
import axios from "@/axios.js";
import {ref, watch} from 'vue';
import {useRoute, useRouter} from "vue-router";
import TaskEditForm from "@/components/tasks/TaskEditForm.vue";
import ErrorMessage from "@/components/ErrorMessage.vue";
import LoadingIndicator from "@/components/LoadingIndicator.vue";
import GridLayout from "@/components/layout/GridLayout.vue";

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

    const request = {
        ...entry.value,
        type: 'task'
    };

    // Don't send read-only properties (TODO needs a better solution on BE side)
    delete request.creationTime;
    delete request.modificationTime;
    delete request.doneTime;

    axios
        .put('/entries/' + entry.value.id, request)
        .then(response => {
            if (!ctrlDown) {
                router.push({ name: 'task', params: { entryId: response.data.id } });
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
