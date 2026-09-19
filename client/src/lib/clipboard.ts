import { CLIPBOARD_CLEAR_TIMEOUT_MS } from '../types';

/**
 * Secure clipboard: writes the value, silently. The copied secret is never
 * logged, never shown in a toast, and (where the platform allows) the
 * clipboard is cleared after a timeout. Clearing writes an empty string, the
 * browser-supported way to "expire" clipboard content like password managers.
 */
export async function copySecret(value: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(value);
    scheduleClipboardClear();
    return true;
  } catch {
    return false;
  }
}

let clearTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleClipboardClear(): void {
  if (clearTimer) clearTimeout(clearTimer);
  clearTimer = setTimeout(() => {
    if (navigator.clipboard && document.hasFocus()) {
      navigator.clipboard.writeText('').catch(() => undefined);
    }
  }, CLIPBOARD_CLEAR_TIMEOUT_MS);
}