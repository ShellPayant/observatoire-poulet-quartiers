// Shared DuckDB helpers for the data pipeline.
// We keep one in-memory instance per script run; extensions are loaded on demand.
import { DuckDBInstance } from "@duckdb/node-api";

/** Open an in-memory DuckDB connection with httpfs ready (for remote CSV/parquet). */
export async function openDb({ spatial = false } = {}) {
  const instance = await DuckDBInstance.create(":memory:");
  const conn = await instance.connect();
  await conn.run("INSTALL httpfs; LOAD httpfs;");
  await conn.run("SET http_timeout = 120000;"); // ms — open-data hosts can be slow
  if (spatial) await loadSpatial(conn);
  return { instance, conn };
}

/** Install + load the spatial extension (ST_* functions, GeoJSON, spatial joins). */
export async function loadSpatial(conn) {
  await conn.run("INSTALL spatial; LOAD spatial;");
}

/** Run a query and return plain JS row objects (BigInt → Number, recursively). */
export async function rows(conn, sql) {
  const reader = await conn.runAndReadAll(sql);
  return reader.getRowObjects().map(normalize);
}

/** Run a single scalar query, returning the first column of the first row. */
export async function scalar(conn, sql) {
  const r = await rows(conn, sql);
  if (!r.length) return null;
  return normalize(r[0])[Object.keys(r[0])[0]];
}

/** Convenience: run a statement with no result handling. */
export async function exec(conn, sql) {
  await conn.run(sql);
}

/** DuckDB returns BigInt for integer columns; convert for JSON-friendliness. */
export function normalize(value) {
  if (typeof value === "bigint") return Number(value);
  if (Array.isArray(value)) return value.map(normalize);
  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = normalize(v);
    return out;
  }
  return value;
}
