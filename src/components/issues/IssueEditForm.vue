<template>
    <fieldset
        :disabled="saving"
        class="row g-3"
        :class="{'was-validated': fieldErrors.length > 0}"
    >
        <div class="col-12">
            <label class="form-label">Title</label>
            <input
                v-model="issue.title"
                class="form-control"
                :class="{'is-invalid': !!fieldErrors.title}"
                type="text"
                placeholder="Title"
            />
            <div v-if="fieldErrors.title" class="invalid-feedback">{{ fieldErrors.title }}</div>
        </div>

        <div class="col-12 col-md-6">
            <label class="form-label">Project</label>
            <ProjectSelect
                v-model="issue.projectId"
                :projects="projects"
                :class="{'is-invalid': !!fieldErrors.projectId}"
                :disabled="disableProject"
            />
            <div v-if="fieldErrors.projectId" class="invalid-feedback">{{ fieldErrors.projectId }}</div>
        </div>

        <div class="col-12 col-md-6">
            <label class="form-label">Type</label>
            <select
                v-model="issue.issueTypeId"
                class="form-select"
                :class="{'is-invalid': !!fieldErrors.issueTypeId}"
            >
                <option v-for="issueType in issueTypes" :key="issueType.id" :value="issueType.id">
                    {{ issueType.title }}
                </option>
            </select>
            <div v-if="fieldErrors.issueTypeId" class="invalid-feedback">{{ fieldErrors.issueTypeId }}</div>
        </div>

        <div class="col-12 col-md-6">
            <label class="form-label">Priority</label>
            <select
                v-model="issue.issuePriorityId"
                class="form-select"
                :class="{'is-invalid': !!fieldErrors.issuePriorityId}"
            >
                <option v-for="issuePriority in issuePriorities" :key="issuePriority.id" :value="issuePriority.id">
                    {{ issuePriority.title }}
                </option>
            </select>
            <div v-if="fieldErrors.issuePriorityId" class="invalid-feedback">{{ fieldErrors.issuePriorityId }}</div>
        </div>

        <div class="col-12 col-md-6">
            <label class="form-label">Status</label>
            <select
                v-model="issue.issueStatusId"
                class="form-select"
                :class="{'is-invalid': !!fieldErrors.issueStatusId}"
             >
                <option v-for="issueStatus in issueStatuses" :key="issueStatus.id" :value="issueStatus.id">
                    {{ issueStatus.title }}
                </option>
            </select>
            <div v-if="fieldErrors.issueStatusId" class="invalid-feedback">{{ fieldErrors.issueStatusId }}</div>
        </div>

        <div class="col-12 col-md-3">
            <label class="form-label">Progress</label>
            <div
                class="input-group"
                :class="{'has-validation': fieldErrors.progress}"
            >
                <div class="input-group-text">
                    <input
                        v-model="progressSet"
                        class="form-check-input"
                        type="checkbox"
                        @change="onProgressSetChanged"
                    />
                </div>
                <input
                    v-model.number="issue.progress"
                    class="form-control"
                    :disabled="issue.progress == null"
                    :class="{'is-invalid': !!fieldErrors.progress}"
                    type="text"
                    :placeholder="issue.progress != null ? 'Progress' : '– not set –'"
                    @change="onProgressChanged"
                />
                <span class="input-group-text">%</span>
                <div v-if="fieldErrors.progress" class="invalid-feedback">{{ fieldErrors.progress }}</div>
            </div>
        </div>

        <div class="col-12 col-md-6 offset-md-3">
            <label class="form-label">Due date</label>
            <input
                v-model="issue.dueDate"
                class="form-control"
                :class="{'is-invalid': !!fieldErrors.dueDate}"
                type="text"
                placeholder="Due date"
            />
            <div v-if="fieldErrors.dueDate" class="invalid-feedback">{{ fieldErrors.dueDate }}</div>
        </div>

        <div class="col-12">
            <MarkdownTextarea
                v-model="issue.description"
                label="Description"
                placeholder="Description"
                :errorMessage="fieldErrors.description"
            />
        </div>

        <div class="hstack gap-2">
            <BaseButton
                :icon="ctrlDown ? 'floppy-disk' : 'check'"
                :title="ctrlDown ? submitCtrlLabel : submitLabel"
                color="primary"
                :loading="saving"
                @click="$emit('submit', ctrlDown)"
            />
            <BaseButton icon="xmark" title="Cancel" color="light" @click="$emit('cancel')" />
        </div>
    </fieldset>
</template>

<script setup>
import BaseButton from "@/components/BaseButton.vue";
import MarkdownTextarea from "@/components/general/MarkdownTextarea.vue";
import {onMounted, onUnmounted, ref, watch} from "vue";
import ProjectSelect from "@/components/general/ProjectSelect.vue";

const ctrlDown = ref(false);

const issue = defineModel();

const props = defineProps({
    projects: {
        type: Array,
        required: true
    },
    issueTypes: {
        type: Array,
        required: true
    },
    issuePriorities: {
        type: Array,
        required: true
    },
    issueStatuses: {
        type: Array,
        required: true
    },
    disableProject: {
        type: Boolean,
        default: false
    },
    submitLabel: {
        type: String,
        required: true
    },
    submitCtrlLabel: {
        type: String,
        required: false
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

defineEmits(['submit', 'cancel']);

if (props.submitCtrlLabel) {
    const onKeyEvent = function(e) {
        if (e.key === 'Control') {
            if (e.type === 'keydown') {
                ctrlDown.value = true;
            } else if (e.type === 'keyup') {
                ctrlDown.value = false;
            }
        }
    };

    onMounted(() => {
        window.addEventListener('keydown', onKeyEvent);
        window.addEventListener('keyup', onKeyEvent);
    });

    onUnmounted(() => {
        window.removeEventListener('keydown', onKeyEvent);
        window.removeEventListener('keyup', onKeyEvent);
    });
}

const progressSet = ref(false);

// Watcher to sync the checkbox when the model's progress property changes (e.g. when resetting the form)
watch(
    () => issue.value.progress,
    () => {
        if (progressSet.value && issue.value.progress == null) {
            progressSet.value = false;
        }
        else if (!progressSet.value && issue.value.progress != null) {
            progressSet.value = true;
        }
    },
    { immediate: true }
);

function onProgressSetChanged() {
    if (progressSet.value && issue.value.progress == null) {
        issue.value.progress = 0;
    }
    else if (!progressSet.value && issue.value.progress != null) {
        issue.value.progress = null;
    }
}

function onProgressChanged() {
    if (issue.value.progress > 100) {
        issue.value.progress = 100;
    }
    else if (issue.value.progress < 0) {
        issue.value.progress = 0;
    }
}
</script>
