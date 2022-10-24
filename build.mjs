/* eslint-disable no-undef */
import { build } from 'esbuild'

const production = process.argv[2] === "--production";
const watch = process.argv[2] === "--watch";

build({
  entryPoints: ["./src/extension.ts"],
  bundle: true,
  outdir: "out",
  external: ["vscode"],
  format: "cjs",
  sourcemap: !production,
  minify: production,
  platform: "node",
  logLevel: 'info',
})
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
