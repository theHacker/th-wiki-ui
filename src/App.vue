<script setup>
import {RouterView} from 'vue-router';
import TheMainNavigation from "@/components/TheMainNavigation.vue";
</script>

<template>
    <header>
        <TheMainNavigation />
    </header>

    <main>
        <RouterView />
    </main>
</template>

<style>
@import "../node_modules/bulma/css/bulma.css";
@import "../node_modules/@fortawesome/fontawesome-free/css/fontawesome.css";
@import "../node_modules/@fortawesome/fontawesome-free/css/regular.css";

:root {
    --bulma-primary-h: 225deg;
    --bulma-primary-l: 42%;
}
</style>

<style scoped>
header {
    line-height: 1.5;
    max-height: 100vh;
}

@media (min-width: 1024px) {
    header {
        display: flex;
        place-items: center;
        padding-right: calc(var(--section-gap) / 2);
    }

    nav {
        text-align: left;
        margin-left: -1rem;
        font-size: 1rem;

        padding: 1rem 0;
        margin-top: 1rem;
    }
}
</style>
