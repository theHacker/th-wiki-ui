<template>
    <h1 class="mb-0">
        <slot />
    </h1>
    <div class="mb-heading hstack gap-2">
        <div v-if="smallText">
            <small>{{ smallText }}</small>
        </div>
    </div>
</template>

<script setup>
defineProps({
    smallText: {
        type: String
    }
});
</script>
