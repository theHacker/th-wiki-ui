<template>
    <header>
        <TheMainNavigation />
    </header>

    <main class="p-4 pb-5">
        <RouterView />
    </main>

    <footer class="py-3 is-size-7 has-text-centered has-background-dark">
        powered by <b>tH-Wiki</b>
    </footer>
</template>

<script setup>
import {RouterView} from 'vue-router';
import TheMainNavigation from "@/components/TheMainNavigation.vue";
</script>
