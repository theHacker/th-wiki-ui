<template>
    <header>
        <TheMainNavigation />
    </header>

    <main class="p-4 pb-5">
        <RouterView />
    </main>

    <footer class="py-3 is-size-7 has-text-centered has-background-dark">
        powered by <b>tH-Wiki</b><br />
        Git commit <i>{{ gitInfo }}</i> <b v-if="gitDirty">(dirty)</b>
    </footer>
</template>

<script setup>
import {RouterView} from 'vue-router';
import TheMainNavigation from "@/components/general/TheMainNavigation.vue";

const gitInfo = import.meta.env.VITE_GIT_HASH;
const gitDirty = import.meta.env.VITE_GIT_DIRTY === 'true';
</script>
