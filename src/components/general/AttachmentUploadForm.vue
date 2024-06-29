<template>
    <h2 class="is-size-5 mb-4">Upload an attachment</h2>

    <fieldset :disabled="uploading">
        <div class="field">
            <div class="file has-name is-fullwidth">
                <label class="file-label">
                    <input class="file-input" type="file" name="file" @change="onFileChange" />
                    <span class="file-cta">
                        <span class="file-icon">
                            <i class="fas fa-upload" />
                        </span>
                        <span class="file-label">Select a file to upload…</span>
                    </span>
                    <span class="file-name">
                        <i v-if="model.file === null">(no file selected)</i>
                        <span v-else>{{ model.file.name }}</span>
                    </span>
                </label>
            </div>
        </div>

        <div class="field">
            <label class="label">Description</label>
            <div class="control">
                <textarea
                    v-model="model.description"
                    class="textarea"
                    rows="4"
                    placeholder="Optional description or comment"
                />
            </div>
        </div>

        <div class="field is-grouped">
            <div class="control">
                <Button
                    icon="check"
                    title="Upload"
                    color="link"
                    :disabled="model.file === null"
                    :loading="uploading"
                    @click="$emit('submit')"
                />
            </div>
            <div class="control">
                <Button
                    icon="xmark"
                    title="Cancel"
                    color="link"
                    :light="true"
                    @click="$emit('cancel')"
                />
            </div>
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
