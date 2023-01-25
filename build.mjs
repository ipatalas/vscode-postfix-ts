import esbuild from 'esbuild'
import * as process from "node:process";
import * as console from "node:console";

const production = process.argv.includes("--production")
const watch = process.argv.includes("--watch")

/** @type {esbuild.BuildOptions} */
const options = {
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
  mainFields: ['module', 'main']
};

(async function () {
  try {
    if (watch) {
      const ctx = await esbuild.context(options)
      await ctx.watch()
    } else {
      await esbuild.build(options);
    }
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
})()
