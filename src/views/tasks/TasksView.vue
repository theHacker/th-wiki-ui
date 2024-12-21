<template>
    <GridLayout>
        <div class="col-12 col-lg-8 offset-lg-2">
            <ErrorMessage v-if="error">{{ error }}</ErrorMessage>

            <div class="hstack gap-2 mb-4">
                <div class="hstack gap-2 me-4 me-lg-0">
                    <SearchInput v-model="search" />
                    <Button
                        class="btn-text-md"
                        :icon="hideDone ? 'eye-slash' : 'eye'"
                        :title="hideDone ? 'Show done' : 'Hide done'"
                        :color="hideDone ? 'success' : 'dark'"
                        @click="hideDone = !hideDone"
                    />
                </div>

                <Button
                    class="btn-text-sm ms-auto"
                    icon="plus"
                    title="New task"
                    color="primary"
                    @click="$router.push({name: 'tasksNew'})"
                />
            </div>

            <table class="table table-responsive table-sm table-hover align-middle">
                <thead>
                    <tr>
                        <th>Done</th>
                        <th>Title</th>
                        <th>Created</th>
                        <th>Due</th>
                        <th>Done</th>
                        <th>Commands</th>
                    </tr>
                </thead>
                <tbody class="table-group-divider">
                    <tr v-for="entry in filteredEntries" :key="entry.id" :class="{'text-danger': isOverdue(entry) }">
                        <td>
                            <input type="checkbox" class="form-check-input" disabled :checked="entry.done" />
                        </td>
                        <td
                            :style="{ paddingLeft: `${entry.level ? ((entry.level - 1) * 24) : 0}px` }"
                        >
                            <div class="d-flex">
                                <div
                                    class="flex-grow-1"
                                    :style="entry.done ? 'text-decoration: var(--bs-gray-600) 2px solid line-through' : ''"
                                >
                                    <RouterLink :to="{ name: 'task', params: { entryId: entry.id } }">
                                        {{ entry.title }}
                                    </RouterLink>
                                </div>
                                <div v-if="!entry.done && entry.progress > 0" class="d-inline-flex align-middle">
                                    <progress
                                        class="ms-2"
                                        :value="entry.progress"
                                        max="100"
                                    >{{ entry.progress }}%</progress>
                                </div>
                            </div>
                        </td>
                        <td>{{ new Date(entry.creationTime).toLocaleDateString() }}</td>
                        <td>
                            <span :class="{'fst-italic': !entry.dueDate, 'fw-semibold': isOverdue(entry) }">
                                {{ entry.dueDate ? new Date(entry.dueDate).toLocaleDateString() : 'no due date' }}
                            </span>
                        </td>
                        <td>
                            {{ entry.doneTime ? new Date(entry.doneTime).toLocaleDateString() : 'not done yet' }}
                        </td>
                        <td>
                            <div class="hstack gap-1">
                                <!-- TODO ordering requires a new field on the entry
                                <Button
                                    icon="arrow-up"
                                    tooltip="Move up"
                                    size="small"
                                    fixedWidth
                                    color="info"
                                    :disabled="!entry.canBeMovedUp"
                                />
                                <Button
                                    icon="arrow-down"
                                    tooltip="Move down"
                                    size="small"
                                    fixedWidth
                                    color="info"
                                    :disabled="!entry.canBeMovedDown"
                                />
                                -->
                                <Button
                                    :icon="entry.done ? 'xmark' : 'check'"
                                    :tooltip="entry.done ? 'Mark undone' : 'Mark done'"
                                    size="small"
                                    fixedWidth
                                    :color="entry.done ? 'warning' : 'success'"
                                    @click="toggleDone(entry)"
                                />
                                <Button
                                    icon="pen"
                                    tooltip="Edit task"
                                    size="small"
                                    fixedWidth
                                    color="primary"
                                    @click="$router.push({ name: 'taskEdit', params: { entryId: entry.id } });"
                                />
                                <Button
                                    icon="list-check"
                                    tooltip="New subtask"
                                    size="small"
                                    fixedWidth
                                    color="light"
                                />
                                <Button
                                    icon="trash"
                                    tooltip="Delete"
                                    size="small"
                                    fixedWidth
                                    color="danger"
                                />
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </GridLayout>
</template>

<script setup>
import Button from "@/components/Button.vue";
import SearchInput from "@/components/SearchInput.vue";
import {computed, ref} from "vue";
import axios from "@/axios.js";
import {arrayToTree, treeToFlatArray} from "@/helper/tree.js";
import ErrorMessage from "@/components/ErrorMessage.vue";
import GridLayout from "@/components/layout/GridLayout.vue";

const error = ref(null);

const search = ref('');
const hideDone = ref(false);

const entries = ref([]);
const loading = ref(true);

const filteredEntries = computed(() => {
    if (search.value || hideDone.value) {
        const searchLowercase = search.value.toLowerCase();

        // When filter is active, we don't use the tree.
        // This avoids lost hits, when a child matches, but one of the parents doesn't.
        return entries.value.filter(entry => {
            if (searchLowercase && !entry.title.toLowerCase().includes(searchLowercase)) {
                return false;
            }
            if (hideDone.value && entry.done) {
                return false;
            }

            return true;
        });
    } else {
        const tree = arrayToTree(entries.value, e => e.id, e => e.parentId, e => e.title);

        return treeToFlatArray(tree);
    }
});

axios
    .get('/entries?type=task&fields=id,parentId,title,done,progress,dueDate,creationTime,doneTime')
    .then(response => {
        loading.value = false;
        entries.value = response.data;
    });

function isOverdue(entry) {
    if (entry.dueDate === null) return false;
    if (entry.done) return false;

    return (Date.parse(entry.dueDate) < Date.now());
}

function toggleDone(entry) {
    error.value = null;

    axios
        .patch('/entries/' + entry.id, {
            done: !entry.done
        })
        .then(response => {
            entries.value = entries.value.map(e => {
                if (e.id === entry.id) {
                    return response.data; // replace changed entry
                } else {
                    return e;
                }
            });
        })
        .catch(e => {
            handleError(e);
        });
}

function handleError(e) {
    if (e.response) {
        error.value = e.response.data.message || e.response.data.error || 'Unknown error';
    } else if (error.request) {
        error.value = e.request; // untested, see https://axios-http.com/docs/handling_errors
    } else {
        error.value = e.message; // untested, see https://axios-http.com/docs/handling_errors
    }
}
</script>

<style lang="scss" scoped>
table.table {

    td:nth-child(1) {
        width: 32px;
        text-align: center;
    }
    td:nth-child(6) {
        $countButtons: 4; // 6; (TODO ordering requires a new field on the entry)

        width: calc($countButtons * 32px + ($countButtons - 1) * 0.25rem);
        text-align: center;
    }

    progress {
        width: 100px;
    }

    // make table text inherit a row's color class (for overdue tasks)
    tr.text-danger {
        td, a {
            color: var(--bs-danger);
        }
    }
}
</style>
