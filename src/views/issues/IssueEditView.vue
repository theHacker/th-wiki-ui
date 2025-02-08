<template>
    <GridLayout>
        <div class="col-12 col-lg-8 offset-lg-2">
            <h1>Edit issue</h1>

            <ErrorMessage v-if="error">{{ error }}</ErrorMessage>

            <div v-if="loading" class="mt-4">
                <Loading>Loading issue…</Loading>
            </div>

            <IssueEditForm
                v-if="!loading"
                v-model="issue"
                :projects="projects"
                :issueTypes="issueTypes"
                :issuePriorities="issuePriorities"
                :issueStatuses="issueStatuses"
                :disableProject="true"
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
import ErrorMessage from "@/components/ErrorMessage.vue";
import IssueEditForm from "@/components/issues/IssueEditForm.vue";
import GridLayout from "@/components/layout/GridLayout.vue";
import {computed, ref, watch} from "vue";
import {useRoute, useRouter} from "vue-router";
import axios from "@/axios.js";
import Loading from "@/components/Loading.vue";

const route = useRoute();
const router = useRouter();

const saving = ref(false);
const error = ref(null);
const fieldErrors = ref({});

const projects = ref(null);
const issueTypes = ref(null);
const issuePriorities = ref(null);
const issueStatuses = ref(null);

const issue = ref(null);

const loading = computed(() => {
    return (
        issue.value === null ||
        projects.value === null ||
        issueTypes.value === null ||
        issuePriorities.value === null ||
        issueStatuses.value === null
    );
});

loadDropdowns();

watch(() => route.params.issueId, fetchData, { immediate: true });

function fetchData(id) {
    saving.value = false;
    fieldErrors.value = {};
    error.value = null;
    issue.value = null;

    axios
        .get(`/issues/${id}`)
        .then(response => {
            issue.value = response.data;
        })
        .catch(handleError);
}

function loadDropdowns() {
    Promise
        .all([
            axios.get(`/projects`),
            axios.get(`/issue-types`),
            axios.get(`/issue-priorities`),
            axios.get(`/issue-statuses`)
        ])
        .then(responses => {
            projects.value = responses[0].data;
            issueTypes.value = responses[1].data;
            issuePriorities.value = responses[2].data;
            issueStatuses.value = responses[3].data;
        })
        .catch(e => {
            handleError(e);
        });
}

function save(ctrlDown) {
    saving.value = true;
    fieldErrors.value = {};
    error.value = null;

    const request = {...issue.value};

    // Don't send read-only properties (TODO needs a better solution on BE side)
    delete request.id;
    delete request.issueKey;
    delete request.creationTime;
    delete request.modificationTime;
    delete request.doneTime;

    axios
        .put(`/issues/${issue.value.id}`, request)
        .then(_response => {
            if (!ctrlDown) {
                router.push({ name: 'issue', params: { issueId: issue.value.id } });
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
