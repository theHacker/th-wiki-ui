<template>
    <nav class="navbar navbar-expand-md bg-primary">
        <div class="container-fluid">
            <RouterLink to="/" class="navbar-brand d-inline-flex align-items-center">
                <img src="/favicon.png" alt="theHacker's Logo" class="d-inline-block me-2" />
                <div>
                    <div>tH-Wiki</div>
                    <div v-if="developmentStage" class="d-lg-none fs-6 text-danger">{{ developmentStage }}</div>
                </div>
            </RouterLink>

            <button class="navbar-toggler" type="button" @click="showNavBar = !showNavBar">
                <span class="navbar-toggler-icon"></span>
            </button>

            <div class="collapse navbar-collapse" :class="{ show: showNavBar }">
                <ul class="navbar-nav flex-row justify-content-around ms-lg-4 me-auto mb-2 mb-lg-0">
                    <li class="nav-item">
                        <RouterLink class="nav-link" to="/">Home</RouterLink>
                    </li>
                    <li class="nav-item">
                        <RouterLink class="nav-link" to="/wiki">Wiki</RouterLink>
                    </li>
                    <li class="nav-item">
                        <RouterLink class="nav-link" to="/issues">Issues</RouterLink>
                    </li>
                </ul>

                <span v-if="developmentStage" class="d-none d-lg-block navbar-text me-auto fs-3 text-danger">
                    – {{ developmentStage }} –
                </span>

                <ul class="navbar-nav flex-row justify-content-around me-lg-4 mb-2 mb-lg-0">
                    <li class="nav-item">
                        <RouterLink class="nav-link" to="/admin">Administration</RouterLink>
                    </li>
                </ul>

                <div class="d-flex">
                    <SearchInput />
                </div>
            </div>
        </div>
    </nav>
</template>

<script setup>
import {RouterLink} from 'vue-router';
import SearchInput from "@/components/SearchInput.vue";
import {ref} from "vue";

let developmentStage = '';
if (process.env.NODE_ENV === 'development') {
    developmentStage = 'Development';
} else if (window.env.DEVELOPMENT_STAGE || import.meta.env.VITE_DEVELOPMENT_STAGE) {
    developmentStage = window.env.DEVELOPMENT_STAGE || import.meta.env.VITE_DEVELOPMENT_STAGE;
}

const showNavBar = ref(false);
</script>

<style lang="scss" scoped>
nav {
    img {
        width: 48px;
        height: 48px;
    }

    .nav-link.active {
        font-weight: bold;
        text-decoration: underline;
        text-decoration-thickness: 3px;
        text-underline-offset: 5px;
    }
}
</style>
