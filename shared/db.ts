import Dexie from "dexie";
import { appDatabaseVersion, appName } from "./constants";
import { TableEnum } from "./enums";
import { Log } from "./models/Log";
import { Setting } from "./models/Setting";

export const DB = new Dexie(appName);

DB.version(appDatabaseVersion).stores({
  [TableEnum.SETTINGS]: "&id",
  [TableEnum.LOGS]: "&id, createdAt",
});

DB.table(TableEnum.SETTINGS).mapToClass(Setting);
DB.table(TableEnum.LOGS).mapToClass(Log);
