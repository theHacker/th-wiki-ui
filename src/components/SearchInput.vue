<template>
    <p class="control has-icons-left has-icons-right">
        <input v-model="text" class="input" type="text" placeholder="Search" />
        <span class="icon is-left">
            <i class="fas fa-search" />
        </span>
        <span
            v-if="text"
            class="icon is-small is-right is-clickable"
            @click="text = ''"
        >
            <i class="fas fa-xmark"></i>
        </span>
    </p>
</template>

<script setup>
import {defineModel} from 'vue';

const text = defineModel({default: ''});
</script>
