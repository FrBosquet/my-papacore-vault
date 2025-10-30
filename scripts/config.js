const fs = require('node:fs')
const path = require('node:path')
const readline = require('node:readline')
const { configPath } = require('./utils')

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim())
    })
  })
}

async function configure() {
  console.log('\n🔧 Papacore Configuration\n')
  console.log('This wizard will help you set up Papacore for your Datacore vault.\n')

  // Check if config already exists
  let existingConfig = null
  if (fs.existsSync(configPath)) {
    existingConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'))
    console.log(`Current vault location: ${existingConfig.targetVault}\n`)
  }

  // Ask for vault location
  const defaultPath = existingConfig?.targetVault || ''
  const promptMessage = defaultPath
    ? `Enter the path to your Datacore vault (or press Enter to keep current): `
    : `Enter the path to your Datacore vault: `

  const vaultPath = await askQuestion(promptMessage)

  rl.close()

  // Use existing path if user just pressed Enter
  const finalPath = vaultPath || defaultPath

  if (!finalPath) {
    console.error('\nError: No vault path provided!')
    process.exit(1)
  }

  // Expand ~ to home directory if present
  const expandedPath = finalPath.startsWith('~')
    ? path.join(require('node:os').homedir(), finalPath.slice(1))
    : finalPath

  // Resolve to absolute path
  const absolutePath = path.resolve(expandedPath)

  // Check if the path exists
  if (!fs.existsSync(absolutePath)) {
    console.log(`\n⚠️  Warning: The path "${absolutePath}" does not exist.`)
    console.log(
      'The directory will be created when you run "pnpm run install" or "pnpm run dev".\n'
    )
  }

  // Create config object
  const config = {
    targetVault: absolutePath,
  }

  // Write config to file
  fs.writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`)

  console.log('\n✅ Configuration saved successfully!')
  console.log(`Vault location: ${absolutePath}`)
  console.log(`Config file: ${configPath}\n`)
  console.log('You can now run:')
  console.log('  - "pnpm run build" to compile your files')
  console.log('  - "pnpm run dev" to compile and auto-install to your vault')
  console.log('  - "pnpm run install" to copy built files to your vault\n')
}

configure()
