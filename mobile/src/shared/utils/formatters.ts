import { format, formatDistanceToNow, parseISO, differenceInDays } from 'date-fns';
import { id } from 'date-fns/locale/id';

// ── Date Formatters ───────────────────────────────────────────────────────────
export function formatDate(date: string | Date, formatStr: string = 'dd MMM yyyy'): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, formatStr, { locale: id });
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'dd MMM yyyy, HH:mm', { locale: id });
}

export function formatTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'HH:mm', { locale: id });
}

export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true, locale: id });
}

export function formatTripDate(startDate: string | Date, endDate: string | Date): string {
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;

  return `${format(start, 'dd', { locale: id })} - ${format(end, 'dd MMM yyyy', { locale: id })}`;
}

export function formatDayRange(startDate: string | Date, endDate: string | Date): string {
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;

  const days = differenceInDays(end, start) + 1;
  return `${days} hari`;
}

export function formatTimeAgo(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);

  if (seconds < 60) return 'baru saja';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}j`;
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)}h`;
  return formatDate(d, 'dd MMM');
}

// ── Currency (IDR) ────────────────────────────────────────────────────────────
export function formatCurrency(amount: number, showSymbol: boolean = true): string {
  const formatted = new Intl.NumberFormat('id-ID', {
    style: showSymbol ? 'currency' : 'decimal',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

  if (!showSymbol) {
    return formatted;
  }

  // Remove trailing ",00" if present
  return formatted.replace(/,00$/, '');
}

export function formatPriceCompact(amount: number): string {
  if (amount >= 1000000000) {
    return `${(amount / 1000000000).toFixed(1)}M`;
  }
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}JT`;
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)}RB`;
  }
  return `Rp${amount}`;
}

// ── Distance ──────────────────────────────────────────────────────────────────
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  const km = meters / 1000;
  return `${km.toFixed(1)} km`;
}

export function formatDistanceCompact(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}

// ── Elevation ─────────────────────────────────────────────────────────────────
export function formatElevation(meters: number): string {
  return `${Math.round(meters)} m dpl`;
}

export function formatElevationGain(meters: number): string {
  if (meters > 1000) {
    return `${(meters / 1000).toFixed(2)} km`;
  }
  return `${Math.round(meters)} m`;
}

// ── Duration ──────────────────────────────────────────────────────────────────
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${Math.round(minutes)} menit`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);

  if (hours < 24) {
    return remainingMinutes > 0 ? `${hours}j ${remainingMinutes}m` : `${hours} jam`;
  }

  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;

  if (remainingHours > 0) {
    return `${days}h ${remainingHours}j`;
  }
  return `${days} hari`;
}

export function formatDurationCompact(minutes: number): string {
  if (minutes < 60) return `${Math.round(minutes)}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}j`;
  return `${Math.floor(hours / 24)}h`;
}

export function formatDurationDays(days: number): string {
  if (days === 1) return '1 hari';
  return `${days} hari`;
}

// ── Speed ─────────────────────────────────────────────────────────────────────
export function formatSpeed(metersPerSecond: number): string {
  const kmh = metersPerSecond * 3.6;
  return `${kmh.toFixed(1)} km/h`;
}

// ── Percentage ────────────────────────────────────────────────────────────────
export function formatPercentage(value: number, total: number): string {
  if (total === 0) return '0%';
  return `${Math.round((value / total) * 100)}%`;
}

// ── Number ────────────────────────────────────────────────────────────────────
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('id-ID').format(num);
}

export function formatCompactNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}JT`;
  if (num >= 1000) return `${(num / 1000).toFixed(0)}RB`;
  return num.toString();
}
