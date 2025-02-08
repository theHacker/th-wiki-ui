<template>
    <li class="nav-item" @click="$emit('click')">
        <a href="#" class="nav-link" :class="{ active }">
            <span class="icon-link">
                <i v-if="loading" class="fas fa-spinner fa-pulse" />
                <i v-if="!loading" :class="iconClass" />
                <span class="d-none d-lg-inline">{{ title }}</span>
            </span>
        </a>
    </li>
</template>

<script setup>
import {computed} from 'vue';

const props = defineProps({
    icon: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    active: {
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
</script>
