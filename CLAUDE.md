# Project Notes for Claude

## Package Manager
- **USE PNPM** - This project uses pnpm, NOT npm

## Project Setup
- TypeScript + Babel project for a markdown editor with custom React runtime
- Source files: `.tsx` and `.ts` in `src/`
- Output files: `.tsx` → `.jsx`, `.ts` → `.js` in `dist/`
- Output is consumed by a markdown editor (not for browsers)

## Build Configuration
- Using custom build script (`build.js`) with Babel for transformations
- `pnpm run build` - Compile all files with transformations
- `pnpm run watch` - Watch mode (auto-recompile on file changes)

## Transformations Applied
1. **Import/Export Transformation:**
   - `import { foo } from './file'` → `const { foo } = await dc.require("file.jsx")` (or `.js`)
   - Import paths are absolute from `dist/` root with file extensions
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

## Custom Build System
- **Build Script:** `build.js` - Custom Node.js script that processes files with Babel
  - Transforms `.tsx` files → `.jsx` files (preserves JSX syntax)
  - Transforms `.ts` files → `.js` files
  - Recursively processes all files in `src/` directory
  - Supports watch mode with `--watch` flag

## Custom Babel Plugins
- `babel-plugins/transform-imports-exports.js` - Custom import/export system with absolute path resolution
- `babel-plugins/transform-react-hooks.js` - Prefix React identifiers with dc.

## Import Path Resolution
- Relative imports are resolved to absolute paths from `dist/` root
- File extensions are automatically mapped and included:
  - Source `.tsx` → Output `.jsx` in import path
  - Source `.ts` → Output `.js` in import path
- Example: `src/components/Button.tsx` → `dc.require("components/Button.jsx")`

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