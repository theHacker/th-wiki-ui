<template>
    <div class="modal" :class="{'is-active': dialogOpen}">
        <div class="modal-background" />
        <div class="modal-content">
            <article class="panel is-danger">
                <p class="panel-heading">Really delete?</p>
                <div class="panel-block">
                    <p>{{ text }}</p>
                </div>
                <div class="panel-block">
                    <fieldset :disabled="deleting">
                        <div class="buttons">
                            <Button
                                icon="trash"
                                title="Delete"
                                color="danger"
                                :loading="deleting"
                                @click="$emit('submit')"
                            />
                            <Button
                                icon="xmark"
                                title="Cancel"
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

<style lang="scss" scoped>
.modal-content, .modal-card {
    overflow: unset; // fix Bulma cutting the box-shadow by "overflow: auto"
}
</style>
