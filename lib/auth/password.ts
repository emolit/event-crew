import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

const KEY_LENGTH = 32;
const COST = 16_384;
const BLOCK_SIZE = 8;
const PARALLELIZATION = 1;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = await deriveKey(password, salt);
  return ["scrypt", COST, BLOCK_SIZE, PARALLELIZATION, salt.toString("hex"), derived.toString("hex")].join(
    "$",
  );
}

export async function verifyPassword(password: string, encoded: string): Promise<boolean> {
  const parts = encoded.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") {
    return false;
  }

  const [cost, blockSize, parallelization] = parts.slice(1, 4).map(Number);
  if (cost !== COST || blockSize !== BLOCK_SIZE || parallelization !== PARALLELIZATION) {
    return false;
  }

  try {
    const salt = Buffer.from(parts[4], "hex");
    const expected = Buffer.from(parts[5], "hex");
    if (salt.length !== 16 || expected.length !== KEY_LENGTH) {
      return false;
    }
    const actual = await deriveKey(password, salt);
    return timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

function deriveKey(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(
      password,
      salt,
      KEY_LENGTH,
      { N: COST, r: BLOCK_SIZE, p: PARALLELIZATION, maxmem: 64 * 1024 * 1024 },
      (error, derivedKey) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(derivedKey);
      },
    );
  });
}
