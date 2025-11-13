/** biome-ignore-all lint/suspicious/noConsole: build script, we need logging here */
const { transformFileSync } = require('@babel/core')
const { execSync } = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')
const { projectRoot, srcDir, distDir, loadConfig, askConfirmation, ensureDir } = require('./utils')

// Import scan functions from scan-vault-lib
const { updateDepsJson } = require('./scan-vault-lib')

// Check if watch mode and install mode are enabled
const isWatchMode = process.argv.includes('--watch')
const isInstallMode = process.argv.includes('--install')

// Load babel config
const babelConfig = require(path.join(projectRoot, 'babel.config.js'))

// Load target vault config if install mode is enabled
let targetVault = null
if (isInstallMode) {
  const config = loadConfig()
  targetVault = config.targetVault
}

function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir)

  files.forEach((file) => {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)

    if (stat.isDirectory()) {
      getAllFiles(filePath, fileList)
    } else if (/\.(ts|tsx)$/.test(file) && !/\.d\.ts$/.test(file)) {
      fileList.push(filePath)
    }
  })

  return fileList
}

// Function to copy a single file to the vault
function copyToVault(distFilePath) {
  if (!targetVault) return

  const relativePath = path.relative(distDir, distFilePath)
  const targetPath = path.join(targetVault, relativePath)

  // Ensure target directory exists
  ensureDir(path.dirname(targetPath))

  // Copy the file
  fs.copyFileSync(distFilePath, targetPath)
}

/**
 * Recursively find all views that depend on a given file
 */
function findAffectedViews(filePath, graph, visited = new Set()) {
  const affectedViews = new Set()

  // Prevent infinite loops
  if (visited.has(filePath)) return affectedViews
  visited.add(filePath)

  // If this is a view, add it
  if (filePath.startsWith('Datacore/views/')) {
    affectedViews.add(filePath)
  }

  // Find all files that depend on this file
  const dependents = graph[filePath] || []

  // Recursively check each dependent
  for (const dependent of dependents) {
    const childViews = findAffectedViews(dependent, graph, visited)
    for (const view of childViews) {
      affectedViews.add(view)
    }
  }

  return affectedViews
}

// Function to touch dependent vault files to trigger Obsidian reload
function touchDependentFiles(outPath) {
  if (!targetVault) return

  const relativePath = path.relative(distDir, outPath)

  // Load deps.json if it exists
  const depsPath = path.join(projectRoot, 'deps.json')
  if (!fs.existsSync(depsPath)) return

  try {
    const deps = JSON.parse(fs.readFileSync(depsPath, 'utf-8'))

    // Recursively find all views affected by this file change
    const affectedViews = findAffectedViews(relativePath, deps.graph || {})

    // Collect all vault files that use these affected views
    const vaultFilesToTouch = new Set()
    for (const viewPath of affectedViews) {
      const vaultFiles = deps.views?.[viewPath] || []
      for (const file of vaultFiles) {
        vaultFilesToTouch.add(file)
      }
    }

    if (vaultFilesToTouch.size > 0) {
      console.log(`Triggering reload for ${vaultFilesToTouch.size} dependent file(s)...`)
      if (affectedViews.size > 0) {
        console.log(`  Affected views: ${Array.from(affectedViews).join(', ')}`)
      }

      vaultFilesToTouch.forEach((file) => {
        const fullPath = path.join(targetVault, file)
        if (fs.existsSync(fullPath)) {
          const content = fs.readFileSync(fullPath, 'utf-8')

          // Find and update timestamp comment in datacorejsx blocks
          const timestamp = Date.now()
          const timestampComment = `// Papacore build ${timestamp}`

          // Match datacorejsx blocks and add/update timestamp at the top
          const updatedContent = content.replace(
            /(```datacorejsx\n)(\/\/ Papacore build [^\n]+\n)?([\s\S]*?\n```)/g,
            `$1${timestampComment}\n$3`
          )

          // Write the updated content
          fs.writeFileSync(fullPath, updatedContent)
          console.log(`  Reloaded: ${file}`)
        }
      })
    }
  } catch (error) {
    console.error('Error touching dependent files:', error.message)
  }
}

// Function to update deps.json
function updateDeps() {
  if (!targetVault) return

  try {
    const deps = updateDepsJson(targetVault, { verbose: false })
    if (deps) {
      const outputPath = path.join(projectRoot, 'deps.json')
      fs.writeFileSync(outputPath, JSON.stringify(deps, null, 2))
      console.log('Updated deps.json')
    }
  } catch (error) {
    console.error('Error updating deps.json:', error.message)
  }
}

// Function to build Tailwind CSS
function buildCSS() {
  console.log('Building CSS...')
  try {
    execSync('pnpm run build:css', { stdio: 'inherit', cwd: projectRoot })
    console.log('CSS built successfully!')

    // Copy CSS to vault .obsidian/snippets if install mode is enabled
    if (isInstallMode && targetVault) {
      const cssPath = path.join(distDir, 'styles.css')
      if (fs.existsSync(cssPath)) {
        const snippetsDir = path.join(targetVault, '.obsidian', 'snippets')
        ensureDir(snippetsDir)
        const targetPath = path.join(snippetsDir, 'papacore.css')
        fs.copyFileSync(cssPath, targetPath)
        console.log('CSS copied to .obsidian/snippets/papacore.css')
      }
    }
  } catch (error) {
    console.error('Error building CSS:', error.message)
  }
}

