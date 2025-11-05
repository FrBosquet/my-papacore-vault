/** biome-ignore-all lint/suspicious/noConsole: build script, we need logging here */
const fs = require('node:fs')
const path = require('node:path')
const { loadConfig } = require('./utils')
const { getViewComponents, scanAllDependencies, scanVault } = require('./scan-vault-lib')

function main() {
  // Get all view components from src
  const viewComponents = getViewComponents()

  if (viewComponents.length === 0) {
    console.log('No view components found in src/Datacore/views/')
    process.exit(0)
  }

  console.log(`Found ${viewComponents.length} view component(s):`)
  viewComponents.forEach((component) => {
    console.log(`  - ${component}`)
  })

  // Scan ALL internal file dependencies
  console.log('\nScanning all internal dependencies...')
  const dependencyGraph = scanAllDependencies()

  console.log(`Found ${Object.keys(dependencyGraph).length} files with dependencies`)

  // Load config to get vault path
  const config = loadConfig()
  const vaultPath = config.targetVault

  if (!vaultPath) {
    console.error('Error: targetVault not configured in papacore.json')
    process.exit(1)
  }

  if (!fs.existsSync(vaultPath)) {
    console.error(`Error: Vault path does not exist: ${vaultPath}`)
    process.exit(1)
  }

  console.log(`\nScanning vault: ${vaultPath}`)
  const viewToVaultFiles = scanVault(vaultPath, viewComponents)

  // Combine into structured deps.json
  const deps = {
    graph: dependencyGraph,
    views: viewToVaultFiles,
  }

  // Write to deps.json
  const outputPath = path.join(__dirname, '..', 'deps.json')
  fs.writeFileSync(outputPath, JSON.stringify(deps, null, 2))

  console.log(`\nDependency scan complete!`)
  console.log(`Results written to: deps.json\n`)

  console.log('Sample dependencies:')
  Object.entries(dependencyGraph).slice(0, 5).forEach(([file, dependents]) => {
    console.log(`  ${file} → used by ${dependents.join(', ')}`)
  })

  console.log('\nViews → Vault files:')
  Object.entries(viewToVaultFiles).forEach(([component, files]) => {
    console.log(`  ${component}: ${files.length} file(s)`)
    if (files.length > 0) {
      files.forEach((file) => {
        console.log(`    - ${file}`)
      })
    }
  })
}

main()
