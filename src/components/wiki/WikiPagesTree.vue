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
            <Tree
                :items="filteredWikiPages"
                :idFunction="wp => wp.id"
                :parentIdFunction="wp => wp.parent?.id || null"
                :sortedByFunction="wp => wp.title"
            >
                <template #default="{ item }">
                    <RouterLink
                        :to="{ name: 'wikiPage', params: { entryId: item.id } }"
                        class="d-block"
                        exactActiveClass="active"
                    >
                        <span class="icon-link mw-100" :class="{'opacity-25': item.grayedOut}">
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

        // Pass 1: Find all matches

        const idsMatching = new Set();

        wikiPages.value.forEach(page => {
            const matches = page.title.toLowerCase().includes(lowercase);

            if (matches) {
                idsMatching.add(page.id);
            }
        });

        // Pass 2: Find all parents
        // TODO Would be nice we if had a tree structure already knowing all parents.

        const wikiPagesById = new Map(
            wikiPages.value.map(item => [item.id, item])
        );
        const idsParentForMatching = new Set();

        idsMatching.forEach(id => {
            let parentId = id;
            while (true) {
                parentId = wikiPagesById.get(parentId)?.parent?.id || null;
                if (parentId === null) {
                    break;
                }

                idsParentForMatching.add(parentId);
            }
        });

        // Decorate/shorten tree

        return wikiPages.value
            .filter(page => idsMatching.has(page.id) || idsParentForMatching.has(page.id))
            .map(page => ({...page, grayedOut: !idsMatching.has(page.id)}));
    } else {
        return wikiPages.value;
    }
});

axios
    .graphql(`
        query WikiPagesForTree {
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
        loading.value = false;
        wikiPages.value = data.wikiPages;
    });
</script>
