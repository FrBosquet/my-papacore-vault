#!/usr/bin/env node

const crypto = require('node:crypto')
const fs = require('node:fs')
const path = require('node:path')

const DATE_ENTRY = /^\[(\d{4}-\d{2}-\d{2})\]\([^)]+\)\s+(#[\w-]+)\s*(.*)$/i
const TAGGED_ENTRY = /^\[[^\]]+\]\([^)]+\)\s+(#[\w-]+)\s*(.*)$/i

// These historic tags cannot be derived reliably from their current note titles.
const GAME_OVERRIDES = {
  'baldurs-gate-3': 'Baldurs Gate III.md',
  'echoes-of-the-eye': 'Outer Wilds Echoes of the Eye.md',
  'gt4-spec-ii': 'Gran Turismo 4 Spec 2.md',
  'i-am-your-beast': 'Im Your Beast.md',
  'no-mans-sky': 'No Mans Sky.md',
  'twinsen-quest': "Twinsen's Little Big Adventure Remastered.md",
}

const normalize = (value) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')

const hash = (value) =>
  crypto.createHash('sha256').update(value).digest('hex').slice(0, 16)

const read = (filePath) => fs.readFileSync(filePath, 'utf8')
const output = (line) => process.stdout.write(`${line}\n`)
const write = (filePath, content) => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, content)
}

const walkMarkdownFiles = (directory) => {
  if (!fs.existsSync(directory)) return []

  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name)
    if (entry.isDirectory()) return walkMarkdownFiles(entryPath)
    return entry.isFile() && entry.name.endsWith('.md') ? [entryPath] : []
  })
}

/**
 * Parses dated legacy game entries. Text following a header belongs to that
 * entry up to the next dated header, including blank lines.
 */
const parseLegacyFile = (content, sourcePath) => {
  const entries = []
  const skipped = []
  let active
  let skippedActive

  const finishActive = () => {
    if (!active) return
    const body = [active.firstLine, ...active.lines].join('\n').trim()
    entries.push({
      date: active.date,
      slug: active.slug,
      body,
      sourcePath,
      fingerprint: hash(
        `${sourcePath}\0${active.date}\0${active.slug}\0${body}`
      ),
    })
    active = undefined
  }

  const finishSkipped = () => {
    if (!skippedActive) return
    skipped.push({
      sourcePath,
      line: skippedActive.line,
      content: [skippedActive.line, ...skippedActive.lines].join('\n').trim(),
      reason: 'Entry has a game tag but no ISO date',
    })
    skippedActive = undefined
  }

  for (const line of content.replace(/\r\n/g, '\n').split('\n')) {
    const datedMatch = line.match(DATE_ENTRY)
    if (datedMatch) {
      finishActive()
      finishSkipped()
      active = {
        date: datedMatch[1],
        slug: datedMatch[2].slice(1),
        firstLine: datedMatch[3],
        lines: [],
      }
      continue
    }

    const taggedMatch = line.match(TAGGED_ENTRY)
    if (taggedMatch) {
      finishActive()
      finishSkipped()
      skippedActive = {
        line,
        lines: [],
      }
      continue
    }

    if (active) active.lines.push(line)
    else if (skippedActive) skippedActive.lines.push(line)
  }

  finishActive()
  finishSkipped()
  return { entries, skipped }
}

const parseLegacyDirectory = (sourceDirectory) =>
  walkMarkdownFiles(sourceDirectory)
    .sort()
    .reduce(
      (result, filePath) => {
        const parsed = parseLegacyFile(read(filePath), filePath)
        result.entries.push(...parsed.entries)
        result.skipped.push(...parsed.skipped)
        return result
      },
      { entries: [], skipped: [] }
    )

const indexGames = (gamesDirectory) => {
  const games = walkMarkdownFiles(gamesDirectory).map((filePath) => ({
    filePath,
    fileName: path.basename(filePath),
    normalizedName: normalize(path.basename(filePath, '.md')),
  }))

  return games
}

const resolveGame = (slug, games) => {
  const override = GAME_OVERRIDES[slug.toLowerCase()]
  if (override) {
    const game = games.find((candidate) => candidate.fileName === override)
    return game
      ? { game }
      : { error: `Override points to missing game note: ${override}` }
  }

  const normalizedSlug = normalize(slug)
  const matches = games.filter(
    (candidate) => candidate.normalizedName === normalizedSlug
  )

  if (matches.length === 1) return { game: matches[0] }
  if (matches.length === 0) return { error: `No game note matches #${slug}` }
  return {
    error: `Ambiguous game tag #${slug}: ${matches
      .map((match) => match.fileName)
      .join(', ')}`,
  }
}

const toSingleParagraph = (text) => text.replace(/\s+/g, ' ').trim()

