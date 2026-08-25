# Vellora Editor ✨

<p align="center">
  <strong>A Premium, Framework-Agnostic, Zero-Dependency Rich Text Editor SDK</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-%3E%3D%2018.0.0-339933?logo=node.js&logoColor=white" alt="Node.js version" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Dependencies-0%20External-8b5cf6" alt="Zero Dependencies" />
  <img src="https://img.shields.io/badge/Frameworks-React%20%7C%20Vue%20%7C%20Svelte%20%7C%20Vanilla-6366f1" alt="Framework Agnostic" />
  <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License" />
</p>

---

## 🚀 Overview

**Vellora Editor** is a modern, extensible rich text editor built **100% from scratch** in TypeScript with **zero external dependencies**. Inspired by the high-end **EDDYTER** aesthetic, it features first-class tables, an interactive 2D HSV color picker, floating selection bubble toolbars, custom plugin architecture, and CSS-variable-driven dark & light themes.

---

## ✨ Features

- **⚡ Zero External Dependencies**: No ProseMirror, Lexical, Quill, or Tailwind required. Pure native performance.
- **🌐 Framework Agnostic**: One single core engine that works seamlessly in **React**, **Next.js**, **Vue 3**, **Nuxt**, **Svelte**, **SvelteKit**, **Angular**, or **Vanilla JS**.
- **📊 First-Class Table System**:
  - Interactive **6×6 visual NxM hover grid selector**.
  - Insert/Delete Rows & Columns with a single click.
  - Header Row toggling & individual cell background colors.
  - **Contextual Table Toolbar** that appears whenever the cursor is inside a table.
  - Excel-style `Tab` / `Shift+Tab` cell navigation.
- **🎨 2D HSV Custom Color Picker**:
  - `Text A` and `Background` color tabs.
  - `#000000` editable hex input with live preview swatch box.
  - 21 curated palette swatches (3×7 grid).
  - Collapsible **2D Saturation-Brightness Canvas** + **Rainbow Hue Slider** for infinite custom colors.
- **🫧 Floating Selection Bubble Toolbar**: Automatically appears on text selection with quick actions (`✦ AI ˅`, `- 14 +`, `Bold`, `Italic`, `Underline`, `Code`, `Link`, `Color`).
- **🔌 Pluggable Extension Architecture**: Write custom extensions, commands, toolbar items, and keyboard shortcuts.
- **🌗 Pure CSS Variable Theming**: Out-of-the-box **Dark Mode** and **Light Mode**. Easily customize every color, border, and radius via standard CSS variables.

---

## 📦 Requirements

| Requirement | Minimum Version | Recommended |
|---|---|---|
| **Node.js** | `>= 18.0.0` | `20.x LTS` or `22.x` |
| **Package Manager** | `pnpm >= 9.x` / `npm >= 9.x` / `yarn >= 1.22.x` | `pnpm 9+` |
| **Browser Support** | All modern browsers (Chrome, Edge, Firefox, Safari) | Latest evergreen |

---

## 📥 Installation

Install the packages via your preferred package manager:

```bash
# Using pnpm (recommended)
pnpm add @vellora/core @vellora/ui

# Using npm
npm install @vellora/core @vellora/ui

# Using yarn
yarn add @vellora/core @vellora/ui
```

---

## 🛠️ Quick Start by Framework

### 1. Vanilla JavaScript / TypeScript

```ts
import { createEditor } from '@vellora/core';
import { createToolbar, BubbleMenu, TableFloatingMenu } from '@vellora/ui';
import '@vellora/ui/styles';

// 1. Create Editor Instance
const editor = createEditor({
  theme: 'dark', // 'dark' | 'light' | 'system'
  defaultFontFamily: 'DM Sans',
  defaultFontSize: 14,
  placeholder: 'Start writing...',
  content: '<p>Welcome to Vellora Editor!</p>',
  onUpdate: (editor) => {
    console.log('HTML:', editor.getHTML());
    console.log('JSON:', editor.getJSON());
  },
});

// 2. Setup Toolbars
const toolbar = createToolbar(editor);
editor.root.insertBefore(toolbar.element, editor.contentEl);

const bubbleMenu = new BubbleMenu(editor);
bubbleMenu.mount(editor.root);

const tableMenu = new TableFloatingMenu(editor);
tableMenu.mount(editor.root);

// 3. Mount into DOM Container
editor.mount(document.getElementById('editor-container')!);
```

