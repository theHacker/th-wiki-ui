<script setup>
import {RouterLink} from 'vue-router';
</script>

<template>
    <nav>
        <ul>
            <li>
                <RouterLink to="/">Home</RouterLink>
            </li>
            <li>
                <RouterLink to="/demo">Wiki</RouterLink>
            </li>
            <li>
                <RouterLink to="/demo">Tasks</RouterLink>
            </li>
            <li>
                <RouterLink to="/demo">Issues</RouterLink>
            </li>
        </ul>
    </nav>
</template>

<style scoped>
nav {
    background: rgba(0, 255, 0, .25);
    width: 100%;
    font-size: 12px;
    text-align: center;
    margin-top: 2rem;
}

nav a.router-link-exact-active {
    color: var(--color-text);
}

nav a.router-link-exact-active:hover {
    background-color: transparent;
}

nav a {
    display: inline-block;
    padding: 0 1rem;
    border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
    border: 0;
}
</style>