const formatListItem = (entry, gameRelativePath) => {
  const title = path.basename(gameRelativePath, '.md')
  const link = `[[${gameRelativePath}|${title}]]`
  const text = toSingleParagraph(entry.body)
  return `- ${link}${text ? ` ${text}` : ''}`
}

/**
 * Migrated entries must remain one list item. A line break splits the note
 * into another block, so Datacore no longer connects the full annotation.
 */
const collapseMigratedEntries = (content) => {
  const lines = content.replace(/\r\n/g, '\n').split('\n')
  const output = []
  let changed = 0
  let index = 0

  while (index < lines.length) {
    if (!lines[index].startsWith('- [[Gaming/Games/')) {
      output.push(lines[index])
      index += 1
      continue
    }

    const block = [lines[index]]
    let cursor = index + 1
    while (
      cursor < lines.length &&
      (lines[cursor].trim() === '' || /^\s/.test(lines[cursor]))
    ) {
      block.push(lines[cursor])
      if (/<!-- legacy-gaming-log:[a-f0-9]+ -->/.test(lines[cursor])) break
      cursor += 1
    }

    const commentIndex = block.findIndex((line) =>
      /<!-- legacy-gaming-log:[a-f0-9]+ -->/.test(line)
    )
    if (commentIndex === -1) {
      output.push(lines[index])
      index += 1
      continue
    }

    const paragraph = toSingleParagraph(block.slice(0, commentIndex).join(' '))
    const original = block.slice(0, commentIndex + 1).join('\n')
    if (`${paragraph}\n` !== original) changed += 1
    output.push(paragraph, '')
    index += commentIndex + 1
  }

  return { content: output.join('\n'), changed }
}

const collapseJournalEntries = (journalDirectory) => {
  const changedFiles = []
  let entriesChanged = 0

  for (const filePath of walkMarkdownFiles(journalDirectory)) {
    const original = read(filePath)
    const result = collapseMigratedEntries(original)
    if (result.changed === 0 || result.content === original) continue
    write(filePath, result.content)
    changedFiles.push(filePath)
    entriesChanged += result.changed
  }

  return { changedFiles, entriesChanged }
}

const addEntriesToDaily = (content, entries) => {
  let result = content.replace(/\r\n/g, '\n')
  const logHeading = /^# Logs\s*$/m
  if (!logHeading.test(result)) {
    result = `${result.trimEnd()}\n\n# Logs\n`
  }

  const headingMatch = result.match(logHeading)
  const insertionAt = headingMatch.index + headingMatch[0].length
  const newItems = entries
    .filter((entry) => !result.includes(entry.rendered))
    .map((entry) => entry.rendered)

  if (newItems.length === 0) return { content: result, inserted: 0 }

  const insertion = `\n\n${newItems.join('\n\n')}`
  return {
    content: `${result.slice(0, insertionAt)}${insertion}${result.slice(
      insertionAt
    )}`,
    inserted: newItems.length,
  }
}

const verifyTargets = (entries, journalDirectory) =>
  entries.filter((entry) => {
    const dailyPath = path.join(journalDirectory, `${entry.date}.md`)
    if (!fs.existsSync(dailyPath)) return true
    const occurrences = read(dailyPath).split(entry.rendered).length - 1
    return occurrences !== 1
  })

const parseArguments = (argv) => {
  const options = { apply: false, deleteSource: false }
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index]
    if (argument === '--') continue
    if (argument === '--apply') options.apply = true
    else if (argument === '--collapse-existing') options.collapseExisting = true
    else if (argument === '--delete-source') options.deleteSource = true
    else if (argument.startsWith('--')) {
      const key = argument.slice(2)
      options[key] = argv[index + 1]
      index += 1
    }
  }
  return options
}

const loadConfig = (options, workingDirectory = process.cwd()) => {
  const configuredVault = JSON.parse(
    read(path.join(workingDirectory, 'papacore.json'))
  ).targetVault
  const vault = path.resolve(options.vault || configuredVault)
  return {
    vault,
    sourceDirectory: path.resolve(
      options.source || path.join(vault, 'Gaming log/Past')
    ),
    journalDirectory: path.resolve(
      options.journal || path.join(vault, 'Journal')
    ),
    templatePath: path.resolve(
      options.template || path.join(vault, 'Templates/daily.md')
    ),
    gamesDirectory: path.resolve(
      options.games || path.join(vault, 'Gaming/Games')
    ),
    manifestPath: path.resolve(
      options.manifest ||
        path.join(vault, 'Gaming log/.migration-state/gaming-logs.json')
    ),
    skippedArchivePath: path.resolve(
      options.skippedArchive ||
        path.join(
          vault,
          'Gaming log/.migration-state/unmigrated-undated-entries.md'
        )
    ),
  }
}

