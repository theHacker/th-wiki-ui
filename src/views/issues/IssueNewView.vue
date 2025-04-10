<template>
    <GridLayout>
        <div class="col-12 col-lg-8 offset-lg-2">
            <h1>New issue</h1>

            <ErrorMessage v-if="errors.length > 0" :title="errors.length > 1 ? 'Errors' : 'Error'">
                <ul>
                    <li v-for="error in errors">{{ error }}</li>
                </ul>
            </ErrorMessage>

            <div v-if="loading" class="mt-4">
                <LoadingIndicator>Loading…</LoadingIndicator>
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
import LoadingIndicator from "@/components/LoadingIndicator.vue";
import {computed, ref} from "vue";
import {useRouter} from "vue-router";
import axios from "@/axios.js";
import {handleError} from "@/helper/graphql-error-handling.js";

const router = useRouter();

const saving = ref(false);
const errors = ref([]);
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
    axios
        .graphql(
            `
                query IssueDropdowns {
                    projects {
                        id
                        prefix
                        title
                    }
                    issueTypes {
                        id
                        title
                    }
                    issuePriorities {
                        id
                        title
                    }
                    issueStatuses {
                        id
                        title
                    }
                }
            `
        )
        .then(data => {
            projects.value = data.projects;
            issueTypes.value = data.issueTypes;
            issuePriorities.value = data.issuePriorities;
            issueStatuses.value = data.issueStatuses;

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
            const handledErrors = handleError(e);

            errors.value = handledErrors.genericErrors;
            fieldErrors.value = handledErrors.fieldErrors;
        });
}

function save(ctrlDown) {
    fieldErrors.value = {};
    errors.value = [];

    // TODO more client-side validation. For now, we let the backend validate mostly.
    //      With the new GraphQL API there are errors leading to an invalid request,
    //      these must be stopped at client-side already.
    if (!issue.value.projectId) {
        fieldErrors.value.projectId = 'You must select a project.';
        return;
    }

    saving.value = true;

    axios
        .graphql(
            `
                mutation CreateIssue($input: CreateIssueInput!) {
                    createIssue(input: $input) {
                        issue {
                            id
                        }
                    }
                }
            `,
            { input: issue.value }
        )
        .then(data => {
            if (ctrlDown) {
                resetForm();
            } else {
                router.push({name: 'issue', params: {issueId: data.createIssue.issue.id}});
            }
        })
        .catch(e => {
            const handledErrors = handleError(e);

            errors.value = handledErrors.genericErrors;
            fieldErrors.value = handledErrors.fieldErrors;
        })
        .finally(() => {
            saving.value = false;
        });
}

function resetForm() {
    issue.value = {
        title: '',
        projectId: issue.value.projectId, // keep project for "Create and continue"
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
</script>
