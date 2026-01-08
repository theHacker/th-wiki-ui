<template>
    <nav class="bg-info-subtle p-3">
        <h5>Table of Contents</h5>

        <div v-if="headings.length === 0"><i>No headings</i></div>
        <ul v-else class="m-0 list-unstyled text-nowrap">
            <li v-for="heading in headings" :key="heading.id">
                <a
                    :href="'#' + heading.id"
                    :style="{ marginLeft: `${(heading.level - 1) * 16}px` }"
                    v-html="heading.titleHtml"
                    @click="$emit('headingClick')"
                />
            </li>
        </ul>
    </nav>
</template>

<script setup>
defineProps({
    headings: {
        type: Array,
        required: true
    }
});

defineEmits(['headingClick']);
</script>
