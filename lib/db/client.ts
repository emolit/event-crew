import { mkdirSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { AdminConfig, getAdminConfig } from "@/lib/admin/config";

export type Database = DatabaseSync;

let activeDatabase: { path: string; database: DatabaseSync } | null = null;

export function openDatabase(config: AdminConfig = getAdminConfig()): DatabaseSync {
  if (activeDatabase?.path === config.databasePath) {
    return activeDatabase.database;
  }

  closeDatabaseForTests();
  mkdirSync(config.dataDir, { recursive: true, mode: 0o700 });
  mkdirSync(config.uploadsDir, { recursive: true, mode: 0o700 });
  mkdirSync(config.backupsDir, { recursive: true, mode: 0o700 });

  const database = new DatabaseSync(config.databasePath);
  database.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;");
  activeDatabase = { path: config.databasePath, database };
  return database;
}

export function closeDatabaseForTests(): void {
  if (!activeDatabase) {
    return;
  }

  activeDatabase.database.close();
  activeDatabase = null;
}
