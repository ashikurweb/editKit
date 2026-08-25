# @editkit/svelte ✨

Official Svelte integration for **EditKit** — A premium, zero-dependency rich text editor SDK.

<p align="center">
  <img src="https://raw.githubusercontent.com/ashikurweb/vellora-editor/master/assets/editkit-preview.png" alt="EditKit Editor Preview" width="100%" />
</p>

## 📦 Installation

```bash
npm install @editkit/svelte @editkit/ui
# or
pnpm add @editkit/svelte @editkit/ui
# or
yarn add @editkit/svelte @editkit/ui
```

## 🚀 Quick Start (`use:editkit`)

```svelte
<script lang="ts">
  import { editkit } from '@editkit/svelte';
  import '@editkit/ui/styles';

  let content = '<p>Hello from Svelte!</p>';
</script>

<div
  use:editkit={{
    content,
    theme: 'dark',
    placeholder: 'Write with EditKit in Svelte...',
    features: {
      chart: false,
      math: false,
    },
    onChange: (html) => {
      content = html;
    }
  }}
/>
```

## 📄 License

MIT © [Ashikur](https://github.com/ashikurweb)
