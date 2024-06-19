<template>
    <div>
        <ErrorMessage v-if="error">{{ error }}</ErrorMessage>

        <fieldset :disabled="saving">
            <div class="field">
                <label class="label">Title</label>
                <div class="control">
                    <input
                        v-model="entry.title"
                        class="input"
                        :class="{'is-danger': !!fieldErrors.title}"
                        type="text"
                        placeholder="Title"
                    />
                </div>
                <p v-if="fieldErrors.title" class="help is-danger">{{ fieldErrors.title }}</p>
            </div>

            <div class="field">
                <label class="label">Parent</label>
                <div class="control">
                    <WikiPagesSelect
                        v-model="entry.parentId"
                        :error="!!fieldErrors.parentId"
                    />
                </div>
                <p v-if="fieldErrors.parentId" class="help is-danger">{{ fieldErrors.parentId }}</p>
            </div>

            <div class="field">
                <label class="label">Content</label>
                <div class="control">
                    <textarea
                        v-model="entry.content"
                        class="textarea"
                        :class="{'is-danger': !!fieldErrors.content}"
                        rows="15"
                        placeholder="Content"
                    />
                </div>
                <p v-if="fieldErrors.content" class="help is-danger">{{ fieldErrors.content }}</p>
                <p class="help">Content will be parsed as Markdown.</p>
            </div>

            <div class="field is-grouped">
                <div class="control">
                    <Button icon="check" :title="submitLabel" color="link" :loading="saving" @click="$emit('submit')" />
                </div>
                <div class="control">
                    <Button icon="xmark" title="Cancel" color="link" :light="true" @click="$emit('cancel')" />
                </div>
            </div>
        </fieldset>
    </div>
</template>

<script setup>
import Button from "@/components/Button.vue";
import ErrorMessage from "@/components/ErrorMessage.vue";
import WikiPagesSelect from "@/components/WikiPagesSelect.vue";

const entry = defineModel();

defineProps({
    submitLabel: {
        type: String,
        required: true
    },
    saving: {
        type: Boolean,
        default: false
    },
    error: {
        type: String,
        default: null
    },
    fieldErrors: {
        type: Array,
        default: []
    }
})

defineEmits(['submit', 'cancel']);
</script>
