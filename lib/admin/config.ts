import { resolve } from "node:path";

export interface AdminConfig {
  dataDir: string;
  databasePath: string;
  uploadsDir: string;
  backupsDir: string;
  sessionSecret: string;
  isProduction: boolean;
}

const DEVELOPMENT_SESSION_SECRET = "0".repeat(64);

export function getAdminConfig(env: NodeJS.ProcessEnv = process.env): AdminConfig {
  const isProduction = env.NODE_ENV === "production";
  const configuredDataDir = env.EVENT_CREW_DATA_DIR?.trim();
  const configuredSecret = env.SESSION_SECRET?.trim();

  if (isProduction && !configuredDataDir) {
    throw new Error("EVENT_CREW_DATA_DIR is required in production");
  }

  if (isProduction && (!configuredSecret || configuredSecret.length < 64)) {
    throw new Error("SESSION_SECRET must contain at least 64 characters in production");
  }

  const dataDir = resolve(/* turbopackIgnore: true */ configuredDataDir || ".data");
  const sessionSecret = configuredSecret || DEVELOPMENT_SESSION_SECRET;

  return {
    dataDir,
    databasePath: resolve(dataDir, "event-crew.sqlite"),
    uploadsDir: resolve(dataDir, "uploads"),
    backupsDir: resolve(dataDir, "backups"),
    sessionSecret,
    isProduction,
  };
}
