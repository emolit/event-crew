export const MIN_ADMIN_PASSWORD_LENGTH = 4;

export function validateAdminPassword(password: string): string | null {
  return password.length < MIN_ADMIN_PASSWORD_LENGTH
    ? `Пароль должен содержать не менее ${MIN_ADMIN_PASSWORD_LENGTH} символов`
    : null;
}
