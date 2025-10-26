const { transformFileSync } = require('@babel/core');
const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const distDir = path.join(__dirname, 'dist');

// Check if watch mode is enabled
const isWatchMode = process.argv.includes('--watch');

// Load babel config
const babelConfig = require('./babel.config.js');

function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      getAllFiles(filePath, fileList);
    } else if (/\.(ts|tsx)$/.test(file)) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function compileFile(filePath) {
  const relativePath = path.relative(srcDir, filePath);
  const ext = path.extname(filePath);

  // Determine output extension
  let outExt;
  if (ext === '.tsx') {
    outExt = '.jsx';
  } else if (ext === '.ts') {
    outExt = '.js';
  } else {
    return; // Skip other files
  }

  const outPath = path.join(
    distDir,
    relativePath.replace(/\.(ts|tsx)$/, outExt)
  );

  // Ensure output directory exists
  ensureDir(path.dirname(outPath));

  try {
    // Transform the file
    const result = transformFileSync(filePath, {
      ...babelConfig,
      filename: filePath
    });

    // Write output
    fs.writeFileSync(outPath, result.code);
    console.log(`Compiled: ${relativePath}`);
  } catch (error) {
    console.error(`Error compiling ${relativePath}:`, error.message);
  }
}

function build() {
  // Clean dist directory
  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true });
  }
  ensureDir(distDir);

  // Get all source files
  const files = getAllFiles(srcDir);

  console.log('Building...');
  files.forEach(compileFile);
  console.log('\nBuild completed successfully!');
}

function watch() {
  console.log('Building initial files...');
  build();

  console.log(`\nWatching for changes in ${srcDir}...`);

  fs.watch(srcDir, { recursive: true }, (_eventType, filename) => {
    if (!filename) return;

    const filePath = path.join(srcDir, filename);

    // Only recompile .ts and .tsx files
    if (/\.(ts|tsx)$/.test(filePath) && fs.existsSync(filePath)) {
      console.log(`\nFile changed: ${filename}`);
      compileFile(filePath);
    }
  });
}

if (isWatchMode) {
  watch();
} else {
  build();
}
