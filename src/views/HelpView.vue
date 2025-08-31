<template>
    <GridLayout>
        <template #sidebar>
            <h1>Help</h1>

            <div class="card mh-100">
                <div class="card-header">
                    <small class="fs-7 text-secondary float-end">Backend</small>
                    <h2 class="fs-5 m-0">tH-Wiki</h2>
                </div>
                <div class="card-body overflow-x-hidden">
                    <LoadingIndicator v-if="helpPagesApi.length === 0">
                        Loading help resources from API…
                    </LoadingIndicator>
                    <TreeView
                        ref="treeViewApi"
                        :items="helpPagesApi"
                        :idFunction="wp => wp.id"
                        :parentIdFunction="wp => wp.parentId || null"
                        :sortFunction="treeViewSortFunction"
                    >
                        <template #default="{ item }">
                            <a
                                :class="{ active: currentHelpPageId === `api:${item.id}` }"
                                href="#"
                                @click.prevent="showHelpPage('api', item)"
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

            <div class="card mh-100 mt-4">
                <div class="card-header">
                    <small class="fs-7 text-secondary float-end">Frontend</small>
                    <h2 class="fs-5 m-0">tH-Wiki UI</h2>
                </div>
                <div class="card-body overflow-x-hidden">
                    <LoadingIndicator v-if="helpPagesUi.length === 0">
                        Preparing help resources from UI…
                    </LoadingIndicator>
                    <TreeView
                        ref="treeViewUi"
                        :items="helpPagesUi"
                        :idFunction="wp => wp.id"
                        :parentIdFunction="wp => wp.parentId || null"
                        :sortFunction="treeViewSortFunction"
                    >
                        <template #default="{ item }">
                            <a
                                :class="{ active: currentHelpPageId === `ui:${item.id}` }"
                                href="#"
                                @click.prevent="showHelpPage('ui', item)"
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
            <article v-else v-html="helpPageRenderedMarkdown" class="helpContent" />
        </template>
    </GridLayout>
</template>

<script setup>
import axios from "@/axios.js";
import {ref, useTemplateRef} from "vue";
import {useHead} from "@unhead/vue";
import GridLayout from "@/components/layout/GridLayout.vue";
import TreeView from "@/components/TreeView.vue";
import MarkdownRenderer from "@/markdown/rendering.js";
import {base64ToBlob, base64ToUtf8String} from "@/helper/base64.js";
import LoadingIndicator from "@/components/LoadingIndicator.vue";

useHead({
    title: 'Help'
});

const localMdImports = import.meta.glob(
    [
        '/*.md',
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

const treeViewApi = useTemplateRef("treeViewApi");
const treeViewUi = useTemplateRef("treeViewUi");

const helpPagesApi = ref([]);
const helpResourcesApi = ref([]);

const helpPagesUi = ref([]);
const helpResourcesUi = ref([]);

const currentHelpPageId = ref(null);
const helpPageRenderedMarkdown = ref(null);

axios
    .graphql(`
        query HelpResources {
            helpResources {
                path
                dataBase64
                mimeType
            }
        }
    `)
    .then(async data => {
        // Separate markdown files and other resources
        const markdowns = data.helpResources.filter(it => it.mimeType === 'text/markdown');
        const other = data.helpResources.filter(it => it.mimeType !== 'text/markdown');

        // Process other resources first
        for (const otherResource of other) {
            const blob = base64ToBlob(otherResource.dataBase64, otherResource.mimeType);
            const url = URL.createObjectURL(blob);

            const resource = {
                path: otherResource.path,
                blob,
                url
            };

            helpResourcesApi.value.push(resource);
        }

        // Process markdown resources
        for (const markdownResource of markdowns) {
            const markdownRenderer = new MarkdownRenderer();
            markdownRenderer.enableAttachmentByBlobs(markdownResource.path, helpResourcesApi.value);

            let path = markdownResource.path;
            const data = base64ToUtf8String(markdownResource.dataBase64);

            const parentPath = path.replace(/(.*)(\/.+?)$/, '$1');
            let title = markdownRenderer.extractTitle(data) || ('<i>' + path.replace(/.*\/(.+?)$/, '$1') + '</i>');
            const renderedMarkdown = await markdownRenderer.renderPlain(data);

            // Special case different title.
            // (We don't support frontmatter on Markdown files)
            if (path === '/LICENSE.md') {
                title = 'License';
            }

            helpPagesApi.value.push({id: path, title, path, parentId: parentPath, renderedMarkdown});

            // Add parents
            while (path !== '') {
                path = path.replace(/(.*)(\/.+?)$/, '$1');
                const parentPath = path.replace(/(.*)(\/.+?)$/, '$1');
                const title = ('<i>' + path.replace(/.*\/(.+?)$/, '$1') + '</i>');

                if (path !== '' && !helpPagesApi.value.some(hp => hp.path === path)) {
                    helpPagesApi.value.push({id: path, title, path, parentId: parentPath, folder: true});
                }
            }
        }
    })
    .then(() => {
        const homeHelpPage = helpPagesApi.value.find(hp => hp.path === '/README.md');

        showHelpPage('api', homeHelpPage);
    });

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

        helpResourcesUi.value.push(resource);
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
            markdownRenderer.enableAttachmentByBlobs(path, helpResourcesUi.value);

            const parentPath = path.replace(/(.*)(\/.+?)$/, '$1');
            let title = markdownRenderer.extractTitle(data) || ('<i>' + path.replace(/.*\/(.+?)$/, '$1') + '</i>');
            const renderedMarkdown = await markdownRenderer.renderPlain(data);

            // Special case different title.
            // (We don't support frontmatter on Markdown files)
            if (path === '/LICENSE.md') {
                title = 'License';
            }

            helpPagesUi.value.push({id: path, title, path, parentId: parentPath, renderedMarkdown});

            // Add parents
            while (path !== '') {
                path = path.replace(/(.*)(\/.+?)$/, '$1');
                const parentPath = path.replace(/(.*)(\/.+?)$/, '$1');
                const title = ('<i>' + path.replace(/.*\/(.+?)$/, '$1') + '</i>');

                if (path !== '' && !helpPagesUi.value.some(hp => hp.path === path)) {
                    helpPagesUi.value.push({id: path, title, path, parentId: parentPath, folder: true});
                }
            }
        }
    })
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

function showHelpPage(section, helpPage) {
    if (helpPage.folder) {
        const tree = section === 'api' ? treeViewApi : treeViewUi;

        tree.value.toggleNode(helpPage.id);
    }
    else {
        currentHelpPageId.value = `${section}:${helpPage.id}`;
        helpPageRenderedMarkdown.value = helpPage.renderedMarkdown;
    }
}
</script>

<style lang="scss" scoped>
// Format screenshots nice within our docs.
// We can't use a <style> tag within the markdown to format,
// GitHub won't interpret it (but display the HTML code).
article:deep(img) {
    max-width: 400px;
    margin: 0.5rem 0.25rem;
    border: 1px solid var(--bs-gray-800);
}
</style>
