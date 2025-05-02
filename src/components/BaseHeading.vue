<template>
    <div class="d-inline-flex flex-wrap">
        <h1 class="mb-0" :class="{ 'me-3': tagsSorted.length > 0 }">
            <slot />
        </h1>
        <div class="hstack align-items-start gap-1 flex-wrap">
            <TagBadge
                v-for="(tag, index) in tagsSorted"
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
import {computed} from "vue";
import {toSortedTags} from "@/helper/sort-tags.js";

const props = defineProps({
    smallText: {
        type: String
    },
    tags: {
        type: Array
    }
});

const tagsSorted = computed(() => {
    return toSortedTags(props.tags);
});
</script>
