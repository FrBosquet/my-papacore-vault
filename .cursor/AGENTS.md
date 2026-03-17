## `my-vault` project – Cursor agents

This folder is a **Papacore-powered Datacore vault/project**.

It represents what a user’s project looks like after running `papacore init` (plus some customization): TypeScript/Preact components under `src/Datacore/**`, Papacore config, and scripts that rely on the `papacore` package as a dev dependency.

### What lives here

- Datacore components, views, and utilities written in TS/JSX.
- Project config for Papacore (vault path, Tailwind, TS, Biome, etc.).
- Any project‑specific tweaks that still follow the general Papacore patterns.

### How to behave in this project

- Treat this as a **regular Papacore project**, not the Papacore core package.
- Prefer to:
  - Use the `papacore` CLI for builds and dev (`papacore dev`, `papacore build`, etc.).
  - Keep the project structure aligned with what `papacore init` generates.
- When you find generic improvements that would help all Papacore users:
  - Propose them in the `papacore` package (CLI, core, templates), then sync this project with those templates.

For constraints specific to this vault, see `.cursor/rules/WORKSPACE.md` in this project.

