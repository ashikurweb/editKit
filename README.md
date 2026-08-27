# EditKit Text Editor — Rich Text / WYSIWYG Editor for React, Vue, Svelte & TypeScript

<p align="center">
  <strong>An open-source, framework-agnostic rich text editor for modern web applications</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/editkit-text-editor"><img src="https://img.shields.io/npm/v/editkit-text-editor?logo=npm&label=npm" alt="editkit-text-editor npm version" /></a>
  <a href="https://www.npmjs.com/package/editkit-text-editor"><img src="https://img.shields.io/npm/dm/editkit-text-editor?logo=npm" alt="editkit-text-editor monthly downloads" /></a>
  <a href="https://github.com/ashikurweb/editKit-text-editor/blob/master/LICENSE"><img src="https://img.shields.io/npm/l/editkit-text-editor" alt="MIT license" /></a>
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white" alt="TypeScript rich text editor" />
  <img src="https://img.shields.io/badge/React%20%7C%20Vue%20%7C%20Svelte%20%7C%20Vanilla-6366f1" alt="React Vue Svelte and vanilla JavaScript support" />
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/editkit-text-editor">npm</a> ·
  <a href="https://github.com/ashikurweb/editKit-text-editor">GitHub</a> ·
  <a href="https://github.com/ashikurweb/editKit-text-editor/issues">Issues</a> ·
  <a href="#installation">Installation</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/ashikurweb/editKit-text-editor/master/assets/editkit-preview.png" alt="EditKit Rich Text Editor Preview" width="100%" style="border-radius: 12px; box-shadow: 0 12px 32px rgba(0,0,0,0.4);" />
</p>

---

## Overview

**EditKit Text Editor (`editkit-text-editor`)** is an open-source, extensible rich text and WYSIWYG editor built in TypeScript. It has official integrations for **React and Next.js**, **Vue and Nuxt**, **Svelte and SvelteKit**, and **vanilla JavaScript** without relying on ProseMirror, Lexical, Slate, Quill, or another editor engine. Angular can use the framework-agnostic API, while Laravel works through Blade/Vite or Inertia React/Vue.

Use the all-in-one `editkit-text-editor` npm package for the simplest setup, or install the smaller `@editkit/*` packages individually for a modular integration.

Crafted with high-end modern aesthetics, it delivers:
- ⚡ **Blazing Fast Performance**: Zero-bundle overhead, lightweight and instant startup.
- 🎨 **Sleek Modern UI**: Premium dark & light theme built with pure CSS variables.
- 📊 **First-Class Interactive Tables**: 6×6 visual hover grid, dynamic rows/cols manipulation, and cell coloring.
- 🌈 **2D HSV Custom Color Picker**: Full palette swatches + 2D saturation/brightness spectrum and hue slider.
- 🫧 **Contextual Floating Menus**: Smart text selection bubble toolbar, floating table controls, and image resizer.
- 🔌 **Modular Architecture**: Dedicated official packages for **React**, **Vue 3**, **Svelte**, and **Vanilla JS**.

---

## Installation

```bash
npm install editkit-text-editor
```

```ts
import {
  EditKitEditor,
  createToolbar,
  BubbleMenu,
  TableFloatingMenu,
  ImageFloatingMenu,
} from 'editkit-text-editor';
import 'editkit-text-editor/styles';

const editor = new EditKitEditor({
  content: '<h1>Hello EditKit</h1><p>Start writing...</p>',
  placeholder: 'Write something amazing...',
});

const toolbar = createToolbar(editor);
editor.root.insertBefore(toolbar.element, editor.contentEl);

new BubbleMenu(editor).mount(editor.root);
new TableFloatingMenu(editor).mount(editor.root);
new ImageFloatingMenu(editor).mount(editor.root);
editor.mount(document.querySelector('#editor')!);
```

### Package options

