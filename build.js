const production = process.argv[2] === "--production";
const watch = process.argv[2] === "--watch";

require("esbuild")
  .build({
    entryPoints: ["./src/extension.ts"],
    bundle: true,
    outdir: "out",
    external: ["vscode"],
    format: "cjs",
    sourcemap: !production,
    minify: production,
    keepNames: true,
    mainFields: ['module', 'main'],
    platform: "node",
    watch: watch && {
      onRebuild(error) {
        if (error) console.error("watch build failed:", error);
        else console.log("watch build succeeded");
      },
    },
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
