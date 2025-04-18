<template>
    <ConfirmDialog
        :dialogOpen="dialogOpen"
        title="Really delete?"
        color="danger"
        :progressing="deleting"
        submitIcon="trash"
        submitTitle="Delete"
        cancelIcon="xmark"
        cancelTitle="Cancel"
        @submit="$emit('submit')"
        @cancel="$emit('cancel')"
    >
        <slot />
    </ConfirmDialog>
</template>

<script setup>
import ConfirmDialog from "@/components/ConfirmDialog.vue";

defineProps({
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
