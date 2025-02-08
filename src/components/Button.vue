<template>
    <button :class="buttonClass" :title="tooltip" @click="$emit('click')">
        <span>
            <i v-if="!loading" :class="iconClass" />
            <i v-if="loading" class="fa fa-spinner fa-pulse" />
        </span>
        <span v-if="title" class="title">{{ title }}</span>
    </button>
</template>

<script setup>
import {computed} from 'vue';

const props = defineProps({
    icon: {
        type: String,
        required: true
    },
    title: {
        type: String
    },
    tooltip: {
        type: String
    },
    size: {
        validator(value, _props) {
            // see https://getbootstrap.com/docs/5.3/components/buttons/#sizes
            return ['small', 'normal', 'large'].includes(value);
        },
        default: 'normal'
    },
    fixedWidth: { // Note: gets ignored for spinner (loading === true)
        type: Boolean,
        default: false
    },
    color: {
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
    loading: {
        type: Boolean,
        default: false
    }
});

defineEmits(['click']);

const iconClass = computed(() => {
    const classes = {};

    classes['fas'] = true;
    classes[`fa-${props.icon}`] = true;

    if (props.fixedWidth) {
        classes['fa-fw'] = true;
    }

    return classes;
});

const buttonClass = computed(() => {
    const classes = {};

    classes['btn'] = true;
    classes[`btn-${props.color}`] = true;

    if (props.title) {
        // Only add icon-link if there is a title, not for icon-only buttons.
        // That centers the icon-only inside the button.
        classes['icon-link'] = true;
    }

    switch (props.size) {
        case 'small':
            classes['btn-sm'] = true;
            break;
        case 'large':
            classes['btn-lg'] = true;
            break;
        case 'normal':
        default:
            // no additional class
            break;
    }

    return classes;
});
</script>
