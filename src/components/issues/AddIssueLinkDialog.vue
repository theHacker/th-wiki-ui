<template>
    <ConfirmDialog
        color="success"
        title="Link to another issue"
        size="large"
        :dialogOpen="dialogOpen"
        :progressing="linkingIssue"
        submitIcon="diagram-predecessor"
        submitTitle="Link"
        :submitDisabled="submitDisabled"
        cancelIcon="xmark"
        cancelTitle="Cancel"
        @submit="emitSubmit"
        @cancel="$emit('cancel')"
    >
        <ErrorMessage v-if="errors.length > 0" :title="errors.length > 1 ? 'Errors' : 'Error'">
            <ul>
                <li v-for="(error, index) in errors" :key="index">{{ error }}</li>
            </ul>
        </ErrorMessage>

        <LoadingIndicator v-if="loading" />

        <fieldset
            v-if="!loading"
            :disabled="false"
            class="row g-2 align-items-center"
        >
            <div class="col-auto">
                This issue
            </div>
            <div class="col-auto">
                <select
                    v-model="issueLinkType"
                    class="form-select"
                >
                    <template v-for="issueLinkType in issueLinkTypes" :key="issueLinkType.id">
                        <option
                            :value="{ id: issueLinkType.id, inverse: false }"
                        >{{ issueLinkType.wording }}</option>
                        <option
                            v-if="issueLinkType.wordingInverse"
                            :value="{ id: issueLinkType.id, inverse: true }"
                        >{{ issueLinkType.wordingInverse }}</option>
                    </template>
                </select>
            </div>
            <div class="col-auto">
                <select
                    v-model="otherIssueId"
                    class="form-select"
                >
                    <template v-for="issue in issues" :key="issue.id">
                        <option
                            :value="issue.id"
                            :disabled="issue.id === issueId"
                        >{{ issue.issueKey }}: {{ issue.title }}</option>
                    </template>
                </select>
            </div>
            <div class="col-auto">.</div>
        </fieldset>
    </ConfirmDialog>
</template>

<script setup>
import {computed, ref, watch} from "vue";
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import axios from "@/axios.js";
import {handleError} from "@/helper/graphql-error-handling.js";
import ErrorMessage from "@/components/ErrorMessage.vue";
import LoadingIndicator from "@/components/LoadingIndicator.vue";

const props = defineProps({
    dialogOpen: {
        type: Boolean,
        default: false
    },
    issueId: {
        type: String,
        required: true
    },
    linkingIssue: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['submit', 'cancel']);

const issues = ref(null);
const issueLinkTypes = ref(null);

const issueToIssueLinksMap = new Map(); // issueId => [issueLink]

const loading = ref(true);
const errors = ref([]);

const issueLinkType = ref(null);
const otherIssueId = ref(null);

const submitDisabled = computed(() => {
    if (loading.value) {
        return true;
    }

    // Option selected?

    if (issueLinkType.value === null) {
        return true;
    }
    if (otherIssueId.value === null) {
        return true;
    }

    // Check if selected options would lead to an already existing link

    const existingLinks = issueToIssueLinksMap.get(props.issueId)
        .filter(it =>
            it.issueLinkType.id === issueLinkType.value.id &&
            (it.issue1.id === otherIssueId.value ||
                it.issue2.id === otherIssueId.value)
        );
    if (existingLinks.length > 0) {
        return true;
    }

    // All clear

    return false;
});

watch(() => [props.dialogOpen, props.issueId], ([newDialogOpen, newIssueId], [_oldDialogOpen, oldIssueId]) => {
    // Load data only when dialog opens or issueId changes (not for closing the dialog)
    if (newIssueId !== oldIssueId || newDialogOpen === true) {
        fetchData();
    }
});

function fetchData() {
    loading.value = true;
    errors.value = [];

    issues.value = null;
    issueLinkTypes.value = null;

    // Reset form, too
    issueLinkType.value = null;
    otherIssueId.value = null;

    axios
        .graphql(
            `
                query IssuesAndLinks {
                    issues {
                        id
                        issueKey
                        title
                        issueLinks {
                            id
                            issue1 {
                                id
                            }
                            issue2 {
                                id
                            }
                            issueLinkType {
                                id
                            }
                        }
                    }
                    issueLinkTypes {
                        id
                        type
                        wording
                        wordingInverse
                    }
                }
            `
        )
        .then(data => {
            loading.value = false;

            issues.value = data.issues;
            issueLinkTypes.value = data.issueLinkTypes;

            // Update the map which issue has what issueLinks
            issueToIssueLinksMap.clear();
            for (const issue of data.issues) {
                issueToIssueLinksMap.set(issue.id, issue.issueLinks);
            }
        })
        .catch(e => {
            errors.value = handleError(e).genericErrors;
        });
}

function emitSubmit() {
    const issueLink = {
        issue1Id: (issueLinkType.value.inverse) ? otherIssueId.value : props.issueId,
        issue2Id: (issueLinkType.value.inverse) ? props.issueId : otherIssueId.value,
        issueLinkTypeId: issueLinkType.value.id
    };

    emit('submit', issueLink);
}
</script>
