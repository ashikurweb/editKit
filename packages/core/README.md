# @editkit/core ✨

EditKit Core Engine — A zero-dependency, framework-agnostic rich text editor.

<p align="center">
  <img src="https://raw.githubusercontent.com/ashikurweb/editkit-editor/master/assets/editkit-preview.png" alt="EditKit Editor Preview" width="100%" />
</p>

## 📦 Installation

```bash
npm install @editkit/core @editkit/ui
# or
pnpm add @editkit/core @editkit/ui
```

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

## 📄 License

MIT © [Ashikur](https://github.com/ashikurweb)
