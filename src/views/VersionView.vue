<template>
    <GridLayout>
        <h1>Version</h1>

        <div class="row g-3">
            <div class="col-12 col-lg-5 offset-lg-1">
                <div class="card">
                    <div class="card-header text-bg-info">UI</div>

                    <div class="card-body">
                        <div>
                            <span class="icon-link">
                                <i class="fas fa-code-commit" />
                                <code>{{ version.ui.gitHash }}</code>
                            </span>
                        </div>
                        <div v-if="version.ui.gitDirty" class="mt-2">
                            <span class="icon-link">
                                <i class="fas fa-pen-fancy" />
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
                        <Loading v-if="version.api === null">Contacting API…</Loading>

                        <div v-if="version.api?.gitHash">
                            <span class="icon-link">
                                <i class="fas fa-code-commit" />
                                <code>{{ version.api.gitHash }}</code>
                            </span>
                        </div>
                        <div v-if="version.api?.gitDirty" class="mt-2">
                            <span class="icon-link">
                                <i class="fas fa-pen-fancy" />
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
import Loading from "@/components/Loading.vue";
import GridLayout from "@/components/layout/GridLayout.vue";

const version = ref({
    api: null,
    ui: {
        gitHash: import.meta.env.VITE_GIT_HASH,
        gitDirty: import.meta.env.VITE_GIT_DIRTY === 'true'
    }
});

axios
    .graphql(`
        query Version {
            version {
                gitHash
                gitDirty
            }
        }
    `)
    .then(data => {
        version.value.api = data.version;
    });
</script>
