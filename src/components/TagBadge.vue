<template>
    <span class="badge-group" :title="tooltip">
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
        validator(value, _props) {
            // see https://getbootstrap.com/docs/5.3/components/buttons/#variants
            return [
                'primary', 'secondary',
                'success', 'danger', 'warning', 'info',
                'light', 'dark', 'link'
            ].includes(value);
        },
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
        validator(value, _props) {
            // see https://getbootstrap.com/docs/5.3/components/buttons/#variants
            return [
                'primary', 'secondary',
                'success', 'danger', 'warning', 'info',
                'light', 'dark', 'link'
            ].includes(value);
        },
        default: 'light'
    },
    tooltip: {
        type: String
    }
});

const scopeAttributes = computed(() => {
    const color = props.scopeColor || props.titleColor;

    return parseColor(color, true);
});

const titleAttributes = computed(() => {
    return parseColor(props.titleColor, true);
});
</script>
