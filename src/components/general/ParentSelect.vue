<template>
    <div class="input-group" :class="{'has-validation': !!props.errorMessage}">
        <select
            v-model="wikiPageId"
            class="form-select"
            :class="{'is-invalid': !!props.errorMessage}"
            :disabled="loading"
        >
            <template v-if="loading">
                <option>Loading…</option>
            </template>
            <template v-if="!loading">
                <option :value="null">(no parent)</option>
                <option v-for="wikiPage in wikiPages" :key="wikiPage.id" :value="wikiPage.id">
                    {{ optionIndent(wikiPage) }}{{ wikiPage.title }}
                </option>
            </template>
        </select>
        <label v-if="loading" class="input-group-text">
            <i class="fa fa-spinner fa-pulse" />
        </label>
        <div v-if="props.errorMessage" class="invalid-feedback">{{ props.errorMessage }}</div>
    </div>
</template>

<script setup>
import axios from "@/axios.js";
import {ref} from 'vue';
import {treeifyArray} from "@/helper/tree.js";

const wikiPageId = defineModel();

const props = defineProps({
    errorMessage: {
        type: String,
        required: false
    }
});

const wikiPages = ref([]);
const loading = ref(true);

function optionIndent(wikiPage) {
    const nbsp = String.fromCharCode(0xa0);
    const indent = nbsp.repeat(5);

    return indent.repeat(wikiPage.level - 1);
}

axios
    .graphql(`
        query WikiPagesForParentSelect {
            wikiPages {
                id
                title
                parent {
                    id
                }
            }
        }
    `)
    .then(data => {
        const treeArray = treeifyArray(data.wikiPages, e => e.id, e => e.parent?.id || null, e => e.title);

        loading.value = false;
        wikiPages.value = treeArray;
    });
</script>
