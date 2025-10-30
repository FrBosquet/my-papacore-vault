const { transformFileSync } = require('@babel/core');
const fs = require('fs');
const path = require('path');
const {
  projectRoot,
  srcDir,
  distDir,
  loadConfig,
  askConfirmation,
  ensureDir
} = require('./utils');

// Check if watch mode and install mode are enabled
const isWatchMode = process.argv.includes('--watch');
const isInstallMode = process.argv.includes('--install');

// Load babel config
const babelConfig = require(path.join(projectRoot, 'babel.config.js'));

// Load target vault config if install mode is enabled
let targetVault = null;
if (isInstallMode) {
  const config = loadConfig();
  targetVault = config.targetVault;
}

function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      getAllFiles(filePath, fileList);
    } else if (/\.(ts|tsx)$/.test(file) && !/\.d\.ts$/.test(file)) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// Function to copy a single file to the vault
function copyToVault(distFilePath) {
  if (!targetVault) return;

  const relativePath = path.relative(distDir, distFilePath);
  const targetPath = path.join(targetVault, relativePath);

  // Ensure target directory exists
  ensureDir(path.dirname(targetPath));

  // Copy the file
  fs.copyFileSync(distFilePath, targetPath);
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

    // Copy to vault if install mode is enabled
    if (isInstallMode) {
      copyToVault(outPath);
      console.log(`Installed: ${relativePath}`);
    }
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

    // Only recompile .ts and .tsx files (exclude .d.ts files)
    if (/\.(ts|tsx)$/.test(filePath) && !/\.d\.ts$/.test(filePath) && fs.existsSync(filePath)) {
      console.log(`\nFile changed: ${filename}`);
      compileFile(filePath);
    }
  });
}

async function main() {
  // Ask for confirmation if install mode is enabled
  if (isInstallMode) {
    const message = `Files will be automatically copied to ${targetVault}\nAny matching files in the target directory will be OVERWRITTEN.`;
    const confirmed = await askConfirmation(targetVault, message);

    if (!confirmed) {
      console.log('\nBuild cancelled.');
      process.exit(0);
    }

    // Create target vault directory if it doesn't exist
    if (!fs.existsSync(targetVault)) {
      console.log(`\nCreating target directory: ${targetVault}`);
      fs.mkdirSync(targetVault, { recursive: true });
    }
  }

  // Run watch or build
  if (isWatchMode || isInstallMode) {
    watch();
  } else {
    build();
  }
}

main();
