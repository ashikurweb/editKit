// ============================================================
// Vellora — Complete Eddyter-Inspired Premium Toolbar
// Exact match for the design in the screenshots
// ============================================================

import type { VelloraEditor, BulletListStyle, NumberedListStyle } from '@vellora/core';
import { icons } from './icons';
import { ColorPickerPopover } from './ColorPicker';

export interface ToolbarConfig {
  container?: HTMLElement;
}

const FONT_FAMILIES = [
  'DM Sans',
  'Inter',
  'Plus Jakarta Sans',
  'Geist',
  'Fira Code',
  'Playfair Display',
  'Merriweather',
  'System UI',
];

export class VelloraToolbar {
  readonly element: HTMLElement;
  private editor: VelloraEditor;
  private openDropdown: HTMLElement | null = null;
  private _unsubscribers: (() => void)[] = [];

  // Active state trackers
  private blockLabel!: HTMLElement;
  private fontLabel!: HTMLElement;
  private sizeDisplay!: HTMLElement;
  private boldBtn!: HTMLElement;
  private italicBtn!: HTMLElement;
  private alignTrigger!: HTMLElement;

  constructor(editor: VelloraEditor, config: ToolbarConfig = {}) {
    this.editor = editor;

    this.element = document.createElement('div');
    this.element.classList.add('vellora-toolbar');
    this.element.setAttribute('role', 'toolbar');
    this.element.setAttribute('aria-label', 'Editor formatting toolbar');

    this._buildToolbar();
    this._syncStates();

    // Selection & update listeners
    const unsub1 = editor.on('selectionUpdate', () => this._syncStates());
    const unsub2 = editor.on('update', () => this._syncStates());
    this._unsubscribers.push(unsub1, unsub2);

    // Global outside click for dropdowns
    const outsideClick = (e: MouseEvent) => {
      if (this.openDropdown && !this.openDropdown.contains(e.target as Node)) {
        this._closeDropdown();
      }
    };
    document.addEventListener('mousedown', outsideClick);
    this._unsubscribers.push(() => document.removeEventListener('mousedown', outsideClick));

    if (config.container) {
      config.container.appendChild(this.element);
    }
  }

  mount(container: HTMLElement): void {
    container.appendChild(this.element);
  }

  destroy(): void {
    this._unsubscribers.forEach(fn => fn());
    this.element.remove();
  }

  private _buildToolbar(): void {
    this.element.innerHTML = '';

    const leftGroup = document.createElement('div');
    leftGroup.classList.add('vellora-toolbar-group', 'vellora-toolbar-group--left');

    const rightGroup = document.createElement('div');
    rightGroup.classList.add('vellora-toolbar-group', 'vellora-toolbar-group--right');

    // ──────────────────────────────────────────
    // LEFT CONTROLS
    // ──────────────────────────────────────────

    // 1. Undo / Redo
    leftGroup.appendChild(this._createBtn('undo', 'Undo (Ctrl+Z)', () => this.editor.commands.undo()));
    leftGroup.appendChild(this._createBtn('redo', 'Redo (Ctrl+Shift+Z)', () => this.editor.commands.redo()));
    leftGroup.appendChild(this._createDivider());

    // 2. Block Type Selector: ¶ Normal ˅
    leftGroup.appendChild(this._createBlockDropdown());

    // 3. Font Family: DM Sans ˅
    leftGroup.appendChild(this._createFontDropdown());

    // 4. Font Size Stepper: - 14 +
    leftGroup.appendChild(this._createFontSizeStepper());
    leftGroup.appendChild(this._createDivider());

    // 5. Bold & Character Formatting Dropdown (Exact EDDYTER Match)
    this.boldBtn = this._createBtn('bold', 'Bold (Ctrl+B)', () => this.editor.commands.bold(), 'bold');
    leftGroup.appendChild(this.boldBtn);
    leftGroup.appendChild(this._createFormatDropdown());

    // 6. Text Color & Highlight Popover: A ˅
    leftGroup.appendChild(this._createColorDropdown());

    // 7. Alignment Dropdown: ≡ ˅
    leftGroup.appendChild(this._createAlignDropdown());
    leftGroup.appendChild(this._createDivider());

    // 8. Lists Dropdown with nested flyouts: ≡ ˅
    leftGroup.appendChild(this._createListDropdown());
    leftGroup.appendChild(this._createDivider());

    // 9. Media & Embed Tools: Image, Table (with Grid Picker!), Chart, Math, Link, Emoji, Omega, Pin
    leftGroup.appendChild(this._createImageButton());
    leftGroup.appendChild(this._createTableGridDropdown());
    leftGroup.appendChild(this._createBtn('chart', 'Insert Chart', () => this._insertChartMock()));
    leftGroup.appendChild(this._createBtn('math', 'Formula / Math', () => this._insertMathMock()));
    leftGroup.appendChild(this._createLinkButton());
    leftGroup.appendChild(this._createEmojiDropdown());
    leftGroup.appendChild(this._createSymbolDropdown());
    leftGroup.appendChild(this._createBtn('pin', 'Bookmark / Pin', () => this._insertBookmarkMock()));

    // ──────────────────────────────────────────
    // RIGHT CONTROLS
    // ──────────────────────────────────────────

    // 1. Language pill: EN
    const langBtn = document.createElement('div');
    langBtn.classList.add('vellora-toolbar-pill-badge');
    langBtn.textContent = 'EN';
    rightGroup.appendChild(langBtn);

    // 2. ✦ AI ˅ button with dropdown
    rightGroup.appendChild(this._createAIDropdown());

    // 3. Typography & Case tool: T.
    rightGroup.appendChild(this._createTypographyDropdown());

    // 4. Clear formatting: ✕
    rightGroup.appendChild(this._createBtn('clearFormat', 'Clear Formatting', () => this.editor.commands.clearFormatting()));

    // 5. Comment: 💬
    rightGroup.appendChild(this._createBtn('comment', 'Add Comment', () => this._addCommentMock()));

    // 6. History / Clock: 🕒
    rightGroup.appendChild(this._createBtn('clock', 'Version History', () => alert('Version History: Snapshot saved.')));

    // 7. More Add: + ˅
    rightGroup.appendChild(this._createMoreDropdown());

    this.element.appendChild(leftGroup);
    this.element.appendChild(rightGroup);
  }

