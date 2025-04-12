<template>
    <GridLayout>
        <div class="col-12 col-lg-8 offset-lg-2">
            <h1>New wiki page</h1>

            <ErrorMessage v-if="errors.length > 0" :title="errors.length > 1 ? 'Errors' : 'Error'">
                <ul>
                    <li v-for="(error, index) in errors" :key="index">{{ error }}</li>
                </ul>
            </ErrorMessage>

            <WikiPageEditForm
                v-model="wikiPage"
                submitLabel="Create"
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
import {ref} from 'vue';
import {useRouter} from "vue-router";
import WikiPageEditForm from "@/components/wiki/WikiPageEditForm.vue";
import ErrorMessage from "@/components/ErrorMessage.vue";
import GridLayout from "@/components/layout/GridLayout.vue";
import {handleError} from "@/helper/graphql-error-handling.js";

const router = useRouter();

const saving = ref(false);
const errors = ref([]);
const fieldErrors = ref({});

const wikiPage = ref({
    title: '',
    parentId: null,
    content: ''
});

function save() {
    saving.value = true;
    fieldErrors.value = {};
    errors.value = [];

    axios
        .graphql(
            `
                mutation CreateWikiPage($input: CreateWikiPageInput!) {
                    createWikiPage(input: $input) {
                        wikiPage {
                            id
                        }
                    }
                }
            `,
            { input: wikiPage.value }
        )
        .then(data => {
            router.push({ name: 'wikiPage', params: { wikiPageId: data.createWikiPage.wikiPage.id } });
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
