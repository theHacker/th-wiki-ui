<template>
    <GridLayout>
        <h1>Backups</h1>

        <ErrorMessage v-if="errors.length > 0" :title="errors.length > 1 ? 'Errors' : 'Error'">
            <ul>
                <li v-for="(error, index) in errors" :key="index">{{ error }}</li>
            </ul>
        </ErrorMessage>

        <div class="row g-3">
            <div class="col-12 col-lg-8 offset-lg-2">
                <div v-if="loading" class="mt-4">
                    <LoadingIndicator />
                </div>
            </div>

            <template v-if="!loading">
                <div class="col-12 col-lg-6 col-xl-5 offset-xl-1">
                    <div class="card">
                        <div
                            class="card-header"
                            :class="backups.configuration.enabled ? 'text-bg-success' : 'text-bg-warning'"
                        >Status</div>

                        <div class="card-body">
                            <div v-if="backups.configuration.enabled">
                                <span class="icon-link">
                                    <i class="fas fa-check fa-2x me-1" />
                                    Backups are enabled.
                                </span>

                                <div class="mt-3">
                                    Next backup at <time class="fw-bold">{{ backups.nextAutomaticBackup }}</time>.
                                </div>
                            </div>

                            <div v-if="!backups.configuration.enabled">
                                <span class="icon-link">
                                    <i class="fas fa-pause fa-2x me-1" />
                                    Backups are disabled.
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-12 col-lg-6 col-xl-5">
                    <div class="card">
                        <div class="card-header text-bg-info">Configuration</div>

                        <div class="card-body">
                            <div class="vstack gap-2">
                                <span v-if="backups.configuration.automaticBackupCron !== null" class="icon-link">
                                    <i class="fas fa-clock me-1" />
                                    <span>
                                        Automatic backup with cron expression<br />
                                        <code>{{ backups.configuration.automaticBackupCron }}</code>
                                    </span>
                                </span>

                                <span class="icon-link">
                                    <i class="fas fa-broom me-1" />
                                    <span>
                                        Prune old backups with retention expression<br />
                                        <code>{{ backups.configuration.backupRetentionExpression }}</code>
                                    </span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-12 col-xl-10 offset-xl-1">
                    <div class="card">
                        <div class="card-header text-bg-info">Existing backups</div>

                        <div class="card-body">
                            <table class="table table-responsive table-hover align-middle">
                                <thead>
                                    <tr>
                                        <th>Filename</th>
                                        <th>Creation time</th>
                                        <th>Size</th>
                                        <th>Retention info</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr
                                        v-for="backup in backups.existingBackups"
                                        :key="backup.filename"
                                    >
                                        <td :class="retentionIconClass(backup.retention)">
                                            <span class="icon-link">
                                                <span>
                                                    <i
                                                        class="fas"
                                                        :class="backup.retention.keep ? 'fa-box-archive' : 'fa-trash'"
                                                    />
                                                </span>
                                                <span>
                                                    <code>{{ backup.filename }}</code>
                                                </span>
                                            </span>
                                        </td>
                                        <td :class="retentionIconClass(backup.retention)">
                                            <time>{{ backup.creationTime }}</time>
                                        </td>
                                        <td :class="retentionIconClass(backup.retention)">
                                            <span :title="`${backup.size} bytes`">
                                                {{ formatBytes(backup.size) }}
                                            </span>
                                        </td>
                                        <td :class="retentionIconClass(backup.retention)">
                                            {{ backup.retention.reason }}
                                        </td>
                                    </tr>
                                    <tr v-if="backups.existingBackups.length === 0">
                                        <td colspan="4" class="text-center">
                                            <i>No backups yet.</i>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </template>
        </div>
    </GridLayout>
</template>

<script setup>
import {ref} from "vue";
import {useHead} from "@unhead/vue";
import LoadingIndicator from "@/components/LoadingIndicator.vue";
import axios from "@/axios.js";
import ErrorMessage from "@/components/ErrorMessage.vue";
import {handleError} from "@/helper/graphql-error-handling.js";
import GridLayout from "@/components/layout/GridLayout.vue";
import {formatBytes} from "@/helper/format-bytes.js";

useHead({
    title: 'Backups'
});

const backups = ref(null);
const loading = ref(true);

const errors = ref([]);

fetchData();

function fetchData() {
    axios
        .graphql(
            `
                query Backups {
                    backups {
                        configuration {
                            enabled
                            automaticBackupCron
                            backupRetentionExpression
                        }
                        nextAutomaticBackup
                        existingBackups {
                            filename
                            creationTime
                            size
                            retention {
                                keep
                                reason
                            }
                        }
                    }
                }
            `
        )
        .then(data => {
            loading.value = false;
            backups.value = data.backups;
        })
        .catch(e => {
            errors.value = handleError(e).genericErrors;
        });
}

function retentionIconClass(backupRetention) {
    if (!backupRetention.keep) {
        return 'bg-danger opacity-25';
    }

    if (backupRetention.reason.startsWith('keep-last:')) {
        return 'bg-info bg-opacity-5';
    } else if (backupRetention.reason.startsWith('keep-hourly:')) {
        return 'bg-info bg-opacity-10';
    } else if (backupRetention.reason.startsWith('keep-daily:')) {
        return 'bg-info bg-opacity-25';
    } else if (backupRetention.reason.startsWith('keep-weekly:')) {
        return 'bg-success bg-opacity-25';
    } else if (backupRetention.reason.startsWith('keep-monthly:')) {
        return 'bg-success bg-opacity-50';
    } else if (backupRetention.reason.startsWith('keep-yearly:')) {
        return 'bg-success bg-opacity-75';
    }
}
</script>
