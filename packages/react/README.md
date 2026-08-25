# @editkit/react ✨

<p align="center">
  <strong>The Ultimate React Rich Text Editor SDK — Zero Dependencies, Native Tables, 2D Color Picker & Modular Toolbars</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-16.8%2B%20%7C%2017%20%7C%2018%20%7C%2019-61dafb?logo=react&logoColor=black" alt="React 18 & 19" />
  <img src="https://img.shields.io/badge/Next.js-App%20%26%20Pages%20Router-black?logo=next.js&logoColor=white" alt="Next.js Support" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white" alt="TypeScript Ready" />
  <img src="https://img.shields.io/badge/Dependencies-0%20External-8b5cf6" alt="Zero Dependencies" />
  <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License" />
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/ashikurweb/editKit-text-editor/master/assets/editkit-preview.png" alt="EditKit React Editor Preview" width="100%" />
</p>

---

## ⚡ Why @editkit/react?

- 🚀 **Zero External Dependencies**: 100% pure TypeScript. No heavy ProseMirror, Lexical, Slate, or Quill bundle bloat.
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

---

## 🚀 Quick Start

### 1. Ready-to-Use Component (`<EditKitEditor />`)

```tsx
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
          comment: false,        // Hide Comment button
          versionHistory: false, // Hide Snapshot button
          bookmark: false,       // Hide Bookmark action
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
| `value` | `string` | `''` | Controlled HTML content of the editor |
| `defaultValue` | `string` | `''` | Initial uncontrolled HTML content |
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
| `bookmark` | `boolean` | `true` | Bookmark / Pin action button |
| `selectAll` | `boolean` | `true` | Select all editor content button (`⌘A`) |
| `clearAll` | `boolean` | `true` | Clear all content button (Cross icon, enabled only when all selected) |
| `comment` | `boolean` | `true` | Add inline comment button |
| `versionHistory` | `boolean` | `true` | Version snapshot history button |
| `more` | `boolean` | `true` | More tools dropdown (`+ ˅`) |

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

---

## 📄 License

MIT © [Ashikur Rahman](https://github.com/ashikurweb)
