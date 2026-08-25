# @editkit/react ✨

Official React integration for **EditKit** — A premium, zero-dependency rich text editor SDK.

<p align="center">
  <img src="https://raw.githubusercontent.com/ashikurweb/editkit-editor/master/assets/editkit-preview.png" alt="EditKit Editor Preview" width="100%" />
</p>

## 📦 Installation

```bash
npm install @editkit/react @editkit/ui
# or
pnpm add @editkit/react @editkit/ui
# or
yarn add @editkit/react @editkit/ui
```

## 🚀 Quick Start

### 1. Ready-to-Use Component (`<EditKitEditor />`)

```tsx
import React, { useState } from 'react';
import { EditKitEditor } from '@editkit/react';
import '@editkit/ui/styles';

export default function App() {
  const [content, setContent] = useState('<h1>Hello EditKit</h1><p>Start writing...</p>');

  return (
    <EditKitEditor
      value={content}
      onChange={setContent}
      theme="dark" // 'dark' | 'light' | 'system'
      placeholder="Type something amazing..."
      features={{
        math: false,           // Optional: disable math
        chart: false,          // Optional: disable chart
        table: true,           // 6x6 visual hover grid table
        emoji: true,           // Emoji picker
      }}
      bubbleMenu={true}        // Floating bubble toolbar
      tableMenu={true}         // Floating table toolbar
      imageMenu={true}         // Floating image resize menu
    />
  );
}
```

### 2. Custom Hook (`useEditKitEditor`)

```tsx
import React from 'react';
import { useEditKitEditor } from '@editkit/react';
import '@editkit/ui/styles';

export function CustomEditor() {
  const { editor, containerRef } = useEditKitEditor({
    content: '<p>Headless React hook</p>',
    theme: 'dark',
  });

  return (
    <div>
      <div className="toolbar">
        <button onClick={() => editor?.commands.bold()}>Bold</button>
        <button onClick={() => editor?.commands.italic()}>Italic</button>
      </div>
      <div ref={containerRef} />
    </div>
  );
}
```

## 🎛️ Props Reference

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `value` | `string` | `''` | Controlled HTML content |
| `defaultValue` | `string` | `''` | Initial HTML content |
| `onChange` | `(html: string) => void` | - | Content update callback |
| `theme` | `'light' \| 'dark' \| 'system'` | `'dark'` | Theme appearance |
| `placeholder` | `string` | `'Write something...'` | Empty editor placeholder |
| `editable` | `boolean` | `true` | Read-only mode toggle |
| `features` | `ToolbarFeaturesConfig` | `{}` | Granular toolbar button toggles |
| `bubbleMenu` | `boolean` | `true` | Floating text selection menu |
| `tableMenu` | `boolean` | `true` | Floating table actions menu |
| `imageMenu` | `boolean` | `true` | Floating image resizer |

## 📄 License

MIT © [Ashikur](https://github.com/ashikurweb)
