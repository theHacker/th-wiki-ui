<template>
    <div class="columns">
        <div class="column is-8 is-offset-2">
            <ErrorMessage v-if="error">{{ error }}</ErrorMessage>

            <div class="level">
                <div class="level-left">
                    <div class="level-item">
                        <SearchInput v-model="search" />
                    </div>
                    <div class="level-item">
                        <Button
                            :icon="hideDone ? 'eye-slash' : 'eye'"
                            :title="hideDone ? 'Show done' : 'Hide done'"
                            color="success"
                            :dark="!hideDone"
                            @click="hideDone = !hideDone"
                        />
                    </div>
                </div>
                <div class="level-right">
                    <div class="level-item">
                        <Button
                            title="New task"
                            color="primary"
                            @click="$router.push({name: 'tasksNew'})"
                        />
                    </div>
                </div>
            </div>

            <table class="table is-fullwidth is-narrow">
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
                <tbody>
                    <tr v-for="entry in filteredEntries" :key="entry.id" :class="{'has-text-danger': isOverdue(entry) }">
                        <td><input type="checkbox" disabled :checked="entry.done" /></td>
                        <td
                            :style="{ paddingLeft: `${entry.level ? ((entry.level - 1) * 24) : 0}px` }"
                        >
                            <div class="level">
                                <div class="level-left">
                                    <div
                                        class="level-item"
                                        :style="entry.done ? 'text-decoration: var(--bulma-grey) 2px solid line-through' : ''"
                                    >
                                        <RouterLink :to="{ name: 'task', params: { entryId: entry.id } }">
                                            {{ entry.title }}
                                        </RouterLink>
                                    </div>
                                </div>
                                <div class="level-right">
                                    <div v-if="!entry.done && entry.progress > 0" class="level-item">
                                        <progress
                                            class="progress is-primary"
                                            :value="entry.progress"
                                            max="100"
                                        >{{ entry.progress }}%</progress>
                                    </div>
                                </div>
                            </div>
                        </td>
                        <td>{{ new Date(entry.creationTime).toLocaleDateString() }}</td>
                        <td>
                            <span :class="{'is-italic': !entry.dueDate, 'has-text-weight-semibold': isOverdue(entry) }">
                                {{ entry.dueDate ? new Date(entry.dueDate).toLocaleDateString() : 'no due date' }}
                            </span>
                        </td>
                        <td>
                            {{ entry.doneTime ? new Date(entry.doneTime).toLocaleDateString() : 'not done yet' }}
                        </td>
                        <td>
                            <div class="field is-grouped">
                                <!-- TODO ordering requires a new field on the entry
                                <div class="control">
                                    <Button
                                        icon="arrow-up"
                                        tooltip="Move up"
                                        size="small"
                                        color="info"
                                        :disabled="!entry.canBeMovedUp"
                                    />
                                </div>
                                <div class="control">
                                    <Button
                                        icon="arrow-down"
                                        tooltip="Move down"
                                        size="small"
                                        color="info"
                                        :disabled="!entry.canBeMovedDown"
                                    />
                                </div>
                                -->
                                <div class="control">
                                    <Button
                                        :icon="entry.done ? 'xmark' : 'check'"
                                        :tooltip="entry.done ? 'Mark undone' : 'Mark done'"
                                        size="small"
                                        :color="entry.done ? 'warning' : 'success'"
                                        @click="toggleDone(entry)"
                                    />
                                </div>
                                <div class="control">
                                    <Button
                                        icon="pen"
                                        tooltip="Edit task"
                                        size="small"
                                        color="primary"
                                        @click="$router.push({ name: 'taskEdit', params: { entryId: entry.id } });"
                                    />
                                </div>
                                <div class="control">
                                    <Button
                                        icon="list-check"
                                        tooltip="New subtask"
                                        size="small"
                                        color="link"
                                    />
                                </div>
                                <div class="control">
                                    <Button
                                        icon="trash"
                                        tooltip="Delete"
                                        size="small"
                                        color="danger"
                                    />
                                </div>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
import Button from "@/components/Button.vue";
import SearchInput from "@/components/SearchInput.vue";
import {computed, ref} from "vue";
import axios from "@/axios.js";
import {arrayToTree, treeToFlatArray} from "@/helper/tree.js";
import ErrorMessage from "@/components/ErrorMessage.vue";

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
    td:nth-child(5) {
        $countButtons: 4; // 6; (TODO ordering requires a new field on the entry)

        width: calc($countButtons * 32px + ($countButtons - 1) * 0.25rem);
        text-align: center;
    }

    .is-grouped {
        gap: 0.25rem; // reduce gap between buttons
    }

    progress {
        width: 100px;
    }

    // make table text inherit a row's color class (for overdue tasks)
    tr.has-text-danger {
        td:nth-child(2), td:nth-child(3), td:nth-child(4) { // not the buttons
            color: var(--bulma-danger-rgb);
        }
        a {
            color: var(--bulma-danger-rgb);
        }
    }
}
</style>
