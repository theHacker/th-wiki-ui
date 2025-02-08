<template>
    <div
        class="modal"
        :class="{show: dialogOpen}"
        :style="dialogOpen ? 'display: block;' : ''"
    >
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header" :class="{[`text-bg-${color}`]: true}">
                    <h1 class="modal-title fs-5">{{ title }}</h1>
                </div>
                <div class="modal-body">
                    <div>{{ text }}</div>
                </div>
                <div class="modal-footer">
                    <fieldset :disabled="progressing">
                        <div class="hstack gap-2">
                            <Button
                                :icon="submitIcon"
                                :title="submitTitle"
                                :color="color"
                                :loading="progressing"
                                @click="$emit('submit')"
                            />
                            <Button
                                :icon="cancelIcon"
                                :title="cancelTitle"
                                color="light"
                                @click="$emit('cancel')"
                            />
                        </div>
                    </fieldset>
                </div>
            </div>
        </div>
    </div>
    <Teleport to="body">
        <div v-if="dialogOpen" class="modal-backdrop fade" :class="{show: dialogOpen}" />
    </Teleport>
</template>

<script setup>
import Button from "@/components/Button.vue";

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
    text: {
        type: String,
        required: true
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
    cancelIcon: {
        type: String,
        default: 'xmark'
    },
    cancelTitle: {
        type: String,
        default: 'No'
    }
});

defineEmits(['submit', 'cancel']);
</script>
