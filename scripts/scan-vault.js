const { execSync } = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')
const { loadConfig, srcDir, distDir } = require('./utils')

/**
 * Get all view component files and map them to their output paths
 */
function getViewComponents() {
  const viewsDir = path.join(srcDir, 'Datacore', 'views')

  if (!fs.existsSync(viewsDir)) {
    console.error('Error: Views directory not found:', viewsDir)
    return []
  }

  const files = fs.readdirSync(viewsDir)
  const components = []

  files.forEach((file) => {
    if (/\.(ts|tsx)$/.test(file) && !/\.d\.ts$/.test(file)) {
      // Map to output path: .tsx -> .jsx, .ts -> .js
      const outputFile = file.replace(/\.tsx$/, '.jsx').replace(/\.ts$/, '.js')
      const outputPath = `Datacore/views/${outputFile}`
      components.push(outputPath)
    }
  })

  return components
}

/**
 * Get all compiled files in dist/Datacore/
 */
function getAllCompiledFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir)

  files.forEach((file) => {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)

    if (stat.isDirectory()) {
      getAllCompiledFiles(filePath, fileList)
    } else if (/\.(js|jsx)$/.test(file)) {
      const relativePath = path.relative(distDir, filePath)
      fileList.push(relativePath)
    }
  })

  return fileList
}

/**
 * Scan ALL internal file dependencies by reading dc.require() calls in dist files
 * Returns a map of: file -> array of files that depend on it
 */
function scanAllDependencies() {
  const datacoreDir = path.join(distDir, 'Datacore')

  if (!fs.existsSync(datacoreDir)) {
    console.error('Error: Datacore dist directory not found:', datacoreDir)
    return {}
  }

  const allFiles = getAllCompiledFiles(datacoreDir)
  const dependencyGraph = {}

  allFiles.forEach((filePath) => {
    const fullPath = path.join(distDir, filePath)
    const content = fs.readFileSync(fullPath, 'utf-8')

    // Find all dc.require() calls
    const requirePattern = /dc\.require\(["'`]([^"'`]+)["'`]\)/g
    const matches = content.matchAll(requirePattern)

    for (const match of matches) {
      const requiredFile = match[1]

      // Only track internal dependencies (Datacore files)
      if (requiredFile.startsWith('Datacore/')) {
        if (!dependencyGraph[requiredFile]) {
          dependencyGraph[requiredFile] = []
        }
        if (!dependencyGraph[requiredFile].includes(filePath)) {
          dependencyGraph[requiredFile].push(filePath)
        }
      }
    }
  })

  // Sort arrays for consistent output
  Object.keys(dependencyGraph).forEach((key) => {
    dependencyGraph[key].sort()
  })

  return dependencyGraph
}

function scanVault(vaultPath, viewComponents) {
  // Use grep to find all dc.require() calls in .md files
  try {
    // Get all matches with filenames and line numbers
    const grepWithFiles = execSync(
      'grep -rnE "dc\\.require\\(" --include="*.md" "' + vaultPath + '"',
      { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 }
    )

    const deps = {}

    // Initialize deps for all view components
    viewComponents.forEach((component) => {
      deps[component] = []
    })

    // Parse the output: format is "filepath:line:content"
    grepWithFiles.split('\n').forEach((line) => {
      if (!line) return

      const match = line.match(/^(.+):(\d+):.*dc\.require\(["'`]([^"'`]+)["`']/)
      if (match) {
        const [, filepath, , componentPath] = match

        // Only track if it's one of our view components
        if (viewComponents.includes(componentPath)) {
          const relativeFilePath = path.relative(vaultPath, filepath)
          if (!deps[componentPath].includes(relativeFilePath)) {
            deps[componentPath].push(relativeFilePath)
          }
        }
      }
    })

    // Sort arrays for consistent output
    Object.keys(deps).forEach((key) => {
      deps[key].sort()
    })

    return deps
  } catch (error) {
    // grep returns exit code 1 if no matches found
    if (error.status === 1) {
      // Return empty arrays for all components
      const deps = {}
      viewComponents.forEach((component) => {
        deps[component] = []
      })
      return deps
    }
    throw error
  }
}

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
