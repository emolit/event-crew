import { stdin, stdout } from "node:process";
import { createInterface } from "node:readline/promises";
import { hashPassword } from "../lib/auth/password";
import { openDatabase } from "../lib/db/client";
import { runMigrations } from "../lib/db/migrate";
import { MIN_ADMIN_PASSWORD_LENGTH, validateAdminPassword } from "../lib/auth/password-policy";

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  if (args.some((argument) => argument !== "--reset")) {
    throw new Error("Допустим только флаг --reset; пароль нельзя передавать в аргументах");
  }
  const reset = args.includes("--reset");
  const prompt = createInterface({ input: stdin, output: stdout });
  const username = (await prompt.question("Логин администратора [admin]: ")).trim() || "admin";
  prompt.close();
  const password = await readHidden(`Пароль (не менее ${MIN_ADMIN_PASSWORD_LENGTH} символов): `);
  const confirmation = await readHidden("Повторите пароль: ");
  const passwordError = validateAdminPassword(password);
  if (passwordError) {
    throw new Error(passwordError);
  }
  if (password !== confirmation) {
    throw new Error("Пароли не совпадают");
  }

  const db = openDatabase();
  runMigrations(db);
  const existing = db.prepare("SELECT id FROM users WHERE username = ? COLLATE NOCASE").get(username) as
    | { id: number }
    | undefined;
  if (existing && !reset) {
    throw new Error("Пользователь уже существует; используйте --reset для смены пароля");
  }
  const encoded = await hashPassword(password);
  if (existing) {
    db.prepare(
      "UPDATE users SET password_hash = ?, is_active = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    ).run(encoded, existing.id);
    db.prepare("UPDATE sessions SET revoked_at = CURRENT_TIMESTAMP WHERE user_id = ?").run(existing.id);
  } else {
    db.prepare("INSERT INTO users (username, password_hash, role) VALUES (?, ?, 'owner')").run(
      username,
      encoded,
    );
  }
  stdout.write(`Администратор ${username} сохранён.\n`);
}

function readHidden(question: string): Promise<string> {
  if (!stdin.isTTY || typeof stdin.setRawMode !== "function") {
    const prompt = createInterface({ input: stdin, output: stdout });
    return prompt.question(question).finally(() => prompt.close());
  }

  return new Promise((resolve, reject) => {
    let value = "";
    stdout.write(question);
    stdin.setRawMode(true);
    stdin.resume();
    const onData = (chunk: Buffer) => {
      const text = chunk.toString("utf8");
      if (text === "\u0003") {
        cleanup();
        reject(new Error("Ввод отменён"));
        return;
      }
      if (text === "\r" || text === "\n") {
        cleanup();
        stdout.write("\n");
        resolve(value);
        return;
      }
      if (text === "\u0008" || text === "\u007f") {
        value = value.slice(0, -1);
        return;
      }
      value += text;
    };
    const cleanup = () => {
      stdin.off("data", onData);
      stdin.setRawMode(false);
      stdin.pause();
    };
    stdin.on("data", onData);
  });
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Неизвестная ошибка";
  console.error(message);
  process.exitCode = 1;
});
