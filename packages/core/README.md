# @editkit/core ✨

<p align="center">
  <strong>EditKit Core Engine — A Zero-Dependency, High-Performance, Framework-Agnostic Rich Text Editor</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white" alt="TypeScript Ready" />
  <img src="https://img.shields.io/badge/Dependencies-0%20External-8b5cf6" alt="Zero Dependencies" />
  <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License" />
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/ashikurweb/editKit/master/assets/editkit-preview.png" alt="EditKit Core Editor Preview" width="100%" />
</p>

---

## 📦 Installation

```bash
npm install @editkit/core @editkit/ui
# or
pnpm add @editkit/core @editkit/ui
```

---

## 🚀 Quick Start

```ts
import { EditKitEditor } from '@editkit/core';
import { createToolbar, BubbleMenu, TableFloatingMenu, ImageFloatingMenu } from '@editkit/ui';
import '@editkit/ui/styles';

const editor = new EditKitEditor({
  theme: 'dark',
  placeholder: 'Start typing...',
  content: '<p>Hello from EditKit Core!</p>',
  onUpdate: (ed) => console.log('HTML:', ed.getHTML()),
});

const toolbar = createToolbar(editor);
editor.root.insertBefore(toolbar.element, editor.contentEl);

new BubbleMenu(editor).mount(editor.root);
new TableFloatingMenu(editor).mount(editor.root);
new ImageFloatingMenu(editor).mount(editor.root);

editor.mount(document.getElementById('editor')!);
```

---

## 📖 Commands API Reference

- `editor.commands.bold()` / `italic()` / `underline()` / `strikethrough()` / `code()`
- `editor.commands.heading(1)` through `heading(6)`
- `editor.commands.bulletList()` / `orderedList()` / `taskList()`
- `editor.commands.alignLeft()` / `alignCenter()` / `alignRight()` / `alignJustify()`
- `editor.commands.insertTable({ rows: 3, cols: 3, withHeaderRow: true })`
- `editor.commands.setTextColor('#ff0000')` / `setHighlight('#ffff00')`
- `editor.getHTML()` / `getJSON()` / `getText()` / `setContent(html)`

---

## 📄 License

MIT © [Ashikur Rahman](https://github.com/ashikurweb)
