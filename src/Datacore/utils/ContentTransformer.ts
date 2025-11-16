/**
 * ContentTransformer - Parse and transform multiline markdown content
 *
 * This class allows build-time manipulation of markdown files,
 * including frontmatter updates and section-based content insertion.
 */
export class ContentTransformer {
  private lines: string[]

  constructor(content?: string) {
    this.lines = content ? content.split('\n') : []
  }

  static async fromTemplate(templateName: string) {
    const templateFile = dc.app.vault.getFileByPath(`Templates/${templateName}.md`)

    if (!templateFile) {
      return null
    }

    try {
      const content = await dc.app.vault.read(templateFile)
      return new ContentTransformer(content)
    } catch (error) {
      alert(
        `Error getting template: ${error instanceof Error ? error.message : error}`
      )
      return null
    }
  }

  /**
   * Set or update a frontmatter property
   *
   * @param key - The frontmatter key to set
   * @param value - The value to set (string, number, boolean, or object)
   * @returns this for chaining
   */
  setFrontmatter(key: string, value: string | number | boolean | object | null): this {
    const { start, end } = this.findFrontmatterBounds()

    if (start === -1) {
      // No frontmatter exists, create it
      this.createFrontmatter(key, value)
    } else {
      // Frontmatter exists, update or insert the key
      this.updateFrontmatterKey(start, end, key, value)
    }

    return this
  }

  /**
   * Insert content at the end of a specific section
   *
   * @param sectionTitle - The heading text to find (without # symbols)
   * @param content - The content to insert
   * @param createIfMissing - Create the section if it doesn't exist (default: true)
   * @returns this for chaining
   */
  insertInSection(sectionTitle: string, content: string, createIfMissing = true): this {
    const sectionIndex = this.findSectionIndex(sectionTitle)

    if (sectionIndex === -1) {
      if (createIfMissing) {
        // Section doesn't exist, create it at the end
        this.lines.push('', `## ${sectionTitle}`, '', content)
      }
    } else {
      // Find the end of this section (next heading or end of file)
      const insertIndex = this.findSectionEnd(sectionIndex)
      this.lines.splice(insertIndex, 0, content)
    }

    return this
  }

  /**
   * Get the transformed content as a string
   */
  toString(): string {
    return this.lines.join('\n')
  }

  // Private helper methods

  private findFrontmatterBounds(): { start: number; end: number } {
    if (this.lines[0]?.trim() !== '---') {
      return { start: -1, end: -1 }
    }

    for (let i = 1; i < this.lines.length; i++) {
      if (this.lines[i]?.trim() === '---') {
        return { start: 0, end: i }
      }
    }

    return { start: -1, end: -1 }
  }

  private createFrontmatter(key: string, value: string | number | boolean | object | null): void {
    const newFrontmatter = ['---']

    if (Array.isArray(value)) {
      newFrontmatter.push(`${key}:`)
      for (const item of value) {
        newFrontmatter.push(`  - "${item}"`)
      }
    } else {
      const formattedValue = this.formatYamlValue(value)
      newFrontmatter.push(`${key}: ${formattedValue}`)
    }

    newFrontmatter.push('---', '')

    this.lines.unshift(...newFrontmatter)
  }

  private updateFrontmatterKey(
    start: number,
    end: number,
    key: string,
    value: string | number | boolean | object | null
  ): void {
    // Look for existing key
    for (let i = start + 1; i < end; i++) {
      const line = this.lines[i] ?? ''
      const match = line.match(/^(\s*)([^:]+):\s*(.*)$/)

      if (match && match[2]?.trim() === key) {
        // Key exists, remove it (and any array items that follow)
        const linesToRemove = this.countLinesToRemove(i, end)
        this.lines.splice(i, linesToRemove)
        end -= linesToRemove - 1

        if (value === null) {
          return
        }

        // Insert new value at the same position
        const indent = match[1] ?? ''
        this.insertFormattedValue(i, key, value, indent)
        return
      }
    }

    // Key doesn't exist, add it before the closing ---
    if (value !== null) {
      this.insertFormattedValue(end, key, value, '')
    }
  }

  private countLinesToRemove(startIndex: number, endIndex: number): number {
    let count = 1
    // Check if next lines are array items (start with whitespace + dash)
    for (let i = startIndex + 1; i < endIndex; i++) {
      const line = this.lines[i] ?? ''
      if (line.match(/^\s+-\s/)) {
        count++
      } else {
        break
      }
    }
    return count
  }

  private insertFormattedValue(
    index: number,
    key: string,
    value: string | number | boolean | object | null,
    indent: string
  ): void {
    if (Array.isArray(value)) {
      // Multi-line array format
      const lines = [`${indent}${key}:`]
      for (const item of value) {
        lines.push(`${indent}  - "${item}"`)
      }
      this.lines.splice(index, 0, ...lines)
    } else {
      const formattedValue = this.formatYamlValue(value)
      this.lines.splice(index, 0, `${indent}${key}: ${formattedValue}`)
    }
  }

  private formatYamlValue(value: string | number | boolean | object | null): string {
    if (value === null) {
      return 'null'
    }

    if (typeof value === 'string') {
      // Quote strings that contain special characters
      if (value.includes(':') || value.includes('#') || value.includes('\n')) {
        return `"${value.replace(/"/g, '\\"')}"`
      }
      return value
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value)
    }

    if (typeof value === 'object') {
      return JSON.stringify(value)
    }

    return String(value)
  }

  private findSectionIndex(sectionTitle: string): number {
    const normalizedTitle = sectionTitle.trim().toLowerCase()

    for (let i = 0; i < this.lines.length; i++) {
      const line = this.lines[i] ?? ''
      const match = line.match(/^(#{1,6})\s+(.+)$/)

      if (match && match[2]?.trim().toLowerCase() === normalizedTitle) {
        return i
      }
    }

    return -1
  }

  private findSectionEnd(sectionIndex: number): number {
    const sectionLine = this.lines[sectionIndex] ?? ''
    const sectionLevel = sectionLine.match(/^(#{1,6})/)?.[1]?.length ?? 2

    // Find the next heading of equal or higher level (fewer # symbols)
    for (let i = sectionIndex + 1; i < this.lines.length; i++) {
      const line = this.lines[i] ?? ''
      const match = line.match(/^(#{1,6})\s/)

      if (match) {
        const level = match[1]?.length ?? 6
        if (level <= sectionLevel) {
          // Insert before this heading
          return i
        }
      }
    }

    // No next section found, insert at end
    return this.lines.length
  }
}
