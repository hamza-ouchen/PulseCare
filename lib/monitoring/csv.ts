import Papa from "papaparse";

export type CsvRow = Record<string, unknown>;

const CSV_CACHE_TTL_MS = 4000;
const cache = new Map<string, { rows: CsvRow[]; fetchedAt: number }>();
const pending = new Map<string, Promise<CsvRow[]>>();

export async function fetchCsv(url: string): Promise<CsvRow[]> {
  const cached = cache.get(url);
  if (cached && Date.now() - cached.fetchedAt < CSV_CACHE_TTL_MS) return cached.rows;
  const existingRequest = pending.get(url);
  if (existingRequest) return existingRequest;

  const request = (async () => {
    try {
      const response = await fetch(url, {
        cache: "no-store",
        headers: { Accept: "text/csv,text/plain;q=0.9,*/*;q=0.1" },
      });
      if (!response.ok) {
        if (cached) return cached.rows;
        throw new Error(`CSV source returned HTTP ${response.status}.`);
      }
      const csv = await response.text();
      const result = Papa.parse<CsvRow>(csv, {
        header: true,
        skipEmptyLines: "greedy",
        transformHeader: (header) => header.trim(),
      });
      if (result.errors.length > 0) {
        const blockingError = result.errors.find((error) => error.type !== "FieldMismatch");
        if (blockingError) {
          if (cached) return cached.rows;
          throw new Error(`CSV parsing failed: ${blockingError.message}`);
        }
      }
      cache.set(url, { rows: result.data, fetchedAt: Date.now() });
      return result.data;
    } finally {
      pending.delete(url);
    }
  })();

  pending.set(url, request);
  return request;
}
