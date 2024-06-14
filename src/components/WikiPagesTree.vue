<template>
    <div class="panel">
        <div class="panel-block">
            <p class="control has-icons-left">
                <input v-model="search" class="input" type="text" placeholder="Search" />
                <span class="icon is-left">
                    <i class="fas fa-search" />
                </span>
            </p>
        </div>

        <div v-if="loading" class="panel-block">
            <div class="icon-text">
                <span class="icon">
                    <i class="fas fa-spinner fa-pulse fa-2x" />
                </span>
                <span class="pl-2">Loading…</span>
            </div>
        </div>
        <div v-if="!loading" class="panel-block">
            <table class="table is-fullwidth is-hoverable">
                <thead>
                    <tr>
                        <th>&nbsp;</th>
                        <th>Title</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="wikiPage in filteredWikiPages">
                        <td><i class="fas fa-file" /></td>
                        <td>
                            <RouterLink
                                :to="{ name: 'wikiPage', params: { wikiPageId: wikiPage.id } }"
                            >
                                {{ wikiPage.title }}
                            </RouterLink>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
import axios from "@/axios.js";
import {computed, ref} from 'vue';

const search = ref('');

const wikiPages = ref([]);
const loading = ref(true);

const filteredWikiPages = computed(() => {
    if (search.value !== '') {
        const lowercase = search.value.toLowerCase();

        return wikiPages.value.filter(page => page.title.toLowerCase().includes(lowercase));
    } else {
        return wikiPages.value;
    }
});

axios
    .get('/wiki-pages')
    .then(response => {
        loading.value = false;
        wikiPages.value = response.data;
    });
</script>

<style lang="scss" scoped>
table {
    th:nth-child(1),
    td:nth-child(1) {
        width: 32px;
        padding-right: 0;
    }

    th:nth-child(2),
    td:nth-child(2) {
        padding-left: 0;
    }
}
</style>
