<template>
    <span class="badge-group" :title="tooltip" @click="$emit('click')">
        <span v-if="scope" class="badge rounded-pill" v-bind="scopeAttributes">
            <i v-if="scopeIcon" :class="'fas fa-' + scopeIcon" />
            {{ scope }}
        </span>
        <span class="badge rounded-pill" v-bind="titleAttributes">
            <i v-if="titleIcon" :class="'fas fa-' + titleIcon" />
            {{ title }}
        </span>
    </span>
</template>

<script setup>
import {computed} from "vue";
import {parseColor} from "@/helper/color.js";

const props = defineProps({
    scope: {
        type: String,
        required: false
    },
    scopeIcon: {
        type: String,
        required: false
    },
    scopeColor: {
        type: String,
        required: false
    },
    title: {
        type: String,
        required: true
    },
    titleIcon: {
        type: String,
        required: false
    },
    titleColor: {
        type: String,
        default: 'light'
    },
    tooltip: {
        type: String
    }
});

defineEmits(['click']);

const scopeAttributes = computed(() => {
    const color = props.scopeColor || props.titleColor;

    return parseColor(color, true);
});

const titleAttributes = computed(() => {
    return parseColor(props.titleColor, true);
});
</script>
