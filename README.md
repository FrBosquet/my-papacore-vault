# Papacore

A custom TypeScript/JSX build tool for creating components compatible with Datacore's custom Preact runtime. Datacore is an Obsidian plugin that allows you to query your notes and render data as Preact components.

## Overview

Papacore transforms TypeScript and JSX files into a format consumable by Datacore's custom Preact runtime. The build system:

- Transforms `.tsx` files → `.jsx` files (preserving JSX syntax)
- Transforms `.ts` files → `.js` files
- Converts ES6 imports/exports to `dc.require()` calls
- Prefixes React hooks with `dc.` (e.g., `useState` → `dc.useState`)
- Resolves all imports to absolute paths from the `dist/` root

## Installation

```bash
# Install dependencies
pnpm install
```

## Configuration

Before you can deploy your components to your Datacore vault, you need to configure the target location:

```bash
pnpm run config
```

This will prompt you to enter the path to your Datacore vault. The configuration is saved in `papacore.json` (which is git-ignored for security).

You can run `pnpm run config` again anytime to update the vault location.

## Usage

### Build Once

Compile all source files once:

```bash
pnpm run build
```

### Watch Mode

Continuously watch for changes and rebuild automatically:

```bash
pnpm run watch
```

### Development Mode (Build + Auto-Install)

Build, watch for changes, and automatically install to your configured vault:

```bash
pnpm run dev
```

This will:
1. Ask for confirmation once at startup
2. Build all files
3. Copy them to your vault
4. Watch for changes and auto-install on every save

### Install to Vault

Copy already-built files from `dist/` to your configured vault:

```bash
pnpm run install
```

This will ask for confirmation before overwriting files.

## Project Structure

```
papacore/
├── src/                    # Source files (.ts, .tsx)
│   ├── index.tsx
│   ├── counter.tsx
│   └── Datacore/
│       └── utils/
│           └── time.ts
├── dist/                   # Compiled output (.js, .jsx)
│   ├── index.jsx
│   ├── counter.jsx
│   └── Datacore/
│       └── utils/
│           └── time.js
├── scripts/                # Build and utility scripts
│   ├── build.js           # Build script with watch mode
│   ├── install.js         # Install to vault script
│   ├── config.js          # Configuration wizard
│   └── utils.js           # Shared utilities
├── babel-plugins/          # Custom Babel transformation plugins
│   ├── transform-imports-exports.js
│   └── transform-react-hooks.js
├── babel.config.js        # Babel configuration
└── papacore.json          # Vault configuration (git-ignored)
```

## How It Works

### Source Code

**src/index.tsx:**
```tsx
import { Counter } from "./counter";
import { getTodayString } from "./Datacore/utils/time";

export function App() {
  return (
    <div>
      <p>Today is {getTodayString()}</p>
      <Counter />
    </div>
  );
}
```

### Compiled Output

**dist/index.jsx:**
```jsx
const { Counter } = await dc.require("counter.jsx");
const { getTodayString } = await dc.require("Datacore/utils/time.js");

function App() {
  return <div>
      <p>Today is {getTodayString()}</p>
      <Counter />
    </div>;
}

return { App };
```

## Transformations

### 1. Import/Export Transformation

- **Relative imports** → `dc.require()` with absolute paths from `dist/` root
  ```tsx
  // Source
  import { foo } from "./bar";

  // Output
  const { foo } = await dc.require("bar.jsx");
  ```

- **React imports** → Removed (React is available on `dc` global)
  ```tsx
  // Source
  import { useState } from "react";

  // Output
  // (removed)
  ```

- **Type-only imports** → Removed
  ```tsx
  // Source
  import type { MyType } from "./types";

  // Output
  // (removed)
  ```

- **Exports** → Returned as object at end of file
  ```tsx
  // Source
  export function Component() { ... }
  export const value = 42;

  // Output
  function Component() { ... }
  const value = 42;
  return { Component, value };
  ```

### 2. React Hooks Transformation

All React APIs are prefixed with `dc.`:

```tsx
// Source
const [count, setCount] = useState(0);
useEffect(() => { ... }, [count]);

// Output
const [count, setCount] = dc.useState(0);
dc.useEffect(() => { ... }, [count]);
```

### 3. JSX Preservation

JSX syntax is preserved in the output (not converted to `React.createElement`):

```tsx
// Source & Output (same)
return <div className="container">
  <Button onClick={handleClick}>Click me</Button>
</div>;
```

### 4. File Extension Mapping

Import paths automatically map source extensions to output extensions:

| Source Import | Source File | Output Import |
|--------------|-------------|---------------|
| `"./component"` | `component.tsx` | `"component.jsx"` |
| `"./utils"` | `utils.ts` | `"utils.js"` |

## Custom Babel Plugins

The build system uses two custom Babel plugins:

1. **transform-imports-exports.js** - Handles import/export transformation and path resolution
2. **transform-react-hooks.js** - Prefixes React identifiers with `dc.`

## Requirements

- Node.js (for running the build script)
- pnpm (package manager)

## Development

### Quick Start

1. Install dependencies: `pnpm install`
2. Configure your vault: `pnpm run config`
3. Start development mode: `pnpm run dev`
4. Edit files in `src/` and they'll automatically compile and install to your vault

### Development Workflow

**Option 1: Auto-install to vault (recommended)**
```bash
pnpm run dev
```
This watches for changes, rebuilds, and automatically copies files to your vault.

**Option 2: Build only**
```bash
pnpm run watch
```
This watches for changes and rebuilds, but doesn't install to your vault.

**Option 3: Manual build + install**
```bash
pnpm run build
pnpm run install
```
Build once and manually copy to your vault.

## Scripts Reference

| Command | Description |
|---------|-------------|
| `pnpm run config` | Configure vault location (interactive wizard) |
| `pnpm run build` | Build once (compile all files) |
| `pnpm run watch` | Watch mode (rebuild on changes) |
| `pnpm run dev` | Development mode (build + watch + auto-install to vault) |
| `pnpm run install` | Copy built files to vault (with confirmation) |

## License

MIT License - see [LICENSE](LICENSE) file for details.

This project is free to use, modify, and distribute with attribution.
