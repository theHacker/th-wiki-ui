<template>
    <ConfirmDialog
        :dialogOpen="dialogOpen"
        title="Manage tags"
        color="success"
        size="large"
        :progressing="saving"
        submitIcon="check"
        submitTitle="Save"
        :submitDisabled="saving"
        cancelIcon="xmark"
        cancelTitle="Cancel"
        :cancelDisabled="saving"
        @submit="$emit('submit')"
        @cancel="$emit('cancel')"
    >
        <h5 class="mb-1">
            Assigned tags
        </h5>
        <div class="ps-0 ps-md-4">
            <div><small>Global tags</small></div>
            <div class="ps-0 ps-md-4 hstack gap-2 flex-wrap">
                <TagBadge
                    v-for="tag in assignedGlobalTags"
                    :key="tag.id"
                    class="cursor-pointer user-select-none"
                    :scope="tag.scope"
                    :scopeIcon="tag.scopeIcon"
                    :scopeColor="tag.scopeColor"
                    :title="tag.title"
                    :titleIcon="tag.titleIcon"
                    :titleColor="tag.titleColor"
                    :tooltip="tag.description"
                    @click="unassignTag(tag)"
                />
                <i v-if="assignedGlobalTags.length === 0">– none –</i>
            </div>
        </div>

        <h5 class="mt-4 mb-1">
            Available tags
        </h5>
        <div class="ps-0 ps-md-4">
            <div><small>Global tags</small></div>
            <div class="ps-0 ps-md-4 hstack gap-2 flex-wrap">
                <TagBadge
                    v-for="tag in assignableGlobalTags"
                    :key="tag.id"
                    class="cursor-pointer user-select-none"
                    :scope="tag.scope"
                    :scopeIcon="tag.scopeIcon"
                    :scopeColor="tag.scopeColor"
                    :title="tag.title"
                    :titleIcon="tag.titleIcon"
                    :titleColor="tag.titleColor"
                    :tooltip="tag.description"
                    @click="assignTag(tag)"
                />
                <i v-if="assignableGlobalTags.length === 0">– none –</i>
            </div>
        </div>
    </ConfirmDialog>
</template>

<script setup>
import {computed} from "vue";
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import TagBadge from "@/components/TagBadge.vue";

const assignedTagIds = defineModel();

const props = defineProps({
    dialogOpen: {
        type: Boolean,
        default: false
    },
    globalTags: {
        type: Array,
        default() {
            return [];
        }
    },
    saving: {
        type: Boolean,
        default: false
    },
});

defineEmits(['submit', 'cancel']);

const assignedGlobalTags = computed(() => {
    return props.globalTags.filter(tag => assignedTagIds.value.includes(tag.id));
});
const assignableGlobalTags = computed(() => {
    return props.globalTags.filter(tag => !assignedTagIds.value.includes(tag.id));
});

function assignTag(tag) {
    if (props.saving) return;

    assignedTagIds.value.push(tag.id);
}

function unassignTag(tag) {
    if (props.saving) return;

    assignedTagIds.value = assignedTagIds.value.filter(it => it !== tag.id);
}
</script>
