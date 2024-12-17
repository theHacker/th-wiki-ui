<template>
    <div
        class="dropdown"
        @click="dropdownOpen = !dropdownOpen"
    >
        <button type="button" class="btn btn-outline-light dropdown-toggle">
            <span class="icon-link">
                <i v-if="icon" :class="`fas fa-${icon}`" />
                <span v-if="title">{{ title }}</span>
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
    icon: {
        type: String,
        required: false
    },
    title: {
        type: String,
        required: false
    }
});
</script>
