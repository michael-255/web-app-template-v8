import type { Component } from "vue";
import { z } from "zod";
import type {
  idSchema,
  logDetailsSchema,
  logLabelSchema,
  logLevelSchema,
  logSchema,
  routeNameSchema,
  settingIdSchema,
  settingSchema,
  settingValueSchema,
  statusSchema,
  tableSchema,
  textAreaSchema,
  textLineSchema,
  timestampSchema,
} from "./schemas";

/**
 * Defining in one file to reduce the likelyhood of circular dependencies.
 */

//
// App
//

export type BackupType = {
  appName: string;
  databaseVersion: string;
  createdAt: TimestampType;
  settings: SettingType[];
  logs: LogType[];
  plans: PlanType[];
  measurements: MeasurementType[];
  workouts: WorkoutType[];
  workoutResults: WorkoutResultType[];
  exercises: ExerciseType[];
  exerciseResults: ExerciseResultType[];
};

export type SelectOption = {
  value: IdType;
  label: string;
  disable: boolean;
};

export type ComponentWithPropsType = {
  component: Component;
  props?: Record<string, any>;
};

//
// Shared
//

export type TableType = z.infer<typeof tableSchema>;
export type RouteNameType = z.infer<typeof routeNameSchema>;
export type IdType = z.infer<typeof idSchema>;
export type TimestampType = z.infer<typeof timestampSchema>;
export type TextLineType = z.infer<typeof textLineSchema>;
export type TextAreaType = z.infer<typeof textAreaSchema>;
export type StatusType = z.infer<typeof statusSchema>;

//
// Settings
//

export type SettingIdType = z.infer<typeof settingIdSchema>;
export type SettingValueType = z.infer<typeof settingValueSchema>;
export type SettingType = z.infer<typeof settingSchema>;

//
// Logs
//

export type LogLevelType = z.infer<typeof logLevelSchema>;
export type LogLabelType = z.infer<typeof logLabelSchema>;
export type LogDetailsType = z.infer<typeof logDetailsSchema>;
export type LogType = z.infer<typeof logSchema>;
