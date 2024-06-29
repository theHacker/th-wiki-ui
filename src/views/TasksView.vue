<template>
    <div class="columns">
        <div class="column is-8 is-offset-2">
            <div class="level">
                <div class="level-left">
                    <div class="level-item">
                        <SearchInput v-model="search" />
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
                        <th>Commands</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="entry in entries" :class="{'has-text-danger': entry.overdue }">
                        <td><input type="checkbox" disabled :checked="entry.done" /></td>
                        <td
                            :style="{ paddingLeft: `${entry.indentLevel * 24}px` }"
                        >
                            <div class="level">
                                <div class="level-left">
                                    <div
                                        class="level-item"
                                        :style="entry.done ? 'text-decoration: var(--bulma-grey) 2px solid line-through' : ''"
                                    >
                                        {{ entry.title }}
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
                        <td>{{ entry.createDate }}</td>
                        <td>
                            <span :class="{'is-italic': !entry.dueDate, 'has-text-weight-semibold': entry.overdue }">
                                {{ entry.dueDate || 'no due date' }}
                            </span>
                        </td>
                        <td>
                            <div class="field is-grouped">
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
                                <div class="control">
                                    <Button
                                        :icon="entry.done ? 'xmark' : 'check'"
                                        :tooltip="entry.done ? 'Mark undone' : 'Mark down'"
                                        size="small"
                                        :color="entry.done ? 'warning' : 'success'"
                                    />
                                </div>
                                <div class="control">
                                    <Button
                                        icon="eye"
                                        tooltip="View/Edit details"
                                        size="small"
                                        color="primary"
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
import {ref} from "vue";

const search = ref('');

// Demo data only
const entries = Array(15)
    .fill(undefined)
    .map((_, index) => {
        const i = index + 1;

        const title = `Demo TODO ${i} something to do`;
        const done = (i % 7 === 0);
        const progress = done ? 100 : (i % 4 === 0) ? 25 : 0;
        const createDate = (i % 2 === 0) ? '2024-05-04' : '2024-05-02';
        const dueDate = (i === 3) ? '2024-01-01' : (i % 3 === 0) ? '2024-05-04' : null;

        // TODO these will be calculated eventually
        const overdue = (i === 3);
        const indentLevel = [3, 8, 10, 13].includes(i) ? 1 : [4, 5, 14].includes(i) ? 2 : 0;
        const canBeMovedUp = ![1, 3, 4, 8, 10, 13, 14].includes(i);
        const canBeMovedDown = ![3, 5, 8, 10, 13, 14, 15].includes(i);

        return {
            title, done, progress, createDate, dueDate, overdue, indentLevel, canBeMovedUp, canBeMovedDown
        };
    });
</script>

<style lang="scss" scoped>
table.table {
    td:nth-child(1) {
        width: 32px;
        text-align: center;
    }
    td:nth-child(5) {
        $countButtons: 6;

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
    }
}
</style>
