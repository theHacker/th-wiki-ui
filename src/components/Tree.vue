<template>
    <ul>
        <li v-for="item in items">
            <slot :item="item" />

            <div class="ml-5">
                <Tree
                    v-if="item.children && item.children.length > 0"
                    :items="item.children"
                >
                    <!-- Note: Chain slots through, so it works recursive (see https://github.com/vuejs/vue/issues/5965) -->
                    <template #default="{ item }">
                        <slot :item="item" />
                    </template>
                </Tree>
            </div>
        </li>
    </ul>
</template>

<script setup>
defineProps({
    items: {
        type: Array,
        required: true
    },
});
</script>

<style lang="scss" scoped>
:deep(.icon-text) {
    --bulma-icon-text-spacing: 0;
}
</style>
