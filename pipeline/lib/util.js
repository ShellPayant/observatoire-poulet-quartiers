// Filesystem + fetch helpers for the pipeline.
import { mkdir, writeFile, readFile, access } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// pipeline/lib/util.js  →  project root is three levels up from this file.
export const ROOT = resolve(fileURLToPath(import.meta.url), "../../..");
export const RAW = resolve(ROOT, "data/raw");
export const SEED = resolve(ROOT, "data/seed");
// Pipeline outputs are written where Observable Framework can serve them as
// static FileAttachments: src/data/.
export const PUBLISH = resolve(ROOT, "src/data");

// Grand Paris MVP scope.
export const DEPARTEMENTS = ["75", "92", "93", "94"];
export const DVF_YEARS = [2020, 2021, 2022, 2023, 2024];

/** Pretty-print JSON to an absolute path, creating parent dirs. BigInt-safe. */
export async function writeJSON(absPath, data, { pretty = false } = {}) {
  await mkdir(dirname(absPath), { recursive: true });
  const json = JSON.stringify(data, bigintReplacer, pretty ? 2 : 0);
  await writeFile(absPath, json, "utf8");
  return { path: absPath, bytes: Buffer.byteLength(json) };
}

export function bigintReplacer(_key, value) {
  return typeof value === "bigint" ? Number(value) : value;
}

export async function readJSON(absPath) {
  return JSON.parse(await readFile(absPath, "utf8"));
}

export async function exists(absPath) {
  try {
    await access(absPath);
    return true;
  } catch {
    return false;
  }
}

/** fetch() with a timeout + one retry; returns Response (caller handles body). */
export async function fetchWithRetry(url, { timeoutMs = 60000, init = {}, retries = 2 } = {}) {
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(url, { ...init, signal: ctrl.signal });
      clearTimeout(t);
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
      return res;
    } catch (err) {
      clearTimeout(t);
      lastErr = err;
      if (attempt < retries) await sleep(1500 * (attempt + 1));
    }
  }
  throw lastErr;
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Console log with a leading tag, for readable pipeline output. */
export function log(tag, ...args) {
  console.log(`[${tag}]`, ...args);
}
