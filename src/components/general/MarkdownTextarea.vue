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
                    :active="buttonState === ButtonStates.TEXT"
                    @click="buttonState = ButtonStates.TEXT"
                />
                <BaseButton
                    icon="code"
                    tooltip="Code view (monospace font)"
                    size="small"
                    fixedWidth
                    :active="buttonState === ButtonStates.CODE"
                    @click="buttonState = ButtonStates.CODE"
                />
                <BaseButton
                    icon="newspaper"
                    tooltip="Preview view"
                    size="small"
                    fixedWidth
                    :active="buttonState === ButtonStates.PREVIEW"
                    @click="buttonState = ButtonStates.PREVIEW"
                />
            </div>
        </div>

        <textarea
            v-model="model"
            v-show="buttonState !== ButtonStates.PREVIEW"
            class="form-control"
            :class="{'is-invalid': !!errorMessage, 'font-monospace': buttonState === ButtonStates.CODE}"
            rows="15"
            :placeholder="placeholder"
        />

        <div v-if="buttonState === ButtonStates.PREVIEW" class="card">
            <div class="card-header text-bg-info">
                <i class="fas fa-newspaper pe-1" />
                Preview
            </div>
            <div class="card-body">
                <article class="overflow-scroll" style="max-height: 300px;" v-html="preview" />
            </div>
        </div>

        <div v-if="errorMessage" class="invalid-feedback">{{ errorMessage }}</div>
        <div v-show="buttonState !== ButtonStates.PREVIEW" class="form-text">Content will be parsed as Markdown.</div>
    </div>
</template>

<script>
const ButtonStates = Object.freeze({
    TEXT: Symbol('TEXT'),
    CODE: Symbol('CODE'),
    PREVIEW: Symbol('PREVIEW')
});
</script>

<script setup>
import {ref} from "vue";
import {computedAsync} from "@vueuse/core";
import BaseButton from "@/components/BaseButton.vue";
import MarkdownRenderer from "@/markdown/rendering.js";
import axios from "@/axios.js";

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

const buttonState = ref(ButtonStates.TEXT);

const markdownRenderer = new MarkdownRenderer();
markdownRenderer.enableIssueLookupByAxios(axios);

const preview = computedAsync(async () => {
    if (buttonState.value === ButtonStates.PREVIEW) {
        return await markdownRenderer.renderPlain(model.value);
    } else {
        return null; // don't render on every change when preview is not visible
    }
});
</script>
