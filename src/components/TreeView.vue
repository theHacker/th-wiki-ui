<template>
    <ul class="tree d-flex flex-column list-unstyled mb-0">
        <li
            v-for="item in treeArray"
            :key="idFunction(item)"
            :class="isNodeVisible(item) ? 'd-flex' : 'd-none'"
        >
            <div class="tree-spacer" v-for="i in item.level" :key="i">
                <TreeSpacerBox
                    :top="item.lines[i-1] === '└' || item.lines[i-1] === '│' || item.lines[i-1] === '├'"
                    :bottom="item.lines[i-1] === '┌' || item.lines[i-1] === '│' || item.lines[i-1] === '├'"
                    :right="item.lines[i-1] === '└' || item.lines[i-1] === '┌' || item.lines[i-1] === '├'"
                    :button="(i === item.level) ? getButton(item) : null"
                    @click="(i === item.level) && expandCollapseNode(item)"
                />
            </div>
            <div class="tree-label">
                <slot :item="item" />
            </div>
        </li>
    </ul>
</template>

<script setup>
import {computed, ref} from "vue";
import TreeSpacerBox from "@/components/TreeSpacerBox.vue";
import {Tree} from "@/helper/tree.js";

const props = defineProps({
    items: {
        type: Array,
        required: true
    },
    idFunction: {
        type: Function,
        required: true
    },
    parentIdFunction: {
        type: Function,
        required: true
    },
    sortFunction: {
        type: Function,
        required: true
    }
});

defineExpose({ expandNode, collapseNode, toggleNode, expandAllNodes, collapseAllNodes });

const allIds = computed(() => {
    return props.items
        .map(item => props.idFunction(item));
});

const itemsById = computed(() => {
    return new Map(
        props.items
            .map(item => [props.idFunction(item), item])
    );
});

const leafIds = computed(() => {
    const idsHavingAParent = new Set();

    props.items.forEach(item => {
        const parentId = props.parentIdFunction(item);
        if (parentId !== null) {
            idsHavingAParent.add(parentId);
        }
    });

    return new Set(allIds.value).difference(idsHavingAParent);
});

const expandedIds = ref(new Set(allIds.value)); // default: all nodes are expanded

const treeArray = computed(() => {
    const tree = new Tree({
        items: props.items,
        idFunction: props.idFunction,
        parentIdFunction: props.parentIdFunction,
        sortFunction: props.sortFunction
    });

    return tree.toLinearArray();
});

function getButton(item) {
    if (leafIds.value.has(props.idFunction(item))) {
        return '';
    }

    return isNodeExpanded(item) ? '-' : '+';
}

function isNodeExpanded(item) {
    const id = props.idFunction(item);

    return expandedIds.value.has(id);
}

function isNodeVisible(item) {
    // A node N is visible if and only if all of N's ancestors are expanded.
    // A node without any ancestors if always visible.

    let i = item;

    while (true) {
        const parentId = props.parentIdFunction(i);
        if (parentId === null) {
            return true;
        }

        if (!expandedIds.value.has(parentId)) {
            return false;
        }

        i = itemsById.value.get(parentId);
    }
}

function expandCollapseNode(item) {
    const id = props.idFunction(item);
    if (expandedIds.value.has(id)) {
        expandedIds.value.delete(id);
    } else {
        expandedIds.value.add(id);
    }
}

function expandNode(id) {
    expandedIds.value.add(id);
}

function collapseNode(id) {
    expandedIds.value.delete(id);
}

function toggleNode(id) {
    if (expandedIds.value.has(id)) {
        expandedIds.value.delete(id);
    } else {
        expandedIds.value.add(id);
    }
}

function collapseAllNodes() {
    expandedIds.value.clear();
}

function expandAllNodes() {
    allIds.value.forEach(id => expandedIds.value.add(id));
}
</script>

<style lang="scss" scoped>
.tree li {
    // don't waste space on the first level, so move all items a little to the left
    margin-left: -8px;
}

.tree-spacer {
    width: 24px;
    text-align: center;
}

.tree-label {
    padding-left: 0.25rem;
}
</style>
