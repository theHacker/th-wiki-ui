<template>
    <div class="panel">
        <div class="panel-block">
            <div class="level">
                <div class="level-left">
                    <div class="level-item">
                        <SearchInput v-model="search" />
                    </div>
                </div>
                <div class="level-right">
                    <div class="level-item">
                        <Button
                            title="New page"
                            color="primary"
                            @click="$router.push({name: 'wikiPageNew'})"
                        />
                    </div>
                </div>
            </div>
        </div>

        <div v-if="loading" class="panel-block">
            <Loading />
        </div>
        <div v-if="!loading" class="panel-block">
            <Tree :items="filteredWikiPages">
                <template #default="{ item }">
                    <RouterLink
                        v-slot="{ route, isExactActive, navigate }"
                        :to="{ name: 'wikiPage', params: { entryId: item.id } }"
                        custom
                    >
                        <div
                            :class="{ nav: true, active: isExactActive, 'is-clickable': true, 'is-unselectable': true }"
                            @click="navigate"
                        >
                            <span class="icon-text">
                                <span class="icon">
                                    <i v-if="item.folder" class="fas fa-folder" />
                                    <i v-if="!item.folder" class="fas fa-file" />
                                </span>
                                <span>
                                    <a :href="route.href">{{ item.title }}</a>
                                </span>
                            </span>
                        </div>
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
import {arrayToTree} from "@/helper/tree.js";
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
        return wikiPages.value.filter(page => page.title.toLowerCase().includes(lowercase));
    } else {
        return arrayToTree(wikiPages.value, e => e.id, e => e.parentId, e => e.title).children;
    }
});

axios
    .get('/entries?type=wiki&fields=id,parentId,title')
    .then(response => {
        loading.value = false;
        wikiPages.value = response.data;
    });
</script>

<style lang="scss" scoped>
ul {
    width: 100%;
}

.nav {
    --bulma-duration: 0; // No color animations please.

    a, .icon {
        color: var(--bulma-text);
    }

    &:hover {
        a, .icon {
            color: var(--bulma-text-strong);
        }
    }

    &.active {
        a, .icon {
            color: var(--bulma-link);
        }
        a {
            background-color: hsla(var(--bulma-primary-h), var(--bulma-primary-s), var(--bulma-primary-20-l), .5);
            padding: 2px 2px 2px 0;
        }
    }
}
</style>
