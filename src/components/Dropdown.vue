<template>
    <div
        class="dropdown"
        @click="dropdownOpen = !dropdownOpen"
    >
        <button type="button" class="btn btn-outline-light dropdown-toggle" :class="buttonClass">
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
        required: false
    },
    icon: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: false
    }
});
</script>
