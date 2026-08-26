# Notes From The Underground

Notes From The Underground is an [Obsidian](https://obsidian.md) plugin that replaces scattered notes with a single sortable, filterable table. It scans your vault's markdown files and pulls structured fields — Priority, Progress, Tags, Description, Link, and Date — straight out of each note's content.

## Installation

The plugin is not yet on the community plugin browser, so install it manually:

1. Download `main.js`, `manifest.json`, and `styles.css` from the [latest release](https://github.com/thiagocolen/notes-from-the-underground/releases/latest).
2. Copy the three files into `VaultFolder/.obsidian/plugins/notes-from-the-underground/` (create the folder if it doesn't exist).
3. Reload Obsidian and enable "Notes From The Underground" under **Settings → Community plugins**.
4. Open the table from the ribbon icon or the "Open notes table" command.

## Note format

The table reads `Key: value` lines from a note's body to populate its columns. Keys are case-insensitive and can appear in any order; anything after the last recognized property line becomes the description if no `Description:` line was given explicitly.

```md
# Reference Sample 01

Priority: Very High
Progress: To Do
Tags: Crypto, Code
Description: A description of the note
Link: https://www.google.com
Date: October 13, 2024

... anything ...
```

- **Title** — the first line if it's a `# Heading`, otherwise the file's name.
- **Path** — the note's parent folder, shown as `<folder> Folder` (or `Root Folder` at the vault root).
- **Tags** — a comma-separated list, optionally wrapped in `[...]`.
- Notes with none of these properties still show up in the table with blank fields.

## Features

- Sortable columns: Path, Title, Priority, Progress, Tags, Description, Link, Date.
- Per-column text filtering, including tag-aware filtering on the Tags column.
- Column resizing, drag-to-reorder, and a visibility toggle panel.
- Row selection with a live total/selected count.
- Click a note's title to open it directly in a new leaf.

## Development

- `npm run dev` — bundle with esbuild in watch mode.
- `npm run build` — type-check, then produce a production build of `main.js`.
- `npm run build:deploy` — build, then copy `main.js`, `manifest.json`, and `styles.css` into a local test vault.
- `npm run lint` — run ESLint, including the `eslint-plugin-obsidianmd` rules.

## Questions or issues?

Open an issue on [GitHub](https://github.com/thiagocolen/notes-from-the-underground/issues).

## License

[0BSD](./LICENSE)
