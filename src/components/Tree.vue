<template>
    <ul class="tree d-flex flex-column list-unstyled mb-0">
        <li
            v-for="item in treeifiedArray"
            :key="item[idProperty]"
            :class="isNodeVisible(item) ? 'd-flex' : 'd-none'"
        >
            <div class="tree-spacer" v-for="i in item.level">
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
import {treeifyArray} from "@/helper/tree.js";

const props = defineProps({
    items: {
        type: Array,
        required: true
    },
    idProperty: {
        type: String,
        required: true
    },
    parentIdProperty: {
        type: String,
        required: true
    },
    sortedByProperty: {
        type: String,
        required: true
    }
});

const allIds = computed(() => {
    return props.items
        .map(item => item[props.idProperty]);
});

const itemsById = computed(() => {
    return new Map(
        props.items
            .map(item => [item[props.idProperty], item])
    );
});

const leafIds = computed(() => {
    const idsHavingAParent = new Set();

    props.items.forEach(item => {
        if (item[props.parentIdProperty] !== null) {
            idsHavingAParent.add(item[props.parentIdProperty]);
        }
    });

    return new Set(allIds.value).difference(idsHavingAParent);
});

const expandedIds = ref(new Set(allIds.value)); // default: all nodes are expanded

const treeifiedArray = computed(() => {
    return treeifyArray(
        props.items,
        e => e[props.idProperty],
        e => e[props.parentIdProperty],
        e => e[props.sortedByProperty]
    );
});

function getButton(item) {
    if (leafIds.value.has(item[props.idProperty])) {
        return '';
    }

    return isNodeExpanded(item) ? '-' : '+';
}

function isNodeExpanded(item) {
    const id = item[props.idProperty];

    return expandedIds.value.has(id);
}

function isNodeVisible(item) {
    // A node N is visible if and only if all of N's ancestors are expanded.
    // A node without any ancestors if always visible.

    let i = item;

    while (true) {
        const parentId = i[props.parentIdProperty];
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
    const id = item[props.idProperty];
    if (expandedIds.value.has(id)) {
        expandedIds.value.delete(id);
    } else {
        expandedIds.value.add(id);
    }
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