function compileFile(filePath) {
  const relativePath = path.relative(srcDir, filePath)
  const ext = path.extname(filePath)

  // Check if this is a .stories.tsx file
  const isStoryFile = filePath.includes('.stories.tsx')

  // Determine output extension
  let outExt
  if (ext === '.tsx') {
    outExt = '.jsx'
  } else if (ext === '.ts') {
    outExt = '.js'
  } else {
    return // Skip other files
  }

  const outPath = path.join(distDir, relativePath.replace(/\.(ts|tsx)$/, outExt))

  // Ensure output directory exists
  ensureDir(path.dirname(outPath))

  try {
    // Transform the file
    const result = transformFileSync(filePath, {
      ...babelConfig,
      filename: filePath,
    })

    // Write output
    fs.writeFileSync(outPath, result.code)
    console.log(`Compiled: ${relativePath}`)

    // If this is a story file, create a corresponding .md file
    if (isStoryFile) {
      const mdPath = outPath.replace(/\.jsx$/, '.md')

      // Extract the export name from the compiled file
      const exportMatch = result.code.match(/return\s*\{\s*(\w+)\s*\}/)
      const exportName = exportMatch ? exportMatch[1] : 'default'

      // Get the relative path from dist root for the import
      const importPath = path.relative(distDir, outPath).replace(/\\/g, '/')

      // Generate the markdown content with datacorejsx code block
      const timestamp = Date.now()
      const mdContent = `
      
\`\`\`datacorejsx
// Papacore build ${timestamp}
const { ${exportName} } = await dc.require('${importPath}');

return <${exportName} />
\`\`\`
`
      fs.writeFileSync(mdPath, mdContent)
      console.log(`Created story markdown: ${path.relative(distDir, mdPath)}`)

      // Copy markdown to vault if install mode is enabled
      if (isInstallMode) {
        copyToVault(mdPath)
      }
    }

    // Copy to vault if install mode is enabled
    if (isInstallMode) {
      copyToVault(outPath)
      console.log(`Installed: ${relativePath}`)

      // Touch dependent vault files to trigger Obsidian reload
      touchDependentFiles(outPath)
    }
  } catch (error) {
    console.error(`Error compiling ${relativePath}:`, error.message)
  }
}

function build() {
  // Clean dist directory
  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true })
  }
  ensureDir(distDir)

  // Get all source files
  const files = getAllFiles(srcDir)

  console.log('Building...')
  files.forEach(compileFile)

  // Build CSS
  buildCSS()

  // Update dependency graph
  if (isInstallMode) {
    updateDeps()
  }

  console.log('\nBuild completed successfully!')
}

function watch() {
  console.log('Building initial files...')
  build()

  console.log(`\nWatching for changes in ${srcDir}...`)

  // Keep track of previously compiled files
  let compiledFiles = new Set(getAllFiles(srcDir))

  fs.watch(srcDir, { recursive: true }, (_eventType, filename) => {
    if (!filename) return

    const filePath = path.join(srcDir, filename)

    // Only recompile .ts and .tsx files (exclude .d.ts files)
    if (/\.(ts|tsx)$/.test(filePath) && !/\.d\.ts$/.test(filePath) && fs.existsSync(filePath)) {
      console.log(`\nFile changed: ${filename}`)

      // Rescan directory to find any new files
      const currentFiles = new Set(getAllFiles(srcDir))
      const newFiles = [...currentFiles].filter(f => !compiledFiles.has(f))

      // Compile the changed file
      compileFile(filePath)

      // Compile any newly discovered files
      if (newFiles.length > 0) {
        console.log(`\nFound ${newFiles.length} new file(s):`)
        newFiles.forEach(newFile => {
          const relPath = path.relative(srcDir, newFile)
          console.log(`  - ${relPath}`)
          compileFile(newFile)
        })
      }

      // Update the compiled files set
      compiledFiles = currentFiles

      // Rebuild CSS since Tailwind classes might have changed
      buildCSS()

      // Update dependency graph in install mode
      if (isInstallMode) {
        updateDeps()
      }
    }

    // Rebuild CSS if styles.css changes
    if (filename === 'styles.css') {
      console.log('\nCSS file changed')
      buildCSS()
    }
  })
}

async function main() {
  // Ask for confirmation if install mode is enabled
  if (isInstallMode) {
    const message = `Files will be automatically copied to ${targetVault}\nAny matching files in the target directory will be OVERWRITTEN.`
    const confirmed = await askConfirmation(targetVault, message)

    if (!confirmed) {
      console.log('\nBuild cancelled.')
      process.exit(0)
    }

    // Create target vault directory if it doesn't exist
    if (!fs.existsSync(targetVault)) {
      console.log(`\nCreating target directory: ${targetVault}`)
      fs.mkdirSync(targetVault, { recursive: true })
    }
  }

  // Run watch or build
  if (isWatchMode || isInstallMode) {
    watch()
  } else {
    build()
  }
}

main()
