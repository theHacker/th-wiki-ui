<template>
    <fieldset
        :disabled="saving"
        class="row g-3"
        :class="{'was-validated': fieldErrors.length > 0}"
    >
        <div class="col-12">
            <label class="form-label">Title</label>
            <input
                v-model="entry.title"
                class="form-control"
                :class="{'is-invalid': !!fieldErrors.title}"
                type="text"
                placeholder="Title"
            />
            <div v-if="fieldErrors.title" class="invalid-feedback">{{ fieldErrors.title }}</div>
        </div>

        <div class="col-12 col-lg-6">
            <label class="form-label">Parent</label>
            <ParentSelect
                v-model="entry.parentId"
                type="task"
                :errorMessage="fieldErrors.parentId"
            />
        </div>

        <div class="col-12 col-lg-6">
            <label class="form-label">Due date</label>
            <input
                v-model="entry.dueDate"
                class="form-control"
                :class="{'is-invalid': !!fieldErrors.dueDate}"
                type="text"
                placeholder="Due date"
            />
            <div v-if="fieldErrors.dueDate" class="invalid-feedback">{{ fieldErrors.dueDate }}</div>
        </div>

        <div class="col-12 col-lg-6">
            <label class="form-label">Done</label>
            <div class="form-check">
                <input
                    v-model="entry.done"
                    id="checkboxDone"
                    class="form-check-input"
                    :class="{'is-invalid': !!fieldErrors.done}"
                    type="checkbox"
                    @change="onDoneChanged"
                />
                <label class="form-check-label" for="checkboxDone">
                    Task is done
                </label>
                <div v-if="fieldErrors.done" class="invalid-feedback">{{ fieldErrors.done }}</div>
            </div>
        </div>

        <div class="col-12 col-lg-6">
            <label class="form-label">Progress</label>
            <div
                class="input-group w-50"
                :class="{'has-validation': fieldErrors.progress}"
            >
                <input
                    v-model.number="entry.progress"
                    class="form-control"
                    :class="{'is-invalid': !!fieldErrors.progress}"
                    type="text"
                    placeholder="Progress"
                    @change="onProgressChanged"
                />
                <span class="input-group-text">%</span>
                <div v-if="fieldErrors.progress" class="invalid-feedback">{{ fieldErrors.progress }}</div>
            </div>
        </div>

        <div class="col-12">
            <label class="form-label">Content</label>
            <textarea
                v-model="entry.content"
                class="form-control"
                :class="{'is-invalid': !!fieldErrors.content}"
                rows="15"
                placeholder="Content"
            />
            <div v-if="fieldErrors.content" class="invalid-feedback">{{ fieldErrors.content }}</div>
            <div class="form-text">Content will be parsed as Markdown.</div>
        </div>

        <div class="hstack gap-2">
            <Button
                icon="check"
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
});

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

function onDoneChanged() {
    if (entry.value.done && entry.value.progress < 100) {
        entry.value.progress = 100;
    }
    else if (!entry.value.done && entry.value.progress >= 100) {
        entry.value.progress = 0;
    }
}

function onProgressChanged() {
    if (entry.value.progress >= 100 && !entry.value.done) {
        entry.value.done = true;
    }
    else if (entry.value.progress < 100 && entry.value.done) {
        entry.value.done = false;
    }
}
</script>
