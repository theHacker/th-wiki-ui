<template>
    <div class="columns">
        <div class="column is-8 is-offset-2">
            <h1 class="title">New task</h1>

            <ErrorMessage v-if="error">{{ error }}</ErrorMessage>

            <TaskEditForm
                v-model="entry"
                submitLabel="Create"
                submitCtrlLabel="Create and continue"
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
import TaskEditForm from "@/components/tasks/TaskEditForm.vue";
import ErrorMessage from "@/components/ErrorMessage.vue";

const router = useRouter();

const saving = ref(false);
const error = ref(null);
const fieldErrors = ref({});

const emptyEntry = {
    title: '',
    parentId: null,
    content: '',
    progress: 0,
    done: false,
    dueDate: null
    // TODO new field folder
};

const entry = ref({...emptyEntry});

function save(ctrlDown) {
    saving.value = true;
    fieldErrors.value = {};
    error.value = null;

    const request = {
        ...entry.value,
        type: 'task'
    };

    axios
        .post('/entries', request)
        .then(response => {
            if (ctrlDown) {
                entry.value = {...emptyEntry};
            } else {
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
