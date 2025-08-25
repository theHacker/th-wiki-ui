<template>
    <GridLayout>
        <div class="col-12 col-lg-8 offset-lg-2">
            <h1>Edit issue</h1>

            <ErrorMessage v-if="errors.length > 0" :title="errors.length > 1 ? 'Errors' : 'Error'">
                <ul>
                    <li v-for="(error, index) in errors" :key="index">{{ error }}</li>
                </ul>
            </ErrorMessage>

            <div v-if="loading" class="mt-4">
                <LoadingIndicator>Loading issue…</LoadingIndicator>
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
import {useHead} from "@unhead/vue";
import {useRoute, useRouter} from "vue-router";
import axios from "@/axios.js";
import LoadingIndicator from "@/components/LoadingIndicator.vue";
import {handleError} from "@/helper/graphql-error-handling.js";

useHead({
    title: 'Edit issue'
});

const route = useRoute();
const router = useRouter();

const saving = ref(false);
const errors = ref([]);
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
    errors.value = [];
    issue.value = null;

    axios
        .graphql(
            `
                query Issue($issueId: ID!) {
                    issue(id: $issueId) {
                        id
                        project {
                            id
                        }
                        issueType {
                            id
                        }
                        issuePriority {
                            id
                        }
                        issueStatus {
                            id
                        }
                        title
                        description
                        progress
                        dueDate
                    }
                }
            `,
            { issueId: id }
        )
        .then(data => {
            issue.value = {
                id: data.issue.id,
                projectId: data.issue.project.id,
                issueTypeId: data.issue.issueType.id,
                issuePriorityId: data.issue.issuePriority.id,
                issueStatusId: data.issue.issueStatus.id,
                title: data.issue.title,
                description: data.issue.description,
                progress: data.issue.progress,
                dueDate: data.issue.dueDate
            };
        })
        .catch(e => {
            const handledErrors = handleError(e);

            errors.value = handledErrors.genericErrors;
            fieldErrors.value = handledErrors.fieldErrors;
        });
}

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
        })
        .catch(e => {
            const handledErrors = handleError(e);

            errors.value = handledErrors.genericErrors;
            fieldErrors.value = handledErrors.fieldErrors;
        });
}

function save(ctrlDown) {
    saving.value = true;
    fieldErrors.value = {};
    errors.value = [];

    const input = {
        id: issue.value.id,
        issueTypeId: issue.value.issueTypeId,
        issuePriorityId: issue.value.issuePriorityId,
        issueStatusId: issue.value.issueStatusId,
        title: issue.value.title,
        description: issue.value.description,
        progress: issue.value.progress,
        dueDate: issue.value.dueDate
    };

    axios
        .graphql(
            `
                mutation UpdateIssue($input: UpdateIssueInput!) {
                    updateIssue(input: $input) {
                        issue {
                            id
                        }
                    }
                }
            `,
            { input }
        )
        .then(data => {
            if (!ctrlDown) {
                router.push({ name: 'issue', params: { issueId: data.updateIssue.issue.id } });
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

function cancel() {
    router.back();
}
</script>
