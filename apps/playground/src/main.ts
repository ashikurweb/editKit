// ============================================================
// Vellora Editor — Playground Demo (Eddyter Inspired UI)
// ============================================================

import { createEditor, Extension } from '@vellora/core';
import { createToolbar, BubbleMenu, TableFloatingMenu, ImageFloatingMenu } from '@vellora/ui';
import '@vellora/ui/styles';
import './style.css';

// ── Sample Rich Content with First-Class Table & Image ──
const SAMPLE_CONTENT = `
<h1>Build modern docs with Vellora ✨</h1>
<p>A premium, framework-agnostic rich text editor built <strong>100% from scratch</strong> — zero external dependencies, full table support, customizable via CSS variables, and native image manipulation.</p>

<table class="vellora-table">
  <thead>
    <tr>
      <th>Feature</th>
      <th>Vellora</th>
      <th>Traditional Editors</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Custom Tables</strong></td>
      <td>First-class (Add/Del rows, cols, cell colors)</td>
      <td>Basic HTML wrapper</td>
    </tr>
    <tr>
      <td><strong>Dependencies</strong></td>
      <td>0 Dependencies (Pure TypeScript)</td>
      <td>Heavy bundle overhead</td>
    </tr>
    <tr>
      <td><strong>Theming</strong></td>
      <td>Pure CSS Variables (Dark &amp; Light)</td>
      <td>Complex CSS overrides</td>
    </tr>
    <tr>
      <td><strong>Frameworks</strong></td>
      <td>React, Vue, Svelte, Vanilla JS</td>
      <td>Locked into single framework</td>
    </tr>
  </tbody>
</table>

<h3>Interactive Task List</h3>
<ul class="vellora-task-list">
  <li class="vellora-task-item vellora-task-done"><input type="checkbox" checked class="vellora-task-checkbox"> <span>First-class table support with hover grid</span></li>
  <li class="vellora-task-item vellora-task-done"><input type="checkbox" checked class="vellora-task-checkbox"> <span>Floating bubble toolbar on text selection</span></li>
  <li class="vellora-task-item vellora-task-done"><input type="checkbox" checked class="vellora-task-checkbox"> <span>Interactive image resizer &amp; contextual toolbar</span></li>
  <li class="vellora-task-item"><input type="checkbox" class="vellora-task-checkbox"> <span>Custom Plugin &amp; Extension architecture</span></li>
</ul>

<blockquote>
  <p>"Minimal by default. Powerful when needed." — Built for high-performance publishing.</p>
</blockquote>

<pre><code>// Initialize Vellora in any JS framework:
const editor = createEditor({
  theme: 'dark',
  defaultFontFamily: 'DM Sans',
  defaultFontSize: 14,
});

editor.mount(document.getElementById('editor'));</code></pre>
`;

// ── Example Custom Plugin ──
class WordCounterPlugin extends Extension {
  get name() { return 'wordCounter'; }

  onUpdate(editor: any) {
    const text = editor.getText();
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    const wordEl = document.getElementById('words-count');
    const charEl = document.getElementById('chars-count');
    if (wordEl) wordEl.textContent = `Words: ${words}`;
    if (charEl) charEl.textContent = `Characters: ${chars}`;
  }
}

