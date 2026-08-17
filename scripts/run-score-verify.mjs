import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';

const temporaryDirectory = await mkdtemp(join(tmpdir(), 'cooked-score-verify-'));
const outputFile = join(temporaryDirectory, 'score-verify.mjs');

try {
  await build({
    entryPoints: ['scripts/score-verify.ts'],
    bundle: true,
    platform: 'node',
    format: 'esm',
    outfile: outputFile,
    logLevel: 'warning',
    tsconfigRaw: {
      compilerOptions: {
        target: 'ES2022',
        strict: true,
      },
    },
  });
  await import(`${pathToFileURL(outputFile).href}?run=${Date.now()}`);
} finally {
  await rm(temporaryDirectory, { recursive: true, force: true });
}
