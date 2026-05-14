export function formatArea(sqm: number): string {
  if (sqm < 1000) {
    return `${sqm.toFixed(2)} m²`;
  } else if (sqm < 1000000) {
    return `${(sqm / 1000).toFixed(2)} km²`;
  }
  return `${(sqm / 1000000).toFixed(2)} Mm²`;
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-IN').format(num);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function getSeverityBadgeColor(severity: string): string {
  const colors: Record<string, string> = {
    High: 'bg-danger-soft text-danger-foreground',
    Medium: 'bg-warning-soft text-warning-foreground',
    Low: 'bg-accent-soft text-accent-foreground',
  };
  return colors[severity] || 'bg-surface-subtle text-muted-foreground';
}
