<script setup>
import {RouterView} from 'vue-router';
import TheMainNavigation from "@/components/TheMainNavigation.vue";

const apiUrl = import.meta.env.VITE_API_URL;
</script>

<template>
    <header>
        <TheMainNavigation />

        <div class="debug">
            API server at <code>{{ apiUrl }}</code>.
        </div>
    </header>

    <main>
        <RouterView />
    </main>
</template>

<style>
@import "style/style.scss";
@import "../node_modules/@fortawesome/fontawesome-free/css/fontawesome.css";
@import "../node_modules/@fortawesome/fontawesome-free/css/regular.css";
</style>

<style lang="scss" scoped>
header {
    line-height: 1.5;
    max-height: 100vh;

    .debug {
        background: rgba(orange, .25);
    }
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
