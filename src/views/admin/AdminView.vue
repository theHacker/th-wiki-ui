<template>
    <GridLayout>
        <h1>Administration</h1>

        <div class="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4 g-3">
            <div v-for="(tile, index) in tiles" :key="index" class="col">
                <RouterLink :to="'/admin' + tile.linkTo">
                    <div class="card text-center">
                        <h5 class="card-header">{{ tile.title }}</h5>
                        <div class="card-body">
                            <i :class="`fas fa-${tile.icon} fa-6x`" />
                        </div>
                    </div>
                </RouterLink>
            </div>
        </div>
    </GridLayout>
</template>

<script setup>
import GridLayout from "@/components/layout/GridLayout.vue";

const tiles = [
    { title: 'Projects', icon: 'rocket', linkTo: '/projects' },
    { title: 'Tags', icon: 'tags', linkTo: '/tags' }
];
</script>
