# @editkit/svelte ✨

<p align="center">
  <strong>The Ultimate Svelte Rich Text Editor Action — Zero Dependencies, Native Tables & 2D Color Picker</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Svelte-3%20%7C%204%20%7C%205%20(Runes)-ff3e00?logo=svelte&logoColor=white" alt="Svelte Support" />
  <img src="https://img.shields.io/badge/SvelteKit-Ready-ff3e00?logo=svelte&logoColor=white" alt="SvelteKit Ready" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Dependencies-0%20External-8b5cf6" alt="Zero Dependencies" />
  <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License" />
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/ashikurweb/editKit-text-editor/master/assets/editkit-preview.png" alt="EditKit Svelte Editor Preview" width="100%" />
</p>

---

## ⚡ Why @editkit/svelte?

- 🚀 **Zero External Dependencies**: Pure native TypeScript.
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

---

## 📄 License

MIT © [Ashikur Rahman](https://github.com/ashikurweb)
