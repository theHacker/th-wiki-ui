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
                    <tr v-for="i in 15" :class="{'has-text-danger': i === 3 }">
                        <td><input type="checkbox" disabled :checked="i % 7 === 0" /></td>
                        <td
                            :style="{ paddingLeft: `${[3, 8, 10, 13].includes(i) ? 24 : [4, 5, 14].includes(i) ? 48 : 0}px` }"
                        >
                            <div class="level">
                                <div class="level-left">
                                    <div class="level-item" :style="(i % 7 === 0) ? 'text-decoration: var(--bulma-grey) 2px solid line-through' : ''">
                                        Demo TODO {{ i }} something to do
                                    </div>
                                </div>
                                <div class="level-right">
                                    <div v-if="i % 4 === 0" class="level-item">
                                        <progress class="progress is-primary" value="25" max="100">25%</progress>
                                    </div>
                                </div>
                            </div>
                        </td>
                        <td>2024-05-04</td>
                        <td>
                            <span :class="{'is-italic': i % 3 !== 0, 'has-text-weight-semibold': i === 3}">
                                {{ i === 3 ? '2024-01-01' : i % 3 === 0 ? '2024-05-04' : 'no due date' }}
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
                                        :disabled="[1, 3, 4, 8, 10, 13, 14].includes(i)"
                                    />
                                </div>
                                <div class="control">
                                    <Button
                                        icon="arrow-down"
                                        tooltip="Move down"
                                        size="small"
                                        color="info"
                                        :disabled="[3, 5, 8, 10, 13, 14, 15].includes(i)"
                                    />
                                </div>
                                <div class="control">
                                    <Button
                                        :icon="i % 7 === 0 ? 'xmark' : 'check'"
                                        :tooltip="i % 7 === 0 ? 'Mark undone' : 'Mark down'"
                                        size="small"
                                        :color="i % 7 === 0 ? 'warning' : 'success'"
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
