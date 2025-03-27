<template>
    <fieldset
        :disabled="saving"
        class="row g-3"
        :class="{'was-validated': fieldErrors.length > 0}"
    >
        <div class="col-12">
            <label class="form-label">Title</label>
            <input
                v-model="wikiPage.title"
                class="form-control"
                :class="{'is-invalid': !!fieldErrors.title}"
                type="text"
                placeholder="Title"
            />
            <div v-if="fieldErrors.title" class="invalid-feedback">{{ fieldErrors.title }}</div>
        </div>

        <div class="col-12 col-lg-auto">
            <label class="form-label">Parent</label>
            <ParentSelect
                v-model="wikiPage.parentId"
                type="wiki"
                :errorMessage="fieldErrors.parentId"
            />
        </div>

        <div class="col-12">
            <MarkdownTextarea
                v-model="wikiPage.content"
                label="Content"
                placeholder="Content"
                :errorMessage="fieldErrors.content"
            />
        </div>

        <div class="hstack gap-2">
            <Button
                :icon="ctrlDown ? 'floppy-disk' : 'check'"
                :title="ctrlDown ? submitCtrlLabel : submitLabel"
                color="primary"
                :loading="saving"
                @click="$emit('submit', ctrlDown)"
            />
            <Button icon="xmark" title="Cancel" color="light" @click="$emit('cancel')" />
        </div>
    </fieldset>
</template>

<script setup>
import Button from "@/components/Button.vue";
import ParentSelect from "@/components/general/ParentSelect.vue";
import MarkdownTextarea from "@/components/general/MarkdownTextarea.vue";
import {onMounted, onUnmounted, ref} from "vue";

const ctrlDown = ref(false);

const wikiPage = defineModel();

const props = defineProps({
    submitLabel: {
        type: String,
        required: true
    },
    submitCtrlLabel: {
        type: String,
        required: false
    },
    saving: {
        type: Boolean,
        default: false
    },
    fieldErrors: {
        type: Object,
        default: {}
    }
})

defineEmits(['submit', 'cancel']);

if (props.submitCtrlLabel) {
    function onKeyEvent(e) {
        if (e.key === 'Control') {
            if (e.type === 'keydown') {
                ctrlDown.value = true;
            } else if (e.type === 'keyup') {
                ctrlDown.value = false;
            }
        }
    }

    onMounted(() => {
        window.addEventListener('keydown', onKeyEvent);
        window.addEventListener('keyup', onKeyEvent);
    });

    onUnmounted(() => {
        window.removeEventListener('keydown', onKeyEvent);
        window.removeEventListener('keyup', onKeyEvent);
    });
}
</script>
