const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');

const sharedDir = path.resolve(__dirname, '../shared');
const sharedSrcDir = path.join(sharedDir, 'src');
const sharedDistDir = path.join(sharedDir, 'dist');
const serverDistDir = path.join(__dirname, 'dist');

// Recursively find all TypeScript files in a directory
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

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

async function build() {
  // Step 1: Compile shared package
  const sharedTsFiles = findTsFiles(sharedSrcDir);
  console.log(`Compiling shared package (${sharedTsFiles.length} files)...`);

  await esbuild.build({
    entryPoints: sharedTsFiles,
    bundle: false,
    platform: 'node',
    target: 'ES2022',
    format: 'cjs',
    outdir: sharedDistDir,
    tsconfig: path.join(sharedDir, 'tsconfig.json'),
  });

  // Step 2: Compile server package
  const serverTsFiles = findTsFiles(path.join(__dirname, 'src'));
  console.log(`Compiling server package (${serverTsFiles.length} files)...`);

  await esbuild.build({
    entryPoints: serverTsFiles,
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
            return { path: path.join(sharedDistDir, 'index.js') };
          });
        },
      },
    ],
  });

  // Step 3: Copy compiled shared to dist/node_modules for runtime resolution
  console.log('Setting up node_modules structure...');
  const nodeModulesPath = path.join(serverDistDir, 'node_modules', '@us-always', 'shared');
  const distNodeModulesDir = path.dirname(nodeModulesPath);

  if (!fs.existsSync(distNodeModulesDir)) {
    fs.mkdirSync(distNodeModulesDir, { recursive: true });
  }

  // Copy compiled shared
  copyDir(sharedDistDir, nodeModulesPath);

  // Create package.json for the shared module in dist
  const packageJson = {
    name: '@us-always/shared',
    version: '1.0.0',
    main: './index.js'
  };
  fs.writeFileSync(
    path.join(nodeModulesPath, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );

  console.log('✓ Build complete');
}

build().catch(() => process.exit(1));





