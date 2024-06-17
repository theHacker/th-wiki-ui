<template>
    <ul>
        <li v-for="item in items">
            <div>
                <span class="icon-text">
                    <span class="icon">
                        <slot name="icon" :item="item" />
                    </span>
                    <span>
                        <slot name="label" :item="item" />
                    </span>
                </span>
            </div>
            <div class="ml-5">
                <Tree
                    v-if="item.children && item.children.length > 0"
                    :items="item.children"
                >
                    <!-- Note: Chain slots through, so it works recursive (see https://github.com/vuejs/vue/issues/5965) -->
                    <template #icon="{ item }">
                        <slot name="icon" :item="item" />
                    </template>
                    <template #label="{ item }">
                        <slot name="label" :item="item" />
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
.icon-text {
    --bulma-icon-text-spacing: 0;
}
</style>
