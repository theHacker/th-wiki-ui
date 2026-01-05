<template>
    <select v-model="projectId" class="form-select" :disabled="disabled">
        <option v-if="nullOption" :value="null">{{ nullOption }}</option>
        <option
            v-for="project in projectsSorted"
            :key="project.id"
            :value="project.id"
            :disabled="isOptionDisabled(project)"
        >
            {{ project.title }} &nbsp;({{ project.prefix }})
        </option>
    </select>
</template>

<script setup>
import {computed} from "vue";

const projectId = defineModel();

const props = defineProps({
    projects: {
        type: Array,
        required: true
    },
    nullOption: {
        type: String,
        required: false
    },
    disabled: {
        type: Boolean,
        default: false
    },
    disabledOption: {
        type: Function,
        required: false
    }
});

const projectsSorted = computed(() => {
    return props.projects.toSorted((a, b) => a.prefix.localeCompare(b.prefix));
});

function isOptionDisabled(project) {
    if (!props.disabledOption) {
        return false;
    }

    return props.disabledOption(project);
}
</script>
