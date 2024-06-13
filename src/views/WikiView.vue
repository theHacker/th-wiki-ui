<script setup>
import axios from "@/axios.js";
import {ref} from 'vue';

const wikiPages = ref([]);
const loading = ref(true);

axios
    .get('/wiki-pages')
    .then(response => {
        loading.value = false;
        wikiPages.value = response.data;
    });
</script>

<template>
    <h1>Wiki pages</h1>

    <div v-if="loading">Loading…</div>

    <table>
        <tr>
            <th>ID</th>
            <th>Title</th>
        </tr>
        <tr v-for="wikiPage in wikiPages">
            <td>{{ wikiPage.id }}</td>
            <td>{{ wikiPage.title }}</td>
        </tr>
    </table>
</template>
