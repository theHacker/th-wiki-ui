<template>
    <header>
        <TheMainNavigation />
    </header>

    <main class="p-4 pb-5">
        <RouterView />
    </main>

    <footer class="py-3 is-size-7 has-text-centered has-background-dark">
        powered by <b>tH-Wiki</b><br />
        Git commits:
        UI <i>{{ version.ui.gitHash }}</i> <b v-if="version.ui.gitDirty">(dirty)</b> -
        API <i>{{ version.api.gitHash }}</i> <b v-if="version.api.gitDirty">(dirty)</b>
    </footer>
</template>

<script setup>
import axios from "@/axios.js";
import {RouterView} from 'vue-router';
import TheMainNavigation from "@/components/general/TheMainNavigation.vue";
import {ref} from "vue";

const version = ref({
    api: {
        gitHash: '',
        gitDirty: false
    },
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
