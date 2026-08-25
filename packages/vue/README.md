# @editkit/vue ✨

Official Vue 3 integration & composables for **EditKit** — A premium, zero-dependency rich text editor SDK.

<p align="center">
  <img src="https://raw.githubusercontent.com/ashikurweb/vellora-editor/master/assets/editkit-preview.png" alt="EditKit Editor Preview" width="100%" />
</p>

## 📦 Installation

```bash
npm install @editkit/vue @editkit/ui
# or
pnpm add @editkit/vue @editkit/ui
# or
yarn add @editkit/vue @editkit/ui
```

## 🚀 Quick Start

### 1. Ready-to-Use Component with `v-model` (`<EditKitEditor />`)

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { EditKitEditor } from '@editkit/vue';
import '@editkit/ui/styles';

const content = ref('<p>Hello from Vue 3 and EditKit!</p>');
</script>

<template>
  <EditKitEditor
    v-model="content"
    theme="dark"
    placeholder="Write something in Vue..."
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
</template>
```

### 2. Composable (`useEditKitEditor`)

```vue
<script setup lang="ts">
import { useTemplateRef } from 'vue';
import { useEditKitEditor } from '@editkit/vue';
import '@editkit/ui/styles';

const editorEl = useTemplateRef<HTMLElement>('editorEl');
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

## 🎛️ Props Reference

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `v-model` (`modelValue`) | `string` | `''` | Two-way bound HTML content |
| `theme` | `'light' \| 'dark' \| 'system'` | `'dark'` | Theme appearance |
| `placeholder` | `string` | `'Write something...'` | Empty editor placeholder |
| `editable` | `boolean` | `true` | Read-only mode toggle |
| `features` | `ToolbarFeaturesConfig` | `{}` | Granular toolbar button toggles |
| `bubbleMenu` | `boolean` | `true` | Floating text selection menu |
| `tableMenu` | `boolean` | `true` | Floating table actions menu |
| `imageMenu` | `boolean` | `true` | Floating image resizer |

## 📄 License

MIT © [Ashikur](https://github.com/ashikurweb)
