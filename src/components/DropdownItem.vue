<template>
    <li>
        <a class="dropdown-item" href="#" @click="$emit('click')">
            <span class="icon-link">
                <i v-if="icon" :class="`fas fa-${icon}`" />
                <span v-if="title">{{ title }}</span>
            </span>
        </a>
    </li>
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
