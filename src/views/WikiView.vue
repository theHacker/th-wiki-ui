<template>
    <h1 class="title">Wiki pages</h1>

    <div v-if="loading" class="icon-text">
        <span class="icon">
            <i class="fas fa-spinner fa-pulse fa-2x" />
        </span>
        <span class="pl-2">Loading…</span>
    </div>

    <table v-if="!loading" class="table is-hoverable">
        <thead>
            <tr>
                <th>ID</th>
                <th>Title</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="wikiPage in wikiPages">
                <td>{{ wikiPage.id }}</td>
                <td>{{ wikiPage.title }}</td>
            </tr>
        </tbody>
    </table>
</template>

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
