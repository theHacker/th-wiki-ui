<template>
    <GridLayout>
        <div class="col-12 col-lg-8 offset-lg-2">
            <h1>New tag</h1>

            <ErrorMessage v-if="errors.length > 0" :title="errors.length > 1 ? 'Errors' : 'Error'">
                <ul>
                    <li v-for="(error, index) in errors" :key="index">{{ error }}</li>
                </ul>
            </ErrorMessage>

            <TagEditForm
                v-model="tag"
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
import ErrorMessage from "@/components/ErrorMessage.vue";
import TagEditForm from "@/components/tags/TagEditForm.vue";
import GridLayout from "@/components/layout/GridLayout.vue";
import {ref, watch} from "vue";
import {useHead} from "@unhead/vue";
import axios from "@/axios.js";
import {handleError} from "@/helper/graphql-error-handling.js";
import {useRoute, useRouter} from "vue-router";

useHead({
    title: 'New tag'
});

const tag = ref({
    projectId: null,
    scope: '',
    scopeIcon: '',
    scopeColor: '',
    title: '',
    titleIcon: '',
    titleColor: '',
    description: ''
});

const route = useRoute();
const router = useRouter();

const saving = ref(false);
const errors = ref([]);
const fieldErrors = ref({});

watch(
    () => route.params.projectId,
    (projectId) => {
        tag.value.projectId = projectId || null;
    },
    { immediate: true }
);

function save() {
    fieldErrors.value = {};
    errors.value = [];
    saving.value = true;

    axios
        .graphql(
            `
                mutation CreateTag($input: CreateTagInput!) {
                    createTag(input: $input) {
                        tag {
                            id
                        }
                    }
                }
            `,
            { input: tag.value }
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
