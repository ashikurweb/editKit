# EditKit Vue Rich Text Editor — `@editkit/vue`

<p align="center">
  <strong>A TypeScript WYSIWYG editor component and composable for Vue 3 and Nuxt</strong>
</p>

`@editkit/vue` is the official Vue 3 and Nuxt integration for [EditKit Text Editor](https://www.npmjs.com/package/editkit-text-editor), with `v-model`, native tables, a color picker, and floating menus.

<p align="center">
  <a href="https://www.npmjs.com/package/@editkit/vue"><img src="https://img.shields.io/npm/v/@editkit/vue?logo=npm" alt="@editkit/vue npm version" /></a>
  <a href="https://www.npmjs.com/package/@editkit/vue"><img src="https://img.shields.io/npm/dm/@editkit/vue?logo=npm" alt="@editkit/vue monthly downloads" /></a>
  <img src="https://img.shields.io/badge/Vue-3.x-42b883?logo=vuedotjs&logoColor=white" alt="Vue 3 Support" />
  <img src="https://img.shields.io/badge/Nuxt-3.x-00dc82?logo=nuxt.js&logoColor=white" alt="Nuxt 3 Ready" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Editor%20Engine-First%20Party-8b5cf6" alt="No third-party editor engine" />
  <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License" />
</p>

---

## ⚡ Why @editkit/vue?

- 🚀 **No Third-Party Editor Engine**: Built in TypeScript without ProseMirror, Lexical, Slate, or Quill.
- 🟢 **Native Vue 3**: Fully supports `v-model`, `ref`, `reactive`, `<script setup>`, and Nuxt 3.
- 📊 **First-Class Interactive Tables**: 6×6 hover grid selector, single-click row/column management, and cell coloring.
- 🎨 **2D HSV Custom Color Picker**: 21 palette swatches + 2D spectrum canvas and hue slider.
- 🫧 **Contextual Floating Menus**: Smart text selection bubble toolbar, floating table actions, and image resize bar.
- 🎛️ **Granular Feature Props**: Turn any toolbar button on or off with boolean props.
- 🌗 **CSS Variable Theming**: Sleek dark & light modes. Easily customized via plain CSS.

---

## 📦 Installation

```bash
# Using npm
npm install @editkit/vue @editkit/ui

# Using pnpm
pnpm add @editkit/vue @editkit/ui

# Using yarn
yarn add @editkit/vue @editkit/ui
```

All-in-one alternative: `npm install editkit-text-editor vue`, then import from `editkit-text-editor/vue` and `editkit-text-editor/styles`.

---

## 🚀 Quick Start

### 1. Ready-to-Use Component (`<EditKitEditor />` with `v-model`)

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { EditKitEditor } from '@editkit/vue';
import '@editkit/ui/styles';

const content = ref('<p>Hello from Vue 3 and EditKit!</p>');
</script>

<template>
  <div class="editor-wrapper max-w-4xl mx-auto p-4">
    <EditKitEditor
      v-model="content"
      theme="dark"
      placeholder="Start typing in Vue..."
      :features="{
        math: false,           // Hide LaTeX Math formula modal
        chart: false,          // Hide Chart widget
        table: true,           // Interactive 6x6 table grid
        emoji: true,           // Emoji picker
      }"
      :bubble-menu="true"
      :table-menu="true"
      :image-menu="true"
    />
  </div>
</template>
```

---

### 2. Composable (`useEditKitEditor`)

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { useEditKitEditor } from '@editkit/vue';
import '@editkit/ui/styles';

const editorEl = ref<HTMLElement | null>(null);
const { editor } = useEditKitEditor(editorEl, {
  content: '<p>Composable based editor</p>',
  theme: 'dark',
});
</script>

<template>
  <div>
    <div class="toolbar flex gap-2 mb-2">
      <button @click="editor?.commands.bold()">Bold</button>
      <button @click="editor?.commands.italic()">Italic</button>
      <button @click="editor?.commands.insertTable({ rows: 3, cols: 3 })">Table</button>
    </div>
    <div ref="editorEl" />
  </div>
</template>
```

