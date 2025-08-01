// src/lib/tyreQuery.ts
export type Condition = "NOI" | "SEMI" | "SH";

export interface TyreQuery {
  width?: string;
  height?: string;
  diameter?: string;
  condition?: Condition;
}

/**
 * Build a URLSearchParams instance from a TyreQuery object.
 * Only truthy values are included.
 */
export function buildTyreQuery(filters: TyreQuery): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.width) params.append("width", filters.width);
  if (filters.height) params.append("height", filters.height);
  if (filters.diameter) params.append("diameter", filters.diameter);
  if (filters.condition) params.append("condition", filters.condition);

  return params;
}

/**
 * Convenience wrapper that returns `"?foo=bar"` or the empty string.
 */
export function toQueryString(filters: TyreQuery): string {
  const str = buildTyreQuery(filters).toString();
  return str ? `?${str}` : "";
}

/**
 * Parse the current `location.search` (or any query string) back
 * into a typed TyreQuery object.
 */
export function parseTyreQuery(search: string): TyreQuery {
  const params = new URLSearchParams(
    search.startsWith("?") ? search.slice(1) : search,
  );

  return {
    width: params.get("width") || undefined,
    height: params.get("height") || undefined,
    diameter: params.get("diameter") || undefined,
    condition: params.get("condition") as Condition | undefined,
  };
}
