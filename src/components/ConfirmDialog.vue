<template>
    <div class="modal" :class="{'is-active': dialogOpen}">
        <div class="modal-background" />
        <div class="modal-content">
            <article class="panel" :class="{[`is-${color}`]: true}">
                <p class="panel-heading">{{ title }}</p>
                <div class="panel-block">
                    <p>{{ text }}</p>
                </div>
                <div class="panel-block">
                    <fieldset :disabled="progressing">
                        <div class="buttons">
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
            </article>
        </div>
    </div>
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
            // see https://bulma.io/documentation/elements/button/#colors
            return [
                'white', 'light', 'dark', 'black', 'text', 'ghost',
                'primary', 'link',
                'info', 'success', 'warning', 'danger'
            ].includes(value);
        },
        default: 'warning'
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

<style lang="scss" scoped>
.modal-content, .modal-card {
    overflow: unset; // fix Bulma cutting the box-shadow by "overflow: auto"
}
</style>
