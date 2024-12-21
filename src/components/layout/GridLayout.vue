<template>
    <div class="d-grid gridLayout vh-100" :class="{ hasSidebar: !!$slots.sidebar }">
        <header class="mb-2 mb-lg-3">
            <TheMainNavigation />
        </header>

        <aside v-if="$slots.sidebar" class="px-2 ps-lg-3 pe-md-0 mb-3 mb-lg-0">
            <slot name="sidebar" />
        </aside>

        <main class="px-2 px-lg-4">
            <slot />
        </main>

        <footer class="mt-2 mt-lg-3">
            <TheFooter />
        </footer>
    </div>
</template>

<script setup>
import TheMainNavigation from "@/components/general/TheMainNavigation.vue";
import TheFooter from "@/components/general/TheFooter.vue";
</script>

<style lang="scss" scoped>
header {
    grid-area: header;
}
aside {
    grid-area: sidebar;
    overflow: scroll;
}
main {
    grid-area: main;
    overflow: scroll;
}
footer {
    grid-area: footer;
}
</style>