| Use case | Install | Import from |
| :--- | :--- | :--- |
| All-in-one / Vanilla JS | `editkit-text-editor` | `editkit-text-editor` |
| React / Next.js | `editkit-text-editor` | `editkit-text-editor/react` |
| Vue / Nuxt | `editkit-text-editor` | `editkit-text-editor/vue` |
| Svelte / SvelteKit | `editkit-text-editor` | `editkit-text-editor/svelte` |
| Angular | `editkit-text-editor` | `editkit-text-editor` (core API) |
| Laravel Blade / Vite | `editkit-text-editor` | `editkit-text-editor` (browser bundle) |
| Laravel Inertia | `editkit-text-editor` | React or Vue subpath |
| Modular core | `@editkit/core @editkit/ui` | `@editkit/core`, `@editkit/ui` |

---

## Compatibility and supported versions

| Framework / Environment | Minimum Version | Supported Range | Package to Install |
| :--- | :--- | :--- | :--- |
| **Node.js** | `>= 18.0.0` | `18.x`, `20.x`, `22.x+` | - |
| **React** | **16.8+** | `^16.8.0 \|\| ^17.0.0 \|\| ^18.0.0 \|\| ^19.0.0` | `editkit-text-editor/react` |
| **Vue** | **3.0+** | `>= 3.0.0` (Vue 3.0 through Vue 3.5+) | `editkit-text-editor/vue` |
| **Svelte** | **3.0+** | `^3.0.0 \|\| ^4.0.0 \|\| ^5.0.0` (Runes) | `editkit-text-editor/svelte` |
| **Vanilla JS / TS** | **Any** | All modern browsers (Chrome, Safari, Firefox, Edge) | `editkit-text-editor` |
| **Angular** | **Modern Angular** | Framework-agnostic manual integration | `editkit-text-editor` |
| **Laravel** | **Vite / Inertia** | Blade with JavaScript, Inertia React, or Inertia Vue | `editkit-text-editor` |

---

## Setup by framework

### 1. ⚛️ React / Next.js / Laravel Inertia React

```bash
# npm (React and React DOM are peer dependencies)
npm install editkit-text-editor react react-dom

# pnpm
pnpm add editkit-text-editor react react-dom

# yarn
yarn add editkit-text-editor react react-dom
```

#### Component Usage (`<EditKitEditor />`):

```tsx
'use client';

import React, { useState } from 'react';
import { EditKitEditor } from 'editkit-text-editor/react';
import 'editkit-text-editor/styles';

export default function App() {
  const [content, setContent] = useState('<h1>Hello EditKit</h1><p>Start writing...</p>');

  return (
    <div className="max-w-4xl mx-auto p-4">
      <EditKitEditor
        value={content}
        onChange={setContent}
        theme="dark" // 'dark' | 'light' | 'system'
        placeholder="Type something amazing..."
        // Granularly toggle any feature on/off:
        features={{
          math: false,           // Hide LaTeX Math formula modal
          chart: false,          // Hide Chart widget
          comment: false,        // Hide Comment button
          versionHistory: false, // Hide Snapshot button
          bookmark: false,       // Hide Bookmark / Pin
        }}
        bubbleMenu={true}        // Floating selection bubble menu
        tableMenu={true}         // Contextual floating table actions
        imageMenu={true}         // Floating image resize bar
      />
    </div>
  );
}
```

#### Hook Usage (`useEditKitEditor`):

```tsx
import React from 'react';
import { useEditKitEditor } from 'editkit-text-editor/react';
import 'editkit-text-editor/styles';

export function CustomEditor() {
  const { editor, containerRef } = useEditKitEditor({
    content: '<p>Custom headless integration</p>',
    theme: 'dark',
    features: {
      chart: false,
    },
  });

  return (
    <div>
      <div className="custom-actions">
        <button onClick={() => editor?.commands.bold()}>Bold</button>
        <button onClick={() => editor?.commands.italic()}>Italic</button>
      </div>
      <div ref={containerRef} />
    </div>
  );
}
```

---

### 2. 🟢 Vue 3 / Nuxt 3 / Laravel Inertia Vue

```bash
# npm
npm install editkit-text-editor vue

# pnpm
pnpm add editkit-text-editor vue
```

#### Component Usage (`<EditKitEditor />` with `v-model`):

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { EditKitEditor } from 'editkit-text-editor/vue';
import 'editkit-text-editor/styles';

const content = ref('<p>Hello from Vue 3 and EditKit!</p>');
</script>

