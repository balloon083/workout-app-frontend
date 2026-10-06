import { isAxiosError } from 'axios';

/** Pulls the `{ error }` message the backend sends, or falls back to a default. */
export function getErrorMessage(err: unknown, fallback: string): string {
  if (isAxiosError<{ error?: string }>(err) && err.response?.data?.error) {
    return err.response.data.error;
  }
  return fallback;
}
