# EditKit Text Editor — TypeScript Rich Text & WYSIWYG Editor

<p align="center">
  <strong>Open-source rich text editor for React, Next.js, Vue, Nuxt, Svelte, SvelteKit, Angular, Laravel, and JavaScript</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/editkit-text-editor"><img src="https://img.shields.io/npm/v/editkit-text-editor?logo=npm&label=npm" alt="editkit-text-editor npm version" /></a>
  <a href="https://www.npmjs.com/package/editkit-text-editor"><img src="https://img.shields.io/npm/dm/editkit-text-editor?logo=npm" alt="editkit-text-editor monthly downloads" /></a>
  <a href="https://github.com/ashikurweb/editKit-text-editor/blob/master/LICENSE"><img src="https://img.shields.io/npm/l/editkit-text-editor" alt="MIT license" /></a>
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white" alt="TypeScript rich text editor" />
  <img src="https://img.shields.io/badge/React%20%7C%20Vue%20%7C%20Svelte%20%7C%20Angular%20%7C%20Laravel-6366f1" alt="React Vue Svelte Angular and Laravel rich text editor support" />
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/editkit-text-editor">npm</a> ·
  <a href="https://github.com/ashikurweb/editKit-text-editor">GitHub</a> ·
  <a href="https://github.com/ashikurweb/editKit-text-editor/issues">Issues</a> ·
  <a href="#install-editkit-text-editor">Installation</a>
</p>

## Overview

`editkit-text-editor` is an open-source TypeScript rich text and WYSIWYG editor npm package for React, Next.js, Vue 3, Nuxt, Svelte, SvelteKit, Angular, Laravel, and vanilla JavaScript. It includes a complete customizable UI, interactive tables, image tools, an HTML editor output API, and dark/light themes.

The default factory and framework integrations mount the same maintained editor UI. Feature flags, CSS variables, commands, extensions, and custom toolbar items let an application customize it without maintaining a fork.

Official entry points cover React/Next.js, Vue/Nuxt, Svelte/SvelteKit, and vanilla JavaScript. Angular uses the framework-agnostic browser API; Laravel can use that API through Vite or a React/Vue adapter through Inertia.

## Rich text editor features

- Complete WYSIWYG toolbar, selection bubble menu, document preview, and HTML output
- Interactive tables with row, column, cell, resize, and contextual-menu tools
- Images, links, colors, lists, emoji, symbols, charts, math, panels, and content blocks
- TypeScript types, ESM and CommonJS builds, SSR-safe imports, and responsive layouts
- React, Next.js, Vue, Nuxt, Svelte, SvelteKit, Angular, Laravel Vite, and vanilla JavaScript support
- No third-party editor engine; the core editing engine and UI are maintained in this repository

## Install EditKit Text Editor

Choose the integration for your framework. Each option provides the same default UI and imports the stylesheet from `editkit-text-editor/styles`.

React, Vue, and Svelte are normally already installed in projects created with their official framework tools; the commands below make those peer requirements explicit.

| Framework | Install | JavaScript / TypeScript import |
| :--- | :--- | :--- |
| Vanilla JavaScript or TypeScript | `npm install editkit-text-editor` | `editkit-text-editor` |
| React, Next.js, or Laravel Inertia React | `npm install editkit-text-editor react react-dom` | `editkit-text-editor/react` |
| Vue 3, Nuxt, or Laravel Inertia Vue | `npm install editkit-text-editor vue` | `editkit-text-editor/vue` |
| Svelte or SvelteKit | `npm install editkit-text-editor svelte` | `editkit-text-editor/svelte` |
| Angular | `npm install editkit-text-editor` | `editkit-text-editor` |
| Laravel Blade with Vite | `npm install editkit-text-editor` | `editkit-text-editor` |

### Vanilla JavaScript and TypeScript quick start

```bash
npm install editkit-text-editor
```

Import the stylesheet once in your application entry, layout, or global CSS entry. Without it, the editor works but does not have the standard EditKit appearance.

```ts
import { createEditKit } from 'editkit-text-editor';
import 'editkit-text-editor/styles';

const editkit = createEditKit({
  element: '#editor',
  content: '<h1>Hello EditKit</h1><p>Start writing...</p>',
  theme: 'dark',
  placeholder: 'Write something amazing...',
  onUpdate: (editor) => {
    console.log(editor.getHTML());
  },
});

// Later, when the page/view is torn down:
// editkit.destroy();
```

```html
<div id="editor"></div>
```

`createEditKit()` mounts the default toolbar, bubble menu, table menu, and image menu. Its return value exposes those UI instances and the core `editor`, plus one idempotent `destroy()` method for complete cleanup.

