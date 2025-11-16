import { ContentTransformer } from './ContentTransformer'

describe('ContentTransformer', () => {
  describe('constructor', () => {
    it('should create instance with empty content array when no content provided', () => {
      const transformer = new ContentTransformer()
      expect(transformer.toString()).toBe('')
    })

    it('should create instance with parsed content when content provided', () => {
      const content = 'Line 1\nLine 2\nLine 3'
      const transformer = new ContentTransformer(content)
      expect(transformer.toString()).toBe(content)
    })
  })

  describe('setFrontmatter', () => {
    it('should create frontmatter when none exists', () => {
      const transformer = new ContentTransformer('Some content')
      transformer.setFrontmatter('title', 'My Title')

      const result = transformer.toString()
      expect(result).toContain('---')
      expect(result).toContain('title: My Title')
    })

    it('should update existing frontmatter key', () => {
      const content = `---
title: Old Title
author: John
---

Content here`

      const transformer = new ContentTransformer(content)
      transformer.setFrontmatter('title', 'New Title')

      const result = transformer.toString()
      expect(result).toContain('title: New Title')
      expect(result).not.toContain('Old Title')
      expect(result).toContain('author: John')
    })

    it('should add new frontmatter key to existing frontmatter', () => {
      const content = `---
title: My Title
---

Content`

      const transformer = new ContentTransformer(content)
      transformer.setFrontmatter('author', 'Jane Doe')

      const result = transformer.toString()
      expect(result).toContain('title: My Title')
      expect(result).toContain('author: Jane Doe')
    })

    it('should handle array values', () => {
      const transformer = new ContentTransformer()
      transformer.setFrontmatter('tags', ['tag1', 'tag2', 'tag3'])

      const result = transformer.toString()
      expect(result).toContain('tags:')
      expect(result).toContain('  - "tag1"')
      expect(result).toContain('  - "tag2"')
      expect(result).toContain('  - "tag3"')
    })

    it('should handle array values modification', () => {
      const transformer = new ContentTransformer()
      transformer.setFrontmatter('tags', ['tag1', 'tag2', 'tag3'])
      transformer.setFrontmatter('tags', ['tag4', 'tag5'])

      const result = transformer.toString()

      expect(result).toContain('tags:')
      expect(result).not.toContain('  - "tag1"')
      expect(result).not.toContain('  - "tag2"')
      expect(result).not.toContain('  - "tag3"')
      expect(result).toContain('  - "tag4"')
      expect(result).toContain('  - "tag5"')
    })

    it('should handle number values', () => {
      const transformer = new ContentTransformer()
      transformer.setFrontmatter('count', 42)

      const result = transformer.toString()
      expect(result).toContain('count: 42')
    })

    it('should handle boolean values', () => {
      const transformer = new ContentTransformer()
      transformer.setFrontmatter('published', true)

      const result = transformer.toString()
      expect(result).toContain('published: true')
    })

    it('should quote strings with special characters', () => {
      const transformer = new ContentTransformer()
      transformer.setFrontmatter('description', 'A title: with colon')

      const result = transformer.toString()
      expect(result).toContain('"A title: with colon"')
    })

    it('should support chaining', () => {
      const transformer = new ContentTransformer()
      const result = transformer
        .setFrontmatter('title', 'My Title')
        .setFrontmatter('author', 'John')
        .toString()

      expect(result).toContain('title: My Title')
      expect(result).toContain('author: John')
    })
  })

  describe('insertInSection', () => {
    it('should create section if it does not exist', () => {
      const transformer = new ContentTransformer('# Main Title\n\nSome content')
      transformer.insertInSection('New Section', 'Content in new section')

      const result = transformer.toString()
      expect(result).toContain('## New Section')
      expect(result).toContain('Content in new section')
    })

    it('should insert content at the end of existing section', () => {
      const content = `# Main Title

## Section 1
Existing content

## Section 2
More content`

      const transformer = new ContentTransformer(content)
      transformer.insertInSection('Section 1', 'New content')

      const result = transformer.toString()
      const section1Index = result.indexOf('## Section 1')
      const section2Index = result.indexOf('## Section 2')
      const newContentIndex = result.indexOf('New content')

      expect(newContentIndex).toBeGreaterThan(section1Index)
      expect(newContentIndex).toBeLessThan(section2Index)
    })

    it('should handle case-insensitive section matching', () => {
      const content = `## My Section\nContent`
      const transformer = new ContentTransformer(content)
      transformer.insertInSection('my section', 'New content')

      const result = transformer.toString()
      expect(result).toContain('New content')
    })

    it('should insert at end of file if section is last', () => {
      const content = `## Section 1
Content here`

      const transformer = new ContentTransformer(content)
      transformer.insertInSection('Section 1', 'New content at end')

      const result = transformer.toString()
      expect(result).toContain('New content at end')
    })

    it('should support chaining', () => {
      const transformer = new ContentTransformer('# Title')
      const result = transformer
        .insertInSection('Section 1', 'Content 1')
        .insertInSection('Section 2', 'Content 2')
        .toString()

      expect(result).toContain('## Section 1')
      expect(result).toContain('Content 1')
      expect(result).toContain('## Section 2')
      expect(result).toContain('Content 2')
    })

    it('should respect heading hierarchy', () => {
      const content = `# Main

## Section A

### Subsection A1

## Section B`

      const transformer = new ContentTransformer(content)
      transformer.insertInSection('Section A', 'New content')

      const result = transformer.toString()
      const sectionAIndex = result.indexOf('## Section A')
      const sectionBIndex = result.indexOf('## Section B')
      const newContentIndex = result.indexOf('New content')

      expect(newContentIndex).toBeGreaterThan(sectionAIndex)
      expect(newContentIndex).toBeLessThan(sectionBIndex)
    })
  })

  describe('integration', () => {
    it('should handle complex transformations with chaining', () => {
      const transformer = new ContentTransformer()
      const result = transformer
        .setFrontmatter('title', 'My Document')
        .setFrontmatter('tags', ['doc', 'test'])
        .setFrontmatter('created', Date.now())
        .insertInSection('Introduction', 'This is the intro.')
        .insertInSection('Conclusion', 'This is the conclusion.')
        .toString()

      expect(result).toContain('title: My Document')
      expect(result).toContain('tags:')
      expect(result).toContain('  - "doc"')
      expect(result).toContain('  - "test"')
      expect(result).toContain('## Introduction')
      expect(result).toContain('This is the intro.')
      expect(result).toContain('## Conclusion')
      expect(result).toContain('This is the conclusion.')
    })
  })
})
