# EditKit Core — `@editkit/core`

Framework-neutral TypeScript editor engine used by EditKit. It has no runtime dependencies and does not include the standard toolbar styles or UI components.

## Install

```bash
npm install @editkit/core
```

```ts
import { EditKitEditor } from '@editkit/core';

const editor = new EditKitEditor({
  content: '<p>Hello from EditKit.</p>',
  onUpdate: current => console.log(current.getHTML()),
});

editor.mount(document.querySelector('#editor')!);

// Run during application teardown.
editor.destroy();
```

Use `editkit-text-editor` when you want the complete default UI, or combine this package with `@editkit/ui` to build a custom layout.

## Core API

- Formatting: `bold()`, `italic()`, `underline()`, `strikethrough()`, and `code()`
- Blocks: `paragraph()`, `heading(1..6)`, lists, quotes, panels, and dividers
- Media: images, links, tables, and math blocks
- State: `getHTML()`, `getText()`, `getJSON()`, `setContent()`, `undo()`, and `redo()`
- Extensions: commands, keyboard shortcuts, lifecycle hooks, and toolbar item definitions

## Content safety

`content` and `setContent()` accept trusted application HTML. Sanitize HTML received from users, APIs, databases, or converters before passing it to the editor, and sanitize it according to your policy before rendering it elsewhere. Clipboard HTML is filtered by EditKit, but that does not turn the trusted-content APIs into a general-purpose sanitizer.

## License

MIT © [Ashikur Rahman](https://github.com/ashikurweb)
