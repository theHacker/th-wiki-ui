<template>
    <GridLayout>
        <h1>Projects</h1>

        <div class="row g-3">
            <div class="col-12 col-lg-6 col-xl-5 offset-xl-1">
                <div class="card">
                    <div class="card-header text-bg-info">Projects</div>

                    <div class="card-body">
                        <LoadingIndicator v-if="loading" />

                        <template v-if="!loading">
                            <div v-if="projects.length === 0">No projects yet.</div>

                            <ul v-if="projects.length > 0" class="list-group">
                                <li v-for="project in projects" :key="project.id" class="list-group-item">
                                    <div class="d-flex w-100 justify-content-between">
                                        <h5 class="mb-1">{{ project.title }}</h5>
                                        <small><strong>{{ project.prefix }}</strong></small>
                                    </div>
                                    <div class="d-flex w-100 justify-content-between">
                                        <div>{{ project.description }}</div>
                                    </div>
                                </li>
                            </ul>

                            <p v-if="projects.length > 0" class="mt-3 mb-0 icon-link">
                                <i class="fas fa-person-digging text-warning" />
                                No delete/rename UI (yet). Will be provided when we have more detailed pages.
                            </p>
                        </template>
                    </div>
                </div>
            </div>

            <div class="col-12 col-lg-6 col-xl-5">
                <ErrorMessage v-if="errors.length > 0" :title="errors.length > 1 ? 'Errors' : 'Error'">
                    <ul>
                        <li v-for="(error, index) in errors" :key="index">{{ error }}</li>
                    </ul>
                </ErrorMessage>

                <div class="card">
                    <div class="card-header text-bg-info">Add a project</div>

                    <div class="card-body">
                        <fieldset
                            :disabled="saving"
                            class="row g-3"
                            :class="{'was-validated': fieldErrors.length > 0}"
                        >
                            <div class="col-12 col-md-9">
                                <label class="form-label">Title</label>
                                <input
                                    v-model="project.title"
                                    class="form-control"
                                    :class="{'is-invalid': !!fieldErrors.title}"
                                    type="text"
                                    placeholder="Title"
                                    @change="suggestPrefix"
                                />
                                <div v-if="fieldErrors.title" class="invalid-feedback">{{ fieldErrors.title }}</div>
                            </div>

                            <div class="col-12 col-md-3">
                                <label class="form-label">Prefix</label>
                                <input
                                    v-model="project.prefix"
                                    class="form-control"
                                    :class="{'is-invalid': !!fieldErrors.prefix}"
                                    type="text"
                                    placeholder="Prefix"
                                    @change="project.prefix = project.prefix.toUpperCase()"
                                />
                                <div v-if="fieldErrors.prefix" class="invalid-feedback">{{ fieldErrors.prefix }}</div>
                            </div>

                            <div class="col-12">
                                <label class="form-label">Description</label>
                                <textarea
                                    v-model="project.description"
                                    class="form-control"
                                    :class="{'is-invalid': !!fieldErrors.description}"
                                    placeholder="Description"
                                />
                                <div v-if="fieldErrors.description" class="invalid-feedback">{{ fieldErrors.description }}</div>
                            </div>

                            <div class="hstack gap-2">
                                <BaseButton
                                    icon="check"
                                    title="Create"
                                    color="primary"
                                    :loading="saving"
                                    @click="saveProject"
                                />
                                <BaseButton icon="trash" title="Reset" color="light" @click="resetForm" />
                            </div>
                        </fieldset>
                    </div>
                </div>
            </div>
        </div>
    </GridLayout>
</template>

<script setup>
import {ref} from "vue";
import BaseButton from "@/components/BaseButton.vue";
import LoadingIndicator from "@/components/LoadingIndicator.vue";
import axios from "@/axios.js";
import ErrorMessage from "@/components/ErrorMessage.vue";
import {handleError} from "@/helper/graphql-error-handling.js";
import GridLayout from "@/components/layout/GridLayout.vue";

const projects = ref([]);
const loading = ref(true);

const project = ref({
    title: '',
    prefix: '',
    description: ''
});

const saving = ref(false);
const errors = ref([]);
const fieldErrors = ref({});

fetchData();

function fetchData() {
    axios
        .graphql(
            `
                query Projects {
                    projects {
                        id
                        prefix
                        title
                        description
                    }
                }
            `
        )
        .then(data => {
            loading.value = false;
            projects.value = data.projects;
        })
        .catch(e => {
            errors.value = handleError(e).genericErrors;
        });
}

function suggestPrefix() {
    const title = project.value.title;

    // Delete prefix after title was cleared
    if (title === '' && project.value.prefix !== '') {
        project.value.prefix = '';
        return;
    }

    // Don't change prefix, if there already is something in
    if (project.value.prefix !== '') {
        return;
    }

    // Multiple words? Try using the uppercase letters
    const upperCaseLetters = title.replace(/[^A-Z]/g, '');
    if (upperCaseLetters.length >= 2) {
        project.value.prefix = upperCaseLetters;
        return;
    }

    // Title short enough to take it?
    if (title.length <= 5) {
        project.value.prefix = title.toUpperCase();
        return;
    }

    // Single/Few word? Try eliminating vowels (not when first letter)
    const titleWithoutVowels = title.replace(/(?!^[a-z])[^b-df-hj-np-tv-z]/gi, '');
    if (titleWithoutVowels.length <= 5) {
        project.value.prefix = titleWithoutVowels.toUpperCase();
        return;
    }

    // Fallback: Take 3 non-vowels
    project.value.prefix = titleWithoutVowels.toUpperCase().substring(0, 3);
}

function saveProject() {
    saving.value = true;
    fieldErrors.value = {};
    errors.value = [];

    axios
        .graphql(
            `
                mutation CreateProject($input: CreateProjectInput!) {
                    createProject(input: $input) {
                        project {
                            id
                            prefix
                            title
                            description
                        }
                    }
                }
            `,
            { input: project.value }
        )
        .then(data => {
            projects.value.push(data.createProject.project);

            resetForm();
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
    project.value = {
        title: '',
        prefix: '',
        description: ''
    };
    fieldErrors.value = {};
}
</script>
