# 📦 EditKit NPM Publishing & Maintenance Guide

This document explains how to **publish**, **update**, and **maintain** the `editkit-text-editor` umbrella package and the modular `@editkit/*` packages on npm.

---

## 📑 Table of Contents
1. [Prerequisites](#1-prerequisites)
2. [NPM Account & Scope Setup](#2-npm-account--scope-setup)
3. [First-Time Publishing](#3-first-time-publishing)
4. [Releasing an Update / New Version](#4-releasing-an-update--new-version)
5. [Monorepo Package Structure](#5-monorepo-package-structure)
6. [Commands Cheatsheet](#6-commands-cheatsheet)

---

## 1. Prerequisites

Make sure you have:
- **Node.js**: `v18.0.0` or higher (`node -v`)
- **pnpm**: `v9.x` or higher (`pnpm -v`)
- An active account on [npmjs.com](https://www.npmjs.com/)

---

## 2. NPM Account & Scope Setup

EditKit uses scoped package names:
- `editkit-text-editor` (all-in-one public package)
- `@editkit/core`
- `@editkit/ui`
- `@editkit/react`
- `@editkit/vue`
- `@editkit/svelte`

### Option A: Using the `@editkit` organization (Recommended)
1. Go to [npmjs.com](https://www.npmjs.com/) and log in.
2. Click on your profile avatar (top right) ➔ **Add Organization**.
3. Create an organization named **`editkit`** (choose the free tier).
4. Now you can publish any `@editkit/*` package directly.

### Option B: Using your personal username scope
If `editkit` org is taken or you prefer your username (e.g. `@ashikur`):
Update the `"name"` in each `package.json`:
- `@ashikur/editkit-core`
- `@ashikur/editkit-ui`
- `@ashikur/editkit-react`
- `@ashikur/editkit-vue`
- `@ashikur/editkit-svelte`

---

## 3. First-Time Publishing

Follow these 4 simple steps to publish all packages to NPM:

### Step 1: Login to NPM in your terminal
```bash
npm login
```
*(Enter your NPM username, password, and Email verification code / 2FA when prompted).*

### Step 2: Verify your login
```bash
npm whoami
```
*(This will print your logged-in username).*

### Step 3: Run the build & typecheck
```bash
npm run build
pnpm -r exec tsc --noEmit
```

### Step 4: Publish all packages simultaneously
```bash
pnpm -r publish --access public
```

> [!TIP]
> The `-r` flag tells pnpm to recursively publish all workspace packages in dependency order (`core` ➔ `ui` ➔ framework integrations ➔ `editkit-text-editor`). The private playground is skipped.

---

## 4. Releasing an Update / New Version

When you add new features or fix bugs, follow this workflow to release an update:

### Step 1: Bump the version number
Decide on your version bump (SemVer: `Major.Minor.Patch`):
- **Patch** (`1.0.0` ➔ `1.0.1`): Bug fixes, style tweaks
- **Minor** (`1.0.0` ➔ `1.1.0`): New features (new toolbar buttons, props)
- **Major** (`1.0.0` ➔ `2.0.0`): Breaking architectural changes

You can update the `"version"` field in all `package.json` files or run:
```bash
# Example: update all packages to 1.0.1
pnpm -r exec npm version 1.0.1 --no-git-tag-version
```

### Step 2: Rebuild the project
```bash
npm run build
```

### Step 3: Publish the new version
```bash
pnpm -r publish --access public
```

---

## 5. Monorepo Package Structure

```
editKit-text-editor
├── assets/
│   └── editkit-preview.png     # Screenshot shown in README.md
├── packages/
│   ├── core/                   # @editkit/core (TypeScript editor engine)
│   ├── ui/                     # @editkit/ui (Toolbar, Modals, Menus, CSS)
│   ├── react/                  # @editkit/react (React component & hooks)
│   ├── vue/                    # @editkit/vue (Vue 3 component & composable)
│   └── svelte/                 # @editkit/svelte (Svelte action)
├── apps/
│   └── playground/             # Vite interactive testing playground
├── docs/
│   └── PUBLISHING.md           # Documentation
├── .codex/
│   └── publishing-guide.md     # Quick Codex reference
├── README.md                   # Main GitHub / NPM Documentation
├── LICENSE                     # MIT Open-Source License
├── src/                        # editkit-text-editor umbrella exports
├── package.json                # Root package and monorepo configuration
└── pnpm-workspace.yaml         # Workspace definitions
```

---

## 6. Commands Cheatsheet

| Task | Command |
| :--- | :--- |
| **Start Local Playground** | `pnpm playground` |
| **Build all packages** | `npm run build` |
| **Check TypeScript types** | `pnpm -r exec tsc --noEmit` |
| **Clean build caches** | `npm run clean` |
| **Check NPM Login** | `npm whoami` |
| **Publish to npm** | `pnpm -r publish --access public` |
