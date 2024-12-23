<template>
    <ul class="list-unstyled tree mb-0">
        <li v-for="item in items" :key="item[itemKey]">
            <div class="d-inline-flex align-middle gap-1">
                <span class="cursor-pointer me-1" @click="expandCollapseNode(item)">
                    <i
                        class="fa fa-xs"
                        :class="getIcon(item)"
                    />
                </span>
                <slot :item="item" />
            </div>

            <div class="ms-4" v-show="isNodeExpanded(item)">
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
import {ref} from "vue";

const props = defineProps({
    items: {
        type: Array,
        required: true
    },
    itemKey: {
        type: String,
        required: true
    }
});

const allKeys = props.items
    .map(item => item[props.itemKey]);

const expandedKeys = ref(new Set(allKeys)); // default: all nodes are expanded

function isNodeExpanded(item) {
    const key = item[props.itemKey];

    return expandedKeys.value.has(key);
}

function getIcon(item) {
    if (!item.children || item.children.length === 0) {
        return 'fa-square-caret-right opacity-10';
    }

    return isNodeExpanded(item) ? 'fa-square-minus' : 'fa-square-plus';
}

function expandCollapseNode(item) {
    const key = item[props.itemKey];
    if (expandedKeys.value.has(key)) {
        expandedKeys.value.delete(key);
    } else {
        expandedKeys.value.add(key);
    }
}
</script>
