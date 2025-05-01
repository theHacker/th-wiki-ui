<template>
    <div class="d-inline-flex">
        <h1 class="mb-0">
            <slot />
        </h1>
        <div class="ms-3 hstack align-items-start gap-2">
            <TagBadge
                v-for="(tag, index) in tags"
                :key="index"
                :scope="tag.scope"
                :scopeIcon="tag.scopeIcon"
                :scopeColor="tag.scopeColor"
                :title="tag.title"
                :titleIcon="tag.titleIcon"
                :titleColor="tag.titleColor"
                :tooltip="tag.description"
            />
        </div>
    </div>
    <div class="mb-heading hstack gap-2">
        <div v-if="smallText">
            <small>{{ smallText }}</small>
        </div>
    </div>
</template>

<script setup>
import TagBadge from "@/components/TagBadge.vue";

defineProps({
    smallText: {
        type: String
    },
    tags: {
        type: Array
    }
});
</script>
