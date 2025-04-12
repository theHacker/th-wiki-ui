<template>
    <div class="card text-bg-warning mb-4">
        <div class="card-header">
            <i class="fas fa-circle-info pe-1" />
            {{ title }}
        </div>
        <div class="card-body">
            <slot />
        </div>
    </div>
</template>

<script setup>
defineProps({
    title: {
        type: String,
        default: "Error"
    }
});
</script>