  // ── Helper: Basic Button ──
  private _createBtn(iconKey: string, tooltip: string, action: () => void, activeKey?: string): HTMLElement {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.classList.add('vellora-tb-btn');
    btn.setAttribute('title', tooltip);
    btn.setAttribute('aria-label', tooltip);
    btn.innerHTML = icons[iconKey] || iconKey;
    if (activeKey) btn.setAttribute('data-active-key', activeKey);

    btn.addEventListener('mousedown', (e) => {
      e.preventDefault();
      action();
      this._syncStates();
    });

    return btn;
  }

  private _createDivider(): HTMLElement {
    const d = document.createElement('div');
    d.classList.add('vellora-tb-divider');
    return d;
  }

  // ── 1. Block Selector Dropdown: ¶ Normal ˅ ──
  private _createBlockDropdown(): HTMLElement {
    const wrap = document.createElement('div');
    wrap.classList.add('vellora-tb-dropdown-wrap');

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.classList.add('vellora-tb-pill-btn');
    trigger.setAttribute('title', 'Text Style');

    const iconSpan = document.createElement('span');
    iconSpan.classList.add('vellora-tb-icon-sm');
    iconSpan.innerHTML = icons.pilcrow;

    this.blockLabel = document.createElement('span');
    this.blockLabel.classList.add('vellora-tb-pill-text');
    this.blockLabel.textContent = 'Normal';

    const chevron = document.createElement('span');
    chevron.classList.add('vellora-tb-chevron');
    chevron.innerHTML = icons.chevronDown;

    trigger.appendChild(iconSpan);
    trigger.appendChild(this.blockLabel);
    trigger.appendChild(chevron);

    const menu = document.createElement('div');
    menu.classList.add('vellora-tb-dropdown-menu', 'vellora-tb-dropdown-menu--block');

    const items = [
      { id: 'paragraph', icon: icons.pilcrow, label: 'Normal', action: () => this.editor.commands.paragraph() },
      { id: 'h1', icon: 'H1', label: 'Heading 1', action: () => this.editor.commands.heading(1) },
      { id: 'h2', icon: 'H2', label: 'Heading 2', action: () => this.editor.commands.heading(2) },
      { id: 'h3', icon: 'H3', label: 'Heading 3', action: () => this.editor.commands.heading(3) },
      { id: 'h4', icon: 'H4', label: 'Heading 4', action: () => this.editor.commands.heading(4) },
      { id: 'h5', icon: 'H5', label: 'Heading 5', action: () => this.editor.commands.heading(5) },
      { id: 'h6', icon: 'H6', label: 'Heading 6', action: () => this.editor.commands.heading(6) },
    ];

    for (const it of items) {
      const itemBtn = document.createElement('button');
      itemBtn.type = 'button';
      itemBtn.classList.add('vellora-tb-menu-item');
      itemBtn.setAttribute('data-block-id', it.id);

      const prefix = document.createElement('span');
      prefix.classList.add('vellora-tb-menu-prefix');
      prefix.innerHTML = it.icon;

      const label = document.createElement('span');
      label.classList.add('vellora-tb-menu-label');
      label.textContent = it.label;

      itemBtn.appendChild(prefix);
      itemBtn.appendChild(label);

      itemBtn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        it.action();
        this.blockLabel.textContent = it.label;
        this._closeDropdown();
      });

