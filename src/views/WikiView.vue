<template>
    <h1 class="title">Wiki pages</h1>

    <div class="columns">

        <div class="column is-3">
            <div class="panel">
                <div class="panel-block">
                    <p class="control has-icons-left">
                        <input class="input" type="text" placeholder="Search" />
                        <span class="icon is-left">
                            <i class="fas fa-search" />
                        </span>
                    </p>
                </div>

                <div v-if="loading" class="panel-block">
                    <div class="icon-text">
                        <span class="icon">
                            <i class="fas fa-spinner fa-pulse fa-2x" />
                        </span>
                        <span class="pl-2">Loading…</span>
                    </div>
                </div>
                <div v-if="!loading" class="panel-block">
                    <table class="table is-fullwidth is-hoverable">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Title</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="wikiPage in wikiPages">
                                <td>{{ wikiPage.id }}</td>
                                <td>{{ wikiPage.title }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <div class="column is-5 is-offset-2 has-text-centered">
            <h2 class="subtitle is-italic">No page selected</h2>

            <section class="section">
                <div class="panel is-info">
                    <p class="panel-heading">Search for content</p>
                    <div class="panel-block">
                        <p class="control has-icons-left">
                            <input class="input" type="text" placeholder="Search" />
                            <span class="icon is-left">
                                <i class="fas fa-search" />
                            </span>
                        </p>
                    </div>
                </div>
            </section>

            <section class="section">
                <div class="panel is-success">
                    <p class="panel-heading">Create a new wiki page</p>
                    <div class="panel-block is-justify-content-center">
                        <button class="button is-primary">Create new wiki page</button>
                    </div>
                </div>
            </section>
        </div>
    </div>
</template>

<script setup>
import axios from "@/axios.js";
import {ref} from 'vue';

const wikiPages = ref([]);
const loading = ref(true);

axios
    .get('/wiki-pages')
    .then(response => {
        loading.value = false;
        wikiPages.value = response.data;
    });
</script>
