<template>
    <div>
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
                    <ParentSelect
                        v-model="entry.parentId"
                        type="wiki"
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
                    <Button
                        :icon="ctrlDown ? 'floppy-disk' : 'check'"
                        :title="ctrlDown ? submitCtrlLabel : submitLabel"
                        color="link"
                        :loading="saving"
                        @click="$emit('submit', ctrlDown)"
                    />
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
import ParentSelect from "@/components/general/ParentSelect.vue";
import {onMounted, onUnmounted, ref} from "vue";

const ctrlDown = ref(false);

const entry = defineModel();

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
