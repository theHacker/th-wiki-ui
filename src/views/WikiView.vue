<template>
    <h1 class="title">Wiki pages</h1>

    <div class="columns">
        <div class="column is-3">
            <WikiPagesTree />
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
                        <Button
                            title="Create new wiki page"
                            color="primary"
                            @click="$router.push({name: 'wikiPageNew'})"
                        />
                    </div>
                </div>
            </section>
        </div>
    </div>
</template>

<script setup>
import WikiPagesTree from "@/components/WikiPagesTree.vue";
import Button from "@/components/Button.vue";
</script>
