<template>
    <div class="select" :class="{'is-danger': props.error, 'is-loading': loading}">
        <select v-model="entryId" :disabled="loading">
            <template v-if="!loading">
                <option :value="null">(no parent)</option>
                <option v-for="entry in entries" :value="entry.id">
                    {{ optionIndent(entry) }}{{ entry.title }}
                </option>
            </template>
        </select>
    </div>
</template>

<script setup>
import axios from "@/axios.js";
import {ref} from 'vue';
import {arrayToTree} from "@/helper/tree.js";

const entryId = defineModel();

const props = defineProps({
    type: {
        type: String,
        required: true
    },
    error: {
        type: Boolean,
        default: false
    }
});

const entries = ref([]);
const loading = ref(true);

function optionIndent(entry) {
    const nbsp = String.fromCharCode(0xa0);
    const indent = nbsp.repeat(5);

    return indent.repeat(entry.level - 1);
}

function treeToFlatArray(tree, flatList = []) {
    const { children, ...item } = tree;

    if (!item.root) {
        flatList.push(item);
    }

    for (const child of children) {
        treeToFlatArray(child, flatList);
    }

    return flatList;
}

axios
    .get(`/entries?type=${props.type}&fields=id,parentId,title`)
    .then(response => {
        const tree = arrayToTree(response.data, e => e.id, e => e.parentId, e => e.title);
        const flatArray = treeToFlatArray(tree);

        loading.value = false;
        entries.value = flatArray;
    });
</script>
