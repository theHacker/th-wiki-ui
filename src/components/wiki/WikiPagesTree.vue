<template>
    <div class="card mh-100">
        <div class="card-header">
            <div class="hstack gap-2">
                <SearchInput v-model="search" />
                <BaseButton
                    class="btn-text-xxl"
                    icon="plus"
                    title="New page"
                    color="primary"
                    @click="$router.push({name: 'wikiPageNew'})"
                />
            </div>
        </div>

        <div v-if="loading" class="card-body">
            <LoadingIndicator />
        </div>
        <div v-if="!loading" class="card-body overflow-x-hidden">
            <TreeView
                :items="filteredWikiPages"
                :idFunction="wp => wp.id"
                :parentIdFunction="wp => wp.parent?.id || null"
                :sortFunction="(a, b) => a.title.localeCompare(b.title)"
            >
                <template #default="{ item }">
                    <RouterLink
                        :to="{ name: 'wikiPage', params: { wikiPageId: item.id } }"
                        class="d-block"
                        exactActiveClass="active"
                        draggable="true"
                        @dragstart="e => onDragStart(e, item.id)"
                        @dragover="e => onDragOver(e, item.id)"
                        @dragend="e => onDragEnd(e)"
                        @dragenter="e => onDragEnter(e, item.id)"
                        @dragleave="onDragLeave(item.id)"
                        @drop="e => onDrop(e)"
                    >
                        <span
                            class="icon-link mw-100 dragAcceptor"
                            :class="cssItem(item)"
                        >
                            <i class="fas fa-file" />
                            <span class="title text-truncate">{{ item.title }}</span>
                        </span>
                    </RouterLink>
                </template>
            </TreeView>
        </div>
    </div>
</template>

<script setup>
import axios from "@/axios.js";
import {computed, ref} from 'vue';
import SearchInput from "@/components/SearchInput.vue";
import LoadingIndicator from "@/components/LoadingIndicator.vue";
import TreeView from "@/components/TreeView.vue";
import {Tree} from "@/helper/tree.js";
import BaseButton from "@/components/BaseButton.vue";

const emit = defineEmits(['onNodeDragDrop']);

defineExpose({ refreshTree });

const search = ref('');

const wikiPages = ref([]);
const loading = ref(true);

const tree = computed(() => {
    return new Tree({
        items: wikiPages.value,
        parentIdFunction: n => n.parent?.id || null,
        sortFunction: (a, b) => a.title.localeCompare(b.title)
    });
});

const dragDropInProgress = ref(null);

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

function fetchData() {
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
}

function refreshTree() {
    fetchData();
}

fetchData();

function cssItem(item) {
    const classes = [];

    if (item.grayedOut) {
        classes.push('opacity-25');
    }

    if (dragDropInProgress.value) {
        if (item.id === dragDropInProgress.value.hoverWikiPageId) {
            if (dragDropInProgress.value.hoverAllowed) {
                classes.push('text-success');
            } else {
                classes.push('text-danger');
            }
        }
        else {
            if (isDragAllowed(dragDropInProgress.value.sourceWikiPageId, item.id)) {
                classes.push('text-success-emphasis');
            } else {
                classes.push('text-danger-emphasis');
            }
        }
    }

    return classes;
}

const dragDropFormat = "text/x-thwiki-wikipage-id";

function onDragStart(e, wikiPageId) {
    e.dataTransfer.setData(dragDropFormat, wikiPageId);
    e.dataTransfer.effectAllowed = "move";

    dragDropInProgress.value = {
        sourceWikiPageId: wikiPageId,
        hoverWikiPageId: null,
        hoverAllowed: false
    };
}

function onDragEnd() {
    dragDropInProgress.value = null;
}

function onDragEnter(e, wikiPageId) {
    const sourceWikiPageId = e.dataTransfer.getData(dragDropFormat);
    const targetWikiPageId = wikiPageId;

    dragDropInProgress.value.hoverWikiPageId = wikiPageId;
    dragDropInProgress.value.hoverAllowed = isDragAllowed(sourceWikiPageId, targetWikiPageId);
}

function onDragLeave(wikiPageId) {
    if (dragDropInProgress.value.hoverWikiPageId === wikiPageId) {
        dragDropInProgress.value.hoverWikiPageId = null;
    }
}

function onDragOver(e, wikiPageId) {
    if (e.dataTransfer.types.includes(dragDropFormat)) {
        const sourceWikiPageId = e.dataTransfer.getData(dragDropFormat);
        const targetWikiPageId = wikiPageId;

        if (isDragAllowed(sourceWikiPageId, targetWikiPageId)) {
            e.dataTransfer.dropEffect = "move";
            e.preventDefault();
        } else {
            e.dataTransfer.dropEffect = "none";
        }
    }
}

function onDrop(e) {
    const sourceWikiPageId = e.dataTransfer.getData(dragDropFormat);
    const targetWikiPageId = dragDropInProgress.value.hoverWikiPageId;

    dragDropInProgress.value = null;

    if (targetWikiPageId === null) {
        return;
    }

    emit('onNodeDragDrop', sourceWikiPageId, targetWikiPageId);
}

function isDragAllowed(sourceWikiPageId, targetWikiPageId) {
    // Can't drop onto itself
    if (sourceWikiPageId === targetWikiPageId) {
        return false;
    }

    // Doesn't make sense if it's already the direct parent
    if (tree.value.isParent(targetWikiPageId, sourceWikiPageId)) {
        return false;
    }

    // Can't create a cycle
    if (tree.value.isDescendant(targetWikiPageId, sourceWikiPageId)) {
        return false;
    }

    // Fine to drop
    return true;
}
</script>

<style lang="scss" scoped>
// Children elements must not trigger any drag&drop events
.dragAcceptor * {
    pointer-events: none;
}
</style>
