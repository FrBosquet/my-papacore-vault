## Workspace rules – `my-vault` project

These rules apply when working inside the `my-vault/` project (or repo, once split).

### Purpose

- `my-vault/` is a **Papacore project and Datacore vault** used to:
  - Exercise the `papacore` CLI (`papacore dev`, `papacore build`, etc.).
  - Verify build, install, hot‑reload, and CSS behaviour end‑to‑end.
  - Serve as a realistic example of how a Papacore project is structured.

### General principles

- **Keep edits pragmatic**: focus on making the example reliable and representative, not overly abstract.
- **Stay close to the scaffold**:
  - The project should look like something created via `papacore init` plus light customization.
  - Preserve the expected folder structure under `src/Datacore/**`.
- When unsure whether a change belongs here or in the core:
  - Ask whether it benefits all Papacore projects; if so, it probably belongs in the `papacore` package.

### Relationship to the `papacore` package

- This project should treat `papacore` as a **dev dependency and tooling**, not as a sibling codebase.
- Avoid adding one‑off build logic here that duplicates or diverges from what the `papacore` package provides.
- When scripts or patterns here turn out to be generally useful:
  - Upstream them into the `papacore` package (CLI, core, templates).
  - Then align this project with the updated templates.