---

## 🎛️ Complete Component Props Reference

### Core Editor Props (`<EditKitEditor />`)

| Prop Name | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `v-model` (`modelValue`) | `string` | `undefined` | Two-way bound HTML content |
| `defaultValue` | `string` | `undefined` | Initial uncontrolled HTML content |
| `theme` | `'light' \| 'dark' \| 'system'` | `'dark'` | Theme appearance |
| `placeholder` | `string` | `'Write something...'` | Empty editor placeholder text |
| `editable` | `boolean` | `true` | Read-only mode toggle |
| `autofocus` | `boolean` | `false` | Focus the editor after mounting |
| `defaultFontFamily` | `string` | `'DM Sans'` | Initial editor font family |
| `defaultFontSize` | `number` | `14` | Initial editor font size in pixels |
| `historyDepth` | `number` | `100` | Maximum undo history entries |
| `extensions` | `Extension[]` | `[]` | Core extensions to register |
| `customToolbarItems` | `CustomToolbarItem[]` | `[]` | Typed controls appended to the toolbar |
| `showToolbar` | `boolean` | `true` | Show or hide the top formatting toolbar |
| `bubbleMenu` | `boolean` | `true` | Enable floating selection bubble toolbar |
| `tableMenu` | `boolean` | `true` | Enable contextual table action floating menu |
| `imageMenu` | `boolean` | `true` | Enable floating image resizer menu |
| `className` | `string` | `''` | Custom CSS class name on root container |
| `features` | `ToolbarFeaturesConfig` | `{}` | Granular toolbar button toggles (see table below) |

---

### Toolbar Feature Flags (`features` prop)

| Feature Key | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `history` | `boolean` | `true` | Undo & Redo button group |
| `block` | `boolean` | `true` | Paragraph & Headings dropdown (Heading 1 to 6) |
| `fontFamily` | `boolean` | `true` | Font family dropdown (DM Sans, Inter, Geist, etc.) |
| `fontSize` | `boolean` | `true` | Font size stepper (`- 14 +`) |
| `bold` | `boolean` | `true` | Bold formatting button (`B`) |
| `format` | `boolean` | `true` | Extra formats (Italic, Underline, Strikethrough, Code, Sub/Superscript) |
| `color` | `boolean` | `true` | Text color & background highlight color popover (`A ˅`) |
| `align` | `boolean` | `true` | Alignment dropdown (Left, Center, Right, Justify) & Line Height |
| `lists` | `boolean` | `true` | Bullet, Numbered, Task lists & Indent/Outdent |
| `image` | `boolean` | `true` | Image dropzone upload & URL modal |
| `table` | `boolean` | `true` | Interactive 6×6 visual hover grid table inserter |
| `chart` | `boolean` | `true` | Insert Chart widget |
| `math` | `boolean` | `true` | LaTeX Math & Equation editor modal |
| `link` | `boolean` | `true` | In-place floating link preview & editor popover (`Ctrl+K`) |
| `emoji` | `boolean` | `true` | Searchable emoji picker with category tabs |
| `symbol` | `boolean` | `true` | Special characters & math symbols picker (`Ω`) |
| `panel` | `boolean` | `true` | Info, warning, error, success, and note panels |
| `insertElements` | `boolean` | `true` | Dividers, uploads, signatures, and layout blocks |
| `selectAll` | `boolean` | `true` | Select all editor content (`⌘A`) |
| `clearAll` | `boolean` | `true` | Clear all content button (Cross icon, enabled only when all selected) |
| `preview` | `boolean` | `true` | Responsive document preview button |

---

## 🎨 CSS Variable Theming

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

> `v-model`, `defaultValue`, and composable `content` are trusted-HTML inputs. Sanitize content from users or external systems before passing it to EditKit and before rendering saved HTML.

---

## 📄 License

MIT © [Ashikur Rahman](https://github.com/ashikurweb)
