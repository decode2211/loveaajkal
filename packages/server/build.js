const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');

const sharedDir = path.resolve(__dirname, '../shared');

esbuild.build({
  entryPoints: ['src/app.ts'],
  bundle: false,
  platform: 'node',
  target: 'ES2022',
  format: 'cjs',
  outdir: 'dist',
  tsconfig: 'tsconfig.json',
  plugins: [
    {
      name: 'alias-plugin',
      setup(build) {
        build.onResolve({ filter: /^@us-always\/shared/ }, (args) => {
          return { path: path.join(sharedDir, 'src', 'index.ts') };
        });
      },
    },
  ],
}).catch(() => process.exit(1));

