import { describe, expect, test } from "vitest";
import {
  MIN_ADMIN_PASSWORD_LENGTH,
  validateAdminPassword,
} from "@/lib/auth/password-policy";

describe("admin password policy", () => {
  test("accepts four characters and rejects three", () => {
    expect(MIN_ADMIN_PASSWORD_LENGTH).toBe(4);
    expect(validateAdminPassword("1234")).toBeNull();
    expect(validateAdminPassword("123")).toMatch(/4/);
  });
});
