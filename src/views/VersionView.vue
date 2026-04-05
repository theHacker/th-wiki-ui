<template>
    <GridLayout>
        <h1>Version</h1>

        <div class="row g-3">
            <div class="col-12 col-lg-5 offset-lg-1">
                <div class="card">
                    <div class="card-header text-bg-info">UI</div>

                    <div class="card-body">
                        <div v-if="version.ui?.gitTag && version.ui?.gitDistance !== null" class="mb-2">
                            <span class="icon-link">
                                <i class="fas fa-fw fa-tag" />
                                <code>{{ version.ui.gitTag }}</code>
                                <small v-if="version.ui.gitDistance > 0">
                                    + {{ version.ui.gitDistance }} {{ version.ui.gitDistance > 1 ? 'commits' : 'commit' }}
                                </small>
                            </span>
                        </div>
                        <div>
                            <span class="icon-link">
                                <i class="fas fa-fw fa-code-commit" />
                                <code>{{ version.ui.gitHash }}</code>
                            </span>
                        </div>
                        <div v-if="version.ui.gitDirty" class="mt-2">
                            <span class="icon-link">
                                <i class="fas fa-fw fa-pen-fancy" />
                                Working copy is dirty.
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-12 col-lg-5">
                <div class="card">
                    <div class="card-header text-bg-info">API</div>

                    <div class="card-body">
                        <LoadingIndicator v-if="version.api === null">Contacting API…</LoadingIndicator>

                        <div v-if="version.api?.gitTag && version.api?.gitDistance !== null" class="mb-2">
                            <span class="icon-link">
                                <i class="fas fa-fw fa-tag" />
                                <code>{{ version.api.gitTag }}</code>
                                <small v-if="version.api.gitDistance > 0">
                                    + {{ version.api.gitDistance }} {{ version.api.gitDistance > 1 ? 'commits' : 'commit' }}
                                </small>
                            </span>
                        </div>
                        <div v-if="version.api?.gitHash">
                            <span class="icon-link">
                                <i class="fas fa-fw fa-code-commit" />
                                <code>{{ version.api.gitHash }}</code>
                            </span>
                        </div>
                        <div v-if="version.api?.gitDirty" class="mt-2">
                            <span class="icon-link">
                                <i class="fas fa-fw fa-pen-fancy" />
                                Working copy is dirty.
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </GridLayout>
</template>

<script setup>
import axios from "@/axios.js";
import {ref} from "vue";
import {useHead} from "@unhead/vue";
import LoadingIndicator from "@/components/LoadingIndicator.vue";
import GridLayout from "@/components/layout/GridLayout.vue";

useHead({
    title: 'Version'
});

const version = ref({
    api: null,
    ui: {
        gitTag: import.meta.env.VITE_GIT_TAG !== '' ? import.meta.env.VITE_GIT_TAG : null,
        gitDistance: import.meta.env.VITE_GIT_DISTANCE !== '' ? parseInt(import.meta.env.VITE_GIT_DISTANCE) : null,
        gitHash: import.meta.env.VITE_GIT_HASH,
        gitDirty: import.meta.env.VITE_GIT_DIRTY === 'true'
    }
});

axios
    .graphql(`
        query Version {
            version {
                gitTag
                gitDistance
                gitHash
                gitDirty
            }
        }
    `)
    .then(data => {
        version.value.api = data.version;
    });
</script>