---

### 2. React / Next.js

```tsx
import React, { useEffect, useRef } from 'react';
import { createEditor, VelloraEditor } from '@vellora/core';
import { createToolbar, BubbleMenu, TableFloatingMenu } from '@vellora/ui';
import '@vellora/ui/styles';

export const VelloraReactEditor: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<VelloraEditor | null>(null);

  useEffect(() => {
    if (!containerRef.current || editorRef.current) return;

    // Initialize Editor
    const editor = createEditor({
      theme: 'dark',
      defaultFontFamily: 'DM Sans',
      defaultFontSize: 14,
      content: '<h1>Hello from React!</h1><p>Start editing...</p>',
    });

    const toolbar = createToolbar(editor);
    editor.root.insertBefore(toolbar.element, editor.contentEl);

    const bubbleMenu = new BubbleMenu(editor);
    bubbleMenu.mount(editor.root);

    const tableMenu = new TableFloatingMenu(editor);
    tableMenu.mount(editor.root);

    editor.mount(containerRef.current);
    editorRef.current = editor;

    return () => {
      editor.destroy();
      editorRef.current = null;
    };
  }, []);

  return <div ref={containerRef} className="my-editor-wrapper" />;
};
```

---

### 3. Vue 3 / Nuxt

```vue
<template>
  <div ref="editorContainer" class="my-editor-wrapper" />
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { createEditor, VelloraEditor } from '@vellora/core';
import { createToolbar, BubbleMenu, TableFloatingMenu } from '@vellora/ui';
import '@vellora/ui/styles';

const editorContainer = ref<HTMLElement | null>(null);
let editor: VelloraEditor | null = null;

onMounted(() => {
  if (!editorContainer.value) return;

  editor = createEditor({
    theme: 'dark',
    defaultFontFamily: 'DM Sans',
    defaultFontSize: 14,
    content: '<h1>Hello from Vue 3!</h1>',
  });

  const toolbar = createToolbar(editor);
  editor.root.insertBefore(toolbar.element, editor.contentEl);

  const bubbleMenu = new BubbleMenu(editor);
  bubbleMenu.mount(editor.root);

  const tableMenu = new TableFloatingMenu(editor);
  tableMenu.mount(editor.root);

  editor.mount(editorContainer.value);
});

onBeforeUnmount(() => {
  editor?.destroy();
});
</script>
```

---

### 4. Svelte / SvelteKit

```svelte
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { createEditor, type VelloraEditor } from '@vellora/core';
  import { createToolbar, BubbleMenu, TableFloatingMenu } from '@vellora/ui';
  import '@vellora/ui/styles';

  let container: HTMLElement;
  let editor: VelloraEditor;

  onMount(() => {
    editor = createEditor({
      theme: 'dark',
      defaultFontFamily: 'DM Sans',
      defaultFontSize: 14,
      content: '<h1>Hello from Svelte!</h1>',
    });

    const toolbar = createToolbar(editor);
    editor.root.insertBefore(toolbar.element, editor.contentEl);

    const bubbleMenu = new BubbleMenu(editor);
    bubbleMenu.mount(editor.root);

    const tableMenu = new TableFloatingMenu(editor);
    tableMenu.mount(editor.root);

    editor.mount(container);
  });

  onDestroy(() => {
    editor?.destroy();
  });
</script>

<div bind:this={container} class="my-editor-wrapper" />
```

---

## 🔌 Custom Plugins & Extensions

You can extend Vellora with custom business logic, shortcuts, and toolbar buttons:

