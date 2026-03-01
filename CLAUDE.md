# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository purpose

This repository is a **design artifact workspace** for miniERP, not an application runtime project. It contains:
- UI prototypes in `.pen` format
- Page/specification documents in Markdown
- Generated reference images

## Key project structure

- `designs/`
  - `miniERP-pencil-opus4.6.pen`
  - `miniERP-pencil-codex5.3.pen`
  - `miniERP-pencil-gemini3.1.pen`
  - `minierp_page_spec.md` (4 template families + 30-page route plan)
  - `miniERP_design_summary.md` (implementation progress)
  - `miniERP_evidence_system.md` (document-level + row-level evidence design)
- `*.resolved` files (resolved snapshots; treat as reference artifacts unless explicitly asked to edit)
- `images/`
  - Generated screenshot artifacts used as visual references

## Development commands

There is currently (as of this file revision) **no configured build/lint/test toolchain** in this repository (no `package.json`, Makefile, or test runner config).

Commonly useful commands:

```bash
git status
```
Check working tree changes.

```bash
git diff
```
Review content changes before committing.

```bash
ls -la designs
```
Inspect available design/spec files.

### Test commands

No automated test framework is configured in this repo at this time, so there is no "run all tests" or "run single test" command.

## Architecture overview (big picture)

### 1) Template-driven screen system
The product UI is modeled around 4 reusable page archetypes defined in `designs/minierp_page_spec.md`:
- **T1 OverviewLayout**: KPIs + todo/alerts + shortcuts + timeline
- **T2 WorkbenchLayout**: high-density list/table operations + filters + detail drawer
- **T3 DetailLayout**: single-entity detail with tabs and contextual actions
- **T4 WizardLayout**: step-based posting/transaction workflows

Most remaining pages are intended as template reuse with field/data substitution rather than net-new layout invention.

### 2) Pen-file-first implementation source
The `.pen` documents are the primary source for layout/component structure. Markdown docs describe intent and coverage status; `.pen` files capture concrete editable design trees.

### 3) Shared visual language
Across implemented screens, the design system follows a Nordic Brutalist style (from project docs):
- zero-radius geometry
- dark sidebar / light canvas contrast
- semantic accents for status states
- uppercase, high-legibility label treatment

### 4) Evidence system as cross-workflow capability
`designs/miniERP_evidence_system.md` defines a two-layer evidence model that spans purchasing/sales/inventory flows:
- **Document-level evidence panel** (global attachments)
- **Row-level evidence entry** (SKU-line-specific evidence via camera-count entry + drawer)

This is a core interaction pattern for dispute traceability in GRN/OUT/stocktake and should be preserved when extending workflow pages.

## Working with .pen files

- Prefer Pencil MCP tools for inspecting/editing `.pen` files.
- If Pencil MCP is unavailable, avoid manual structural edits and use Markdown specs as source of truth.
- For architecture discovery, use Markdown specs/summaries first, then confirm structure in the corresponding `.pen` file.
