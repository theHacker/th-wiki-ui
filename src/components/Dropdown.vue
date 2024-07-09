<template>
    <div
        class="dropdown"
        :class="{ 'is-active': dropdownOpen }"
        @click="dropdownOpen = !dropdownOpen"
    >
        <div class="dropdown-trigger">
            <button class="button">
                <span v-if="icon" class="icon is-small">
                    <i :class="`fas fa-${icon}`" />
                </span>
                <span v-if="title">{{ title }}</span>
                <span class="icon is-small">
                    <i class="fas fa-angle-down" />
                </span>
            </button>
        </div>
        <div class="dropdown-menu">
            <div class="dropdown-content">
                <slot />
            </div>
        </div>
    </div>
</template>

<script setup>
import {ref} from 'vue';
import Button from "@/components/Button.vue";

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
