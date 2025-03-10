import Dexie, { liveQuery, type Observable } from "dexie";
import { DB } from "../db";
import { DurationEnum, SettingIdEnum, StatusEnum, TableEnum } from "../enums";
import { Setting } from "../models/Setting";
import { logSchema, settingSchema } from "../types/schemas";
import type { IdType, SettingValueType } from "../types/types";

export function getModelSchema(table: TableEnum) {
  switch (table) {
    case TableEnum.SETTINGS:
      return settingSchema;
    case TableEnum.LOGS:
      return logSchema;
    default:
      throw new Error(`Cannot find schema for table: ${table}`);
  }
}

/**
 * TODO:
 * Returns live query of a parent table with records that are not hidden with the remaining
 * sorted with locked records first, then favorited records, then alphabetically by name, and
 * finally by createdAt reversed.
 */
export function liveDashboard<T>(
  db: Dexie = DB,
  table: TableEnum
): Observable<T[]> {
  return liveQuery(() =>
    db
      .table(table)
      .orderBy("name")
      .filter((record) => !record.status.includes(StatusEnum.HIDDEN))
      .toArray()
      .then((records) =>
        records.sort((a, b) => {
          // Locked records come first to indicate they are active in some way
          const aIsLocked = a.status.includes(StatusEnum.LOCKED);
          const bIsLocked = b.status.includes(StatusEnum.LOCKED);

          if (aIsLocked && !bIsLocked) {
            return -1; // a comes first
          }
          if (!aIsLocked && bIsLocked) {
            return 1; // b comes first
          }

          const aIsFavorited = a.status.includes(StatusEnum.FAVORITED);
          const bIsFavorited = b.status.includes(StatusEnum.FAVORITED);

          if (aIsFavorited && !bIsFavorited) {
            return -1; // a comes first
          }

          if (!aIsFavorited && bIsFavorited) {
            return 1; // b comes first
          }

          // If both or neither are favorited, sort alphabetically by name
          const nameComparison = a.name.localeCompare(b.name);
          if (nameComparison !== 0) {
            return nameComparison;
          }

          // If names are identical, sort by createdAt reversed (b - a)
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        })
      )
  );
}

/**
 * TODO:
 * Returns a live query of ordered records.
 */
export function liveTable<T>(
  table: TableEnum,
  orderBy?: "name" | "createdAt",
  db: Dexie = DB
): Observable<T[]> {
  if (orderBy === "name") {
    return liveQuery(() => db.table(table).orderBy(orderBy).toArray());
  } else if (orderBy === "createdAt") {
    return liveQuery(() =>
      db.table(table).orderBy(orderBy).reverse().toArray()
    );
  } else {
    return liveQuery(() => db.table(table).toArray());
  }
}

/**
 * Initializes the Settings table with defaults or the previously stored values.
 */
export async function initializeSettings(db: Dexie = DB) {
  const defaultSettings: {
    [key in SettingIdEnum]: SettingValueType;
  } = {
    [SettingIdEnum.ADVANCED_MODE]: false,
    [SettingIdEnum.INSTRUCTIONS_OVERLAY]: true,
    [SettingIdEnum.CONSOLE_LOGS]: false,
    [SettingIdEnum.INFO_MESSAGES]: true,
    [SettingIdEnum.LOG_RETENTION_DURATION]:
      DurationEnum[DurationEnum["Six Months"]],
  };

  const settingids = Object.values(SettingIdEnum);

  // Get all settings or create them with default values
  const settings = await Promise.all(
    settingids.map(async (id) => {
      const setting = await db.table(TableEnum.SETTINGS).get(id);
      if (setting) {
        return setting;
      } else {
        return new Setting({
          id,
          value: defaultSettings[id],
        });
      }
    })
  );

  await Promise.all(
    settings.map((setting) => db.table(TableEnum.SETTINGS).put(setting))
  );
}

/**
 * Returns a record by ID.
 */
export async function getRecord<T>(
  db: Dexie = DB,
  table: TableEnum,
  id: IdType
): Promise<T> {
  const recordToGet = await db.table(table).get(id);
  if (!recordToGet) {
    throw new Error(`Record not found with ID: ${id}`);
  }
  return recordToGet!;
}

/**
 * Updates the `lastChild` property of the parent record associated with the `parentId` of the most
 * recently created child record. Locked records are not updated.
 */
export async function updateLastChild(
  db: Dexie = DB,
  parentTable: TableEnum,
  childTable: TableEnum,
  parentId: IdType
) {
  const lastChild = (
    await db
      .table(childTable)
      .where("parentId")
      .equals(parentId)
      .sortBy("createdAt")
  )
    .filter((record) => !record.status.includes(StatusEnum.LOCKED))
    .reverse()[0];

  return await db.table(parentTable).update(parentId, { lastChild });
}
