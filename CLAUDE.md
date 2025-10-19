# Project Notes for Claude

## Package Manager
- **USE PNPM** - This project uses pnpm, NOT npm

## Project Setup
- TypeScript + Babel project for a markdown editor with custom React runtime
- Source files: `.tsx` in `src/`
- Output files: `.js` in `dist/`
- Output is consumed by a markdown editor (not for browsers)

## Build Configuration
- Using Babel to transform TypeScript + JSX
- `pnpm run build` - Compile .tsx to .js with transformations
- `pnpm run watch` - Watch mode

## Transformations Applied
1. **Import/Export Transformation:**
   - `import { foo } from './file'` → `const { foo } = await dc.require('./file')`
   - `import ... from 'react'` → **Removed** (React available on dc global)
   - Type-only imports → **Removed**
   - `export function Bar() {}` → Function declared normally, then `return { Bar }` at end

2. **React Hooks to dc. prefix:**
   - `useState` → `dc.useState`
   - `useEffect` → `dc.useEffect`
   - All React hooks/functions prefixed with `dc.`

3. **JSX Preservation:**
   - JSX syntax is kept in output (not transpiled to createElement)
   - TypeScript types are stripped

## Custom Babel Plugins
- `babel-plugins/transform-imports-exports.js` - Custom import/export system
- `babel-plugins/transform-react-hooks.js` - Prefix React identifiers with dc.

## Next Steps

### Global Type-Safe useQuery Hook
Need to create a global type-safe wrapper for `dc.useQuery()`:
- Create in `src/` directory (e.g., `src/globals.ts` or `src/types.ts`)
- Generic function: `useQuery<T>(query: string): T[]`
- Example usage: `useQuery<{ frontmatter: string }>('query')` returns `{ frontmatter: string }[]`
- Provides type safety and autocomplete for query results
- Should be globally available (no imports needed) in all source files

### Cleanup webpack and tsc configs
We end up using only babel for transpilation, so we can remove webpack and tsc configs
- Remove webpack
- Remove tsc

### Vault injection mechanism
We need a way to inject the transpiled code into the vault.
- We config were the vault is mounted
- We build and copy the code to the vault