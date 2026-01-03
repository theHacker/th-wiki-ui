<template>
    <div
        class="dropdown"
        @click.prevent="dropdownOpen = !dropdownOpen"
    >
        <button type="button" class="btn dropdown-toggle" :class="buttonClass + ' ' + ('btn-outline-' + color)">
            <span class="icon-link">
                <i :class="`fas fa-${icon}`" />
                <span v-if="title" class="title">{{ title }}</span>
            </span>
        </button>
        <ul class="dropdown-menu" :class="{ show: dropdownOpen }">
            <slot />
        </ul>
    </div>
</template>

<script setup>
import {ref} from 'vue';

const dropdownOpen = ref(false);

defineProps({
    buttonClass: {
        type: String,
        required: false,
        default: ''
    },
    icon: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: false
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
    }
});
</script>
