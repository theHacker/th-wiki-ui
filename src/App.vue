<template>
    <header>
        <TheMainNavigation />
    </header>

    <main class="p-4 pb-5">
        <RouterView />
    </main>

    <footer>
        <TheFooter />
    </footer>
</template>

<script setup>
import {RouterView} from 'vue-router';
import TheMainNavigation from "@/components/general/TheMainNavigation.vue";
import TheFooter from "@/components/general/TheFooter.vue";
</script>
