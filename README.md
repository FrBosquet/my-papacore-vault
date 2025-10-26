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
├── babel-plugins/          # Custom Babel transformation plugins
├── build.js               # Custom build script
└── babel.config.js        # Babel configuration
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

To work on this project:

1. Make changes to files in `src/`
2. Run `pnpm run watch` to auto-compile on save
3. Check output in `dist/`

## License

MIT License - see [LICENSE](LICENSE) file for details.

This project is free to use, modify, and distribute with attribution.
