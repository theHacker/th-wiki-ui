<template>
    <GridLayout>
        <div class="col-12 col-lg-8 offset-lg-2">
            <h1>Edit wiki page</h1>

            <ErrorMessage v-if="errors.length > 0" :title="errors.length > 1 ? 'Errors' : 'Error'">
                <ul>
                    <li v-for="(error, index) in errors" :key="index">{{ error }}</li>
                </ul>
            </ErrorMessage>

            <div v-if="!wikiPage" class="mt-4">
                <LoadingIndicator>Loading wiki page…</LoadingIndicator>
            </div>

            <WikiPageEditForm
                v-if="wikiPage"
                v-model="wikiPage"
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
import WikiPageEditForm from "@/components/wiki/WikiPageEditForm.vue";
import ErrorMessage from "@/components/ErrorMessage.vue";
import LoadingIndicator from "@/components/LoadingIndicator.vue";
import GridLayout from "@/components/layout/GridLayout.vue";
import {handleError} from "@/helper/graphql-error-handling.js";

const route = useRoute();
const router = useRouter();

const saving = ref(false);
const errors = ref(null);
const fieldErrors = ref({});

const wikiPage = ref(null);

watch(() => route.params.wikiPageId, fetchData, { immediate: true });

function fetchData(id) {
    saving.value = false;
    fieldErrors.value = {};
    errors.value = [];
    wikiPage.value = null;

    axios
        .graphql(
            `
                query WikiPage($wikiPageId: ID!) {
                    wikiPage(id: $wikiPageId) {
                        id
                        title
                        content
                        parent {
                            id
                        }
                    }
                }
            `,
            { wikiPageId: id }
        )
        .then(async data => {
            if (data.wikiPage === null) {
                errors.value = ["Wiki page does not exist."];
            } else {
                wikiPage.value = {
                    id: data.wikiPage.id,
                    title: data.wikiPage.title,
                    content: data.wikiPage.content,
                    parentId: data.wikiPage.parent?.id || null,
                };
            }
        })
        .catch(e => {
            errors.value = handleError(e).genericErrors;
        });
}

function save(ctrlDown) {
    saving.value = true;
    fieldErrors.value = {};
    errors.value = [];

    axios
        .graphql(
            `
                mutation UpdateWikiPage($input: UpdateWikiPageInput!) {
                    updateWikiPage(input: $input) {
                        wikiPage {
                            id
                        }
                    }
                }
            `,
            { input: wikiPage.value }
        )
        .then(data => {
            if (!ctrlDown) {
                router.push({ name: 'wikiPage', params: { wikiPageId: data.updateWikiPage.wikiPage.id } });
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