const buildMigration = (config) => {
  const parsed = parseLegacyDirectory(config.sourceDirectory)
  const games = indexGames(config.gamesDirectory)
  const errors = []
  const entries = parsed.entries.map((entry) => {
    const resolution = resolveGame(entry.slug, games)
    if (resolution.error) {
      errors.push({ entry, error: resolution.error })
      return entry
    }

    const gameRelativePath = path
      .relative(config.vault, resolution.game.filePath)
      .replaceAll(path.sep, '/')
    return {
      ...entry,
      gameRelativePath,
      rendered: formatListItem(entry, gameRelativePath),
    }
  })

  return { entries, skipped: parsed.skipped, errors }
}

const writeManifest = (manifestPath, migration) => {
  write(
    manifestPath,
    `${JSON.stringify(
      {
        version: 1,
        migratedAt: new Date().toISOString(),
        entries: migration.entries.map(
          ({ sourcePath, date, slug, fingerprint, gameRelativePath }) => ({
            sourcePath,
            date,
            slug,
            fingerprint,
            gameRelativePath,
          })
        ),
        skipped: migration.skipped,
      },
      null,
      2
    )}\n`
  )
}

const writeSkippedArchive = (archivePath, skipped) => {
  if (skipped.length === 0) return
  const sections = skipped.map(
    ({ sourcePath, content }) => `## ${sourcePath}\n\n${content}`
  )
  write(
    archivePath,
    `# Unmigrated undated gaming logs\n\nThese entries have no ISO date, so the migration cannot safely assign them to a daily note.\n\n${sections.join(
      '\n\n'
    )}\n`
  )
}

const runMigration = (options, workingDirectory) => {
  if (options.deleteSource && !options.apply) {
    throw new Error('--delete-source requires --apply')
  }

  const config = loadConfig(options, workingDirectory)
  const migration = buildMigration(config)
  if (migration.errors.length > 0) {
    return { ...migration, config, applied: false, reason: 'unresolved-games' }
  }

  const byDate = migration.entries.reduce((groups, entry) => {
    const group = groups.get(entry.date) || []
    group.push(entry)
    groups.set(entry.date, group)
    return groups
  }, new Map())
  const plannedDailyNotes = [...byDate.keys()].filter(
    (date) => !fs.existsSync(path.join(config.journalDirectory, `${date}.md`))
  )
  const result = {
    ...migration,
    config,
    plannedDailyNotes,
    applied: Boolean(options.apply),
    inserted: 0,
    deletedSources: 0,
  }

  if (!options.apply) return result

  const template = read(config.templatePath)
  for (const [date, entries] of byDate) {
    const dailyPath = path.join(config.journalDirectory, `${date}.md`)
    const current = fs.existsSync(dailyPath) ? read(dailyPath) : template
    const update = addEntriesToDaily(current, entries)
    write(dailyPath, update.content)
    result.inserted += update.inserted
  }

  const failures = verifyTargets(migration.entries, config.journalDirectory)
  if (failures.length > 0) {
    throw new Error(
      `Post-write verification failed for ${failures.length} migrated entries`
    )
  }

  writeManifest(config.manifestPath, migration)
  writeSkippedArchive(config.skippedArchivePath, migration.skipped)

  if (options.deleteSource) {
    for (const sourcePath of walkMarkdownFiles(config.sourceDirectory)) {
      fs.unlinkSync(sourcePath)
      result.deletedSources += 1
    }
  }

  return result
}

const printReport = (result) => {
  output(`Legacy dated entries: ${result.entries.length}`)
  output(`Unresolved game mappings: ${result.errors.length}`)
  output(`Skipped undated entries: ${result.skipped.length}`)
  output(`Daily notes to create: ${result.plannedDailyNotes?.length ?? 0}`)
  if (result.applied) {
    output(`Inserted entries: ${result.inserted}`)
    output(`Deleted weekly source notes: ${result.deletedSources}`)
    output(`Manifest: ${result.config.manifestPath}`)
  } else {
    output('Dry run only. Re-run with --apply to write changes.')
  }
  for (const problem of result.errors) {
    output(`${problem.entry.sourcePath}: ${problem.error}`)
  }
  for (const skipped of result.skipped) {
    output(`${skipped.sourcePath}: ${skipped.reason}: ${skipped.line}`)
  }
}

if (require.main === module) {
  try {
    const options = parseArguments(process.argv.slice(2))
    if (options.collapseExisting) {
      const config = loadConfig(options)
      const result = collapseJournalEntries(config.journalDirectory)
      output(`Collapsed entries: ${result.entriesChanged}`)
      output(`Updated daily notes: ${result.changedFiles.length}`)
      for (const filePath of result.changedFiles) output(filePath)
    } else {
      printReport(runMigration(options))
    }
  } catch (error) {
    process.stderr.write(`${error.message}\n`)
    process.exitCode = 1
  }
}

module.exports = {
  addEntriesToDaily,
  buildMigration,
  collapseMigratedEntries,
  formatListItem,
  parseArguments,
  parseLegacyFile,
  resolveGame,
  runMigration,
}
