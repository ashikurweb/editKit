// ============================================================
// EditKit Editor — Playground Demo (EditKit Inspired UI)
// ============================================================

import { createEditor, Extension } from '@editkit/core';
import { createToolbar, BubbleMenu, TableFloatingMenu, ImageFloatingMenu } from '@editkit/ui';
import '@editkit/ui/styles';
import './style.css';

// ── Sample Rich Content with First-Class Table & Image ──
const SAMPLE_CONTENT = `
<table class="editkit-table">
  <thead>
    <tr>
      <th><br></th>
      <th><br></th>
      <th><br></th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><br></td>
      <td><br></td>
      <td><br></td>
    </tr>
    <tr>
      <td><br></td>
      <td><br></td>
      <td><br></td>
    </tr>
  </tbody>
</table>

<h1>Build modern docs with EditKit ✨</h1>
<p>A premium, framework-agnostic rich text editor built <strong>100% from scratch</strong> — zero external dependencies, full table support, customizable via CSS variables, and native image manipulation.</p>

<h3>Interactive Task List</h3>
<ul class="editkit-task-list">
  <li class="editkit-task-item editkit-task-done"><input type="checkbox" checked class="editkit-task-checkbox"> <span>First-class table support with hover grid</span></li>
  <li class="editkit-task-item editkit-task-done"><input type="checkbox" checked class="editkit-task-checkbox"> <span>Floating bubble toolbar on text selection</span></li>
  <li class="editkit-task-item editkit-task-done"><input type="checkbox" checked class="editkit-task-checkbox"> <span>Interactive image resizer &amp; contextual toolbar</span></li>
  <li class="editkit-task-item"><input type="checkbox" class="editkit-task-checkbox"> <span>Custom Plugin &amp; Extension architecture</span></li>
</ul>

<div class="editkit-panel editkit-panel--success" data-panel-type="success">
  <span class="editkit-panel-icon" contenteditable="false">
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="m9 12 2 2 4-4"></path></svg>
  </span>
  <div class="editkit-panel-body" data-placeholder="Enter your success content...">
    <p>EditKit now includes first-class Callout &amp; Alert Panels with live color themes (Info, Warning, Error, Success, Note)!</p>
  </div>
</div>

<blockquote>
  <p>"Minimal by default. Powerful when needed." — Built for high-performance publishing.</p>
</blockquote>

<pre><code>// Initialize EditKit in any JS framework:
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

  // ── Header Banner (Exact match from screenshot: • TRY IT YOURSELF — EDITKIT | THE EDITOR RENDERING THIS PAGE) ──
  const topBanner = document.createElement('div');
  topBanner.className = 'editkit-top-banner';
  topBanner.innerHTML = `
    <div class="editkit-banner-left">
      <span class="editkit-banner-dot"></span>
      <span class="editkit-banner-title">TRY IT YOURSELF — <strong>EDITKIT</strong></span>
      <span class="editkit-banner-sep">|</span>
      <span class="editkit-banner-sub">THE EDITOR RENDERING THIS PAGE</span>
    </div>
    <div class="editkit-banner-right">
      <button id="theme-btn" class="editkit-theme-toggle" title="Toggle Light/Dark Theme">
        <span class="theme-icon-sun">☀️</span>
        <span class="theme-icon-moon">🌙</span>
        <span id="theme-text">Dark Mode</span>
      </button>
    </div>
  `;
  app.appendChild(topBanner);

  // ── Main Container ──
  const main = document.createElement('main');
  main.className = 'editkit-main';

  // Editor Card Wrapper
  const editorCard = document.createElement('div');
  editorCard.className = 'editkit-editor-card';

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
  bottomBar.className = 'editkit-bottom-bar';
  bottomBar.innerHTML = `
    <div class="editkit-bottom-left">
      <span id="words-count">Words: 0</span>
      <span class="editkit-stat-space"></span>
      <span id="chars-count">Characters: 0</span>
    </div>
    <div class="editkit-bottom-right">
      <a href="#feature" class="editkit-footer-link">💡 Suggest a Feature</a>
      <a href="#bug" class="editkit-footer-link">🐞 Report a Bug</a>
      <span class="editkit-version-badge">v1.0.7</span>
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
    themeBtn.classList.toggle('editkit-theme-toggle--light', currentTheme === 'light');
  });

  // ── Developer Showcase Section Below Editor ──
  const devSection = document.createElement('section');
  devSection.className = 'editkit-dev-section';
  devSection.innerHTML = `
    <div class="editkit-dev-grid">
      <div class="editkit-dev-card">
        <h3>🔌 Custom Plugin System</h3>
        <p>Register custom plugins, commands, toolbar items &amp; shortcuts:</p>
        <pre><code>import { Extension } from '@editkit/core';

class MentionsPlugin extends Extension {
  get name() { return 'mentions'; }
  defineKeyboardShortcuts() {
    return {
      '@': (editor) => this.openMentions(editor),
    };
  }
}</code></pre>
      </div>
      <div class="editkit-dev-card">
        <h3>🎨 CSS Variable Theming</h3>
        <p>Override any design token in plain CSS without touching TS/JS:</p>
        <pre><code>[data-editkit] {
  --editkit-card-bg: #141519;
  --editkit-toolbar-bg: #18191e;
  --editkit-primary: #7c3aed;
  --editkit-table-header-bg: #2d3342;
  --editkit-font: 'DM Sans', sans-serif;
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
