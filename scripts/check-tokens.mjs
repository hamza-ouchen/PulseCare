import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const css = await readFile(new URL("../styles/tokens.css", import.meta.url), "utf8");
const source = await readFile(new URL("../lib/tokens.ts", import.meta.url), "utf8");
const cssTokens = new Map(
  [...css.matchAll(/--([\w-]+):\s*([^;]+);/g)].map((match) => [match[1], match[2].trim()]),
);
const tsTokens = new Map(
  [...source.matchAll(/^\s*(?:"([\w-]+)"|([\w-]+)):\s*"([^"]+)",$/gm)].map((match) => [
    match[1] ?? match[2],
    match[3],
  ]),
);

assert.deepEqual(tsTokens, cssTokens, "styles/tokens.css and lib/tokens.ts must remain identical");
console.log(`Token mirrors synchronized: ${cssTokens.size} values.`);
