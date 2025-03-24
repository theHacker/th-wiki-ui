<template>
    <div class="input-group" :class="{'has-validation': !!props.errorMessage}">
        <select
            v-model="entryId"
            class="form-select"
            :class="{'is-invalid': !!props.errorMessage}"
            :disabled="loading"
        >
            <template v-if="loading">
                <option>Loading…</option>
            </template>
            <template v-if="!loading">
                <option :value="null">(no parent)</option>
                <option v-for="entry in entries" :key="entry.id" :value="entry.id">
                    {{ optionIndent(entry) }}{{ entry.title }}
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

const entryId = defineModel();

const props = defineProps({
    errorMessage: {
        type: String,
        required: false
    }
});

const entries = ref([]);
const loading = ref(true);

function optionIndent(entry) {
    const nbsp = String.fromCharCode(0xa0);
    const indent = nbsp.repeat(5);

    return indent.repeat(entry.level - 1);
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
    .then(response => {
        const treeArray = treeifyArray(response.data.data.wikiPages, e => e.id, e => e.parent?.id || null, e => e.title);

        loading.value = false;
        entries.value = treeArray;
    });
</script>
