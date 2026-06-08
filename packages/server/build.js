const esbuild = require('esbuild');
const path = require('path');

async function build() {
  console.log('Building server package...');

  await esbuild.build({
    entryPoints: [path.join(__dirname, 'src/app.ts')],
    bundle: true,
    platform: 'node',
    target: 'node20',
    format: 'cjs',
    outfile: path.join(__dirname, 'dist/app.js'),
    loader: { '.ts': 'ts' },
    external: [
      '@prisma/client',
      'bcryptjs',
      'cloudinary',
      'cookie-parser',
      'cors',
      'date-fns',
      'dotenv',
      'express',
      'express-async-errors',
      'jsonwebtoken',
      'multer',
      'multer-storage-cloudinary',
      'socket.io',
      'zod',
      'prisma',
    ],
    plugins: [
      {
        name: 'shared-alias',
        setup(build) {
          build.onResolve({ filter: /^@us-always\/shared$/ }, () => ({
            path: path.resolve(__dirname, '../shared/src/index.ts'),
          }));
        },
      },
    ],
  });

  console.log('✓ Build complete');
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});