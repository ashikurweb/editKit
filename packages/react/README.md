# EditKit React Rich Text Editor — `@editkit/react`

<p align="center">
  <strong>A TypeScript WYSIWYG editor component and hook for React and Next.js</strong>
</p>

`@editkit/react` is the official React and Next.js integration for [EditKit Text Editor](https://www.npmjs.com/package/editkit-text-editor), with native tables, a color picker, floating menus, and modular toolbars.

<p align="center">
  <a href="https://www.npmjs.com/package/@editkit/react"><img src="https://img.shields.io/npm/v/@editkit/react?logo=npm" alt="@editkit/react npm version" /></a>
  <a href="https://www.npmjs.com/package/@editkit/react"><img src="https://img.shields.io/npm/dm/@editkit/react?logo=npm" alt="@editkit/react monthly downloads" /></a>
  <img src="https://img.shields.io/badge/React-16.8%2B%20%7C%2017%20%7C%2018%20%7C%2019-61dafb?logo=react&logoColor=black" alt="React 18 & 19" />
  <img src="https://img.shields.io/badge/Next.js-App%20%26%20Pages%20Router-black?logo=next.js&logoColor=white" alt="Next.js Support" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white" alt="TypeScript Ready" />
  <img src="https://img.shields.io/badge/Editor%20Engine-First%20Party-8b5cf6" alt="No third-party editor engine" />
  <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License" />
</p>

---

## ⚡ Why @editkit/react?

- 🚀 **No Third-Party Editor Engine**: Built in TypeScript without ProseMirror, Lexical, Slate, or Quill.
- ⚛️ **Universal React Support**: Works seamlessly in **React 16.8+**, **React 18**, **React 19**, **Next.js (App & Pages Router)**, **Remix**, and **Laravel Inertia React**.
- 📊 **First-Class Interactive Tables**: 6×6 visual hover grid, one-click row/column add & delete, cell background coloring, and contextual table menu.
- 🎨 **2D HSV Custom Color Picker**: Text and background highlight color with 21 palette swatches + 2D saturation/brightness spectrum and hue slider.
- 🫧 **Contextual Floating Menus**: Smart text selection bubble toolbar, floating table actions, and image resize bar.
- 🎛️ **Granular Feature Props**: Turn any toolbar item on or off with simple boolean props.
- 🌗 **CSS Variable Theming**: Beautiful dark & light modes out of the box. Fully customizable with plain CSS.

---

## 📦 Installation

```bash
# Using npm
npm install @editkit/react @editkit/ui

# Using pnpm (recommended)
pnpm add @editkit/react @editkit/ui

# Using yarn
yarn add @editkit/react @editkit/ui
```

All-in-one alternative: `npm install editkit-text-editor react react-dom`, then import from `editkit-text-editor/react` and `editkit-text-editor/styles`.

---

## 🚀 Quick Start

### 1. Ready-to-Use Component (`<EditKitEditor />`)

```tsx
'use client';

import React, { useState } from 'react';
import { EditKitEditor } from '@editkit/react';
import '@editkit/ui/styles';

export default function App() {
  const [content, setContent] = useState('<h1>Hello EditKit</h1><p>Start writing...</p>');

  return (
    <div className="max-w-4xl mx-auto p-4">
      <EditKitEditor
        value={content}
        onChange={setContent}
        theme="dark" // 'dark' | 'light' | 'system'
        placeholder="Type something amazing..."
        // Granularly toggle any feature on or off:
        features={{
          math: false,           // Hide LaTeX Math formula modal
          chart: false,          // Hide Chart widget
          panel: false,          // Hide callout / panel menu
          insertElements: false, // Hide Insert Elements menu
        }}
        bubbleMenu={true}        // Floating selection bubble menu
        tableMenu={true}         // Contextual floating table actions
        imageMenu={true}         // Floating image resize bar
      />
    </div>
  );
}
```

---

### 2. Custom Headless Hook (`useEditKitEditor`)

If you want to build custom toolbars or programmatic workflows:

```tsx
import React from 'react';
import { useEditKitEditor } from '@editkit/react';
import '@editkit/ui/styles';

export function CustomEditor() {
  const { editor, containerRef } = useEditKitEditor({
    content: '<p>Custom headless editor</p>',
    theme: 'dark',
    features: {
      chart: false,
    },
  });

  return (
    <div>
      <div className="custom-toolbar flex gap-2 mb-2">
        <button onClick={() => editor?.commands.bold()}>Bold</button>
        <button onClick={() => editor?.commands.italic()}>Italic</button>
        <button onClick={() => editor?.commands.heading(2)}>H2</button>
        <button onClick={() => editor?.commands.insertTable({ rows: 3, cols: 3 })}>Table</button>
      </div>
      <div ref={containerRef} className="editor-container" />
    </div>
  );
}
```

---

## 🎛️ Complete Component Props Reference

### Core Editor Props (`<EditKitEditor />`)

| Prop Name | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `value` | `string` | `undefined` | Controlled HTML content of the editor |
| `defaultValue` | `string` | `undefined` | Initial uncontrolled HTML content |
| `onChange` | `(html: string) => void` | - | Callback triggered whenever content changes |
| `onFocus` | `(editor: EditKitEditor) => void` | - | Callback when editor gains focus |
| `onBlur` | `(editor: EditKitEditor) => void` | - | Callback when editor loses focus |
| `theme` | `'light' \| 'dark' \| 'system'` | `'dark'` | Visual theme mode |
| `placeholder` | `string` | `'Write something...'` | Placeholder text when empty |
| `editable` | `boolean` | `true` | Read-only mode toggle (`false` makes it non-editable) |
| `showToolbar` | `boolean` | `true` | Show or hide the top formatting toolbar |
| `bubbleMenu` | `boolean` | `true` | Enable floating selection bubble toolbar |
| `tableMenu` | `boolean` | `true` | Enable contextual table action floating menu |
| `imageMenu` | `boolean` | `true` | Enable floating image resizer menu |
| `className` | `string` | `''` | Custom CSS class name on root container |
| `features` | `ToolbarFeaturesConfig` | `{}` | Granular toolbar button toggles (see table below) |

---

### Toolbar Feature Flags (`features` prop)

You can pass `features={{ [key]: boolean }}` to customize every single button on the toolbar:

| Feature Key | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `history` | `boolean` | `true` | Undo (`Ctrl+Z`) & Redo (`Ctrl+Y`) button group |
| `block` | `boolean` | `true` | Paragraph & Heading dropdown (Heading 1 to 6) |
| `fontFamily` | `boolean` | `true` | Font family dropdown (DM Sans, Inter, Geist, etc.) |
| `fontSize` | `boolean` | `true` | Font size stepper (`- 14 +`) |
| `bold` | `boolean` | `true` | Bold text button (`B`) |
| `format` | `boolean` | `true` | Character formats dropdown (Italic, Underline, Strikethrough, Code, Sub/Superscript) |
| `color` | `boolean` | `true` | 2D HSV color picker popover (`A ˅`) |
| `align` | `boolean` | `true` | Text alignment dropdown (Left, Center, Right, Justify) & Line Height |
| `lists` | `boolean` | `true` | Bullet, Numbered, Task lists & Indent/Outdent |
| `image` | `boolean` | `true` | Image upload dropzone & URL modal |
| `table` | `boolean` | `true` | Interactive 6×6 visual hover grid table inserter |
| `chart` | `boolean` | `true` | Insert Chart / Poll widget |
| `math` | `boolean` | `true` | LaTeX Math & Equation editor modal |
| `link` | `boolean` | `true` | In-place floating link preview & edit popover (`Ctrl+K`) |
| `emoji` | `boolean` | `true` | Searchable emoji picker with category tabs |
| `symbol` | `boolean` | `true` | Special characters & math symbols picker (`Ω`) |
| `panel` | `boolean` | `true` | Info, warning, error, success, and note panels |
| `insertElements` | `boolean` | `true` | Dividers, uploads, signatures, and layout blocks |
| `selectAll` | `boolean` | `true` | Select all editor content button (`⌘A`) |
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

> `value`, `defaultValue`, and `content` are trusted-HTML inputs. Sanitize content from users or external systems before passing it to EditKit and before rendering saved HTML.

---

## 📄 License

MIT © [Ashikur Rahman](https://github.com/ashikurweb)
