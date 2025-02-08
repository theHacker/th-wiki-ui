<template>
    <h2 class="fs-5 mb-4">Upload an attachment</h2>

    <fieldset :disabled="uploading" class="row g-3">
        <div class="col-12">
            <label class="form-label">File to upload</label>
            <input class="form-control" type="file" name="file" @change="onFileChange" />
        </div>

        <div class="col-12">
            <label class="form-label">Description</label>
            <textarea
                v-model="model.description"
                class="form-control"
                rows="4"
                placeholder="Optional description or comment"
            />
        </div>

        <div class="hstack gap-2">
            <Button
                icon="check"
                title="Upload"
                color="primary"
                :disabled="model.file === null"
                :loading="uploading"
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
</template>

<script setup>
import Button from "@/components/Button.vue";

const model = defineModel();

defineProps({
    uploading: {
        type: Boolean,
        default: false
    }
});

defineEmits(['submit', 'cancel']);

function onFileChange(e) {
    if (e.target.files.length > 0) {
        model.value.file = e.target.files[0];
    }
}
</script>
