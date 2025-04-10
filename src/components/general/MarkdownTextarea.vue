<template>
    <div class="position-relative">
        <label class="form-label">{{ label }}</label>
        <div class="position-absolute top-0 end-0 hstack gap-1">
            <div class="btn-group">
                <BaseButton
                    icon="file-lines"
                    tooltip="Text view (regular font)"
                    size="small"
                    fixedWidth
                    :active="buttonState === ButtonStates.Text"
                    @click="buttonState = ButtonStates.Text"
                />
                <BaseButton
                    icon="code"
                    tooltip="Code view (monospace font)"
                    size="small"
                    fixedWidth
                    :active="buttonState === ButtonStates.Code"
                    @click="buttonState = ButtonStates.Code"
                />
                <BaseButton
                    icon="newspaper"
                    tooltip="Preview view"
                    size="small"
                    fixedWidth
                    :active="buttonState === ButtonStates.Preview"
                    @click="buttonState = ButtonStates.Preview"
                />
            </div>
        </div>

        <textarea
            v-model="model"
            v-show="buttonState !== ButtonStates.Preview"
            class="form-control"
            :class="{'is-invalid': !!errorMessage, 'font-monospace': buttonState === ButtonStates.Code}"
            rows="15"
            :placeholder="placeholder"
        />

        <div v-if="buttonState === ButtonStates.Preview" class="card">
            <div class="card-header text-bg-info">
                <i class="fas fa-newspaper pe-1" />
                Preview
            </div>
            <div class="card-body">
                <article class="overflow-scroll" style="max-height: 300px;" v-html="preview" />
            </div>
        </div>

        <div v-if="errorMessage" class="invalid-feedback">{{ errorMessage }}</div>
        <div v-show="buttonState !== ButtonStates.Preview" class="form-text">Content will be parsed as Markdown.</div>
    </div>
</template>

<script>
const ButtonStates = {
    Text: Symbol('Text'),
    Code: Symbol('Code'),
    Preview: Symbol('Preview')
};
</script>

<script setup>
import {ref} from "vue";
import {computedAsync} from "@vueuse/core";
import BaseButton from "@/components/BaseButton.vue";
import {renderMarkdown} from "@/markdown";

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

const buttonState = ref(ButtonStates.Text);

const preview = computedAsync(async () => {
    if (buttonState.value === ButtonStates.Preview) {
        return await renderMarkdown(model.value);
    } else {
        return null; // don't render on every change when preview is not visible
    }
});
</script>
