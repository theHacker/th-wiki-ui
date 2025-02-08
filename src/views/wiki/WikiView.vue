<template>
    <GridLayout>
        <template #sidebar>
            <WikiPagesTree />
        </template>

        <template #default>
            <div class="col-12 col-lg-8 offset-lg-2 text-center">
                <h2 class="fs-5 fst-italic">No page selected</h2>

                <div class="card m-5">
                    <div class="card-header text-bg-info">Search for content</div>
                    <div class="card-body">
                        <SearchInput />
                    </div>
                </div>

                <div class="card m-5">
                    <div class="card-header text-bg-success">Create a new wiki page</div>
                    <div class="card-body">
                        <Button
                            icon="plus"
                            title="Create new wiki page"
                            color="primary"
                            @click="$router.push({name: 'wikiPageNew'})"
                        />
                    </div>
                </div>
            </div>
        </template>
    </GridLayout>
</template>

<script setup>
import WikiPagesTree from "@/components/wiki/WikiPagesTree.vue";
import Button from "@/components/Button.vue";
import SearchInput from "@/components/SearchInput.vue";
import GridLayout from "@/components/layout/GridLayout.vue";
</script>
