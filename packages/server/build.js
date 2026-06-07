const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');

const sharedDir = path.resolve(__dirname, '../shared');

// Recursively find all TypeScript files in src/
function findTsFiles(dir) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(__dirname, fullPath);
    
    if (entry.isDirectory()) {
      files.push(...findTsFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts')) {
      files.push(relativePath);
    }
  }
  
  return files;
}

const tsFiles = findTsFiles(path.join(__dirname, 'src'));

esbuild.build({
  entryPoints: tsFiles,
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



