<template>
    <div class="position-relative">
        <label class="form-label">{{ label }}</label>
        <div class="position-absolute top-0 end-0 hstack gap-1">
            <Button
                icon="code"
                tooltip="Switch to monospace font"
                size="small"
                fixedWidth
                :active="monospaceFont"
                @click="monospaceFont = !monospaceFont"
            />
            <Button
                icon="newspaper"
                tooltip="Show preview"
                size="small"
                fixedWidth
                :active="showPreview"
                @click="showPreview = !showPreview"
            />
        </div>
        <textarea
            v-model="model"
            class="form-control"
            :class="{'is-invalid': !!errorMessage, 'font-monospace': monospaceFont}"
            rows="15"
            :placeholder="placeholder"
        />
        <div v-if="errorMessage" class="invalid-feedback">{{ errorMessage }}</div>
        <div class="form-text">Content will be parsed as Markdown.</div>

        <div v-if="showPreview" class="card mt-3">
            <div class="card-header text-bg-info">
                <i class="fas fa-newspaper pe-1" />
                Preview
            </div>
            <div class="card-body">
                <article v-html="preview" />
            </div>
        </div>
    </div>
</template>

<script setup>
import {computed, ref} from "vue";
import Button from "@/components/Button.vue";
import {renderMarkdown} from "@/markdown.js";

const model = defineModel();

defineProps({
    label: {
        type: String,
        required: true
    },
    placeholder: {
        type: String,
        required: false
    },
    errorMessage: {
        type: String,
        required: false
    }
});

const monospaceFont = ref(false);

const showPreview = ref(false);
const preview = computed(() => {
    if (showPreview.value) {
        return renderMarkdown(model.value);
    } else {
        return null; // don't render on every change when preview is not visible
    }
});
</script>
