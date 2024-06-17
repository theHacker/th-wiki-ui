<template>
    <ul>
        <li v-for="item in items">
            <div>
                <span class="icon-text">
                    <span class="icon">
                        <i class="fas fa-file" />
                    </span>
                    <span>
                        <RouterLink :to="{ name: 'wikiPage', params: { entryId: item.id } }">
                            {{ item.title }}
                        </RouterLink>
                    </span>
                </span>
            </div>
            <div class="ml-5">
                <Tree
                    v-if="item.children && item.children.length > 0"
                    :items="item.children"
                />
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
