// Orchestrator — runs the whole pipeline in order. `npm run pipeline`.
// Each stage is reproducible from public URLs; OSM is cached under data/raw.
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const STAGES = [
  ["30_geo.js", "commune & arrondissement boundaries"],
  ["10_dvf.js", "DVF real-estate prices"],
  ["20_chains.js", "fast-food + target chains (OSM)"],
  ["32_crime.js", "SSMSI commune crime"],
  ["40_summary.js", "headline KPIs + Saint-Ouen dashboard"]
];

function run(script) {
  return new Promise((res, rej) => {
    const child = spawn(process.execPath, [resolve(here, script)], { stdio: "inherit" });
    child.on("exit", (code) => (code === 0 ? res() : rej(new Error(`${script} exited ${code}`))));
  });
}

for (const [script, label] of STAGES) {
  console.log(`\n=== ${script} — ${label} ===`);
  await run(script);
}
console.log("\n✓ pipeline complete → src/data/");
