# Clone Website Skill — Comprehensive Overview

This is a detailed framework for reverse-engineering and rebuilding websites as pixel-perfect clones using a foreman-driven extraction and parallel builder agent model.

## Core Architecture

The process follows five sequential phases with strict procedural guardrails:

**Phase 1: Reconnaissance** involves capturing full-page screenshots at multiple viewports, extracting global design tokens (fonts, colors, favicons), and conducting mandatory interaction sweeps (scroll, click, hover, responsive tests) to discover behaviors invisible in static screenshots.

**Phase 2: Foundation Build** establishes shared infrastructure: font configuration, global CSS with design tokens, TypeScript interfaces, SVG icon components, and asset downloads via automated scripts.

**Phases 3–4: Component Extraction & Assembly** follow a repeating cycle: extract section styles via `getComputedStyle()`, document every property in a spec file, dispatch focused builder agents in parallel, merge completed worktrees, and assemble the final page with page-level behaviors.

**Phase 5: Visual QA** performs side-by-side comparison testing to catch discrepancies before declaring completion.

## Critical Principles

The framework emphasizes eight core truths:

1. **"Completeness Beats Speed"** — builders need exact CSS values, screenshots, and assets; guessing any property constitutes failure
2. **"Small Tasks, Perfect Results"** — sections exceeding ~150 lines of spec content should split into smaller components
3. **"Real Content, Real Assets"** — extract actual text, images, and SVGs; generate content only for clearly server-generated elements
4. **"Foundation First"** — global CSS and types must exist before component building
5. **"Extract How It Looks AND How It Behaves"** — capture both static styles and dynamic state changes, transition timing, and interaction triggers
6. **"Identify the Interaction Model Before Building"** — determine whether sections are click-driven, scroll-driven, hover-driven, or time-driven *before* any construction
7. **"Extract Every State, Not Just Default"** — click all tabs, scroll past triggers, test hover states to capture complete style variations
8. **"Spec Files Are the Source of Truth"** — every component requires a documented specification file before dispatcher

## Major Anti-Patterns to Avoid

- Building click-based tabs when the original uses scroll-driven switching (or vice versa)
- Capturing only initial state while ignoring hover, scroll-triggered, or tabbed states
- Missing layered/overlay images that create visual depth
- Approximating CSS values instead of extracting computed styles
- Bundling unrelated sections into monolithic builder tasks
- Skipping asset extraction, leaving the clone feeling hollow
- Omitting smooth scroll library detection (Lenis, Locomotive Scroll affect feel significantly)
- Dispatching builders without spec files

## Browser MCP Requirement

This skill is **mandatory-browser-dependent**: it cannot function without Chrome MCP, Playwright MCP, Browserbase MCP, or equivalent. The user must confirm available tools before proceeding.
