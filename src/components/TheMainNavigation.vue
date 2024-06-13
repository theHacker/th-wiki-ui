<script setup>
import {RouterLink} from 'vue-router';
</script>

<template>
    <nav class="navbar is-primary is-background-primary-25 p-1">
        <div class="navbar-brand">
            <RouterLink to="/" class="navbar-item">
                <figure class="image is-48x48">
                    <img src="/favicon.png" alt="theHacker's Logo" />
                </figure>
            </RouterLink>
            <RouterLink to="/" class="navbar-item subtitle mr-4 logo-link">
                tH-Wiki
            </RouterLink>
        </div>

        <div class="navbar-menu">
            <div class="navbar-start">
                <RouterLink class="navbar-item" to="/">Home</RouterLink>
                <RouterLink class="navbar-item" to="/wiki">Wiki</RouterLink>
                <RouterLink class="navbar-item" to="/demo">Tasks</RouterLink>
                <RouterLink class="navbar-item" to="/demo">Issues</RouterLink>
            </div>

            <div class="navbar-end">
                <div class="navbar-item">
                    <p class="control has-icons-left">
                        <input class="input" type="text" placeholder="Search" />
                        <span class="icon is-small is-left">
                            <i class="fas fa-magnifying-glass" />
                        </span>
                    </p>
                </div>
            </div>
        </div>
    </nav>
</template>

<style lang="scss" scoped>
nav {
    .navbar-item figure img {
        max-height: unset; // fix Bulma skewing the image
    }

    // Bulma does the same for "active" and "focus" as for "hover".
    // We don't want that.
    .navbar-item:active:not(:hover),
    .navbar-item:focus:not(:hover),
    .navbar-item:focus-within:not(:hover) {
        background: unset;
    }
}

nav a.router-link-exact-active:not(.logo-link) {
    font-weight: bold;
    text-decoration: underline;
    text-decoration-thickness: 3px;
    text-underline-offset: 5px;
    color: var(--color-text);
}
</style>