## Package entry points

| Use case | Import |
| :--- | :--- |
| Complete UI / vanilla / Angular / Laravel Blade | `editkit-text-editor` |
| React / Next.js / Laravel Inertia React | `editkit-text-editor/react` |
| Vue 3 / Nuxt / Laravel Inertia Vue | `editkit-text-editor/vue` |
| Svelte / SvelteKit | `editkit-text-editor/svelte` |
| Default stylesheet | `editkit-text-editor/styles` |
| Modular editor engine | `@editkit/core` |
| Modular visual components and stylesheet | `@editkit/ui`, `@editkit/ui/styles` |

The editor mounts DOM, so create it in a browser/client lifecycle. Package entry points can be imported by SSR builds, but mounting must wait until the browser is available.

## Framework setup

### React and Next.js

Install React and React DOM alongside the all-in-one package, then use the React subpath. In a Next.js App Router project, keep the component in a client module.

```tsx
'use client';

import { useState } from 'react';
import { EditKitEditor } from 'editkit-text-editor/react';
import 'editkit-text-editor/styles';

export default function EditorPage() {
  const [content, setContent] = useState('<p>Hello from React.</p>');

  return (
    <EditKitEditor
      value={content}
      onChange={setContent}
      theme="dark"
      features={{ panel: true, insertElements: true, math: false }}
    />
  );
}
```

The component and `useEditKitEditor()` hook destroy the editor and all mounted UI when React unmounts them.

### Vue 3 and Nuxt

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { EditKitEditor } from 'editkit-text-editor/vue';
import 'editkit-text-editor/styles';

const content = ref('<p>Hello from Vue.</p>');
</script>

<template>
  <ClientOnly>
    <EditKitEditor
      v-model="content"
      theme="dark"
      :features="{ panel: true, insertElements: true, math: false }"
    />
  </ClientOnly>
</template>
```

`ClientOnly` is a Nuxt component; omit it in a client-rendered Vue application. The component and `useEditKitEditor()` composable clean up automatically on unmount.

### Svelte and SvelteKit

```svelte
<script lang="ts">
  import { editkit } from 'editkit-text-editor/svelte';
  import 'editkit-text-editor/styles';

  let content = '<p>Hello from Svelte.</p>';
</script>

<div
  use:editkit={{
    content,
    theme: 'dark',
    features: { panel: true, insertElements: true, math: false },
    onChange: (html) => (content = html),
  }}
/>
```

Svelte invokes the action's cleanup when the element is removed.

### Angular

There is no separate Angular adapter. Mount the complete browser UI in `ngAfterViewInit()` and destroy it in `ngOnDestroy()`.

```ts
import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { createEditKit, type EditKitInstance } from 'editkit-text-editor';
import 'editkit-text-editor/styles';

@Component({
  selector: 'app-editor',
  standalone: true,
  template: '<div #editorHost></div>',
})
export class EditorComponent implements AfterViewInit, OnDestroy {
  @ViewChild('editorHost', { static: true }) editorHost!: ElementRef<HTMLDivElement>;
  private editkit?: EditKitInstance;

  ngAfterViewInit(): void {
    this.editkit = createEditKit({
      element: this.editorHost.nativeElement,
      content: '<p>Hello from Angular.</p>',
    });
  }

  ngOnDestroy(): void {
    this.editkit?.destroy();
  }
}
```

### Laravel Blade, Vite, and Inertia

EditKit runs in the browser, not in PHP. Use the React or Vue entry point for Inertia, or mount the complete UI from a Vite entry for Blade.

```js
// resources/js/app.js
import { createEditKit } from 'editkit-text-editor';
import 'editkit-text-editor/styles';

const host = document.querySelector('#editor');
const editkit = host
  ? createEditKit({ element: host, content: '<p>Hello from Laravel.</p>' })
  : null;

