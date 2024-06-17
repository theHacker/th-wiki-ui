<template>
    <button class="button" :class="buttonClass" @click="$emit('click')">
        <span v-if="icon" class="icon is-small">
            <i :class="iconClass" />
        </span>
        <span>{{ title }}</span>
    </button>
</template>

<script setup>
import {computed} from 'vue';

const props = defineProps({
    icon: {
        type: String
    },
    title: {
        type: String,
        required: true
    },
    size: {
        validator(value, _props) {
            // see https://bulma.io/documentation/elements/button/#sizes
            return ['small', 'normal', 'medium', 'large'].includes(value);
        },
        default: 'normal'
    },
    color: {
        validator(value, _props) {
            // see https://bulma.io/documentation/elements/button/#colors
            return [
                'white', 'light', 'dark', 'black', 'text', 'ghost',
                'primary', 'link',
                'info', 'success', 'warning', 'danger'
            ].includes(value);
        },
        default: 'light'
    },
    light: {
        type: Boolean,
        default: false
    },
    dark: {
        type: Boolean,
        default: false
    },
    loading: {
        type: Boolean,
        default: false
    }
});

defineEmits(['click']);

const iconClass = computed(() => `fas fa-${props.icon}`);
const buttonClass = computed(() => {
    const classes = {};

    classes[`is-${props.color}`] = true;
    classes[`is-${props.size}`] = true;
    if (props.light) {
        classes['is-light'] = true;
    }
    if (props.dark) {
        classes['is-dark'] = true;
    }
    if (props.loading) {
        classes['is-loading'] = true;
    }

    return classes;
});
</script>
