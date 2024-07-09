<template>
    <a class="dropdown-item" @click="$emit('click')">
        <span v-if="icon" class="icon is-small">
            <i :class="`fas fa-${icon}`" />
        </span>
        <span>{{ title }}</span>
    </a>
</template>

<script setup>
defineProps({
    icon: {
        type: String,
        required: false
    },
    title: {
        type: String,
        required: true
    }
});

defineEmits(['click']);
</script>
