import esbuild from 'esbuild';
// import fs from 'fs';

const outfile = 'dist/snazzy-ui.esm.js';

await esbuild.build({
    entryPoints: ['src/index.ts'],
    bundle: true,
    minify: true,
    format: 'esm',
    sourcemap: true,
    target: ['es2020', 'chrome120', 'firefox120', 'safari16', 'edge115'],
    outfile,
});

// const mod = (await fs.promises.readFile(outfile)).toString();
// const newMod = mod.replace(
//   /"snabbdom"/,
//   '"https://cdn.skypack.dev/snabbdom@3.2.0"'
// );
// await fs.promises.writeFile(outfile, newMod);
