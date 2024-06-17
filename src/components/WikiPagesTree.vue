<template>
    <div class="panel">
        <div class="panel-block">
            <SearchInput v-model="search" />
        </div>

        <div v-if="loading" class="panel-block">
            <Loading />
        </div>
        <div v-if="!loading" class="panel-block">
            <Tree :items="filteredWikiPages">
                <template #label="{ item }">
                    <RouterLink :to="{ name: 'wikiPage', params: { entryId: item.id } }">
                        {{ item.title }}
                    </RouterLink>
                </template>
                <template #icon="{ item }">
                    <i v-if="item.folder" class="fas fa-folder" />
                    <i v-if="!item.folder" class="fas fa-file" />
                </template>
            </Tree>
        </div>
    </div>
</template>

<script setup>
import axios from "@/axios.js";
import {computed, ref} from 'vue';
import SearchInput from "@/components/SearchInput.vue";
import Loading from "@/components/Loading.vue";
import {arrayToTree} from "@/helper/tree.js";
import Tree from "@/components/Tree.vue";

const search = ref('');

const wikiPages = ref([]);
const loading = ref(true);

const filteredWikiPages = computed(() => {
    if (search.value) {
        const lowercase = search.value.toLowerCase();

        // When filter is active, we don't use the tree.
        // This avoids lost hits, when a child matches, but one of the parents doesn't.
        return wikiPages.value.filter(page => page.title.toLowerCase().includes(lowercase));
    } else {
        return arrayToTree(wikiPages.value, e => e.id, e => e.parentId, e => e.title).children;
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
@use "bulma/sass/utilities/index" as bulma;

.router-link-exact-active {
    font-weight: bold;
}
:deep(li) :has(> .router-link-exact-active) {
    background: bulma.$dark;
}
</style>
