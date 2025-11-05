/** biome-ignore-all lint/suspicious/noConsole: build script, we need logging here */
const { execSync } = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')
const { srcDir, distDir } = require('./utils')

/**
 * Get all view component files and map them to their output paths
 */
function getViewComponents() {
  const viewsDir = path.join(srcDir, 'Datacore', 'views')

  if (!fs.existsSync(viewsDir)) {
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
  if (!fs.existsSync(dir)) {
    return fileList
  }

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

/**
 * Run a full scan and update deps.json
 */
function updateDepsJson(vaultPath, options = {}) {
  const { verbose = false } = options

  // Get all view components from src
  const viewComponents = getViewComponents()

  if (viewComponents.length === 0 && verbose) {
    console.log('No view components found')
    return null
  }

  // Scan ALL internal file dependencies
  const dependencyGraph = scanAllDependencies()

  if (!vaultPath) {
    if (verbose) {
      console.error('Error: vaultPath not provided')
    }
    return null
  }

  if (!fs.existsSync(vaultPath)) {
    if (verbose) {
      console.error(`Error: Vault path does not exist: ${vaultPath}`)
    }
    return null
  }

  const viewToVaultFiles = scanVault(vaultPath, viewComponents)

  // Combine into structured deps.json
  const deps = {
    graph: dependencyGraph,
    views: viewToVaultFiles,
  }

  return deps
}

module.exports = {
  getViewComponents,
  getAllCompiledFiles,
  scanAllDependencies,
  scanVault,
  updateDepsJson,
}
