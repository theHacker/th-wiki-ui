<template>
    <fieldset
        :disabled="saving"
        class="row g-3"
        :class="{'was-validated': fieldErrors.length > 0}"
    >
        <div class="col-12">
            <b>Project</b>
            <div v-if="!disableProject" class="form-text">Note: The project cannot be changed later.</div>
        </div>

        <div class="col-12 col-md-6">
            <div class="form-check">
                <input
                    v-model="type"
                    class="form-check-input"
                    type="radio"
                    id="radioGlobal"
                    value="global"
                    :disabled="disableProject"
                />
                <label class="form-check-label" for="radioGlobal">
                    Global tag
                </label>
            </div>
        </div>

        <div class="col-12 col-md-6">
            <div class="form-check mb-2">
                <input
                    v-model="type"
                    class="form-check-input"
                    type="radio"
                    id="radioProject"
                    value="project"
                    :disabled="disableProject || projects === null || projects.length === 0"
                />
                <label class="form-check-label" for="radioProject">
                    Project tag
                </label>
            </div>

            <div v-if="projects === null">
                <LoadingIndicator />
            </div>
            <ProjectSelect
                v-if="projects !== null"
                v-model="tag.projectId"
                :projects="projects"
                :disabled="type === 'global'"
            />
            <div v-if="fieldErrors.projectId" class="invalid-feedback">{{ fieldErrors.projectId }}</div>
        </div>

        <div class="col-12 col-md-4">
            <label class="form-label"><b>Scope</b></label>
            <input
                v-model="tag.scope"
                class="form-control"
                :class="{'is-invalid': !!fieldErrors.scope}"
                type="text"
                placeholder="Scope"
            />
            <div v-if="fieldErrors.scope" class="invalid-feedback">{{ fieldErrors.scope }}</div>
        </div>

        <div class="col-12 col-md-4">
            <label class="form-label">Icon</label>
            <input
                v-model="tag.scopeIcon"
                class="form-control"
                :class="{'is-invalid': !!fieldErrors.scopeIcon}"
                type="text"
                placeholder="Scope's icon"
            />
            <div v-if="fieldErrors.scopeIcon" class="invalid-feedback">{{ fieldErrors.scopeIcon }}</div>
        </div>

        <div class="col-12 col-md-4">
            <label class="form-label">Color</label>
            <input
                v-model="tag.scopeColor"
                class="form-control"
                :class="{'is-invalid': !!fieldErrors.scopeColor}"
                type="text"
                placeholder="Scope's color"
            />
            <div v-if="fieldErrors.scopeColor" class="invalid-feedback">{{ fieldErrors.scopeColor }}</div>
        </div>

        <div class="col-12 col-md-4">
            <label class="form-label"><b>Title</b></label>
            <input
                v-model="tag.title"
                class="form-control"
                :class="{'is-invalid': !!fieldErrors.title}"
                type="text"
                placeholder="Title"
            />
            <div v-if="fieldErrors.title" class="invalid-feedback">{{ fieldErrors.title }}</div>
        </div>

        <div class="col-12 col-md-4">
            <label class="form-label">Icon</label>
            <input
                v-model="tag.titleIcon"
                class="form-control"
                :class="{'is-invalid': !!fieldErrors.titleIcon}"
                type="text"
                placeholder="Title's icon"
            />
            <div v-if="fieldErrors.titleIcon" class="invalid-feedback">{{ fieldErrors.titleIcon }}</div>
        </div>

        <div class="col-12 col-md-4">
            <label class="form-label">Color</label>
            <input
                v-model="tag.titleColor"
                class="form-control"
                :class="{'is-invalid': !!fieldErrors.titleColor}"
                type="text"
                placeholder="Title's color"
            />
            <div v-if="fieldErrors.titleColor" class="invalid-feedback">{{ fieldErrors.titleColor }}</div>
        </div>

        <div class="col-12">
            <label class="form-label"><b>Description</b></label>
            <input
                v-model="tag.description"
                class="form-control"
                :class="{'is-invalid': !!fieldErrors.description}"
                type="text"
                placeholder="Description"
            />
            <div v-if="fieldErrors.description" class="invalid-feedback">{{ fieldErrors.description }}</div>
        </div>

        <div class="col-12">
            <b>Preview</b>

            <div class="p-2 mb-2">
                <TagBadge
                    v-if="tag.title && tag.titleColor"
                    :scope="tag.scope"
                    :scopeIcon="tag.scopeIcon"
                    :scopeColor="tag.scopeColor"
                    :title="tag.title"
                    :titleIcon="tag.titleIcon"
                    :titleColor="tag.titleColor"
                    :tooltip="tag.description"
                />
                <div v-if="!tag.title || !tag.titleColor" class="form-text text-danger">
                    Cannot show preview. At least title and color must be set.
                </div>
            </div>
        </div>

        <div class="hstack gap-2">
            <BaseButton
                icon="check"
                :title="submitLabel"
                color="primary"
                :loading="saving"
                @click="$emit('submit')"
            />
            <BaseButton icon="xmark" title="Cancel" color="light" @click="$emit('cancel')" />
        </div>
    </fieldset>
</template>

<script setup>
import BaseButton from "@/components/BaseButton.vue";
import ProjectSelect from "@/components/general/ProjectSelect.vue";
import {computed, ref} from "vue";
import LoadingIndicator from "@/components/LoadingIndicator.vue";
import axios from "@/axios.js";
import TagBadge from "@/components/TagBadge.vue";

const tag = defineModel();

defineProps({
    disableProject: {
        type: Boolean,
        default: false
    },
    submitLabel: {
        type: String,
        required: true
    },
    saving: {
        type: Boolean,
        default: false
    },
    fieldErrors: {
        type: Object,
        default() { return {}; }
    }
});

const type = computed({
    get() {
        if (tag.value.projectId !== null) {
            return "project";
        } else {
            return "global";
        }
    },
    set(value) {
        if (value === 'project') {
            tag.value.projectId = projects.value[0].id;
        } else if (value === 'global') {
            tag.value.projectId = null;
        }
    }
});

defineEmits(['submit', 'cancel']);

const projects = ref(null);

function fetchData() {
    axios
        .graphql(`
            query Projects {
                projects {
                    id
                    title
                    prefix
                }
            }
        `)
        .then(data => {
            projects.value = data.projects;
        });
}

fetchData();
</script>
