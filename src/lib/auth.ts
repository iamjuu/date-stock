export const DEFAULT_USERNAME = 'Admin@Hawaii.com';
export const DEFAULT_PASSWORD = 'Hawaii';

export const AUTH_COOKIE = 'billing_session';
export const AUTH_TOKEN = 'billing_authenticated';

export function validateCredentials(username: string, password: string): boolean {
  return (
    username.trim().toLowerCase() === DEFAULT_USERNAME.toLowerCase() &&
    password === DEFAULT_PASSWORD
  );
}