<template>
  <div class="editor-wrapper">
    <EditKitEditor
      v-model="content"
      theme="dark"
      placeholder="Start typing in Vue..."
      :features="{
        math: false,
        chart: false,
        table: true,
        emoji: true,
      }"
      :bubble-menu="true"
      :table-menu="true"
      :image-menu="true"
    />
  </div>
</template>
```

#### Composable Usage (`useEditKitEditor`):

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { useEditKitEditor } from 'editkit-text-editor/vue';
import 'editkit-text-editor/styles';

const editorEl = ref<HTMLElement | null>(null);
const { editor } = useEditKitEditor(editorEl, {
  content: '<p>Composable based editor</p>',
  theme: 'dark',
});
</script>

<template>
  <div>
    <button @click="editor?.commands.bold()">Bold</button>
    <div ref="editorEl" />
  </div>
</template>
```

---

### 3. 🟠 Svelte / SvelteKit (Svelte 3, 4, 5)

```bash
# npm
npm install editkit-text-editor svelte

# pnpm
pnpm add editkit-text-editor svelte
```

#### Svelte Action Usage (`use:editkit`):

```svelte
<script lang="ts">
  import { editkit } from 'editkit-text-editor/svelte';
  import 'editkit-text-editor/styles';

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

### 4. 🍦 Vanilla JavaScript / TypeScript

```bash
npm install editkit-text-editor
```

```ts
import { EditKitEditor, createToolbar, BubbleMenu, TableFloatingMenu, ImageFloatingMenu } from 'editkit-text-editor';
import 'editkit-text-editor/styles';

// 1. Initialize core editor
const editor = new EditKitEditor({
  theme: 'dark', // 'dark' | 'light' | 'system'
  defaultFontFamily: 'DM Sans',
  defaultFontSize: 14,
  placeholder: 'Start writing...',
  content: '<p>Welcome to EditKit!</p>',
  onUpdate: (ed) => {
    console.log('HTML:', ed.getHTML());
  },
});

// 2. Attach Toolbar (with custom feature toggles)
const toolbar = createToolbar(editor, {
  features: {
    chart: false,
    math: false,
  },
});
editor.root.insertBefore(toolbar.element, editor.contentEl);

// 3. Attach Floating Menus
new BubbleMenu(editor).mount(editor.root);
new TableFloatingMenu(editor).mount(editor.root);
new ImageFloatingMenu(editor).mount(editor.root);

// 4. Mount into container element
editor.mount(document.getElementById('editor')!);
```

---

### 5. Angular

Angular uses the same framework-agnostic API; there is no separate Angular wrapper package.

```ts
import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { EditKitEditor, createToolbar } from 'editkit-text-editor';
import 'editkit-text-editor/styles';

@Component({
  selector: 'app-editor',
  standalone: true,
  template: '<div #editorHost></div>',
})
export class EditorComponent implements AfterViewInit, OnDestroy {
  @ViewChild('editorHost', { static: true }) editorHost!: ElementRef<HTMLDivElement>;
  private editor?: EditKitEditor;

  ngAfterViewInit(): void {
    this.editor = new EditKitEditor({ content: '<p>Hello from Angular!</p>' });
    const toolbar = createToolbar(this.editor);
    this.editor.root.insertBefore(toolbar.element, this.editor.contentEl);
    this.editor.mount(this.editorHost.nativeElement);
  }

  ngOnDestroy(): void {
    this.editor?.destroy();
  }
}
```

---

### 6. Laravel Blade, Vite, and Inertia

EditKit runs in the browser rather than PHP. Use the React or Vue setup above for Laravel Inertia, or mount the vanilla editor from a Vite entry for Blade:

```ts
// resources/js/editor.ts
import { EditKitEditor, createToolbar } from 'editkit-text-editor';
import 'editkit-text-editor/styles';

const host = document.querySelector<HTMLElement>('#editor');

