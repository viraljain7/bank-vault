/** Non-sensitive formatting & masking helpers. Nothing here touches decrypted data. */

export function maskCardNumber(last4?: string, partial?: string): string {
  if (partial) {
    const digits = partial.replace(/\D/g, '');
    if (digits.length >= 4) return `•••• •••• •••• ${digits.slice(-4)}`;
  }
  return last4 ? `•••• •••• •••• ${last4}` : '•••• •••• •••• ••••';
}

export function maskGeneric(value?: string): string {
  if (!value) return '••••••••••';
  const len = Math.min(Math.max(value.length, 4), 12);
  return '\u2022'.repeat(len);
}

export function maskAccountNumber(accountNumber?: string): string {
  if (!accountNumber) return '•••• •••• •••• ••••';
  const digits = accountNumber.replace(/\D/g, '');
  if (digits.length >= 4) return `•••• •••• •••• ${digits.slice(-4)}`;
  return maskGeneric(accountNumber);
}

export function formatCardNumber(digits: string): string {
  const cleaned = digits.replace(/\D/g, '').slice(0, 19);
  return cleaned.replace(/(.{4})/g, '$1 ').trim();
}

export function formatAccountNumber(digits: string): string {
  const cleaned = digits.replace(/\D/g, '').slice(0, 18);
  return cleaned.replace(/(.{4})/g, '$1 ').trim();
}

export function timeAgo(dateIso: string): string {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(dateIso).getTime()) / 1000));
  const intervals: Array<[number, string]> = [
    [31_536_000, 'year'],
    [2_592_000, 'month'],
    [86_400, 'day'],
    [3_600, 'hour'],
    [60, 'minute'],
  ];
  for (const [secs, unit] of intervals) {
    if (seconds >= secs) {
      const n = Math.floor(seconds / secs);
      return `${n} ${unit}${n === 1 ? '' : 's'} ago`;
    }
  }
  return seconds <= 10 ? 'just now' : `${seconds} seconds ago`;
}

export function formatTime(dateIso: string): string {
  return new Date(dateIso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export function formatDateTime(dateIso: string): string {
  const d = new Date(dateIso);
  return `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${d.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  })}`;
}

export function initials(name: string | null | undefined): string {
  if (!name) return '?';
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');
}

export function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 5) return 'Good evening';
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}