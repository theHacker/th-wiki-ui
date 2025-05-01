<template>
    <BaseDialog
        :dialogOpen="dialogOpen"
        :color="color"
        :title="title"
        :size="size"
    >
        <template #default>
            <slot />
        </template>

        <template #footer>
            <fieldset :disabled="progressing">
                <div class="hstack gap-2">
                    <BaseButton
                        :icon="submitIcon"
                        :title="submitTitle"
                        :color="color"
                        :disabled="submitDisabled"
                        :loading="progressing"
                        @click="$emit('submit')"
                    />
                    <BaseButton
                        :icon="cancelIcon"
                        :title="cancelTitle"
                        color="light"
                        :disabled="cancelDisabled"
                        @click="$emit('cancel')"
                    />
                </div>
            </fieldset>
        </template>
    </BaseDialog>
</template>

<script setup>
import BaseButton from "@/components/BaseButton.vue";
import BaseDialog from "@/components/BaseDialog.vue";

defineProps({
    dialogOpen: {
        type: Boolean,
        default: false
    },
    color: {
        type: String,
        validator(value, _props) {
            // see https://getbootstrap.com/docs/5.3/components/buttons/#variants
            return [
                'primary', 'secondary',
                'success', 'danger', 'warning', 'info',
                'light', 'dark', 'link'
            ].includes(value);
        },
        default: null
    },
    title: {
        type: String,
        required: true
    },
    size: {
        validator(value, _props) {
            // see https://getbootstrap.com/docs/5.3/components/modal/#optional-sizes
            return ['small', 'normal', 'large', 'extra-large', ''].includes(value);
        },
        default: 'normal'
    },
    progressing: {
        type: Boolean,
        default: false
    },
    submitIcon: {
        type: String,
        default: 'check'
    },
    submitTitle: {
        type: String,
        default: 'Yes'
    },
    submitDisabled: {
        type: Boolean,
        default: false
    },
    cancelIcon: {
        type: String,
        default: 'xmark'
    },
    cancelTitle: {
        type: String,
        default: 'No'
    },
    cancelDisabled: {
        type: Boolean,
        default: false
    }
});

defineEmits(['submit', 'cancel']);
</script>
