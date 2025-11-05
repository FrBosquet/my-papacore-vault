/** biome-ignore-all lint/suspicious/noConsole: build script, we need logging here */
const fs = require('node:fs')
const path = require('node:path')
const readline = require('node:readline')

// Project directories
const projectRoot = path.join(__dirname, '..')
const srcDir = path.join(projectRoot, 'src')
const distDir = path.join(projectRoot, 'dist')
const configPath = path.join(projectRoot, 'papacore.json')

/**
 * Load and validate the papacore.json configuration
 * @returns {Object} Configuration object with targetVault
 */
function loadConfig() {
  if (!fs.existsSync(configPath)) {
    console.error('Error: papacore.json not found!')
    console.error('Please create a papacore.json file with a "targetVault" property.')
    process.exit(1)
  }

  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))

  if (!config.targetVault) {
    console.error('Error: "targetVault" not specified in papacore.json')
    process.exit(1)
  }

  return config
}

/**
 * Ask user for confirmation before overwriting files
 * @param {string} targetVault - The target vault path
 * @param {string} message - Optional custom message
 * @returns {Promise<boolean>} True if confirmed, false otherwise
 */
function askConfirmation(targetVault, message = null) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    })

    console.log('\n\x1b[31m⚠️  WARNING ⚠️\x1b[0m')
    if (message) {
      console.log(message)
    } else {
      console.log(`This will copy files from ${distDir} to ${targetVault}`)
      console.log('Any matching files in the target directory will be OVERWRITTEN.')
    }
    console.log('This action CANNOT be undone.')
    console.log('')

    rl.question('Do you want to continue? (Y/N): ', (answer) => {
      rl.close()
      const normalized = answer.trim().toUpperCase()
      if (normalized === 'Y' || normalized === 'YES') {
        resolve(true)
      } else {
        resolve(false)
      }
    })
  })
}

/**
 * Copy files/directories recursively
 * @param {string} src - Source path
 * @param {string} dest - Destination path
 */
function copyRecursive(src, dest) {
  const exists = fs.existsSync(src)
  const stats = exists && fs.statSync(src)
  const isDirectory = exists && stats.isDirectory()

  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest)
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursive(path.join(src, childItemName), path.join(dest, childItemName))
    })
  } else {
    fs.copyFileSync(src, dest)
  }
}

/**
 * Ensure a directory exists, creating it if necessary
 * @param {string} dir - Directory path
 */
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

module.exports = {
  projectRoot,
  srcDir,
  distDir,
  configPath,
  loadConfig,
  askConfirmation,
  copyRecursive,
  ensureDir,
}
