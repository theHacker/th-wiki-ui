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

            <div class="col-12">
                <hr class="mt-3 mb-2"/>
            </div>

            <div class="col-12">
                <h5 class="my-1">Quick search</h5>
            </div>

            <div class="col-10 col-lg order-0">
                <div class="input-group">
                    <span class="input-group-text">
                        <i class="fas fa-hashtag" />
                    </span>
                    <input
                        v-model="quickSearch.issueKeyNumber"
                        type="text"
                        class="form-control"
                        placeholder="issue key or number"
                    />
                </div>
            </div>

            <div class="col-12 col-lg order-2 order-lg-1">
                <div class="input-group">
                    <span class="input-group-text">
                        <i class="fas fa-align-left" />
                    </span>
                    <input
                        v-model="quickSearch.titleOrDescription"
                        type="text"
                        class="form-control"
                        placeholder="title or description"
                    />
                </div>
            </div>

            <div class="col-2 col-lg-auto order-1 order-lg-2">
                <BaseButton
                    icon="xmark"
                    color="danger"
                    @click="quickSearch.issueKeyNumber = ''; quickSearch.titleOrDescription = '';"
                />
            </div>

            <div class="col-12 order-3">
                <span v-if="!quickSearchActive">
                    <i>No filter set.</i>
                </span>
                <span v-else-if="quickSearchIssuesLimited.length === 0">
                    <i>No results.</i>
                </span>
                <span v-else-if="quickSearchIssuesLimited.length !== quickSearchIssues.length">
                    Results ({{ quickSearchIssuesLimited.length }} of {{ quickSearchIssues.length }}):
                </span>
                <span v-else>
                    Results ({{ quickSearchIssuesLimited.length }}):
                </span>

                <ul class="mb-0">
                    <li v-for="issue in quickSearchIssuesLimited" :key="issue.id">
                        <a
                            href="#"
                            @click.prevent="otherIssueId = issue.id"
                        >{{ issue.issueKey }}: {{ issue.title }}</a>
                    </li>
                </ul>
            </div>
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
import BaseButton from "@/components/BaseButton.vue";

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

const issues = ref([]);
const issueLinkTypes = ref([]);

const issueToIssueLinksMap = new Map(); // issueId => [issueLink]

const loading = ref(true);
const errors = ref([]);

const issueLinkType = ref(null);
const otherIssueId = ref(null);

const quickSearch = ref({
    issueKeyNumber: "",
    titleOrDescription: ""
})

const quickSearchActive = computed(() => {
    return quickSearch.value.issueKeyNumber !== '' || quickSearch.value.titleOrDescription !== '';
});

const quickSearchIssues = computed(() => {
    if (!quickSearchActive.value) {
        return [];
    }

    return issues.value.filter(issue => {
        if (quickSearch.value.issueKeyNumber !== '') {
            const number = Number(quickSearch.value.issueKeyNumber);

            // numbers match exact
            if (Number.isInteger(number)) {
                if (issue.issueNumber !== number) {
                    return false;
                }
            }
            // otherwise take as string and search for substring
            else {
                if (!issue.issueKey.toLowerCase().includes(quickSearch.value.issueKeyNumber.toLowerCase())) {
                    return false;
                }
            }
        }

        if (quickSearch.value.titleOrDescription !== '') {
            if (
                !issue.title.toLowerCase().includes(quickSearch.value.titleOrDescription.toLowerCase()) &&
                !issue.description.toLowerCase().includes(quickSearch.value.titleOrDescription.toLowerCase())
            ) {
                return false;
            }
        }

        return true;
    });
});

const maxQuickSearchIssues = 10;
const quickSearchIssuesLimited = computed(() => {
    return quickSearchIssues.value.slice(0, maxQuickSearchIssues);
});

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

    issues.value = [];
    issueLinkTypes.value = [];

    // Reset form, too
    issueLinkType.value = null;
    otherIssueId.value = null;

    axios
        .graphql(
            `
                query IssuesAndLinks {
                    issues {
                        id
                        project {
                            prefix
                        }
                        issueNumber
                        issueKey
                        title
                        description
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

            // Find "our" project, i.e. the project the issue we want to add links to belongs to
            const projectPrefix = data.issues
                .find(issue => issue.id === props.issueId)
                .project
                .prefix;

            issues.value = data.issues.sort((a, b) => {
                // Sort issue from "our" project top
                if (a.project.prefix === projectPrefix && b.project.prefix !== projectPrefix) return -1;
                if (a.project.prefix !== projectPrefix && b.project.prefix === projectPrefix) return 1;

                // Sort by project...
                const cmpProjects = a.project.prefix.localeCompare(b.project.prefix);
                if (cmpProjects !== 0) {
                    return cmpProjects;
                }

                // ...then by issue number
                return a.issueNumber - b.issueNumber;
            });
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