// Prevent duplicate listeners during Vite hot updates.
import.meta.hot?.dispose(() => editkit?.destroy());
```

```blade
<div id="editor"></div>
@vite(['resources/css/app.css', 'resources/js/app.js'])
```

## Configuration

`createEditKit(options)` accepts all core editor options plus these complete-UI options:

| Option | Type | Default | Purpose |
| :--- | :--- | :--- | :--- |
| `element` | `HTMLElement \| string` | required | Host element or selector |
| `showToolbar` | `boolean` | `true` | Mount the standard toolbar |
| `features` | `ToolbarFeaturesConfig` | all enabled | Toggle standard toolbar controls |
| `toolbar` | `ToolbarConfig` | `{}` | Advanced toolbar configuration |
| `bubbleMenu` | `boolean` | `true` | Mount the selection bubble menu |
| `tableMenu` | `boolean` | `true` | Mount contextual table controls |
| `imageMenu` | `boolean` | `true` | Mount contextual image controls |

Core options include `content`, `editable`, `theme`, `placeholder`, `autofocus`, default font settings, history depth, extensions, custom toolbar items, and lifecycle callbacks.

### Toolbar feature flags

Omitted flags default to `true`.

| Flag | Controls |
| :--- | :--- |
| `history`, `undo`, `redo` | History controls; `history: false` hides both undo and redo |
| `block`, `fontFamily`, `fontSize` | Block type and typography controls |
| `bold`, `format`, `color` | Inline formatting and colors |
| `align`, `lists` | Alignment, line height, lists, and indentation |
| `image`, `table`, `chart`, `math`, `link`, `emoji`, `symbol` | Media and rich-content tools |
| `panel` | Info, warning, error, success, and note panel menu |
| `insertElements` | Standalone insert menu for dividers, uploads, signatures, editorial elements, blocks, and patterns |
| `selectAll`, `clearAll`, `preview` | Selection, clear-content, and document-preview controls |

`panel` and `insertElements` are separate flags. Disabling one does not implicitly disable the other.

```ts
const editkit = createEditKit({
  element: '#editor',
  features: {
    chart: false,
    math: false,
    panel: true,
    insertElements: true,
  },
});
```

## Customization

### Keep the default UI and change its theme

Scope CSS overrides to your editor wrapper. The standard stylesheet remains the base, so controls and responsive behavior keep their default design.

```html
<div class="brand-editor"><div id="editor"></div></div>
```

```css
.brand-editor [data-editkit] {
  --editkit-bg: #0b1020;
  --editkit-card-bg: #111827;
  --editkit-toolbar-bg: #172033;
  --editkit-content-bg: #101827;
  --editkit-border: #334155;
  --editkit-border-focus: #22c55e;
  --editkit-primary: #22c55e;
  --editkit-font: Inter, sans-serif;
  --editkit-radius-card: 14px;
  --editkit-radius-btn: 5px;
}
```

### Add an application-specific toolbar item

`customToolbarItems` keeps the standard toolbar and appends typed application controls. An extension can also return the same item shape from `defineToolbarItems()`.

```ts
const editkit = createEditKit({
  element: '#editor',
  customToolbarItems: [
    {
      id: 'save-document',
      label: 'Save',
      tooltip: 'Save document',
      group: 'right',
      onClick: (editor) => saveDocument(editor.getHTML()),
    },
  ],
});
```

### Replace the standard toolbar

For a fully application-owned toolbar, disable the standard toolbar and call core commands from your own controls.

```ts
const editkit = createEditKit({ element: '#editor', showToolbar: false });

document.querySelector('#bold')?.addEventListener('click', () => {
  editkit.editor.commands.bold();
});
```

## Content safety

`content`, `value`, `defaultValue`, `modelValue`, and `editor.setContent()` are trusted-HTML APIs. EditKit does not sanitize arbitrary HTML supplied through those APIs. Sanitize content from users, APIs, databases, Markdown converters, or other untrusted sources before passing it to the editor, and apply the same policy when rendering saved HTML elsewhere.

```ts
import DOMPurify from 'dompurify';

const editkit = createEditKit({
  element: '#editor',
  content: DOMPurify.sanitize(untrustedHTML),
});
```

`dompurify` is an example and is not bundled with EditKit. Configure any sanitizer according to the HTML elements and attributes your application permits.

## Lifecycle and output

- Call `destroy()` for every manually created `createEditKit()` instance.
- React, Vue, and Svelte integrations perform their own unmount cleanup.
- `editor.getHTML()` returns HTML, `getText()` returns plain text, and `getJSON()` returns EditKit's document representation.
- Controlled framework values should be updated through their documented binding (`value`, `v-model`, or the Svelte action options).

## Modular installation

Applications that want to assemble the editor engine and UI separately can install the scoped packages:

```bash
npm install @editkit/core @editkit/ui
```

```ts
import { EditKitEditor } from '@editkit/core';
import { createToolbar } from '@editkit/ui';
import '@editkit/ui/styles';
```

See each package README for manual lifecycle guidance.

## Development

```bash
pnpm install
pnpm verify
pnpm playground
```

## License

MIT © [Ashikur Rahman](https://github.com/ashikurweb) · [Source code](https://github.com/ashikurweb/editKit-text-editor) · [npm package](https://www.npmjs.com/package/editkit-text-editor)
