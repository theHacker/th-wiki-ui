<template>
    <div class="position-relative">
        <label class="form-label">{{ label }}</label>
        <Button
            class="position-absolute top-0 end-0"
            icon="code"
            tooltip="Switch to monospace font"
            size="small"
            :active="monospaceFont"
            @click="monospaceFont = !monospaceFont"
        />
        <textarea
            v-model="model"
            class="form-control"
            :class="{'is-invalid': !!errorMessage, 'font-monospace': monospaceFont}"
            rows="15"
            :placeholder="placeholder"
        />
        <div v-if="errorMessage" class="invalid-feedback">{{ errorMessage }}</div>
        <div class="form-text">Content will be parsed as Markdown.</div>
    </div>
</template>

<script setup>
import {ref} from "vue";
import Button from "@/components/Button.vue";

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
</script>
