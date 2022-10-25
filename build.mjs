/* eslint-disable no-undef */
import { build } from 'esbuild'

const production = process.argv.includes("--production")
const watch = process.argv.includes("--watch")

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
  // needed for debugger
  keepNames: true,
  // needed for vscode-* deps
  mainFields: ['module', 'main'],
  watch
})
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
