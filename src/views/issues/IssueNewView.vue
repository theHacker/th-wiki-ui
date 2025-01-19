<template>
    <GridLayout>
        <div class="col-12 col-lg-8 offset-lg-2">
            <h1>New issue</h1>

            <ErrorMessage v-if="error">{{ error }}</ErrorMessage>

            <div v-if="loading" class="mt-4">
                <Loading>Loading…</Loading>
            </div>

            <IssueEditForm
                v-if="!loading"
                v-model="issue"
                :projects="projects"
                :issueTypes="issueTypes"
                :issuePriorities="issuePriorities"
                :issueStatuses="issueStatuses"
                submitLabel="Create"
                submitCtrlLabel="Create and continue"
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
import Loading from "@/components/Loading.vue";
import {computed, ref} from "vue";
import {useRouter} from "vue-router";
import axios from "@/axios.js";

const router = useRouter();

const saving = ref(false);
const error = ref(null);
const fieldErrors = ref({});

// TODO these could later be configured on the objects themselves once user can configure them
const defaultValues = {
    issueType: 'Feature',
    issuePriority: 'Normal',
    issueStatus: 'Open'
};

const projects = ref(null);
const issueTypes = ref(null);
const issuePriorities = ref(null);
const issueStatuses = ref(null);

const defaultIssueTypeId = ref(null);
const defaultIssuePriorityId = ref(null);
const defaultIssueStatusId = ref(null);

const issue = ref({
    title: '',
    projectId: null,
    issueTypeId: null,
    issuePriorityId: null,
    issueStatusId: null,
    progress: null,
    dueDate: null,
    description: ''
});

const loading = computed(() => {
    return (
        projects.value === null ||
        issueTypes.value === null ||
        issuePriorities.value === null ||
        issueStatuses.value === null
    );
});

loadDropdowns();

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

            // Find default IDs

            const issueTypeId = issueTypes.value
                .find(issueType => issueType.title === defaultValues.issueType)
                ?.id;

            if (issueTypeId) {
                defaultIssueTypeId.value = issueTypeId;
            }

            const issuePriorityId = issuePriorities.value
                .find(issuePriority => issuePriority.title === defaultValues.issuePriority)
                ?.id;

            if (issuePriorityId) {
                defaultIssuePriorityId.value = issuePriorityId;
            }

            const issueStatusId = issueStatuses.value
                .find(issueStatus => issueStatus.title === defaultValues.issueStatus)
                ?.id;

            if (issueStatusId) {
                defaultIssueStatusId.value = issueStatusId;
            }

            // Set defaults

            if (issue.value.issueTypeId === null && defaultIssueTypeId.value !== null) {
                issue.value.issueTypeId = defaultIssueTypeId.value;
            }
            if (issue.value.issuePriorityId === null && defaultIssuePriorityId.value !== null) {
                issue.value.issuePriorityId = defaultIssuePriorityId.value;
            }
            if (issue.value.issueStatusId === null && defaultIssueStatusId.value !== null) {
                issue.value.issueStatusId = defaultIssueStatusId.value;
            }
        })
        .catch(e => {
            handleError(e);
        });
}

function save(ctrlDown) {
    saving.value = true;
    fieldErrors.value = {};
    error.value = null;

    axios
        .post('/issues', issue.value)
        .then(response => {
            if (ctrlDown) {
                resetForm();
            } else {
                router.push({name: 'issue', params: {issueId: response.data.id}});
            }
        })
        .catch(e => {
            handleError(e);
        })
        .finally(() => {
            saving.value = false;
        });
}

function resetForm() {
    issue.value = {
        title: '',
        projectId: null,
        issueTypeId: defaultIssueTypeId.value,
        issuePriorityId: defaultIssuePriorityId.value,
        issueStatusId: defaultIssueStatusId.value,
        progress: null,
        dueDate: null,
        description: ''
    };
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
