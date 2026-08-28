import type { OverallTrend, Priority, RiskLevel, Trend } from "./types";

export function normalizeString(value: unknown): string | null {
  if (typeof value !== "string") return value == null ? null : String(value).trim() || null;
  return value.trim() || null;
}

export function normalizeNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const normalized = typeof value === "string" ? value.trim().replace(",", ".") : value;
  if (normalized === "") return null;
  const number = typeof normalized === "number" ? normalized : Number(normalized);
  return Number.isFinite(number) ? number : null;
}

export function normalizeBoolean(value: unknown): boolean | null {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") {
    if (value === 1) return true;
    if (value === 0) return false;
    return null;
  }
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase();
  if (normalized === "true" || normalized === "1") return true;
  if (normalized === "false" || normalized === "0") return false;
  return null;
}

export function normalizeArray(value: unknown): unknown[] {
  if (value === null || value === undefined || value === "") return [];
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return [value];
  const trimmed = value.trim();
  if (!trimmed) return [];
  try {
    const parsed: unknown = JSON.parse(trimmed);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return trimmed.split("|").map((item) => item.trim()).filter(Boolean);
  }
}

export function normalizeStringArray(value: unknown): string[] {
  return normalizeArray(value).map((item) => String(item).trim()).filter(Boolean);
}

export function normalizeDate(value: unknown): string | null {
  const string = normalizeString(value);
  if (!string) return null;
  const timestamp = Date.parse(string);
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : null;
}

const risks: RiskLevel[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const priorities: Priority[] = ["ROUTINE", "MONITOR", "URGENT_REVIEW", "IMMEDIATE_REVIEW"];
const trends: Trend[] = ["UP", "DOWN", "STABLE", "UNKNOWN"];
const overallTrends: OverallTrend[] = ["IMPROVING", "STABLE", "DEGRADING", "UNKNOWN"];

export function normalizeRisk(value: unknown): RiskLevel {
  const normalized = normalizeString(value)?.toUpperCase() as RiskLevel | undefined;
  return normalized && risks.includes(normalized) ? normalized : "LOW";
}

export function normalizeOptionalRisk(value: unknown): RiskLevel | null {
  const normalized = normalizeString(value)?.toUpperCase() as RiskLevel | undefined;
  return normalized && risks.includes(normalized) ? normalized : null;
}

export function normalizePriority(value: unknown): Priority {
  const normalized = normalizeString(value)?.toUpperCase() as Priority | undefined;
  return normalized && priorities.includes(normalized) ? normalized : "ROUTINE";
}

export function normalizeTrend(value: unknown): Trend {
  const normalized = normalizeString(value)?.toUpperCase() as Trend | undefined;
  return normalized && trends.includes(normalized) ? normalized : "UNKNOWN";
}

export function normalizeOverallTrend(value: unknown): OverallTrend {
  const normalized = normalizeString(value)?.toUpperCase() as OverallTrend | undefined;
  return normalized && overallTrends.includes(normalized) ? normalized : "UNKNOWN";
}
