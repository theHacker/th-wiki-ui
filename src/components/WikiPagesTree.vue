<template>
    <div class="panel">
        <div class="panel-block">
            <SearchInput v-model="search" />
        </div>

        <div v-if="loading" class="panel-block">
            <Loading />
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
                                :to="{ name: 'wikiPage', params: { entryId: wikiPage.id } }"
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
import SearchInput from "@/components/SearchInput.vue";
import Loading from "@/components/Loading.vue";

const search = ref('');

const wikiPages = ref([]);
const loading = ref(true);

const filteredWikiPages = computed(() => {
    if (search.value) {
        const lowercase = search.value.toLowerCase();

        return wikiPages.value.filter(page => page.title.toLowerCase().includes(lowercase));
    } else {
        return wikiPages.value;
    }
});

axios
    .get('/entries') // TODO only wiki
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
