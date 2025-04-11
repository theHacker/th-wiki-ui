<template>
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
                <BaseButton
                    icon="plus"
                    title="Create new wiki page"
                    color="primary"
                    @click="$router.push({name: 'wikiPageNew'})"
                />
            </div>
        </div>
    </div>
</template>

<script setup>
import BaseButton from "@/components/BaseButton.vue";
import SearchInput from "@/components/SearchInput.vue";
</script>
