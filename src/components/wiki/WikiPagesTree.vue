<template>
    <div class="card mh-100">
        <div class="card-header">
            <div class="hstack gap-2">
                <SearchInput v-model="search" />
                <Button
                    class="btn-text-xxl"
                    icon="plus"
                    title="New page"
                    color="primary"
                    @click="$router.push({name: 'wikiPageNew'})"
                />
            </div>
        </div>

        <div v-if="loading" class="card-body">
            <Loading />
        </div>
        <div v-if="!loading" class="card-body overflow-x-hidden">
            <Tree :items="filteredWikiPages" idProperty="id" parentIdProperty="parentId" sortedByProperty="title">
                <template #default="{ item }">
                    <RouterLink
                        :to="{ name: 'wikiPage', params: { entryId: item.id } }"
                        class="d-block"
                        exactActiveClass="active"
                    >
                        <span class="icon-link mw-100">
                            <i v-if="item.folder" class="fas fa-folder" />
                            <i v-if="!item.folder" class="fas fa-file" />
                            <span class="title text-truncate">{{ item.title }}</span>
                        </span>
                    </RouterLink>
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
import Tree from "@/components/Tree.vue";
import Button from "@/components/Button.vue";

const search = ref('');

const wikiPages = ref([]);
const loading = ref(true);

const filteredWikiPages = computed(() => {
    if (search.value) {
        const lowercase = search.value.toLowerCase();

        // When filter is active, we don't use the tree.
        // This avoids lost hits, when a child matches, but one of the parents doesn't.
        return wikiPages.value
            .filter(page => page.title.toLowerCase().includes(lowercase))
            .map(item => ({...item, parentId: null}));
    } else {
        return wikiPages.value;
    }
});

axios
    .get('/entries?type=wiki&fields=id,parentId,title')
    .then(response => {
        loading.value = false;
        wikiPages.value = response.data;
    });
</script>
