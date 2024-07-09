<template>
    <ConfirmDialog
        :dialogOpen="dialogOpen"
        title="Really delete?"
        :text="text"
        color="danger"
        :progressing="deleting"
        submitIcon="trash"
        submitTitle="Delete"
        cancelIcon="xmark"
        cancelTitle="Cancel"
        @submit="$emit('submit')"
        @cancel="$emit('cancel')"
    />
</template>

<script setup>
import ConfirmDialog from "@/components/ConfirmDialog.vue";

defineProps({
    text: {
        type: String,
        required: true
    },
    dialogOpen: {
        type: Boolean,
        default: false
    },
    deleting: {
        type: Boolean,
        default: false
    }
});

defineEmits(['submit', 'cancel']);
</script>
