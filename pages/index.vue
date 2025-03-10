<script setup lang="ts">
import { useQuasar } from "quasar";
import { onMounted, onUnmounted } from "vue";
import useLogger from "~/composables/useLogger";
import { DB } from "~/shared/db";
import {
  DurationEnum,
  DurationMSEnum,
  SettingIdEnum,
  TableEnum,
} from "~/shared/enums";
import { errorIcon } from "~/shared/icons";
import type { SettingType } from "~/shared/types/types";
import { initializeSettings, liveTable } from "~/shared/utils/db-helpers";
import { useSettingsStore } from "~/stores/settings";

const notify = useQuasar().notify;
const { log } = useLogger();
const settingsStore = useSettingsStore();

// Loading live Settings into the store on startup for use throughout the app.
const subscription = liveTable<SettingType>(TableEnum.SETTINGS).subscribe({
  next: (records) => (settingsStore.settings = records),
  error: (error) => log.error(`Error loading live Settings`, error as Error),
});

onMounted(async () => {
  try {
    await initializeSettings();
  } catch (error) {
    // Output the error and notify user since it could be a database or logger failure
    notify({
      message: "Error initializing settings",
      icon: errorIcon,
      color: "negative",
    });
    console.error(error);
  }

  try {
    const logsDeleted = await deleteOldLogs();
    log.silentDebug("Expired logs deleted", { logsDeleted });
  } catch (error) {
    log.error("Error deleting expired logs", error as Error);
  }
});

onUnmounted(() => {
  subscription.unsubscribe();
});

/**
 * Deletes old logs based on the log retention duration setting. Returns the number of logs deleted.
 * Settings must be initialized app wide before calling this method.
 */
async function deleteOldLogs() {
  const setting = await DB.table(TableEnum.SETTINGS).get(
    SettingIdEnum.LOG_RETENTION_DURATION
  );
  const logRetentionDuration = setting?.value as DurationEnum;

  if (!logRetentionDuration || logRetentionDuration === DurationEnum.Forever) {
    return 0; // No logs purged
  }

  const allLogs = await DB.table(TableEnum.LOGS).toArray();
  const maxLogAgeMs = DurationMSEnum[logRetentionDuration];
  const now = Date.now();

  // Find Logs that are older than the retention time and map them to their keys
  const removableLogs = allLogs
    .filter((log: LogType) => {
      const logTimestamp = log.createdAt ?? 0;
      const logAge = now - logTimestamp;
      return logAge > maxLogAgeMs;
    })
    .map((log: LogType) => log.id); // Map remaining Log ids for removal

  await DB.table(TableEnum.LOGS).bulkDelete(removableLogs);
  return removableLogs.length; // Number of logs deleted
}
</script>

<template>
  <div>
    <h1>index.vue</h1>
    <q-btn color="primary" label="Test" size="xl" />
  </div>
</template>
