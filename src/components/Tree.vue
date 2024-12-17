<template>
    <ul class="list-unstyled tree mb-0">
        <li v-for="item in items" :key="item[itemKey]">
            <slot :item="item" />

            <div class="ms-4">
                <Tree
                    v-if="item.children && item.children.length > 0"
                    :items="item.children"
                    :itemKey="itemKey"
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
    itemKey: {
        type: String,
        required: true
    }
});
</script>
