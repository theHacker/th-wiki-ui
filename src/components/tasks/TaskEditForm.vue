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

            <div class="columns">
                <div class="column is-6">
                    <div class="field">
                        <label class="label">Parent</label>
                        <div class="control">
                            <ParentSelect
                                v-model="entry.parentId"
                                type="task"
                                :error="!!fieldErrors.parentId"
                            />
                        </div>
                        <p v-if="fieldErrors.parentId" class="help is-danger">{{ fieldErrors.parentId }}</p>
                    </div>
                </div>

                <div class="column is-6">
                    <div class="field">
                        <label class="label">Due date</label>
                        <div class="control">
                            <input
                                v-model="entry.dueDate"
                                class="input"
                                :class="{'is-danger': !!fieldErrors.dueDate}"
                                type="text"
                                placeholder="Due date"
                            />
                        </div>
                        <p v-if="fieldErrors.dueDate" class="help is-danger">{{ fieldErrors.dueDate }}</p>
                    </div>
                </div>
            </div>

            <div class="columns">
                <div class="column is-6">
                    <div class="field">
                        <label class="label">Done</label>
                        <p class="control">
                            <label class="checkbox">
                                <input
                                    v-model="entry.done"
                                    :class="{'is-danger': !!fieldErrors.done}"
                                    type="checkbox"
                                />
                                Task is done
                            </label>
                        </p>
                        <p v-if="fieldErrors.done" class="help is-danger">{{ fieldErrors.done }}</p>
                    </div>
                </div>

                <div class="column is-6">
                    <label class="label">Progress</label>
                    <div class="field has-addons">
                        <div class="control">
                            <input
                                v-model="entry.progress"
                                class="input"
                                :class="{'is-danger': !!fieldErrors.progress}"
                                type="text"
                                placeholder="Progress"
                            />
                        </div>
                        <p class="control">
                            <a class="button is-static">%</a>
                        </p>
                    </div>
                    <p v-if="fieldErrors.progress" class="help is-danger">{{ fieldErrors.progress }}</p>
                </div>
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
                        icon="check"
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
    /*fieldErrors: {
        type: Object,
        default: {}
    }*/
})

// TODO prop
const fieldErrors = {
    title: 'Everything is just wrong here… just for testing.',
    parentId: 'Everything is just wrong here… just for testing.',
    done: 'Everything is just wrong here… just for testing.',
    progress: 'Everything is just wrong here… just for testing.',
    content: 'Everything is just wrong here… just for testing.',
    dueDate: 'Everything is just wrong here… just for testing.'
}

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

<style lang="scss" scoped>
// Adjust spaces when Bulma's columns feature is mixed into forms feature.
fieldset .columns {
    margin-bottom: 0;

    .column:last-child {
        padding-right: 0;
    }

    .field.has-addons {
        margin-bottom: 0;
    }
}
</style>
