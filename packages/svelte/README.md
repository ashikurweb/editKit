# EditKit Svelte Rich Text Editor — `@editkit/svelte`

<p align="center">
  <strong>A TypeScript WYSIWYG editor action for Svelte 3, 4, 5, and SvelteKit</strong>
</p>

`@editkit/svelte` is the official Svelte and SvelteKit integration for [EditKit Text Editor](https://www.npmjs.com/package/editkit-text-editor), with native tables, a color picker, and configurable toolbars.

<p align="center">
  <a href="https://www.npmjs.com/package/@editkit/svelte"><img src="https://img.shields.io/npm/v/@editkit/svelte?logo=npm" alt="@editkit/svelte npm version" /></a>
  <a href="https://www.npmjs.com/package/@editkit/svelte"><img src="https://img.shields.io/npm/dm/@editkit/svelte?logo=npm" alt="@editkit/svelte monthly downloads" /></a>
  <img src="https://img.shields.io/badge/Svelte-3%20%7C%204%20%7C%205%20(Runes)-ff3e00?logo=svelte&logoColor=white" alt="Svelte Support" />
  <img src="https://img.shields.io/badge/SvelteKit-Ready-ff3e00?logo=svelte&logoColor=white" alt="SvelteKit Ready" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Editor%20Engine-First%20Party-8b5cf6" alt="No third-party editor engine" />
  <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License" />
</p>

---

## ⚡ Why @editkit/svelte?

- 🚀 **No Third-Party Editor Engine**: Built in TypeScript without ProseMirror, Lexical, Slate, or Quill.
- 🟠 **Universal Svelte Support**: Works seamlessly across **Svelte 3**, **Svelte 4**, **Svelte 5 (Runes)**, and **SvelteKit**.
- 📊 **First-Class Interactive Tables**: 6×6 visual hover grid, row/column management, and cell coloring.
- 🎨 **2D HSV Custom Color Picker**: 21 palette swatches + 2D spectrum canvas and hue slider.
- 🫧 **Contextual Floating Menus**: Smart text selection bubble toolbar, floating table actions, and image resize bar.
- 🎛️ **Granular Feature Props**: Turn any toolbar button on or off with boolean options.

---

## 📦 Installation

```bash
# Using npm
npm install @editkit/svelte @editkit/ui

# Using pnpm
pnpm add @editkit/svelte @editkit/ui

# Using yarn
yarn add @editkit/svelte @editkit/ui
```

All-in-one alternative: `npm install editkit-text-editor svelte`, then import from `editkit-text-editor/svelte` and `editkit-text-editor/styles`.

---

## 🚀 Quick Start (`use:editkit`)

```svelte
<script lang="ts">
  import { editkit } from '@editkit/svelte';
  import '@editkit/ui/styles';

  let content = '<p>Hello from Svelte!</p>';
</script>

<div
  use:editkit={{
    content,
    theme: 'dark',
    placeholder: 'Write with EditKit in Svelte...',
    features: {
      chart: false,
      math: false,
    },
    onChange: (html) => {
      content = html;
    }
  }}
/>
```

---

## 🎛️ Complete Options Reference

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `content` | `string` | `''` | Initial / reactive HTML content |
| `theme` | `'light' \| 'dark' \| 'system'` | `'dark'` | Theme appearance |
| `placeholder` | `string` | `'Write something...'` | Empty editor placeholder text |
| `editable` | `boolean` | `true` | Read-only mode toggle |
| `showToolbar` | `boolean` | `true` | Show or hide the top formatting toolbar |
| `bubbleMenu` | `boolean` | `true` | Enable floating selection bubble toolbar |
| `tableMenu` | `boolean` | `true` | Enable contextual table action floating menu |
| `imageMenu` | `boolean` | `true` | Enable floating image resizer menu |
| `features` | `ToolbarFeaturesConfig` | `{}` | Granular toolbar button toggles |
| `onChange` | `(html: string) => void` | - | Callback on content change |

`content` is a trusted-HTML input. Sanitize content from users or external systems before passing it to EditKit and before rendering saved HTML.

---

## 📄 License

MIT © [Ashikur Rahman](https://github.com/ashikurweb)
