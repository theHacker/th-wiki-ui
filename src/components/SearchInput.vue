<template>
    <div class="input-group">
        <span class="input-group-text">
            <i class="fas fa-search" />
        </span>
        <input v-model="text" class="form-control" type="text" placeholder="Search" />
        <button
            type="button"
            class="btn btn-danger"
            :class="{ disabled: text === ''}"
            @click="text = ''"
        >
            <i class="fas fa-xmark" />
        </button>
    </div>
</template>

<script setup>
const text = defineModel({default: ''});
</script>
