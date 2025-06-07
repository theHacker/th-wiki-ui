<template>
    <div class="card mh-100">
        <div class="card-header">
            <div class="d-flex flex-wrap row-gap-2 gap-2">
                <div class="hstack gap-2">
                    <SearchInput v-model="query" />
                    <BaseButton
                        class="btn-text-xxl"
                        icon="plus"
                        title="New page"
                        color="primary"
                        @click="$router.push({name: 'wikiPageNew'})"
                    />
                </div>

                <div class="hstack gap-2 w-100">
                    <div class="btn-group">
                        <BaseButton
                            icon="maximize"
                            tooltip="Expand all nodes"
                            fixedWidth
                            @click="expandAllNodes"
                        />
                        <BaseButton
                            icon="minimize"
                            tooltip="Collapse all nodes"
                            fixedWidth
                            @click="collapseAllNodes"
                        />
                    </div>

                    <div class="btn-group">
                        <BaseButton
                            icon="tags"
                            tooltip="Show tags"
                            fixedWidth
                            :active="showTags"
                            @click="showTags = !showTags"
                        />
                        <BaseButton
                            icon="tag"
                            tooltip="Shorten tags"
                            fixedWidth
                            :active="shortenTags"
                            @click="shortenTags = !shortenTags"
                        />
                    </div>
                </div>

                <div v-if="!loading" class="fw-normal fs-7">
                    <div v-if="queryError" class="text-danger">
                        {{ queryError }}
                    </div>
                    <div v-else>
                        <b>{{ wikiPagesResultingFromQueryNotGrayedOut }}</b> {{ wikiPagesResultingFromQueryNotGrayedOut !== 1 ? 'wiki pages' : 'wiki page'}} filtered.
                        <b>{{ wikiPages.length }}</b> {{ wikiPages.length !== 1 ? 'wiki pages' : 'wiki page'}} total.
                    </div>
                </div>
            </div>
        </div>

        <div v-if="loading" class="card-body">
            <LoadingIndicator />
        </div>
        <div v-if="!loading" class="card-body overflow-x-hidden">
            <TreeView
                ref="treeView"
                :items="wikiPagesResultingFromQuery"
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
                            <i
                                v-if="item.attachmentsCount > 0"
                                class="fas fa-paperclip fa-xs" style="margin-left: -2px;"
                                title="has attachments"
                            />

                            <template v-if="showTags && item.tags.length > 0">
                                <TagBadge
                                    v-for="tag in item.tags"
                                    :key="tag.id"
                                    :scope="tag.scope"
                                    :scopeIcon="tag.scopeIcon"
                                    :scopeColor="tag.scopeColor"
                                    :title="tag.title"
                                    :titleIcon="tag.titleIcon"
                                    :titleColor="tag.titleColor"
                                    :tooltip="tag.description"
                                    :shorten="shortenTags"
                                />
                            </template>
                        </span>
                    </RouterLink>
                </template>
            </TreeView>
        </div>
    </div>
</template>

<script setup>
import axios from "@/axios.js";
import {computed, ref, useTemplateRef, watch} from 'vue';
import SearchInput from "@/components/SearchInput.vue";
import LoadingIndicator from "@/components/LoadingIndicator.vue";
import TreeView from "@/components/TreeView.vue";
import {Tree} from "@/helper/tree.js";
import BaseButton from "@/components/BaseButton.vue";
import {refSyncStateToUserPreferences, UserPreferencesKeys} from "@/helper/local-storage.js";
import TagBadge from "@/components/TagBadge.vue";
import {sortTags} from "@/helper/sort-tags.js";
import {executeQuery} from "./wiki-search.js";

const emit = defineEmits(['onNodeDragDrop']);

defineExpose({ refreshTree });

const treeView = useTemplateRef("treeView");

const query = ref('');

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

const showTags = refSyncStateToUserPreferences({
    type: 'boolean',
    defaultValue: false,
    key: UserPreferencesKeys.WikiPagesTreeShowTags
});
const shortenTags = refSyncStateToUserPreferences({
    type: 'boolean',
    defaultValue: true,
    key: UserPreferencesKeys.WikiPagesTreeShortenTags
});

const wikiPagesResultingFromQuery = ref([]);
const queryError = ref(null);

watch(
    [ query, wikiPages ],
    () => {
        // Pass 1: Execute query, map to IDs

        let newWikiPagesResultingFromQuery = wikiPagesResultingFromQuery.value
            .filter(wp => !wp.grayedOut); // only true results, not intermediate ones (important when we keep this value due to a query error)

        try {
            newWikiPagesResultingFromQuery = executeQuery(query.value, wikiPages.value);
            queryError.value = '';
        } catch (e) {
            // We don't change newWikiPagesResultingFromQuery, so the previous result is still displayed,
            // in addition to the error message.
            queryError.value = e;
        }

        const idsMatching = new Set(newWikiPagesResultingFromQuery.map(wp => wp.id));

        // Pass 2: Find all parents

        const idsParentForMatching = new Set();

        idsMatching.forEach(id => {
            tree.value.getAncestors(id).forEach(wp => idsParentForMatching.add(wp.id));
        });

        // Decorate/shorten tree

        wikiPagesResultingFromQuery.value = wikiPages.value
            .filter(page => idsMatching.has(page.id) || idsParentForMatching.has(page.id))
            .map(page => ({...page, grayedOut: !idsMatching.has(page.id)}));
    }
);

const wikiPagesResultingFromQueryNotGrayedOut = computed(() => {
    return wikiPagesResultingFromQuery.value.filter(wp => !wp.grayedOut).length;
})

function fetchData() {
    axios
        .graphql(`
            query WikiPagesForTree {
                wikiPages {
                    id
                    title
                    content # TODO only until we have server-side search functionality
                    parent {
                        id
                    }
                    attachmentsCount
                    tags {
                        id
                    }
                }
                tags {
                    id
                    scope
                    scopeIcon
                    scopeColor
                    title
                    titleIcon
                    titleColor
                    description
                }
            }
        `)
        .then(data => {
            loading.value = false;
            wikiPages.value = data.wikiPages;

            wikiPages.value.forEach(it => {
                // For convenience, add the full objects to the wiki page
                // (We could let this populate by GraphQL but this would mean more traffic, we prefer doing this here)

                const tagIds = it.tags.map(tag => tag.id);
                it.tags = data.tags
                    .filter(tag => tagIds.includes(tag.id));

                sortTags(it.tags);
            });
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

function collapseAllNodes() {
    treeView.value.collapseAllNodes();
}

function expandAllNodes() {
    treeView.value.expandAllNodes();
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
