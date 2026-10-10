#!/usr/bin/env node
/**
 * Deletes the local demo store (leads submitted in demo mode, edited listings, uploaded photos).
 * The next request re-creates it from the seed in src/lib/demo. Restart the dev server afterwards.
 *   npm run demo:reset
 */
import { rmSync } from "node:fs";
import path from "node:path";

const dir = process.env.DEMO_DATA_DIR || path.join(process.cwd(), ".data");
rmSync(dir, { recursive: true, force: true });
console.log(`Removed ${dir}. Restart the server to re-seed the demo data.`);
