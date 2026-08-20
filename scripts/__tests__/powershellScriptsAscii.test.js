/**
 * Every PowerShell script must be pure ASCII, or carry a UTF-8 BOM.
 *
 * Windows PowerShell 5.1 — the version the .cmd wrappers target — reads a
 * BOM-less .ps1 as Windows-1252, not UTF-8. One em dash is three UTF-8
 * bytes, and the third lands on a curly closing quote in cp1252, which can
 * OPEN a string that was never meant to exist and kill the parse a hundred
 * lines later with an error pointing nowhere near the real cause. The cheap,
 * reviewable fix is to keep the scripts ASCII (write `--` instead of an em
 * dash); a UTF-8 BOM also works and is accepted here.
 *
 * Offenders are reported as `line N col M: U+2014` so the fix is a direct
 * jump, and an empty glob fails rather than passing silently — a test that
 * finds no scripts is misconfigured, not clean.
 */
const fs = require('fs');
const path = require('path');

const SCRIPTS_DIR = path.join(__dirname, '..');

function listPs1Files(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return listPs1Files(full);
    return entry.name.endsWith('.ps1') ? [full] : [];
  });
}

function hasUtf8Bom(buffer) {
  return buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf;
}

function nonAsciiOffenders(text) {
  const offenders = [];
  let line = 1;
  let column = 1;
  for (const char of text) {
    if (char === '\n') {
      line += 1;
      column = 1;
      continue;
    }
    const code = char.codePointAt(0);
    if (code > 0x7f) {
      const hex = code.toString(16).toUpperCase().padStart(4, '0');
      offenders.push(`line ${line} col ${column}: U+${hex} '${char}'`);
    }
    column += 1;
  }
  return offenders;
}

describe('PowerShell scripts survive Windows PowerShell 5.1 encoding', () => {
  const files = listPs1Files(SCRIPTS_DIR);

  it('finds at least one script (an empty glob is a misconfigured test)', () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it.each(files.map((file) => [path.relative(SCRIPTS_DIR, file), file]))(
    '%s is ASCII or carries a UTF-8 BOM',
    (_label, file) => {
      const buffer = fs.readFileSync(file);
      if (hasUtf8Bom(buffer)) return;
      const offenders = nonAsciiOffenders(buffer.toString('utf8'));
      expect(offenders).toEqual([]);
    },
  );
});
