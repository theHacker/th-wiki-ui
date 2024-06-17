<template>
    <div class="select" :class="{'is-danger': props.error, 'is-loading': loading}">
        <select v-model="entryId" :disabled="loading">
            <template v-if="!loading">
                <option :value="null">(no parent)</option>
                <option v-for="wikiPage in wikiPages" :value="wikiPage.id">{{ wikiPage.title }}</option>
            </template>
        </select>
    </div>
</template>

<script setup>
import axios from "@/axios.js";
import {ref} from 'vue';

const entryId = defineModel();

const props = defineProps({
    error: {
        type: Boolean,
        default: false
    }
});

const wikiPages = ref([]);
const loading = ref(true);

axios
    .get('/entries') // TODO only wiki
    .then(response => {
        loading.value = false;
        wikiPages.value = response.data;
    });
</script>
