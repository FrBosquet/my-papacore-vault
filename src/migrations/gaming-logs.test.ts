import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const {
  addEntriesToDaily,
  collapseMigratedEntries,
  formatListItem,
  parseArguments,
  parseLegacyFile,
  runMigration,
} = require('../../scripts/migrate-gaming-logs.js')

const makeWorkspace = () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'gaming-log-migration-'))
  const vault = path.join(root, 'vault')
  fs.mkdirSync(path.join(vault, 'Gaming log/Past'), { recursive: true })
  fs.mkdirSync(path.join(vault, 'Gaming/Games'), { recursive: true })
  fs.mkdirSync(path.join(vault, 'Templates'), { recursive: true })
  fs.writeFileSync(
    path.join(root, 'papacore.json'),
    JSON.stringify({ targetVault: vault })
  )
  fs.writeFileSync(
    path.join(vault, 'Templates/daily.md'),
    '---\n---\n\n# Logs\n'
  )
  fs.writeFileSync(path.join(vault, 'Gaming/Games/Dredge.md'), '---\n---\n')
  return { root, vault }
}

describe('legacy gaming log migration', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('parses multiline dated entries and reports undated tagged entries', () => {
    const parsed = parseLegacyFile(
      [
        '[2025-01-19](2025-01-19) #dredge Started fishing',
        '',
        'Next: improve the boat.',
        '[2025 Week 3](2025%20Week%203.md) #dredge A weekly-only entry',
        '[2025-01-20](2025-01-20) #dredge Finished a quest',
      ].join('\n'),
      '/vault/Gaming log/Past/2025 Week 3.md'
    )

    expect(parsed.entries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          date: '2025-01-19',
          slug: 'dredge',
          body: 'Started fishing\n\nNext: improve the boat.',
        }),
        expect.objectContaining({
          date: '2025-01-20',
          body: 'Finished a quest',
        }),
      ])
    )
    expect(parsed.skipped).toEqual([
      expect.objectContaining({
        content:
          '[2025 Week 3](2025%20Week%203.md) #dredge A weekly-only entry',
        reason: 'Entry has a game tag but no ISO date',
      }),
    ])
  })

  it('accepts pnpm’s argument separator before migration flags', () => {
    expect(parseArguments(['--', '--apply', '--delete-source'])).toEqual({
      apply: true,
      deleteSource: true,
    })
  })

  it('keeps a multiline annotation in one list-item paragraph', () => {
    const rendered = formatListItem(
      {
        body: 'First paragraph.\n\nNext, continue the session.',
        fingerprint: 'abc123',
      },
      'Gaming/Games/Dredge.md'
    )

    expect(rendered).toBe(
      '- [[Gaming/Games/Dredge.md|Dredge]] First paragraph. Next, continue the session.'
    )
  })

  it('collapses line breaks already written into daily notes', () => {
    const result = collapseMigratedEntries(
      [
        '# Logs',
        '',
        '- [[Gaming/Games/Dredge.md|Dredge]] First paragraph.',
        '  ',
        '  Next, continue.',
        '  <!-- legacy-gaming-log:abc123 -->',
        '- [RSVP](RSVP.md) Existing log',
        '  stays untouched',
      ].join('\n')
    )

    expect(result.changed).toBe(1)
    expect(result.content).toBe(
      [
        '# Logs',
        '',
        '- [[Gaming/Games/Dredge.md|Dredge]] First paragraph. Next, continue.',
        '',
        '- [RSVP](RSVP.md) Existing log',
        '  stays untouched',
      ].join('\n')
    )
  })

  it('adds only new fingerprinted entries below Logs', () => {
    const entry = {
      fingerprint: 'abc123',
      rendered: '- [[Gaming/Games/Dredge.md|Dredge]] Started fishing',
    }
    const first = addEntriesToDaily('---\n---\n\n# Logs\n\n- existing', [entry])
    const second = addEntriesToDaily(first.content, [entry])

    expect(first.inserted).toBe(1)
    expect(second.inserted).toBe(0)
    expect(second.content).toMatch(
      /# Logs\s+- \[\[Gaming\/Games\/Dredge\.md\|Dredge\]\] Started fishing/
    )
  })

  it('creates missing daily notes, writes canonical game links, and is idempotent', () => {
    const { root, vault } = makeWorkspace()
    const source = path.join(vault, 'Gaming log/Past/2025 Week 3.md')
    fs.writeFileSync(
      source,
      [
        '[2025 Week 3](2025%20Week%203.md) #dredge An undated entry',
        'Keep this text for manual recovery.',
        '[2025-01-19](2025-01-19) #dredge Reached the second town',
      ].join('\n')
    )

    const first = runMigration({ apply: true }, root)
    const dailyPath = path.join(vault, 'Journal/2025-01-19.md')
    const content = fs.readFileSync(dailyPath, 'utf8')
    const second = runMigration({ apply: true }, root)

    expect(first.inserted).toBe(1)
    expect(content).toContain(
      '[[Gaming/Games/Dredge.md|Dredge]] Reached the second town'
    )
    expect(second.inserted).toBe(0)
    expect(fs.readFileSync(dailyPath, 'utf8')).not.toContain(
      'legacy-gaming-log:'
    )
    expect(
      fs.readFileSync(dailyPath, 'utf8').match(/Reached the second town/g)
    ).toHaveLength(1)
    expect(
      fs.readFileSync(
        path.join(
          vault,
          'Gaming log/.migration-state/unmigrated-undated-entries.md'
        ),
        'utf8'
      )
    ).toContain('Keep this text for manual recovery.')
    fs.rmSync(root, { recursive: true, force: true })
  })

  it('refuses source deletion unless apply succeeds', () => {
    const { root, vault } = makeWorkspace()
    const source = path.join(vault, 'Gaming log/Past/2025 Week 3.md')
    fs.writeFileSync(
      source,
      '[2025-01-19](2025-01-19) #dredge Reached the second town\n'
    )

    expect(() => runMigration({ deleteSource: true }, root)).toThrow(
      '--delete-source requires --apply'
    )
    expect(fs.existsSync(source)).toBe(true)

    const result = runMigration({ apply: true, deleteSource: true }, root)
    expect(result.deletedSources).toBe(1)
    expect(fs.existsSync(source)).toBe(false)
    fs.rmSync(root, { recursive: true, force: true })
  })
})
