import type { SettingIdType, SettingValueType } from "../types/types";

interface SettingParams {
  id: SettingIdType;
  value: SettingValueType;
}

/**
 * This model is used for app wide settings. They are initialized and live queried during startup
 * and stored in the `SettingsStore` for easy access.
 */
export class Setting {
  id: SettingIdType;
  value: SettingValueType;

  constructor(params: SettingParams) {
    this.id = params.id;
    this.value = params.value;
  }
}
