// One Line to Your Younger Self — make.fun bounty
// Writes a single line to /output/entry.txt (or $MAKEFUN_OUTPUT_DIR).
// The line: the older self warns the younger one about a trade he will
// regret for decades — the guitar sold for a car that barely lasts.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const LINE =
  "Don't sell the guitar to pay for the car — you'll drive the car for three years and miss the guitar for thirty.";

function fail(message: string): never {
  console.error(`error: ${message}`);
  process.exit(1);
}

function validate(line: string): void {
  // Count characters as Unicode code points (spread into code points),
  // not UTF-16 code units, so a line with astral characters is measured
  // the way the scorer counts characters.
  const length = [...line].length;
  if (length < 1 || length > 200) {
    fail(`line must be 1-200 characters, got ${length}`);
  }
  if (line !== line.trim()) {
    fail("line must not have leading or trailing whitespace");
  }
  // Also reject U+2028 LINE SEPARATOR and U+2029 PARAGRAPH SEPARATOR,
  // which are line breaks that /[\r\n]/ does not catch.
  if (/[\r\n\u2028\u2029]/.test(line)) {
    fail("line must be a single line");
  }
  for (const ch of line) {
    const code = ch.codePointAt(0)!;
    if (code < 0x20 || code === 0x7f) {
      fail("line must not contain control characters");
    }
  }
}

function main(): void {
  validate(LINE);
  const outDir = (process.env.MAKEFUN_OUTPUT_DIR || "").trim() || "/output";
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "entry.txt");
  writeFileSync(outPath, LINE, "utf8");
  const readBack = readFileSync(outPath, "utf8");
  if (readBack !== LINE) {
    fail("read-back mismatch: entry.txt bytes differ from the line");
  }
  // Re-run the same gate on what actually landed on disk, so a
  // write that silently altered the text cannot slip through.
  validate(readBack);
  if (Buffer.byteLength(readBack, "utf8") !== Buffer.byteLength(LINE, "utf8")) {
    fail("read-back byte length differs from the line");
  }
  console.log(`wrote ${[...LINE].length} characters to ${outPath}`);
  console.log(LINE);
}

main();
