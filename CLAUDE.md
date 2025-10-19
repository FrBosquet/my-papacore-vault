# Project Notes for Claude

## Package Manager
- **USE PNPM** - This project uses pnpm, NOT npm

## Project Setup
- TypeScript project that preserves JSX in output
- TypeScript compiler strips types but keeps JSX syntax
- Source files: `.tsx` in `src/`
- Output files: `.jsx` in `dist/`
- Output is consumed by third-party tools (not for browsers)

## Build Configuration
- Using TypeScript compiler directly (not webpack for main build)
- `pnpm run build` - Compile .tsx to .jsx with types removed
- `pnpm run watch` - Watch mode
- `pnpm run build:webpack` - Webpack bundling (kept for reference)
- tsconfig.json: `"jsx": "preserve"` - keeps JSX in output
