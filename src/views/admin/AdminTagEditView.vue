<template>
    <GridLayout>
        <div class="col-12 col-lg-8 offset-lg-2">
            <h1>Edit tag</h1>

            <ErrorMessage v-if="errors.length > 0" :title="errors.length > 1 ? 'Errors' : 'Error'">
                <ul>
                    <li v-for="(error, index) in errors" :key="index">{{ error }}</li>
                </ul>
            </ErrorMessage>

            <div v-if="tag === null" class="mt-4">
                <LoadingIndicator>Loading tag…</LoadingIndicator>
            </div>

            <TagEditForm
                v-if="tag !== null"
                v-model="tag"
                :disableProject="true"
                submitLabel="Update"
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
import TagEditForm from "@/components/tags/TagEditForm.vue";
import GridLayout from "@/components/layout/GridLayout.vue";
import {ref, watch} from "vue";
import axios from "@/axios.js";
import {handleError} from "@/helper/graphql-error-handling.js";
import {useRoute, useRouter} from "vue-router";
import LoadingIndicator from "@/components/LoadingIndicator.vue";

const tag = ref(null);

const route = useRoute();
const router = useRouter();

const saving = ref(false);
const errors = ref([]);
const fieldErrors = ref({});

watch(() => route.params.tagId, fetchData, { immediate: true });

function fetchData(id) {
    saving.value = false;
    fieldErrors.value = {};
    errors.value = [];
    tag.value = null;

    axios
        .graphql(
            `
                query Tag($tagId: ID!) {
                    tag(id: $tagId) {
                        id
                        project {
                            id
                        }
                        scope
                        scopeIcon
                        scopeColor
                        title
                        titleIcon
                        titleColor
                        description
                    }
                }
            `,
            { tagId: id }
        )
        .then(data => {
            tag.value = {
                id: data.tag.id,
                projectId: data.tag.project?.id || null,
                scope: data.tag.scope,
                scopeIcon: data.tag.scopeIcon,
                scopeColor: data.tag.scopeColor,
                title: data.tag.title,
                titleIcon: data.tag.titleIcon,
                titleColor: data.tag.titleColor,
                description: data.tag.description
            };
        })
        .catch(e => {
            const handledErrors = handleError(e);

            errors.value = handledErrors.genericErrors;
            fieldErrors.value = handledErrors.fieldErrors;
        });
}

function save() {
    fieldErrors.value = {};
    errors.value = [];
    saving.value = true;

    const input = {
        ...tag.value,
        projectId: undefined
    };

    axios
        .graphql(
            `
                mutation UpdateTag($input: UpdateTagInput!) {
                    updateTag(input: $input) {
                        tag {
                            id
                        }
                    }
                }
            `,
            { input }
        )
        .then(_data => {
            router.push({name: 'adminTags'});
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
