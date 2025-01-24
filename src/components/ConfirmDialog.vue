<template>
    <div
        class="modal"
        :class="{show: dialogOpen}"
        :style="dialogOpen ? 'display: block;' : ''"
    >
        <div :class="modalClass">
            <div class="modal-content">
                <div class="modal-header" :class="{[`text-bg-${color}`]: true}">
                    <h1 class="modal-title fs-5">{{ title }}</h1>
                </div>
                <div class="modal-body">
                    <div><slot /></div>
                </div>
                <div class="modal-footer">
                    <fieldset :disabled="progressing">
                        <div class="hstack gap-2">
                            <Button
                                :icon="submitIcon"
                                :title="submitTitle"
                                :color="color"
                                :disabled="submitDisabled"
                                :loading="progressing"
                                @click="$emit('submit')"
                            />
                            <Button
                                :icon="cancelIcon"
                                :title="cancelTitle"
                                color="light"
                                :disabled="cancelDisabled"
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
import {computed} from "vue";

const props = defineProps({
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

const modalClass = computed(() => {
    const classes = {};

    classes['modal-dialog'] = true;
    classes['modal-dialog-centered'] = true;

    switch (props.size) {
        case 'small':
            classes['modal-sm'] = true;
            break;
        case 'large':
            classes['modal-lg'] = true;
            break;
        case 'extra-large':
            classes['modal-xl'] = true;
            break;
        case 'normal':
        default:
            // no additional class
            break;
    }

    return classes;
});
</script>
