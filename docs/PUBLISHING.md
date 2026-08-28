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

### Option B: Migrating to another scope
Changing the npm scope is a package migration, not only a `name` edit. Update every internal dependency, source import, build external, README example, and consumer migration note before publishing under another scope.

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
pnpm verify
```

### Step 4: Publish in dependency order
```bash
pnpm --filter @editkit/core --filter @editkit/ui --filter @editkit/react --filter @editkit/vue --filter @editkit/svelte -r publish --access public
pnpm publish --access public
```

> [!TIP]
> The first command publishes the scoped packages in dependency order. The second explicitly publishes the root `editkit-text-editor` package last. The private playground is never selected.

---

## 4. Releasing an Update / New Version

When you add new features or fix bugs, follow this workflow to release an update:

### Step 1: Bump the version number
Decide on your version bump (SemVer: `Major.Minor.Patch`):
- **Patch** (`1.0.0` ➔ `1.0.1`): Bug fixes, style tweaks
- **Minor** (`1.0.0` ➔ `1.1.0`): New features (new toolbar buttons, props)
- **Major** (`1.0.0` ➔ `2.0.0`): Breaking architectural changes

Update the `"version"` field in the six public package manifests: the root package plus `core`, `ui`, `react`, `vue`, and `svelte`. Keep the private playground package on its independent version. For example:
```bash
# Example: update the six public packages to 1.0.8 without creating Git tags
pnpm --filter editkit-text-editor --filter @editkit/core --filter @editkit/ui --filter @editkit/react --filter @editkit/vue --filter @editkit/svelte exec npm version 1.0.8 --no-git-tag-version
```

Do not use an unfiltered recursive version command: it also changes the private playground version.

### Step 2: Rebuild the project
```bash
pnpm verify
```

### Step 3: Publish the new version
```bash
pnpm --filter @editkit/core --filter @editkit/ui --filter @editkit/react --filter @editkit/vue --filter @editkit/svelte -r publish --access public
pnpm publish --access public
```

---

## 5. Monorepo Package Structure

```
editKit-text-editor
├── packages/
│   ├── core/                   # @editkit/core (TypeScript editor engine)
│   ├── ui/                     # @editkit/ui (Toolbar, Modals, Menus, CSS)
│   ├── react/                  # @editkit/react (React component & hooks)
│   ├── vue/                    # @editkit/vue (Vue 3 component & composable)
│   └── svelte/                 # @editkit/svelte (Svelte action)
├── apps/
│   └── playground/             # Vite interactive testing playground
├── docs/
│   └── PUBLISHING.md           # This guide
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
| **Verify release** | `pnpm verify` |
| **Clean build caches** | `npm run clean` |
| **Check NPM Login** | `npm whoami` |
| **Publish scoped packages** | `pnpm --filter @editkit/core --filter @editkit/ui --filter @editkit/react --filter @editkit/vue --filter @editkit/svelte -r publish --access public` |
| **Publish root package last** | `pnpm publish --access public` |
