<template>
    <GridLayout>
        <template #sidebar>
            <h1>Help</h1>

            <div class="card mh-100">
                <div class="card-header">
                    <small class="fs-7 text-secondary float-end">Frontend</small>
                    <h2 class="fs-5 m-0">tH-Wiki UI</h2>
                </div>
                <div class="card-body overflow-x-hidden">
                    <TreeView
                        ref="treeView"
                        :items="helpPages"
                        :idFunction="wp => wp.id"
                        :parentIdFunction="wp => wp.parentId || null"
                        :sortFunction="treeViewSortFunction"
                    >
                        <template #default="{ item }">
                            <a
                                :class="{ active: item.id === currentHelpPageId }"
                                href="#"
                                @click.prevent="showHelpPage(item)"
                            >
                                <span class="icon-link mw-100" :class="{'opacity-50': item.folder}">
                                    <i class="fas" :class="{'fa-file': !item.folder, 'fa-folder': item.folder}" />

                                    <span v-html="item.title" class="title text-truncate" />
                                </span>
                            </a>
                        </template>
                    </TreeView>
                </div>
            </div>
        </template>

        <template #default>
            <div
                v-if="helpPageRenderedMarkdown === null"
                class="d-flex flex-column h-100 justify-content-center align-items-center"
            >
                <div class="fs-2">No page selected.</div>
                <div class="text-secondary">Click on any page in the tree to display it.</div>
            </div>
            <article v-else v-html="helpPageRenderedMarkdown" />
        </template>
    </GridLayout>
</template>

<script setup>
import {ref, useTemplateRef} from "vue";
import {useHead} from "@unhead/vue";
import GridLayout from "@/components/layout/GridLayout.vue";
import TreeView from "@/components/TreeView.vue";
import MarkdownRenderer from "@/markdown/rendering.js";
import {base64ToBlob} from "@/helper/base64.js";

useHead({
    title: 'Help'
});

const localMdImports = import.meta.glob(
    [
        '/README.md',
        '/doc/**/*.md'
    ],
    { import: 'default', query: '?raw' }
);
const localImageImports = import.meta.glob(
    [
        '/doc/**/*.png',
        '/doc/**/*.jpe?g',
        '/doc/**/*.gif',
    ],
    { import: 'default', query: '?inline' }
);

const treeView = useTemplateRef("treeView");

const helpPages = ref([]);
const helpResources = ref([]);

const currentHelpPageId = ref(null);
const helpPageRenderedMarkdown = ref(null);

Promise.all(
    Object.entries(localImageImports).map(async ([path, resolver]) => {
        const string = await resolver(); // will contain e.g. "data:image/png;base64,xxxxxxx"
        const split = string.split(',', 2);

        const type = split[0].replace(/^data:(.+);base64$/, '$1');
        const blob = base64ToBlob(split[1], type);
        const url = URL.createObjectURL(blob);

        const resource = {
            path,
            blob,
            url
        };

        helpResources.value.push(resource);
    })
).then(() => {
    Promise.all(
        Object.entries(localMdImports).map(async ([path, resolver]) => ({
            path,
            data: await resolver()
        }))
    ).then(async pathsAndData => {
        for (let {path, data} of pathsAndData) {
            const markdownRenderer = new MarkdownRenderer();
            markdownRenderer.enableAttachmentByBlobs(path, helpResources.value);

            const parentPath = path.replace(/(.*)(\/.+?)$/, '$1');
            const title = markdownRenderer.extractTitle(data) || ('<i>' + path.replace(/.*\/(.+?)$/, '$1') + '</i>');
            const renderedMarkdown = await markdownRenderer.renderPlain(data);

            helpPages.value.push({id: path, title, path, parentId: parentPath, renderedMarkdown});

            // Add parents
            while (path !== '') {
                path = path.replace(/(.*)(\/.+?)$/, '$1');
                const parentPath = path.replace(/(.*)(\/.+?)$/, '$1');
                const title = ('<i>' + path.replace(/.*\/(.+?)$/, '$1') + '</i>');

                if (path !== '' && !helpPages.value.some(hp => hp.path === path)) {
                    helpPages.value.push({id: path, title, path, parentId: parentPath, folder: true});
                }
            }
        }
    }).then(() => {
        const homeHelpPage = helpPages.value.find(hp => hp.path === '/README.md');

        showHelpPage(homeHelpPage);
    });
});

function treeViewSortFunction(a, b) {
    // README.md on top

    if (a.path.endsWith("/README.md")) {
        return -1;
    }
    if (b.path.endsWith("/README.md")) {
        return 1;
    }

    // then folders

    if (a.folder && !b.folder) {
        return -1;
    }
    if (!a.folder && b.folder) {
        return 1;
    }

    // then by title alphabetically

    return a.title.localeCompare(b.title);
}

function showHelpPage(helpPage) {
    if (helpPage.folder) {
        treeView.value.toggleNode(helpPage.id);
    }
    else {
        currentHelpPageId.value = helpPage.id;
        helpPageRenderedMarkdown.value = helpPage.renderedMarkdown;
    }
}
</script>
