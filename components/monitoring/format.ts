export function formatValue(value: number | null, digits = 0): string {
  return value !== null && Number.isFinite(value) ? value.toFixed(digits) : "—";
}

export function formatDateTime(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isFinite(date.getTime())
    ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "medium" }).format(date)
    : "—";
}

export function displayList(items: unknown[]): string[] {
  return items.map((item) => typeof item === "string" ? item : JSON.stringify(item)).filter(Boolean);
}