      menu.appendChild(itemBtn);
    }

    trigger.addEventListener('mousedown', (e) => {
      e.preventDefault();
      this._toggleDropdown(wrap);
    });

    wrap.appendChild(trigger);
    wrap.appendChild(menu);
    return wrap;
  }

  // ── 2. Font Family Dropdown: DM Sans ˅ ──
  private _createFontDropdown(): HTMLElement {
    const wrap = document.createElement('div');
    wrap.classList.add('vellora-tb-dropdown-wrap');

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.classList.add('vellora-tb-pill-btn', 'vellora-tb-pill-btn--font');

    this.fontLabel = document.createElement('span');
    this.fontLabel.classList.add('vellora-tb-pill-text');
    this.fontLabel.textContent = this.editor.commands.getFontFamily();

    const chevron = document.createElement('span');
    chevron.classList.add('vellora-tb-chevron');
    chevron.innerHTML = icons.chevronDown;

    trigger.appendChild(this.fontLabel);
    trigger.appendChild(chevron);

    const menu = document.createElement('div');
    menu.classList.add('vellora-tb-dropdown-menu');

    for (const font of FONT_FAMILIES) {
      const it = document.createElement('button');
      it.type = 'button';
      it.classList.add('vellora-tb-menu-item');
      it.style.fontFamily = `"${font}", sans-serif`;
      it.textContent = font;

      it.addEventListener('mousedown', (e) => {
        e.preventDefault();
        this.editor.commands.setFontFamily(font);
        this.fontLabel.textContent = font;
        this._closeDropdown();
      });

      menu.appendChild(it);
    }

    trigger.addEventListener('mousedown', (e) => {
      e.preventDefault();
      this._toggleDropdown(wrap);
    });

    wrap.appendChild(trigger);
    wrap.appendChild(menu);
    return wrap;
  }

  // ── 3. Font Size Stepper: - 14 + ──
  private _createFontSizeStepper(): HTMLElement {
    const wrap = document.createElement('div');
    wrap.classList.add('vellora-tb-stepper-wrap');

    const minus = document.createElement('button');
    minus.type = 'button';
    minus.classList.add('vellora-tb-stepper-btn');
    minus.setAttribute('title', 'Decrease Font Size');
    minus.innerHTML = icons.minus;
    minus.addEventListener('mousedown', (e) => {
      e.preventDefault();
      this.editor.commands.decreaseFontSize();
      this.sizeDisplay.textContent = String(this.editor.commands.getFontSize());
    });

    this.sizeDisplay = document.createElement('span');
    this.sizeDisplay.classList.add('vellora-tb-stepper-val');
    this.sizeDisplay.textContent = String(this.editor.commands.getFontSize());

    const plus = document.createElement('button');
    plus.type = 'button';
    plus.classList.add('vellora-tb-stepper-btn');
    plus.setAttribute('title', 'Increase Font Size');
    plus.innerHTML = icons.plus;
    plus.addEventListener('mousedown', (e) => {
      e.preventDefault();
      this.editor.commands.increaseFontSize();
      this.sizeDisplay.textContent = String(this.editor.commands.getFontSize());
    });

    wrap.appendChild(minus);
    wrap.appendChild(this.sizeDisplay);
    wrap.appendChild(plus);
    return wrap;
  }

  // ── 3.5. Character Formatting Dropdown: [Icon] ˅ (Exact EDDYTER Match) ──
  private _createFormatDropdown(): HTMLElement {
    const wrap = document.createElement('div');
    wrap.classList.add('vellora-tb-dropdown-wrap');

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.classList.add('vellora-tb-btn', 'vellora-tb-btn--chevron');
    trigger.setAttribute('title', 'More Formatting');
    trigger.innerHTML = `${icons.keyboard} <span class="vellora-tb-chevron-sm">${icons.chevronDown}</span>`;

    const menu = document.createElement('div');
    menu.classList.add('vellora-tb-dropdown-menu', 'vellora-tb-dropdown-menu--format');

    const items = [
      { id: 'italic', icon: icons.italic, label: 'Italic', action: () => this.editor.commands.italic() },
      { id: 'strikethrough', icon: icons.strikethrough, label: 'Strikethrough', action: () => this.editor.commands.strikethrough() },
      { id: 'underline', icon: icons.underline, label: 'Underline', action: () => this.editor.commands.underline() },
      { id: 'subscript', icon: icons.subscript, label: 'Subscript', action: () => this.editor.commands.subscript() },
      { id: 'superscript', icon: icons.superscript, label: 'Superscript', action: () => this.editor.commands.superscript() },
      { id: 'keyboard', icon: icons.keyboard, label: 'Keyboard Input', action: () => this.editor.commands.keyboardInput() },
    ];

    for (const it of items) {
      const itBtn = document.createElement('button');
      itBtn.type = 'button';
      itBtn.classList.add('vellora-tb-menu-item');
      itBtn.setAttribute('data-format-id', it.id);
      itBtn.innerHTML = `<span class="vellora-tb-menu-prefix">${it.icon}</span> <span class="vellora-tb-menu-label">${it.label}</span>`;
      itBtn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        it.action();
        this._closeDropdown();
      });
      menu.appendChild(itBtn);
    }

    trigger.addEventListener('mousedown', (e) => {
      e.preventDefault();
      this._toggleDropdown(wrap);
    });

    wrap.appendChild(trigger);
    wrap.appendChild(menu);
    return wrap;
  }

  // ── 4. Color Dropdown with Popover: A ˅ ──
  private _createColorDropdown(): HTMLElement {
    const wrap = document.createElement('div');
    wrap.classList.add('vellora-tb-dropdown-wrap');

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.classList.add('vellora-tb-btn', 'vellora-tb-btn--color');
    trigger.setAttribute('title', 'Text & Highlight Color');
    trigger.innerHTML = `${icons.textColor} <span class="vellora-tb-color-indicator"></span>`;

    const popover = new ColorPickerPopover(this.editor, undefined, () => this._closeDropdown());
    wrap.appendChild(popover.element);

    trigger.addEventListener('mousedown', (e) => {
      e.preventDefault();
      this._toggleDropdown(wrap);
    });

    wrap.appendChild(trigger);
    return wrap;
  }

  // ── 5. Alignment Dropdown: ≡ ˅ (Exact EDDYTER Match) ──
  private _createAlignDropdown(): HTMLElement {
    const wrap = document.createElement('div');
    wrap.classList.add('vellora-tb-dropdown-wrap');

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.classList.add('vellora-tb-btn', 'vellora-tb-btn--chevron');
    trigger.setAttribute('title', 'Text Alignment & Line Height');
    trigger.innerHTML = `${icons.alignLeft} <span class="vellora-tb-chevron-sm">${icons.chevronDown}</span>`;
    this.alignTrigger = trigger;

    const menu = document.createElement('div');
    menu.classList.add('vellora-tb-dropdown-menu', 'vellora-tb-dropdown-menu--align');

    const aligns = [
      { id: 'left', icon: icons.alignLeft, label: 'Left Align', action: () => this.editor.commands.alignLeft() },
      { id: 'center', icon: icons.alignCenter, label: 'Center Align', action: () => this.editor.commands.alignCenter() },
      { id: 'right', icon: icons.alignRight, label: 'Right Align', action: () => this.editor.commands.alignRight() },
      { id: 'justify', icon: icons.alignJustify, label: 'Justify Align', action: () => this.editor.commands.alignJustify() },
    ];

    for (const a of aligns) {
      const it = document.createElement('button');
      it.type = 'button';
      it.classList.add('vellora-tb-menu-item');
      it.setAttribute('data-align-id', a.id);
      it.innerHTML = `<span class="vellora-tb-menu-prefix">${a.icon}</span> <span>${a.label}</span>`;
      it.addEventListener('mousedown', (e) => {
        e.preventDefault();
        a.action();
        this._syncStates();
        this._closeDropdown();
      });
      menu.appendChild(it);
    }

    // ── Line Height Flyout Item (Exact match from screenshot) ──
    const lhWrap = document.createElement('div');
    lhWrap.classList.add('vellora-tb-submenu-wrap');

    const lhItem = document.createElement('div');
    lhItem.classList.add('vellora-tb-menu-item', 'vellora-tb-menu-item--has-sub');
    lhItem.innerHTML = `
      <span class="vellora-tb-menu-label">Line Height</span>
      <span class="vellora-tb-menu-arrow">${icons.chevronRight}</span>
    `;

    const lhSub = document.createElement('div');
    lhSub.classList.add('vellora-tb-submenu', 'vellora-tb-submenu--lh');

    const lineHeights = ['1', '1.15', '1.5', '2', '2.5', '3'];

    for (const lh of lineHeights) {
      const lhBtn = document.createElement('button');
      lhBtn.type = 'button';
      lhBtn.classList.add('vellora-tb-menu-item');
      lhBtn.setAttribute('data-lineheight-id', lh);
      lhBtn.textContent = lh;
      lhBtn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        this.editor.commands.setLineHeight(lh);
        this._syncStates();
        this._closeDropdown();
      });
      lhSub.appendChild(lhBtn);
    }

    lhWrap.appendChild(lhItem);
    lhWrap.appendChild(lhSub);
    menu.appendChild(lhWrap);

    trigger.addEventListener('mousedown', (e) => {
      e.preventDefault();
      this._toggleDropdown(wrap);
    });

    wrap.appendChild(trigger);
    wrap.appendChild(menu);
    return wrap;
  }

  // ── 6. Lists Dropdown with nested submenus as in Screenshot 3 ──
  private _createListDropdown(): HTMLElement {
    const wrap = document.createElement('div');
    wrap.classList.add('vellora-tb-dropdown-wrap');

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.classList.add('vellora-tb-btn', 'vellora-tb-btn--chevron');
    trigger.setAttribute('title', 'Lists & Quotes');
    trigger.innerHTML = `${icons.bulletList} <span class="vellora-tb-chevron-sm">${icons.chevronDown}</span>`;

    const menu = document.createElement('div');
    menu.classList.add('vellora-tb-dropdown-menu', 'vellora-tb-dropdown-menu--lists');

    // Bulleted list flyout item
    const bulletWrap = document.createElement('div');
    bulletWrap.classList.add('vellora-tb-submenu-wrap');

    const bulletItem = document.createElement('div');
    bulletItem.classList.add('vellora-tb-menu-item', 'vellora-tb-menu-item--has-sub');
    bulletItem.innerHTML = `
      <span class="vellora-tb-menu-prefix">${icons.bulletList}</span>
      <span class="vellora-tb-menu-label">Bulleted list</span>
      <span class="vellora-tb-menu-arrow">${icons.chevronRight}</span>
    `;

    const bulletSub = document.createElement('div');
    bulletSub.classList.add('vellora-tb-submenu');

    const bulletStyles: Array<{ id: BulletListStyle; icon: string; label: string }> = [
      { id: 'default', icon: '●', label: 'Default' },
      { id: 'circle', icon: '○', label: 'Circle' },
      { id: 'square', icon: '■', label: 'Square' },
    ];

    for (const bs of bulletStyles) {
      const bBtn = document.createElement('button');
      bBtn.type = 'button';
      bBtn.classList.add('vellora-tb-menu-item');
      bBtn.innerHTML = `<span class="vellora-tb-bullet-symbol">${bs.icon}</span> <span>${bs.label}</span>`;
      bBtn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        this.editor.commands.bulletList(bs.id);
        this._closeDropdown();
      });
      bulletSub.appendChild(bBtn);
    }
    bulletWrap.appendChild(bulletItem);
    bulletWrap.appendChild(bulletSub);
    menu.appendChild(bulletWrap);

    // Numbered list flyout item
    const numWrap = document.createElement('div');
    numWrap.classList.add('vellora-tb-submenu-wrap');

    const numItem = document.createElement('div');
    numItem.classList.add('vellora-tb-menu-item', 'vellora-tb-menu-item--has-sub');
    numItem.innerHTML = `
      <span class="vellora-tb-menu-prefix">${icons.orderedList}</span>
      <span class="vellora-tb-menu-label">Numbered list</span>
      <span class="vellora-tb-menu-arrow">${icons.chevronRight}</span>
    `;

    const numSub = document.createElement('div');
    numSub.classList.add('vellora-tb-submenu');

    const numStyles: Array<{ id: NumberedListStyle; label: string }> = [
      { id: 'decimal', label: '1. 1, 2, 3' },
      { id: 'lower-alpha', label: 'a. a, b, c' },
      { id: 'lower-roman', label: 'i. i, ii, iii' },
    ];

    for (const ns of numStyles) {
      const nBtn = document.createElement('button');
      nBtn.type = 'button';
      nBtn.classList.add('vellora-tb-menu-item');
      nBtn.textContent = ns.label;
      nBtn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        this.editor.commands.orderedList(ns.id);
        this._closeDropdown();
      });
      numSub.appendChild(nBtn);
    }
    numWrap.appendChild(numItem);
    numWrap.appendChild(numSub);
    menu.appendChild(numWrap);

    // Check list
    const checkItem = document.createElement('button');
    checkItem.type = 'button';
    checkItem.classList.add('vellora-tb-menu-item');
    checkItem.innerHTML = `<span class="vellora-tb-menu-prefix">${icons.taskList}</span> <span>Check list</span>`;
    checkItem.addEventListener('mousedown', (e) => {
      e.preventDefault();
      this.editor.commands.taskList();
      this._closeDropdown();
    });
    menu.appendChild(checkItem);

    // Quote
    const quoteItem = document.createElement('button');
    quoteItem.type = 'button';
    quoteItem.classList.add('vellora-tb-menu-item');
    quoteItem.innerHTML = `<span class="vellora-tb-menu-prefix">${icons.blockquote}</span> <span>Quote</span>`;
    quoteItem.addEventListener('mousedown', (e) => {
      e.preventDefault();
      this.editor.commands.blockquote();
      this._closeDropdown();
    });
    menu.appendChild(quoteItem);

    // Code block
    const codeItem = document.createElement('button');
    codeItem.type = 'button';
    codeItem.classList.add('vellora-tb-menu-item');
    codeItem.innerHTML = `<span class="vellora-tb-menu-prefix">${icons.codeBlock}</span> <span>Code block</span>`;
    codeItem.addEventListener('mousedown', (e) => {
      e.preventDefault();
      this.editor.commands.codeBlock();
      this._closeDropdown();
    });
    menu.appendChild(codeItem);

    trigger.addEventListener('mousedown', (e) => {
      e.preventDefault();
      this._toggleDropdown(wrap);
    });

    wrap.appendChild(trigger);
    wrap.appendChild(menu);
    return wrap;
  }

  // ── 7. Table Inserter with Visual NxM Hover Grid ──
  private _createTableGridDropdown(): HTMLElement {
    const wrap = document.createElement('div');
    wrap.classList.add('vellora-tb-dropdown-wrap');

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.classList.add('vellora-tb-btn');
    trigger.setAttribute('title', 'Insert Table');
    trigger.innerHTML = icons.table;

    const menu = document.createElement('div');
    menu.classList.add('vellora-tb-dropdown-menu', 'vellora-tb-table-picker');

    const header = document.createElement('div');
    header.classList.add('vellora-tb-table-picker-header');
    header.innerHTML = `<span>Insert Table</span> <span class="vellora-tb-table-size-text">3 × 3</span>`;

    const sizeText = header.querySelector('.vellora-tb-table-size-text') as HTMLElement;

    // 6x6 Grid of cells
    const grid = document.createElement('div');
    grid.classList.add('vellora-tb-table-grid');

    const cells: HTMLElement[][] = [];
    const MAX_R = 6;
    const MAX_C = 6;

    for (let r = 0; r < MAX_R; r++) {
      cells[r] = [];
      for (let c = 0; c < MAX_C; c++) {
        const cell = document.createElement('div');
        cell.classList.add('vellora-tb-grid-cell');
        cell.setAttribute('data-row', String(r + 1));
        cell.setAttribute('data-col', String(c + 1));

        cell.addEventListener('mouseenter', () => {
          this._highlightGrid(cells, r, c);
          sizeText.textContent = `${r + 1} × ${c + 1}`;
        });

        cell.addEventListener('mousedown', (e) => {
          e.preventDefault();
          this.editor.commands.insertTable({ rows: r + 1, cols: c + 1, withHeaderRow: true });
          this._closeDropdown();
        });

        cells[r][c] = cell;
        grid.appendChild(cell);
      }
    }

    grid.addEventListener('mouseleave', () => {
      this._highlightGrid(cells, -1, -1);
      sizeText.textContent = 'Select size';
    });

    menu.appendChild(header);
    menu.appendChild(grid);

    trigger.addEventListener('mousedown', (e) => {
      e.preventDefault();
      this._toggleDropdown(wrap);
    });

    wrap.appendChild(trigger);
    wrap.appendChild(menu);
    return wrap;
  }

  private _highlightGrid(cells: HTMLElement[][], targetR: number, targetC: number): void {
    for (let r = 0; r < cells.length; r++) {
      for (let c = 0; c < cells[r].length; c++) {
        if (r <= targetR && c <= targetC) {
          cells[r][c].classList.add('vellora-tb-grid-cell--active');
        } else {
          cells[r][c].classList.remove('vellora-tb-grid-cell--active');
        }
      }
    }
  }

  // ── Image Button ──
  private _createImageButton(): HTMLElement {
    return this._createBtn('image', 'Insert Image', () => {
      const url = prompt('Enter Image URL:', 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800');
      if (url) {
        this.editor.commands.insertImage({ src: url, alt: 'Inserted image' });
      }
    });
  }

  // ── Link Button ──
  private _createLinkButton(): HTMLElement {
    return this._createBtn('link', 'Add Link (Ctrl+K)', () => {
      const url = prompt('Enter URL:', 'https://');
      if (url) {
        this.editor.commands.setLink({ url, target: '_blank' });
      }
    });
  }

  // ── Emoji Picker Dropdown ──
  private _createEmojiDropdown(): HTMLElement {
    const wrap = document.createElement('div');
    wrap.classList.add('vellora-tb-dropdown-wrap');

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.classList.add('vellora-tb-btn');
    trigger.setAttribute('title', 'Insert Emoji');
    trigger.innerHTML = icons.emoji;

    const menu = document.createElement('div');
    menu.classList.add('vellora-tb-dropdown-menu', 'vellora-tb-emoji-grid');

    const emojis = ['😀', '🔥', '✨', '🚀', '🎉', '💡', '✅', '❤️', '👍', '📌', '⚡', '💻', '📝', '🎯', '🌟', '🎨'];
    for (const em of emojis) {
      const b = document.createElement('button');
      b.type = 'button';
      b.classList.add('vellora-tb-emoji-btn');
      b.textContent = em;
      b.addEventListener('mousedown', (e) => {
        e.preventDefault();
        document.execCommand('insertText', false, em);
        this._closeDropdown();
      });
      menu.appendChild(b);
    }

    trigger.addEventListener('mousedown', (e) => {
      e.preventDefault();
      this._toggleDropdown(wrap);
    });

    wrap.appendChild(trigger);
    wrap.appendChild(menu);
    return wrap;
  }

  // ── Symbol / Omega Dropdown ──
  private _createSymbolDropdown(): HTMLElement {
    const wrap = document.createElement('div');
    wrap.classList.add('vellora-tb-dropdown-wrap');

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.classList.add('vellora-tb-btn');
    trigger.setAttribute('title', 'Special Symbols');
    trigger.innerHTML = icons.omega;

    const menu = document.createElement('div');
    menu.classList.add('vellora-tb-dropdown-menu', 'vellora-tb-emoji-grid');

    const symbols = ['©', '®', '™', '°', '±', '≠', '≤', '≥', '∞', 'π', 'Ω', 'μ', '←', '→', '↑', '↓'];
    for (const sym of symbols) {
      const b = document.createElement('button');
      b.type = 'button';
      b.classList.add('vellora-tb-emoji-btn');
      b.textContent = sym;
      b.addEventListener('mousedown', (e) => {
        e.preventDefault();
        document.execCommand('insertText', false, sym);
        this._closeDropdown();
      });
      menu.appendChild(b);
    }

    trigger.addEventListener('mousedown', (e) => {
      e.preventDefault();
      this._toggleDropdown(wrap);
    });

    wrap.appendChild(trigger);
    wrap.appendChild(menu);
    return wrap;
  }

  // ── ✦ AI Assistant Dropdown ──
  private _createAIDropdown(): HTMLElement {
    const wrap = document.createElement('div');
    wrap.classList.add('vellora-tb-dropdown-wrap');

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.classList.add('vellora-tb-ai-btn');
    trigger.innerHTML = `${icons.sparkles} <span>AI</span> <span class="vellora-tb-chevron-sm">${icons.chevronDown}</span>`;

    const menu = document.createElement('div');
    menu.classList.add('vellora-tb-dropdown-menu', 'vellora-tb-dropdown-menu--ai');

    const aiActions = [
      { label: '✨ Improve Writing', prompt: 'Improve and polish tone' },
      { label: '🔍 Fix Spelling & Grammar', prompt: 'Fix all typos and grammar' },
      { label: '⚡ Make Shorter', prompt: 'Summarize concisely' },
      { label: '📝 Make Longer', prompt: 'Expand with more details' },
      { label: '🌐 Translate to Spanish', prompt: 'Translate' },
    ];

    for (const a of aiActions) {
      const it = document.createElement('button');
      it.type = 'button';
      it.classList.add('vellora-tb-menu-item');
      it.textContent = a.label;
      it.addEventListener('mousedown', (e) => {
        e.preventDefault();
        alert(`✦ AI Assistant: "${a.label}" executed.`);
        this._closeDropdown();
      });
      menu.appendChild(it);
    }

    trigger.addEventListener('mousedown', (e) => {
      e.preventDefault();
      this._toggleDropdown(wrap);
    });

    wrap.appendChild(trigger);
    wrap.appendChild(menu);
    return wrap;
  }

  // ── Typography Tool: T. ──
  private _createTypographyDropdown(): HTMLElement {
    const wrap = document.createElement('div');
    wrap.classList.add('vellora-tb-dropdown-wrap');

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.classList.add('vellora-tb-btn');
    trigger.setAttribute('title', 'Typography & Transform');
    trigger.innerHTML = icons.typography;

    const menu = document.createElement('div');
    menu.classList.add('vellora-tb-dropdown-menu');

    const items = [
      { label: 'Subscript (X₂)', action: () => this.editor.commands.subscript() },
      { label: 'Superscript (X²)', action: () => this.editor.commands.superscript() },
      { label: 'Horizontal Divider', action: () => this.editor.commands.horizontalRule() },
    ];

    for (const it of items) {
      const b = document.createElement('button');
      b.type = 'button';
      b.classList.add('vellora-tb-menu-item');
      b.textContent = it.label;
      b.addEventListener('mousedown', (e) => {
        e.preventDefault();
        it.action();
        this._closeDropdown();
      });
      menu.appendChild(b);
    }

    trigger.addEventListener('mousedown', (e) => {
      e.preventDefault();
      this._toggleDropdown(wrap);
    });

    wrap.appendChild(trigger);
    wrap.appendChild(menu);
    return wrap;
  }

  // ── More Add: + ˅ ──
  private _createMoreDropdown(): HTMLElement {
    const wrap = document.createElement('div');
    wrap.classList.add('vellora-tb-dropdown-wrap');

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.classList.add('vellora-tb-btn', 'vellora-tb-btn--chevron');
    trigger.setAttribute('title', 'More Insert Items');
    trigger.innerHTML = `${icons.plus} <span class="vellora-tb-chevron-sm">${icons.chevronDown}</span>`;

    const menu = document.createElement('div');
    menu.classList.add('vellora-tb-dropdown-menu');

    const items = [
      { label: 'Callout Box', action: () => this.editor.commands.blockquote() },
      { label: 'Table of Contents', action: () => alert('Inserted Table of Contents') },
      { label: 'Insert Date / Time', action: () => document.execCommand('insertText', false, new Date().toLocaleDateString()) },
    ];

    for (const it of items) {
      const b = document.createElement('button');
      b.type = 'button';
      b.classList.add('vellora-tb-menu-item');
      b.textContent = it.label;
      b.addEventListener('mousedown', (e) => {
        e.preventDefault();
        it.action();
        this._closeDropdown();
      });
      menu.appendChild(b);
    }

    trigger.addEventListener('mousedown', (e) => {
      e.preventDefault();
      this._toggleDropdown(wrap);
    });

    wrap.appendChild(trigger);
    wrap.appendChild(menu);
    return wrap;
  }

  // ── Mocks ──
  private _insertChartMock(): void {
    alert('Chart & Poll Widget Inserted.');
  }

  private _insertMathMock(): void {
    const formula = prompt('Enter Math/LaTeX formula:', 'E = mc^2');
    if (formula) document.execCommand('insertText', false, `[Math: ${formula}]`);
  }

  private _insertBookmarkMock(): void {
    alert('Pinned / Bookmarked location.');
  }

  private _addCommentMock(): void {
    const comment = prompt('Add a comment:');
    if (comment) alert(`Comment added: "${comment}"`);
  }

  // ── Dropdown Toggle & Close ──
  private _toggleDropdown(wrap: HTMLElement): void {
    if (wrap.classList.contains('vellora-tb-dropdown-wrap--open')) {
      this._closeDropdown();
    } else {
      this._closeDropdown();
      this._syncStates();
      wrap.classList.add('vellora-tb-dropdown-wrap--open');
      this.openDropdown = wrap;
    }
  }

  private _closeDropdown(): void {
    if (this.openDropdown) {
      this.openDropdown.classList.remove('vellora-tb-dropdown-wrap--open');
      this.openDropdown = null;
    }
  }

  // ── Sync Active States ──
  private _syncStates(): void {
    if (this.boldBtn) {
      this.boldBtn.classList.toggle('vellora-tb-btn--active', this.editor.isActive('bold'));
    }

    const formatItems = this.element.querySelectorAll('[data-format-id]');
    formatItems.forEach(b => {
      const id = b.getAttribute('data-format-id');
      if (id) {
        b.classList.toggle('vellora-tb-menu-item--active', this.editor.isActive(id));
      }
    });

    // 1. Sync Alignment items & Trigger Icon
    let activeAlign = 'left';
    if (this.editor.isActive('alignCenter') || this.editor.isActive('aligncenter')) activeAlign = 'center';
    else if (this.editor.isActive('alignRight') || this.editor.isActive('alignright')) activeAlign = 'right';
    else if (this.editor.isActive('alignJustify') || this.editor.isActive('alignjustify')) activeAlign = 'justify';
    else activeAlign = 'left';

    const alignIconMap: Record<string, string> = {
      left: icons.alignLeft,
      center: icons.alignCenter,
      right: icons.alignRight,
      justify: icons.alignJustify,
    };

    if (this.alignTrigger) {
      this.alignTrigger.innerHTML = `${alignIconMap[activeAlign] || icons.alignLeft} <span class="vellora-tb-chevron-sm">${icons.chevronDown}</span>`;
    }

    const alignButtons = this.element.querySelectorAll('[data-align-id]');
    alignButtons.forEach(b => {
      const id = b.getAttribute('data-align-id');
      b.classList.toggle('vellora-tb-menu-item--active', id === activeAlign);
    });

    // 2. Sync Line Height items
    const curLH = String(this.editor.commands.getLineHeight() || '1.5');
    const lhButtons = this.element.querySelectorAll('[data-lineheight-id]');
    lhButtons.forEach(b => {
      const id = b.getAttribute('data-lineheight-id');
      b.classList.toggle('vellora-tb-menu-item--active', id === curLH);
    });

    // 3. Sync Block type items
    let activeBlock = 'paragraph';
    if (this.editor.isActive('h1')) activeBlock = 'h1';
    else if (this.editor.isActive('h2')) activeBlock = 'h2';
    else if (this.editor.isActive('h3')) activeBlock = 'h3';
    else if (this.editor.isActive('h4')) activeBlock = 'h4';
    else if (this.editor.isActive('h5')) activeBlock = 'h5';
    else if (this.editor.isActive('h6')) activeBlock = 'h6';

    const blockButtons = this.element.querySelectorAll('[data-block-id]');
    blockButtons.forEach(b => {
      const id = b.getAttribute('data-block-id');
      b.classList.toggle('vellora-tb-menu-item--active', id === activeBlock);
    });

    if (this.blockLabel) {
      if (this.editor.isActive('h1')) this.blockLabel.textContent = 'Heading 1';
      else if (this.editor.isActive('h2')) this.blockLabel.textContent = 'Heading 2';
      else if (this.editor.isActive('h3')) this.blockLabel.textContent = 'Heading 3';
      else if (this.editor.isActive('h4')) this.blockLabel.textContent = 'Heading 4';
      else if (this.editor.isActive('h5')) this.blockLabel.textContent = 'Heading 5';
      else if (this.editor.isActive('h6')) this.blockLabel.textContent = 'Heading 6';
      else this.blockLabel.textContent = 'Normal';
    }

    if (this.sizeDisplay) {
      this.sizeDisplay.textContent = String(this.editor.commands.getFontSize());
    }

    if (this.fontLabel) {
      this.fontLabel.textContent = this.editor.commands.getFontFamily();
    }
  }
}

export function createToolbar(editor: VelloraEditor, config: ToolbarConfig = {}): VelloraToolbar {
  return new VelloraToolbar(editor, config);
}