```ts
import { Extension, type VelloraEditor } from '@vellora/core';

export class MentionsExtension extends Extension {
  get name() {
    return 'mentions';
  }

  onInit(editor: VelloraEditor) {
    console.log('Mentions extension loaded');
  }

  defineKeyboardShortcuts() {
    return {
      'Ctrl+Shift+M': (editor) => {
        editor.commands.bold();
      },
    };
  }

  defineCommands(editor: VelloraEditor) {
    return {
      insertMention: (name: string) => {
        document.execCommand('insertHTML', false, `<span class="mention">@${name}</span>`);
      },
    };
  }
}

// Pass to editor config:
const editor = createEditor({
  extensions: [new MentionsExtension()],
});
```

---

## 🎨 CSS Variable Theming

Vellora uses standard CSS variables. You can completely customize its theme in plain CSS without touching TypeScript:

```css
/* Custom Theme Override */
[data-vellora],
[data-vellora-theme="dark"] {
  --vellora-bg: #0c0d10;
  --vellora-card-bg: #141519;
  --vellora-toolbar-bg: #18191e;
  --vellora-border: #23252f;
  --vellora-border-focus: #7c3aed;
  --vellora-primary: #7c3aed;
  --vellora-table-header-bg: #2d3342;
  --vellora-table-header-text: #e2e8f0;
  --vellora-font: 'DM Sans', sans-serif;
}
```

To switch themes dynamically at runtime:

```ts
// Switch between 'dark' and 'light'
editor.setTheme('dark');
editor.setTheme('light');
```

---

## 📖 Commands & API Reference

### Inline Formatting
- `editor.commands.bold()` — Toggle Bold (`Ctrl+B`)
- `editor.commands.italic()` — Toggle Italic (`Ctrl+I`)
- `editor.commands.underline()` — Toggle Underline (`Ctrl+U`)
- `editor.commands.strikethrough()` — Toggle Strikethrough
- `editor.commands.code()` — Toggle Inline Code (`Ctrl+E`)
- `editor.commands.subscript()` / `superscript()`
- `editor.commands.setTextColor('#ff0000')`
- `editor.commands.setHighlight('#ffff00')`

### Typography & Blocks
- `editor.commands.setFontFamily('DM Sans')`
- `editor.commands.setFontSize(16)`
- `editor.commands.increaseFontSize()` / `decreaseFontSize()`
- `editor.commands.paragraph()`
- `editor.commands.heading(1)` through `heading(6)`
- `editor.commands.blockquote()`
- `editor.commands.codeBlock()`
- `editor.commands.horizontalRule()`

### Lists & Alignment
- `editor.commands.bulletList('default' | 'circle' | 'square')`
- `editor.commands.orderedList('decimal' | 'lower-alpha' | 'lower-roman')`
- `editor.commands.taskList()`
- `editor.commands.indent()` / `outdent()`
- `editor.commands.alignLeft()` / `alignCenter()` / `alignRight()` / `alignJustify()`

### Tables (First-Class Feature)
- `editor.commands.insertTable({ rows: 3, cols: 3, withHeaderRow: true })`
- `editor.commands.addRowAbove()` / `addRowBelow()` / `deleteRow()`
- `editor.commands.addColumnLeft()` / `addColumnRight()` / `deleteColumn()`
- `editor.commands.toggleHeaderRow()`
- `editor.commands.setCellBackground('#3b82f6')`
- `editor.commands.deleteTable()`

### Document & State
- `editor.getHTML()` — Returns current content as HTML string
- `editor.getJSON()` — Returns structured document tree as JSON
- `editor.getText()` — Returns plain text content
- `editor.setContent(html)` — Updates content programmatically
- `editor.clearContent()` — Resets editor
- `editor.isActive('bold' | 'h1' | 'ul')` — Checks if format is active
- `editor.on('update' | 'selectionUpdate' | 'focus' | 'blur', callback)` — Event subscriptions

---

## 💻 Monorepo Development

To run and contribute to the editor locally:

```bash
# 1. Clone repository
git clone https://github.com/ashikurweb/vellora-editor.git
cd vellora-editor

# 2. Install dependencies
pnpm install

# 3. Start local playground dev server
pnpm playground

# Opens at http://localhost:3000
```

---

## 📄 License

MIT © [Ashikur](https://github.com/ashikurweb)
