<template>
    <div class="d-grid gridLayout vh-100" :class="{ hasSidebar: !!$slots.sidebar }">
        <header class="mb-3">
            <TheMainNavigation />
        </header>

        <aside v-if="$slots.sidebar" class="ps-3">
            <slot name="sidebar" />
        </aside>

        <main class="px-4">
            <slot />
        </main>

        <footer class="mt-3">
            <TheFooter />
        </footer>
    </div>
</template>

<script setup>
import TheMainNavigation from "@/components/general/TheMainNavigation.vue";
import TheFooter from "@/components/general/TheFooter.vue";
</script>

<style lang="scss" scoped>
.gridLayout {
    &.hasSidebar {
        grid-template-areas:
        "header header"
        "sidebar main"
        "footer footer";
        grid-template-rows: auto 1fr auto;
        grid-template-columns: minmax(250px, 1fr) 3fr;
    }
    &:not(.hasSidebar) {
        grid-template-areas:
        "header"
        "main"
        "footer";
        grid-template-rows: auto 1fr auto;
        grid-template-columns: 1fr;
    }
}

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
