<template>
    <ConfirmDialog
        v-if="clipboardDataDialog"
        color="success"
        title="Clipboard data with no filename"
        :dialogOpen="true"
        submitIcon="paste"
        submitTitle="Paste"
        :submitDisabled="clipboardDataDialog.selectedType === null || clipboardDataDialog.filename === ''"
        cancelIcon="xmark"
        cancelTitle="Cancel"
        @submit="processClipboardDataDialog"
        @cancel="clipboardDataDialog = null"
    >
        <fieldset>
            <div>
                You pasted data from the clipboard with no filename.<br />
                Please select what data to upload, and what filename to use.
            </div>
            <div class="my-3">
                <div v-for="(item, index) in clipboardDataDialog.items" :key="item.type" class="form-check">
                    <input
                        v-model="clipboardDataDialog.selectedType"
                        class="form-check-input"
                        type="radio"
                        :id="`radioType${index}`"
                        :value="item.type"
                    >
                    <label class="form-check-label" :for="`radioType${index}`">
                        <code>{{ item.type }}</code>
                    </label>
                </div>
            </div>
            <div class="row">
                <label for="filename" class="col-sm-2 col-form-label">Filename</label>
                <div class="col-sm-10">
                    <input v-model="clipboardDataDialog.filename" class="form-control" id="filename" type="text" />
                </div>
            </div>
        </fieldset>
    </ConfirmDialog>

    <h2 class="fs-3 mb-4">Upload or paste an attachment</h2>

    <fieldset :disabled="uploading" class="row g-3">
        <div class="col-12 col-sm-6">
            <label class="form-label">Select file to upload…</label>
            <input class="form-control" type="file" name="file" @change="onFileChange" />
            <div v-if="feedbackMessage === FeedbackMessage.SelectedFile" class="form-text text-success">
                <i class="fas fa-check" /> File selected for upload.
            </div>
        </div>

        <div class="col-12 col-sm-6">
            <label class="form-label">… or paste here</label><br />
            <input class="form-control" type="text" readonly @paste="onPaste" />
            <div v-if="feedbackMessage === FeedbackMessage.PastedFile" class="form-text text-success">
                <i class="fas fa-check" /> File pasted from clipboard.
            </div>
            <div v-if="feedbackMessage === FeedbackMessage.PastedData" class="form-text text-success">
                <i class="fas fa-check" /> Data pasted from clipboard.
            </div>
            <div v-if="feedbackMessage === FeedbackMessage.PastedUnsupported" class="form-text text-danger">
                <i class="fas fa-xmark" /> No supported data inside the clipboard.
            </div>
        </div>

        <div class="col-12 col-sm-6">
            <label class="form-label">Filename</label>
            <input class="form-control" type="text" v-model="model.filename" />
            <div class="form-text">
                <small>You can rename a file before upload by editing this field.</small>
            </div>
        </div>

        <div class="col-12 col-sm-6">
            <label class="form-label">Last modified time</label>
            <input class="form-control" type="text" :value="model.lastModifiedTime || '– no timestamp –'" disabled />
            <div class="form-text">
                <small>Time is in UTC. Timezones are not supported (yet).</small>
            </div>
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
            <BaseButton
                icon="check"
                title="Upload"
                color="primary"
                :disabled="model.file === null"
                :loading="uploading"
                @click="$emit('submit')"
            />
            <BaseButton
                icon="xmark"
                title="Cancel"
                color="light"
                @click="$emit('cancel')"
            />
        </div>
    </fieldset>
</template>

<script>
const FeedbackMessage = {
    SelectedFile: Symbol('SelectedFile'),
    PastedFile: Symbol('PastedFile'),
    PastedData: Symbol('PastedData'),
    PastedUnsupported: Symbol('PastedUnsupported')
};
</script>

<script setup>
import {ref} from "vue";
import BaseButton from "@/components/BaseButton.vue";
import ConfirmDialog from "@/components/ConfirmDialog.vue";

const model = defineModel();

defineProps({
    uploading: {
        type: Boolean,
        default: false
    }
});

defineEmits(['submit', 'cancel']);

const feedbackMessage = ref(null);
const clipboardDataDialog = ref(null);

function onFileChange(e) {
    if (e.target.files.length > 0) {
        const file = e.target.files[0];

        model.value.file = file;
        model.value.filename = file.name;
        model.value.lastModifiedTime = formatDateAsUTCWithoutTimezone(new Date(file.lastModified));
        feedbackMessage.value = FeedbackMessage.SelectedFile;
    }
}

async function onPaste(e) {
    const clipboardData = e.clipboardData;

    // Check for files in clipboard
    if (clipboardData.files.length > 0) {
        const file = clipboardData.files.item(0);

        model.value.file = file;
        model.value.filename = file.name;
        model.value.lastModifiedTime = formatDateAsUTCWithoutTimezone(new Date(file.lastModified));
        feedbackMessage.value = FeedbackMessage.PastedFile;
        return;
    }

    // Check if any data is supported
    // (It can be the case, there is data from a special application the browser does not recognizes)
    if (clipboardData.items.length === 0) {
        model.value.file = null;
        model.value.filename = '';
        model.value.lastModifiedTime = null;
        feedbackMessage.value = FeedbackMessage.PastedUnsupported;
        return;
    }

    // Data in clipboard
    const items = [];
    for (let i = 0; i < clipboardData.items.length; i++) {
        items.push({
            type: clipboardData.items[i].type,
            textPromise: getAsStringPromise(clipboardData.items[i])
        });
    }

    // Await of promises
    // (we can't do this inside the loop directly, this would somehow change the clipboardData)
    for (const item of items) {
        item.text = await item.textPromise;
    }

    // Open dialog
    clipboardDataDialog.value = {
        items,
        selectedType: null,
        filename: ''
    };
}

/**
 * Promise-wrapper for `DataTransferItem.getAsString()`.
 *
 * @param {DataTransferItem} item
 * @returns {Promise<string>}
 */
function getAsStringPromise(item) {
    return new Promise(resolve => {
        item.getAsString(stringData => {
            resolve(stringData);
        });
    });
}

/**
 * Formats a `Date` object to a string we can use in the API.
 *
 * The API does not support timezones. We send UTC time, that makes it consistent.
 *
 * @param {Date} date date to convert
 * @returns {String} string formatted "yyyy-mm-ddThh:mm:ss" (so, without a trailing 'Z').
 */
function formatDateAsUTCWithoutTimezone(date) {
    return date.toISOString().replace(/Z$/, '');
}

function processClipboardDataDialog() {
    const stringData = clipboardDataDialog.value.items
        .find(it => it.type === clipboardDataDialog.value.selectedType)
        .text;

    const file = new File(
        [stringData],
        clipboardDataDialog.value.filename,
        { type: clipboardDataDialog.value.selectedType }
    );

    model.value.file = file;
    model.value.filename = file.name;
    model.value.lastModifiedTime = null;
    feedbackMessage.value = FeedbackMessage.PastedData;

    clipboardDataDialog.value = null;
}
</script>