if (host) {
  const editor = new EditKitEditor({ content: '<p>Hello from Laravel!</p>' });
  const toolbar = createToolbar(editor);
  editor.root.insertBefore(toolbar.element, editor.contentEl);
  editor.mount(host);
}
```

```blade
<div id="editor"></div>
@vite('resources/js/editor.ts')
```

---

## 🎛️ Feature & Toolbar Configuration Props

When configuring the toolbar via `features` (in React/Vue/Svelte or Vanilla), you can toggle any button or tool individually:

| Feature Key | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `history` | `boolean` | `true` | Undo & Redo button group |
| `block` | `boolean` | `true` | Paragraph & Headings dropdown (Heading 1 to 6) |
| `fontFamily` | `boolean` | `true` | Font family picker (DM Sans, Inter, Geist, etc.) |
| `fontSize` | `boolean` | `true` | Font size stepper (`- 14 +`) |
| `bold` | `boolean` | `true` | Bold formatting button (`B`) |
| `format` | `boolean` | `true` | Extra formats (Italic, Underline, Strikethrough, Code, Sub/Superscript) |
| `color` | `boolean` | `true` | Text color & background highlight color popover (`A ˅`) |
| `align` | `boolean` | `true` | Alignment dropdown (Left, Center, Right, Justify) |
| `lists` | `boolean` | `true` | Bullet, Numbered, Task lists, Indent/Outdent & Line Height |
| `image` | `boolean` | `true` | Image dropzone upload & URL modal |
| `table` | `boolean` | `true` | Interactive 6x6 visual hover grid table inserter |
| `chart` | `boolean` | `true` | Insert Chart widget |
| `math` | `boolean` | `true` | LaTeX Math & Equation editor modal |
| `link` | `boolean` | `true` | In-place floating link preview & editor popover |
| `emoji` | `boolean` | `true` | Searchable emoji picker with category tabs |
| `symbol` | `boolean` | `true` | Special characters & math symbols picker |
| `bookmark` | `boolean` | `true` | Pin / Bookmark action |
| `selectAll` | `boolean` | `true` | Select all editor content (`⌘A`) |
| `clearAll` | `boolean` | `true` | Clear all content button (Cross icon, enabled only when all selected) |
| `comment` | `boolean` | `true` | Add comment button |
| `versionHistory` | `boolean` | `true` | Version snapshot history button |
| `more` | `boolean` | `true` | More tools dropdown (`+ ˅`) |

---

## 🎨 CSS Variable Theming

EditKit is styled using standard, cleanly scoped CSS variables. You can easily override colors, radii, and surfaces in plain CSS:

```css
[data-editkit],
[data-editkit-theme="dark"] {
  --editkit-bg: #0c0d10;
  --editkit-card-bg: #141519;
  --editkit-toolbar-bg: #18191e;
  --editkit-border: #23252f;
  --editkit-border-focus: #7c3aed;
  --editkit-primary: #7c3aed;
  --editkit-font: 'DM Sans', sans-serif;
}
```

---

## Frequently asked questions

### What is EditKit Text Editor?

EditKit Text Editor is an open-source rich text/WYSIWYG editor written in TypeScript. The `editkit-text-editor` package provides a vanilla JavaScript editor plus dedicated integrations for React, Next.js, Vue, Nuxt, Svelte, and SvelteKit. Angular uses the core API directly; Laravel uses the browser package through Vite or an Inertia frontend.

### Is EditKit an alternative to TipTap, Quill, Lexical, Slate, or ProseMirror?

Yes. EditKit provides its own editor engine, toolbar, tables, floating menus, image controls, color picker, and theming without depending on those editor frameworks.

### Can I build a headless or custom toolbar editor?

Yes. Use the core editor commands directly, call `useEditKitEditor` in React, use the Vue composable, or configure individual toolbar features.

### Is it free for commercial projects?

Yes. EditKit Text Editor is open source under the MIT License.

---

## 💻 Local Playground & Development

To run the interactive live playground locally:

```bash
# 1. Install dependencies
pnpm install

# 2. Start Playground dev server
pnpm playground

# Runs at http://localhost:5173
```

---

## 📄 License

MIT © [Ashikur Rahman](https://github.com/ashikurweb) · [Source code](https://github.com/ashikurweb/editKit-text-editor) · [npm package](https://www.npmjs.com/package/editkit-text-editor)