function init() {
  const app = document.getElementById('app')!;
  app.innerHTML = '';

  // ── Header Banner (Exact match from screenshot: • TRY IT YOURSELF — EDDYTER | THE EDITOR RENDERING THIS PAGE) ──
  const topBanner = document.createElement('div');
  topBanner.className = 'eddyter-top-banner';
  topBanner.innerHTML = `
    <div class="eddyter-banner-left">
      <span class="eddyter-banner-dot"></span>
      <span class="eddyter-banner-title">TRY IT YOURSELF — <strong>VELLORA</strong></span>
      <span class="eddyter-banner-sep">|</span>
      <span class="eddyter-banner-sub">THE EDITOR RENDERING THIS PAGE</span>
    </div>
    <div class="eddyter-banner-right">
      <button id="theme-btn" class="eddyter-theme-toggle" title="Toggle Light/Dark Theme">
        <span class="theme-icon-sun">☀️</span>
        <span class="theme-icon-moon">🌙</span>
        <span id="theme-text">Dark Mode</span>
      </button>
    </div>
  `;
  app.appendChild(topBanner);

  // ── Main Container ──
  const main = document.createElement('main');
  main.className = 'eddyter-main';

  // Editor Card Wrapper
  const editorCard = document.createElement('div');
  editorCard.className = 'eddyter-editor-card';

  main.appendChild(editorCard);
  app.appendChild(main);

  // ── Initialize Editor ──
  let currentTheme: 'dark' | 'light' = 'dark';

  const editor = createEditor({
    content: SAMPLE_CONTENT.trim(),
    theme: currentTheme,
    defaultFontFamily: 'DM Sans',
    defaultFontSize: 14,
    extensions: [new WordCounterPlugin()],
  });

  // ── Initialize Toolbar ──
  const toolbar = createToolbar(editor);
  editor.root.insertBefore(toolbar.element, editor.contentEl);

  // ── Initialize Floating Menus ──
  const bubbleMenu = new BubbleMenu(editor);
  bubbleMenu.mount(editor.root);

  const tableMenu = new TableFloatingMenu(editor);
  tableMenu.mount(editor.root);

  const imageMenu = new ImageFloatingMenu(editor);
  imageMenu.mount(editor.root);

  // ── Mount Editor into Card ──
  editor.mount(editorCard);

  // ── Bottom Status Bar inside Card (Matching Screenshot bottom footer) ──
  const bottomBar = document.createElement('div');
  bottomBar.className = 'eddyter-bottom-bar';
  bottomBar.innerHTML = `
    <div class="eddyter-bottom-left">
      <span id="words-count">Words: 0</span>
      <span class="eddyter-stat-space"></span>
      <span id="chars-count">Characters: 0</span>
    </div>
    <div class="eddyter-bottom-right">
      <a href="#feature" class="eddyter-footer-link">💡 Suggest a Feature</a>
      <a href="#bug" class="eddyter-footer-link">🐞 Report a Bug</a>
      <span class="eddyter-version-badge">v1.4.22</span>
    </div>
  `;
  editor.root.appendChild(bottomBar);

  // Trigger initial word count
  editor.extensionManager.emitUpdate();

  // ── Theme Switcher ──
  const themeBtn = document.getElementById('theme-btn')!;
  const themeText = document.getElementById('theme-text')!;

  themeBtn.addEventListener('click', () => {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    editor.setTheme(currentTheme);
    document.documentElement.setAttribute('data-theme', currentTheme);
    themeText.textContent = currentTheme === 'dark' ? 'Dark Mode' : 'Light Mode';
    themeBtn.classList.toggle('eddyter-theme-toggle--light', currentTheme === 'light');
  });

  // ── Developer Showcase Section Below Editor ──
  const devSection = document.createElement('section');
  devSection.className = 'eddyter-dev-section';
  devSection.innerHTML = `
    <div class="eddyter-dev-grid">
      <div class="eddyter-dev-card">
        <h3>🔌 Custom Plugin System</h3>
        <p>Register custom plugins, commands, toolbar items &amp; shortcuts:</p>
        <pre><code>import { Extension } from '@vellora/core';

class MentionsPlugin extends Extension {
  get name() { return 'mentions'; }
  defineKeyboardShortcuts() {
    return {
      '@': (editor) => this.openMentions(editor),
    };
  }
}</code></pre>
      </div>
      <div class="eddyter-dev-card">
        <h3>🎨 CSS Variable Theming</h3>
        <p>Override any design token in plain CSS without touching TS/JS:</p>
        <pre><code>[data-vellora] {
  --vellora-card-bg: #141519;
  --vellora-toolbar-bg: #18191e;
  --vellora-primary: #7c3aed;
  --vellora-table-header-bg: #2d3342;
  --vellora-font: 'DM Sans', sans-serif;
}</code></pre>
      </div>
    </div>
  `;
  main.appendChild(devSection);
}

// ── Boot ──
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
