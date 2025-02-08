<template>
    <h1 class="title mb-4">Version</h1>

    <div class="columns">
        <div class="column is-4 is-offset-2">
            <div class="panel is-info">
                <p class="panel-heading">UI</p>

                <div class="panel-block">
                    <span class="panel-icon">
                        <i class="fas fa-code-commit" />
                    </span>
                    <code>{{ version.ui.gitHash }}</code>
                </div>
                <div class="panel-block" v-if="version.ui.gitDirty">
                    <span class="panel-icon">
                        <i class="fas fa-pen-fancy" />
                    </span>
                    Working copy is dirty.
                </div>
            </div>
        </div>

        <div class="column is-4">
            <div class="panel is-info">
                <p class="panel-heading">API</p>

                <div v-if="version.api === null" class="panel-block">
                    <Loading>Contacting API…</Loading>
                </div>

                <div v-if="version.api?.gitHash" class="panel-block">
                    <span class="panel-icon">
                        <i class="fas fa-code-commit" />
                    </span>
                    <code>{{ version.api.gitHash }}</code>
                </div>
                <div v-if="version.api?.gitDirty" class="panel-block">
                    <span class="panel-icon">
                        <i class="fas fa-pen-fancy" />
                    </span>
                    Working copy is dirty.
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import axios from "@/axios.js";
import {ref} from "vue";
import Loading from "@/components/Loading.vue";

const version = ref({
    api: null,
    ui: {
        gitHash: import.meta.env.VITE_GIT_HASH,
        gitDirty: import.meta.env.VITE_GIT_DIRTY === 'true'
    }
});

axios
    .get('/version')
    .then(response => {
        version.value.api = response.data;
    });
</script>
