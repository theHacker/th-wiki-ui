<template>
    <li
        :class="{ 'is-active': active }"
        @click="$emit('click')"
    >
        <a>
            <span v-if="loading" class="icon">
                <i class="fas fa-spinner fa-pulse" />
            </span>
            <span v-if="!loading" class="icon is-small">
                <i :class="iconClass" />
            </span>
            <span>{{ title }}</span>
        </a>
    </li>
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
