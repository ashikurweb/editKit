# EditKit Rich Text Editor UI — `@editkit/ui`

<p align="center">
  <strong>Toolbar, floating menus, modals, color picker, and themes for EditKit Text Editor</strong>
</p>

`@editkit/ui` provides the toolbar and visual components for [EditKit Text Editor](https://www.npmjs.com/package/editkit-text-editor), a TypeScript WYSIWYG editor for React, Vue, Svelte, and vanilla JavaScript.

<p align="center">
  <a href="https://www.npmjs.com/package/@editkit/ui"><img src="https://img.shields.io/npm/v/@editkit/ui?logo=npm" alt="@editkit/ui npm version" /></a>
  <a href="https://www.npmjs.com/package/@editkit/ui"><img src="https://img.shields.io/npm/dm/@editkit/ui?logo=npm" alt="@editkit/ui monthly downloads" /></a>
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white" alt="TypeScript Ready" />
  <img src="https://img.shields.io/badge/Editor%20UI-First%20Party-8b5cf6" alt="First-party editor UI" />
  <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License" />
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/ashikurweb/editKit-text-editor/master/assets/editkit-preview.png" alt="EditKit UI Preview" width="100%" />
</p>

---

## 📦 Installation

```bash
npm install @editkit/ui @editkit/core
# or
pnpm add @editkit/ui @editkit/core
```

For the all-in-one package, install `editkit-text-editor` and import the stylesheet from `editkit-text-editor/styles`.

## 🎨 Styles Import

```ts
import '@editkit/ui/styles';
```

## 🚀 Components Included

- **`createToolbar(editor, config)`** — Full formatting toolbar with granular feature props
- **`BubbleMenu`** — Floating text selection bubble menu
- **`TableFloatingMenu`** — Contextual table actions menu
- **`ImageFloatingMenu`** — Floating image resize bar
- **`ColorPickerPopover`** — 2D HSV color picker
- **`EmojiPicker`** & **`SymbolPicker`**

---

## 📄 License

MIT © [Ashikur Rahman](https://github.com/ashikurweb)
