/** biome-ignore-all lint/suspicious/noConsole: build script, we need logging here */
const fs = require('node:fs')
const path = require('node:path')
const { distDir, loadConfig, askConfirmation, copyRecursive, ensureDir } = require('./utils')

// Load configuration
const config = loadConfig()
const targetDir = config.targetVault

// Check if dist directory exists
if (!fs.existsSync(distDir)) {
  console.error('Error: dist directory not found!')
  console.error('Please run "pnpm run build" first.')
  process.exit(1)
}

// Main installation function
async function install() {
  const confirmed = await askConfirmation(targetDir)

  if (!confirmed) {
    console.log('\nInstallation cancelled.')
    process.exit(0)
  }

  // Create target directory if it doesn't exist
  ensureDir(targetDir)

  console.log(`\nCopying files from ${distDir} to ${targetDir}...`)

  // Copy all files from dist to target
  fs.readdirSync(distDir).forEach((item) => {
    const srcPath = path.join(distDir, item)
    const destPath = path.join(targetDir, item)

    copyRecursive(srcPath, destPath)
    console.log(`Copied: ${item}`)
  })

  console.log('\nInstallation completed successfully!')
  console.log(`Files installed to: ${targetDir}`)
}

// Run the installation
install()
