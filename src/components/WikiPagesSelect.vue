<template>
    <div class="select" :class="{'is-danger': props.error, 'is-loading': loading}">
        <select v-model="entryId" :disabled="loading">
            <template v-if="!loading">
                <option :value="null">(no parent)</option>
                <option v-for="wikiPage in wikiPages" :value="wikiPage.id">
                    {{ optionIndent(wikiPage) }}{{ wikiPage.title }}
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
    error: {
        type: Boolean,
        default: false
    }
});

const wikiPages = ref([]);
const loading = ref(true);

function optionIndent(wikiPage) {
    const nbsp = String.fromCharCode(0xa0);
    const indent = nbsp.repeat(5);

    return indent.repeat(wikiPage.level - 1);
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
    .get('/entries?type=wiki&fields=id,parentId,title')
    .then(response => {
        const tree = arrayToTree(response.data, e => e.id, e => e.parentId, e => e.title);
        const flatArray = treeToFlatArray(tree);

        loading.value = false;
        wikiPages.value = flatArray;
    });
</script>
