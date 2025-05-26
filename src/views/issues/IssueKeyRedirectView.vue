<template>
    <GridLayout>
        <ErrorMessage v-if="errors.length > 0" :title="errors.length > 1 ? 'Errors' : 'Error'">
            <ul>
                <li v-for="(error, index) in errors" :key="index">{{ error }}</li>
            </ul>
        </ErrorMessage>

        <div v-if="loading" class="mt-4">
            <LoadingIndicator>Loading issue…</LoadingIndicator>
        </div>
    </GridLayout>
</template>

<script setup>
import GridLayout from "@/components/layout/GridLayout.vue";
import {ref, watch} from "vue";
import {useRoute, useRouter} from "vue-router";
import ErrorMessage from "@/components/ErrorMessage.vue";
import LoadingIndicator from "@/components/LoadingIndicator.vue";
import axios from "@/axios.js";
import {handleError} from "@/helper/graphql-error-handling.js";

const route = useRoute();
const router = useRouter();

const errors = ref([]);
const loading = ref(true);

watch(() => route.params.issueKey, fetchData, { immediate: true });

function fetchData(issueKey) {
    errors.value = [];
    loading.value = true;

    axios
        .graphql(
            `
                query IssueByIssueKey($issueKey: String!) {
                    issuesByIssueKey(issueKeys: [$issueKey]) {
                        id
                    }
                }
            `,
            { issueKey: issueKey.toUpperCase() }
        )
        .then(data => {
            if (data.issuesByIssueKey?.length !== 1) {
                errors.value = ["Issue does not exist."];
            } else {
                router.replace({name: 'issue', params: {issueId: data.issuesByIssueKey[0].id}});
            }
        })
        .catch(e => {
            errors.value = handleError(e).genericErrors;
        })
        .finally(() => {
            loading.value = false;
        });
}
</script>
