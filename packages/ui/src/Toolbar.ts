// ============================================================
// EditKit — Complete EditKit-Inspired Premium Toolbar
// Exact match for the design in the screenshots
// ============================================================

import type { EditKitEditor, BulletListStyle, NumberedListStyle } from '@editkit/core';
import { icons } from './icons';
import { ColorPickerPopover } from './ColorPicker';
import { EmojiPicker } from './EmojiPicker';
import { SymbolPicker } from './SymbolPicker';
import { ImageModal } from './ImageModal';
import { LinkPopover } from './LinkPopover';
import { MathModal } from './MathModal';
import { DividerModal } from './DividerModal';
import { DecorativeDividerModal } from './DecorativeDividerModal';
import { DecorativeDividerMenu } from './DecorativeDividerMenu';
import { SectionHeadingMenu } from './SectionHeadingMenu';
import { PullQuoteMenu } from './PullQuoteMenu';
import { ButtonBlockMenu } from './ButtonBlockMenu';
import { FAQBlockManager } from './FAQBlockManager';
import { ColumnBlockManager } from './ColumnBlockManager';
import { SignatureModal } from './SignatureModal';
import { PreviewModal } from './PreviewModal';
import { TooltipManager } from './Tooltip';

export interface ToolbarFeaturesConfig {
  history?: boolean;
  undo?: boolean;
  redo?: boolean;
  block?: boolean;
  fontFamily?: boolean;
  fontSize?: boolean;
  bold?: boolean;
  format?: boolean;
  color?: boolean;
  align?: boolean;
  lists?: boolean;
  image?: boolean;
  table?: boolean;
  chart?: boolean;
  math?: boolean;
  link?: boolean;
  emoji?: boolean;
  symbol?: boolean;
  bookmark?: boolean;
  panel?: boolean;
  callout?: boolean;
  insertElements?: boolean;
  selectAll?: boolean;
  clearAll?: boolean;
  preview?: boolean;
  comment?: boolean;
  versionHistory?: boolean;
  more?: boolean;
}

export interface ToolbarConfig {
  container?: HTMLElement;
  features?: ToolbarFeaturesConfig;
}

const FONT_FAMILIES = [
  'DM Sans',
  'Inter',
  'Plus Jakarta Sans',
  'Outfit',
  'Poppins',
  'Roboto',
  'Montserrat',
  'Open Sans',
  'Lato',
  'Comic Neue',
  'Space Grotesk',
  'Playfair Display',
  'Merriweather',
  'Lora',
  'Cinzel',
  'Georgia',
  'Fira Code',
  'JetBrains Mono',
  'Space Mono',
  'Caveat',
  'Dancing Script',
  'Oswald',
  'System UI',
];

export class EditKitToolbar {
  readonly element: HTMLElement;
  private editor: EditKitEditor;
  private config: ToolbarConfig;
  private imageModal: ImageModal;
  private linkPopover: LinkPopover;
  private mathModal: MathModal;
  private dividerModal: DividerModal;
  private signatureModal: SignatureModal;
  private decDividerModal: DecorativeDividerModal;
  private decDividerMenu: DecorativeDividerMenu;
  private secHeadingMenu: SectionHeadingMenu;
  private pullQuoteMenu: PullQuoteMenu;
  private buttonBlockMenu: ButtonBlockMenu;
  private faqManager: FAQBlockManager;
  private columnBlockManager: ColumnBlockManager;
  private previewModal: PreviewModal;
  private openDropdown: HTMLElement | null = null;
  private _unsubscribers: (() => void)[] = [];

  // Active state trackers
  private undoBtn?: HTMLButtonElement;
  private redoBtn?: HTMLButtonElement;
  private blockLabel?: HTMLElement;
  private fontLabel?: HTMLElement;
  private sizeDisplay?: HTMLElement;
  private boldBtn?: HTMLElement;
  private italicBtn?: HTMLElement;
  private alignTrigger?: HTMLElement;
  private alignIconSpan?: HTMLElement;
  private _currentAlign: string = 'left';
  private clearAllBtn?: HTMLButtonElement;

  constructor(editor: EditKitEditor, config: ToolbarConfig = {}) {
    this.editor = editor;
    this.config = config;
    this.imageModal = new ImageModal(editor);
    this.linkPopover = new LinkPopover(editor);
    this.mathModal = new MathModal(editor);
    this.dividerModal = new DividerModal(editor);
    this.signatureModal = new SignatureModal(editor);
    this.decDividerModal = new DecorativeDividerModal(editor);
    this.decDividerMenu = new DecorativeDividerMenu(editor);
    this.decDividerMenu.mount(editor.root as HTMLElement);
    this.secHeadingMenu = new SectionHeadingMenu(editor);
    this.secHeadingMenu.mount(editor.root as HTMLElement);
    this.pullQuoteMenu = new PullQuoteMenu(editor);
    this.pullQuoteMenu.mount(editor.root as HTMLElement);
    this.buttonBlockMenu = new ButtonBlockMenu(editor);
    this.buttonBlockMenu.mount(editor.root as HTMLElement);
    this.faqManager = new FAQBlockManager(editor);
    this.columnBlockManager = new ColumnBlockManager(editor);
    this.previewModal = new PreviewModal(editor);

    TooltipManager.init();

    this.element = document.createElement('div');
    this.element.classList.add('editkit-toolbar');
    this.element.setAttribute('role', 'toolbar');
    this.element.setAttribute('aria-label', 'Editor formatting toolbar');

    this._buildToolbar();
    this._syncStates();

    // Selection & update listeners
    const unsub1 = editor.on('selectionUpdate', () => this._syncStates());
    const unsub2 = editor.on('update', () => this._syncStates());
    const unsub3 = editor.on('openLinkPopover', () => this.linkPopover.show());
    this._unsubscribers.push(unsub1, unsub2, unsub3);

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
    leftGroup.classList.add('editkit-toolbar-group');

    const f = this.config.features || {};
    const isEnabled = (key: keyof ToolbarFeaturesConfig, fallback: boolean = true): boolean => {
      return f[key] !== undefined ? !!f[key] : fallback;
    };

    // Define control groups
    const sections: HTMLElement[][] = [];

    // Group 1: Undo / Redo
    const group1: HTMLElement[] = [];
    const showHistory = isEnabled('history');
    if (showHistory && isEnabled('undo')) {
      this.undoBtn = this._createBtn('undo', 'Undo', () => this.editor.commands.undo(), undefined, '⌘Z');
      const canUndo = this.editor.can().undo();
      this.undoBtn.disabled = !canUndo;
      this.undoBtn.classList.toggle('editkit-tb-btn--disabled', !canUndo);
      group1.push(this.undoBtn);
    }
    if (showHistory && isEnabled('redo')) {
      this.redoBtn = this._createBtn('redo', 'Redo', () => this.editor.commands.redo(), undefined, '⌘⇧Z');
      const canRedo = this.editor.can().redo();
      this.redoBtn.disabled = !canRedo;
      this.redoBtn.classList.toggle('editkit-tb-btn--disabled', !canRedo);
      group1.push(this.redoBtn);
    }
    if (group1.length > 0) sections.push(group1);

    // Group 2: Typography & Size (Block, Font, Size)
    const group2: HTMLElement[] = [];
    if (isEnabled('block')) group2.push(this._createBlockDropdown());
    if (isEnabled('fontFamily')) group2.push(this._createFontDropdown());
    if (isEnabled('fontSize')) group2.push(this._createFontSizeStepper());
    if (group2.length > 0) sections.push(group2);

    // Group 3: Bold & Character formatting dropdown
    const group3: HTMLElement[] = [];
    if (isEnabled('bold')) {
      this.boldBtn = this._createBtn('bold', 'Bold', () => this.editor.commands.bold(), 'bold', '⌘B');
      group3.push(this.boldBtn);
    }
    if (isEnabled('format')) {
      group3.push(this._createFormatDropdown());
    }
    if (group3.length > 0) sections.push(group3);

    // Group 4: Text Color & Highlight Popover
    const group4: HTMLElement[] = [];
    if (isEnabled('color')) {
      group4.push(this._createColorDropdown());
    }
    if (group4.length > 0) sections.push(group4);

    // Group 5: Alignment & Lists
    const group5: HTMLElement[] = [];
    if (isEnabled('align')) group5.push(this._createAlignDropdown());
    if (isEnabled('lists')) group5.push(this._createListDropdown());
    if (group5.length > 0) sections.push(group5);

    // Group 6: Media & Embeds (Image, Table, Chart, Math, Link, Emoji, Symbol, Bookmark)
    const group6: HTMLElement[] = [];
    if (isEnabled('image')) group6.push(this._createImageButton());
    if (isEnabled('table')) group6.push(this._createTableGridDropdown());
    if (isEnabled('chart')) group6.push(this._createBtn('chart', 'Insert Chart', () => this._insertChartMock()));
    if (isEnabled('math')) group6.push(this._createMathDropdown());
    if (isEnabled('link')) group6.push(this._createLinkButton());
    if (isEnabled('emoji')) group6.push(this._createEmojiDropdown());
    if (isEnabled('symbol')) group6.push(this._createSymbolDropdown());
    if (isEnabled('panel') || isEnabled('bookmark') || isEnabled('callout')) {
      group6.push(this._createPanelDropdown());
    }
    if (isEnabled('insertElements') || isEnabled('more') || isEnabled('panel') || isEnabled('bookmark')) {
      group6.push(this._createInsertElementsDropdown());
    }
    if (group6.length > 0) sections.push(group6);

    // Group 7: Secondary Utilities (Select All, Clear All, View Preview, More)
    const group7: HTMLElement[] = [];
    if (isEnabled('selectAll')) {
      group7.push(this._createBtn('typography', 'Select All', () => this.editor.commands.selectAll(), undefined, '⌘A'));
    }
    if (isEnabled('clearAll')) {
      this.clearAllBtn = this._createBtn('clearFormat', 'Clear All Content', () => {
        if (this.clearAllBtn && !this.clearAllBtn.disabled) {
          this.editor.commands.clearAll();
        }
      });
      this.clearAllBtn.disabled = true;
      this.clearAllBtn.classList.add('editkit-tb-btn--disabled');
      group7.push(this.clearAllBtn);
    }
    if (isEnabled('preview', true)) {
      group7.push(this._createBtn('eye', 'View Preview', () => this.previewModal.show(), undefined, '⌘P'));
    }
    if (isEnabled('more')) group7.push(this._createMoreDropdown());
    if (group7.length > 0) sections.push(group7);

    // Render sections with dividers in between
    sections.forEach((section, idx) => {
      section.forEach(el => leftGroup.appendChild(el));
      if (idx < sections.length - 1) {
        leftGroup.appendChild(this._createDivider());
      }
    });

    this.element.appendChild(leftGroup);
  }

  // ── Helper: Basic Button ──
  private _createBtn(iconKey: string, tooltip: string, action: () => void, activeKey?: string, shortcut?: string): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.classList.add('editkit-tb-btn');
    btn.setAttribute('data-editkit-tooltip', tooltip);
    btn.setAttribute('aria-label', tooltip);
    if (shortcut) btn.setAttribute('data-tooltip-shortcut', shortcut);
    btn.innerHTML = icons[iconKey] || iconKey;
    if (activeKey) btn.setAttribute('data-active-key', activeKey);

    btn.addEventListener('mousedown', (e) => {
      e.preventDefault();
      if (btn.disabled || btn.classList.contains('editkit-tb-btn--disabled')) return;
      action();
      this._syncStates();
    });

    return btn;
  }

  private _createDivider(): HTMLElement {
    const d = document.createElement('div');
    d.classList.add('editkit-tb-divider');
    return d;
  }

  // ── 1. Block Selector Dropdown: ¶ Normal ˅ ──
  private _createBlockDropdown(): HTMLElement {
    const wrap = document.createElement('div');
    wrap.classList.add('editkit-tb-dropdown-wrap');

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.classList.add('editkit-tb-pill-btn');
    trigger.setAttribute('data-editkit-tooltip', 'Text Style');
    trigger.setAttribute('aria-label', 'Text Style');

    const iconSpan = document.createElement('span');
    iconSpan.classList.add('editkit-tb-icon-sm');
    iconSpan.innerHTML = icons.pilcrow;

    this.blockLabel = document.createElement('span');
    this.blockLabel.classList.add('editkit-tb-pill-text');
    this.blockLabel.textContent = 'Normal';

    const chevron = document.createElement('span');
    chevron.classList.add('editkit-tb-chevron');
    chevron.innerHTML = icons.chevronDown;

    trigger.appendChild(iconSpan);
    trigger.appendChild(this.blockLabel);
    trigger.appendChild(chevron);

    const menu = document.createElement('div');
    menu.classList.add('editkit-tb-dropdown-menu', 'editkit-tb-dropdown-menu--block');

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
      itemBtn.classList.add('editkit-tb-menu-item');
      itemBtn.setAttribute('data-block-id', it.id);

      const prefix = document.createElement('span');
      prefix.classList.add('editkit-tb-menu-prefix');
      prefix.innerHTML = it.icon;

      const label = document.createElement('span');
      label.classList.add('editkit-tb-menu-label');
      label.textContent = it.label;

      itemBtn.appendChild(prefix);
      itemBtn.appendChild(label);

      itemBtn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        it.action();
        if (this.blockLabel) this.blockLabel.textContent = it.label;
        this._closeDropdown();
      });

      menu.appendChild(itemBtn);
    }

    trigger.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this._toggleDropdown(wrap);
    });

    wrap.appendChild(trigger);
    wrap.appendChild(menu);
    return wrap;
  }

  // ── 2. Font Family Dropdown: DM Sans ˅ ──
  private _createFontDropdown(): HTMLElement {
    const wrap = document.createElement('div');
    wrap.classList.add('editkit-tb-dropdown-wrap');

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.classList.add('editkit-tb-pill-btn', 'editkit-tb-pill-btn--font');

    this.fontLabel = document.createElement('span');
    this.fontLabel.classList.add('editkit-tb-pill-text');
    this.fontLabel.textContent = this.editor.commands.getFontFamily();

    const chevron = document.createElement('span');
    chevron.classList.add('editkit-tb-chevron');
    chevron.innerHTML = icons.chevronDown;

    trigger.appendChild(this.fontLabel);
    trigger.appendChild(chevron);

    const menu = document.createElement('div');
    menu.classList.add('editkit-tb-dropdown-menu', 'editkit-tb-dropdown-menu--font');

    for (const font of FONT_FAMILIES) {
      const it = document.createElement('button');
      it.type = 'button';
      it.classList.add('editkit-tb-menu-item');
      it.style.fontFamily = `"${font}", sans-serif`;
      it.textContent = font;

      it.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.editor.commands.setFontFamily(font);
        if (this.fontLabel) this.fontLabel.textContent = font;
        this._closeDropdown();
      });

      menu.appendChild(it);
    }

    trigger.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this._toggleDropdown(wrap);
    });

    wrap.appendChild(trigger);
    wrap.appendChild(menu);
    return wrap;
  }

  // ── 3. Font Size Stepper: - 14 + ──
  private _createFontSizeStepper(): HTMLElement {
    const wrap = document.createElement('div');
    wrap.classList.add('editkit-tb-stepper-wrap');

    const minus = document.createElement('button');
    minus.type = 'button';
    minus.classList.add('editkit-tb-stepper-btn');
    minus.setAttribute('data-editkit-tooltip', 'Decrease Font Size');
    minus.setAttribute('aria-label', 'Decrease Font Size');
    minus.innerHTML = icons.minus;
    minus.addEventListener('mousedown', (e) => {
      e.preventDefault();
      this.editor.commands.decreaseFontSize();
      if (this.sizeDisplay) this.sizeDisplay.textContent = String(this.editor.commands.getFontSize());
    });

    this.sizeDisplay = document.createElement('span');
    this.sizeDisplay.classList.add('editkit-tb-stepper-val');
    this.sizeDisplay.textContent = String(this.editor.commands.getFontSize());

    const plus = document.createElement('button');
    plus.type = 'button';
    plus.classList.add('editkit-tb-stepper-btn');
    plus.setAttribute('data-editkit-tooltip', 'Increase Font Size');
    plus.setAttribute('aria-label', 'Increase Font Size');
    plus.innerHTML = icons.plus;
    plus.addEventListener('mousedown', (e) => {
      e.preventDefault();
      this.editor.commands.increaseFontSize();
      if (this.sizeDisplay) this.sizeDisplay.textContent = String(this.editor.commands.getFontSize());
    });

    wrap.appendChild(minus);
    wrap.appendChild(this.sizeDisplay);
    wrap.appendChild(plus);
    return wrap;
  }

  // ── 3.5. Character Formatting Dropdown: [Icon] ˅ (Exact EDITKIT Match) ──
  private _createFormatDropdown(): HTMLElement {
    const wrap = document.createElement('div');
    wrap.classList.add('editkit-tb-dropdown-wrap');

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.classList.add('editkit-tb-btn', 'editkit-tb-btn--chevron');
    trigger.setAttribute('data-editkit-tooltip', 'More Formatting');
    trigger.setAttribute('aria-label', 'More Formatting');
    trigger.innerHTML = `${icons.keyboard} <span class="editkit-tb-chevron-sm">${icons.chevronDown}</span>`;

    const menu = document.createElement('div');
    menu.classList.add('editkit-tb-dropdown-menu', 'editkit-tb-dropdown-menu--format');

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
      itBtn.classList.add('editkit-tb-menu-item');
      itBtn.setAttribute('data-format-id', it.id);
      itBtn.innerHTML = `<span class="editkit-tb-menu-prefix">${it.icon}</span> <span class="editkit-tb-menu-label">${it.label}</span>`;
      itBtn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        it.action();
        this._closeDropdown();
      });
      menu.appendChild(itBtn);
    }

    trigger.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this._toggleDropdown(wrap);
    });

    wrap.appendChild(trigger);
    wrap.appendChild(menu);
    return wrap;
  }

  // ── 4. Color Dropdown with Popover: A ˅ ──
  private _createColorDropdown(): HTMLElement {
    const wrap = document.createElement('div');
    wrap.classList.add('editkit-tb-dropdown-wrap');

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.classList.add('editkit-tb-btn', 'editkit-tb-btn--color');
    trigger.setAttribute('data-editkit-tooltip', 'Text & Highlight Color');
    trigger.setAttribute('aria-label', 'Text & Highlight Color');
    trigger.innerHTML = `${icons.textColor} <span class="editkit-tb-color-indicator"></span>`;

    const popover = new ColorPickerPopover(this.editor, undefined, () => this._closeDropdown());
    wrap.appendChild(popover.element);

    trigger.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this._toggleDropdown(wrap);
    });

    wrap.appendChild(trigger);
    return wrap;
  }

  // ── 5. Alignment Dropdown: ≡ ˅ (Exact EDITKIT Match) ──
  private _createAlignDropdown(): HTMLElement {
    const wrap = document.createElement('div');
    wrap.classList.add('editkit-tb-dropdown-wrap');

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.classList.add('editkit-tb-btn', 'editkit-tb-btn--chevron');
    trigger.setAttribute('data-editkit-tooltip', 'Text Alignment & Line Height');
    trigger.setAttribute('aria-label', 'Text Alignment & Line Height');

    this.alignIconSpan = document.createElement('span');
    this.alignIconSpan.classList.add('editkit-tb-align-icon');
    this.alignIconSpan.innerHTML = icons.alignLeft;

    const chevron = document.createElement('span');
    chevron.classList.add('editkit-tb-chevron-sm');
    chevron.innerHTML = icons.chevronDown;

    trigger.appendChild(this.alignIconSpan);
    trigger.appendChild(chevron);
    this.alignTrigger = trigger;

    const menu = document.createElement('div');
    menu.classList.add('editkit-tb-dropdown-menu', 'editkit-tb-dropdown-menu--align');

    const aligns = [
      { id: 'left', icon: icons.alignLeft, label: 'Left Align', action: () => this.editor.commands.alignLeft() },
      { id: 'center', icon: icons.alignCenter, label: 'Center Align', action: () => this.editor.commands.alignCenter() },
      { id: 'right', icon: icons.alignRight, label: 'Right Align', action: () => this.editor.commands.alignRight() },
      { id: 'justify', icon: icons.alignJustify, label: 'Justify Align', action: () => this.editor.commands.alignJustify() },
    ];

    for (const a of aligns) {
      const it = document.createElement('button');
      it.type = 'button';
      it.classList.add('editkit-tb-menu-item');
      it.setAttribute('data-align-id', a.id);
      it.innerHTML = `<span class="editkit-tb-menu-prefix">${a.icon}</span> <span>${a.label}</span>`;
      it.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        a.action();
        this._syncStates();
        this._closeDropdown();
      });
      menu.appendChild(it);
    }

    // ── Line Height Flyout Item (Exact match from screenshot) ──
    const lhWrap = document.createElement('div');
    lhWrap.classList.add('editkit-tb-submenu-wrap');

    const lhItem = document.createElement('div');
    lhItem.classList.add('editkit-tb-menu-item', 'editkit-tb-menu-item--has-sub');
    lhItem.innerHTML = `
      <span class="editkit-tb-menu-label">Line Height</span>
      <span class="editkit-tb-menu-arrow">${icons.chevronRight}</span>
    `;

    const lhSub = document.createElement('div');
    lhSub.classList.add('editkit-tb-submenu', 'editkit-tb-submenu--lh');

    const lineHeights = ['1', '1.15', '1.5', '2', '2.5', '3'];

    for (const lh of lineHeights) {
      const lhBtn = document.createElement('button');
      lhBtn.type = 'button';
      lhBtn.classList.add('editkit-tb-menu-item');
      lhBtn.setAttribute('data-lineheight-id', lh);
      lhBtn.textContent = lh;
      lhBtn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
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
      e.stopPropagation();
      this._toggleDropdown(wrap);
    });

    wrap.appendChild(trigger);
    wrap.appendChild(menu);
    return wrap;
  }

  // ── 6. Lists Dropdown with nested submenus as in Screenshot 3 ──
  private _createListDropdown(): HTMLElement {
    const wrap = document.createElement('div');
    wrap.classList.add('editkit-tb-dropdown-wrap');

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.classList.add('editkit-tb-btn', 'editkit-tb-btn--chevron');
    trigger.setAttribute('data-editkit-tooltip', 'Lists & Quotes');
    trigger.setAttribute('aria-label', 'Lists & Quotes');
    trigger.innerHTML = `${icons.bulletList} <span class="editkit-tb-chevron-sm">${icons.chevronDown}</span>`;

    const menu = document.createElement('div');
    menu.classList.add('editkit-tb-dropdown-menu', 'editkit-tb-dropdown-menu--lists');

    // Bulleted list flyout item
    const bulletWrap = document.createElement('div');
    bulletWrap.classList.add('editkit-tb-submenu-wrap');

    const bulletItem = document.createElement('div');
    bulletItem.classList.add('editkit-tb-menu-item', 'editkit-tb-menu-item--has-sub');
    bulletItem.innerHTML = `
      <span class="editkit-tb-menu-prefix">${icons.bulletList}</span>
      <span class="editkit-tb-menu-label">Bulleted list</span>
      <span class="editkit-tb-menu-arrow">${icons.chevronRight}</span>
    `;

    const bulletSub = document.createElement('div');
    bulletSub.classList.add('editkit-tb-submenu');

    const bulletStyles: Array<{ id: BulletListStyle; icon: string; label: string }> = [
      { id: 'default', icon: '●', label: 'Default' },
      { id: 'circle', icon: '○', label: 'Circle' },
      { id: 'square', icon: '■', label: 'Square' },
    ];

    for (const bs of bulletStyles) {
      const bBtn = document.createElement('button');
      bBtn.type = 'button';
      bBtn.classList.add('editkit-tb-menu-item');
      bBtn.innerHTML = `<span class="editkit-tb-bullet-symbol">${bs.icon}</span> <span>${bs.label}</span>`;
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
    numWrap.classList.add('editkit-tb-submenu-wrap');

    const numItem = document.createElement('div');
    numItem.classList.add('editkit-tb-menu-item', 'editkit-tb-menu-item--has-sub');
    numItem.innerHTML = `
      <span class="editkit-tb-menu-prefix">${icons.orderedList}</span>
      <span class="editkit-tb-menu-label">Numbered list</span>
      <span class="editkit-tb-menu-arrow">${icons.chevronRight}</span>
    `;

    const numSub = document.createElement('div');
    numSub.classList.add('editkit-tb-submenu');

    const numStyles: Array<{ id: NumberedListStyle; label: string }> = [
      { id: 'decimal', label: '1. 1, 2, 3' },
      { id: 'lower-alpha', label: 'a. a, b, c' },
      { id: 'lower-roman', label: 'i. i, ii, iii' },
    ];

    for (const ns of numStyles) {
      const nBtn = document.createElement('button');
      nBtn.type = 'button';
      nBtn.classList.add('editkit-tb-menu-item');
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
    checkItem.classList.add('editkit-tb-menu-item');
    checkItem.innerHTML = `<span class="editkit-tb-menu-prefix">${icons.taskList}</span> <span>Check list</span>`;
    checkItem.addEventListener('mousedown', (e) => {
      e.preventDefault();
      this.editor.commands.taskList();
      this._closeDropdown();
    });
    menu.appendChild(checkItem);

    // Quote
    const quoteItem = document.createElement('button');
    quoteItem.type = 'button';
    quoteItem.classList.add('editkit-tb-menu-item');
    quoteItem.innerHTML = `<span class="editkit-tb-menu-prefix">${icons.blockquote}</span> <span>Quote</span>`;
    quoteItem.addEventListener('mousedown', (e) => {
      e.preventDefault();
      this.editor.commands.blockquote();
      this._closeDropdown();
    });
    menu.appendChild(quoteItem);

    // Code block
    const codeItem = document.createElement('button');
    codeItem.type = 'button';
    codeItem.classList.add('editkit-tb-menu-item');
    codeItem.innerHTML = `<span class="editkit-tb-menu-prefix">${icons.codeBlock}</span> <span>Code block</span>`;
    codeItem.addEventListener('mousedown', (e) => {
      e.preventDefault();
      this.editor.commands.codeBlock();
      this._closeDropdown();
    });
    menu.appendChild(codeItem);

    trigger.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this._toggleDropdown(wrap);
    });

    wrap.appendChild(trigger);
    wrap.appendChild(menu);
    return wrap;
  }

  // ── 7. Table Inserter with Visual NxM Hover Grid ──
  private _createTableGridDropdown(): HTMLElement {
    const wrap = document.createElement('div');
    wrap.classList.add('editkit-tb-dropdown-wrap');

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.classList.add('editkit-tb-btn');
    trigger.setAttribute('data-editkit-tooltip', 'Insert Table');
    trigger.setAttribute('aria-label', 'Insert Table');
    trigger.innerHTML = icons.table;

    const menu = document.createElement('div');
    menu.classList.add('editkit-tb-dropdown-menu', 'editkit-tb-table-picker');

    const header = document.createElement('div');
    header.classList.add('editkit-tb-table-picker-header');
    header.innerHTML = `<span>Insert Table</span> <span class="editkit-tb-table-size-text">3 × 3</span>`;

    const sizeText = header.querySelector('.editkit-tb-table-size-text') as HTMLElement;

    // 6x6 Grid of cells
    const grid = document.createElement('div');
    grid.classList.add('editkit-tb-table-grid');

    const cells: HTMLElement[][] = [];
    const MAX_R = 6;
    const MAX_C = 6;

    for (let r = 0; r < MAX_R; r++) {
      cells[r] = [];
      for (let c = 0; c < MAX_C; c++) {
        const cell = document.createElement('div');
        cell.classList.add('editkit-tb-grid-cell');
        cell.setAttribute('data-row', String(r + 1));
        cell.setAttribute('data-col', String(c + 1));

        cell.addEventListener('mouseenter', () => {
          this._highlightGrid(cells, r, c);
          sizeText.textContent = `${r + 1} × ${c + 1}`;
        });

        cell.addEventListener('mousedown', (e) => {
          e.preventDefault();
          e.stopPropagation();
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
      e.stopPropagation();
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
          cells[r][c].classList.add('editkit-tb-grid-cell--active');
        } else {
          cells[r][c].classList.remove('editkit-tb-grid-cell--active');
        }
      }
    }
  }

  // ── Image Button (Opens 2-Step Dropzone & URL Modal) ──
  private _createImageButton(): HTMLElement {
    return this._createBtn('image', 'Insert Image', () => {
      this.imageModal.show('dropzone');
    });
  }

  // ── Math / Equation Dropdown (Exact match to Screenshot) ──
  private _createMathDropdown(): HTMLElement {
    const wrap = document.createElement('div');
    wrap.classList.add('editkit-tb-dropdown-wrap');

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.classList.add('editkit-tb-btn');
    trigger.setAttribute('data-editkit-tooltip', 'Formula / Equation');
    trigger.setAttribute('aria-label', 'Formula / Equation');
    trigger.innerHTML = icons.math;

    const menu = document.createElement('div');
    menu.classList.add('editkit-tb-dropdown-menu', 'editkit-tb-dropdown-menu--compact');

    const items = [
      { id: 'block', icon: icons.mathBlock, label: 'Block equation', action: () => this.mathModal.show('block') },
      { id: 'inline', icon: icons.mathInline, label: 'Inline equation', action: () => this.mathModal.show('inline') },
    ];

    for (const it of items) {
      const itBtn = document.createElement('button');
      itBtn.type = 'button';
      itBtn.classList.add('editkit-tb-menu-item');
      itBtn.innerHTML = `<span class="editkit-tb-menu-prefix">${it.icon}</span> <span class="editkit-tb-menu-label">${it.label}</span>`;
      itBtn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this._closeDropdown();
        it.action();
      });
      menu.appendChild(itBtn);
    }

    trigger.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this._toggleDropdown(wrap);
    });

    wrap.appendChild(trigger);
    wrap.appendChild(menu);
    return wrap;
  }

  // ── Link Button ──
  private _createLinkButton(): HTMLElement {
    const btn = this._createBtn('link', 'Add Link (Ctrl+K)', () => {
      this.linkPopover.show(btn.getBoundingClientRect());
    });
    return btn;
  }

  // ── Emoji Picker Dropdown (Exact match to EditKit Screenshot) ──
  private _createEmojiDropdown(): HTMLElement {
    const wrap = document.createElement('div');
    wrap.classList.add('editkit-tb-dropdown-wrap');

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.classList.add('editkit-tb-btn');
    trigger.setAttribute('data-editkit-tooltip', 'Insert Emoji');
    trigger.setAttribute('aria-label', 'Insert Emoji');
    trigger.innerHTML = icons.emoji;

    const picker = new EmojiPicker(this.editor, () => {
      this._closeDropdown();
    });

    wrap.appendChild(trigger);
    wrap.appendChild(picker.element);

    trigger.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const willOpen = !wrap.classList.contains('editkit-tb-dropdown-wrap--open');
      this._toggleDropdown(wrap);
      if (willOpen) {
        picker.focusSearch();
      }
    });

    return wrap;
  }

  // ── Symbol / Omega Dropdown (Rich Special Characters Picker) ──
  private _createSymbolDropdown(): HTMLElement {
    const wrap = document.createElement('div');
    wrap.classList.add('editkit-tb-dropdown-wrap');

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.classList.add('editkit-tb-btn');
    trigger.setAttribute('data-editkit-tooltip', 'Special Characters');
    trigger.setAttribute('aria-label', 'Special Characters');
    trigger.innerHTML = icons.omega;

    const symbolPicker = new SymbolPicker(this.editor, () => {
      this._closeDropdown();
    });

    trigger.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const willOpen = !wrap.classList.contains('editkit-tb-dropdown-wrap--open');
      this._toggleDropdown(wrap);
      if (willOpen) {
        symbolPicker.focusSearch();
      }
    });

    wrap.appendChild(trigger);
    wrap.appendChild(symbolPicker.element);
    return wrap;
  }

  // ── More Add: + ˅ ──
  private _createMoreDropdown(): HTMLElement {
    const wrap = document.createElement('div');
    wrap.classList.add('editkit-tb-dropdown-wrap');

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.classList.add('editkit-tb-btn', 'editkit-tb-btn--chevron');
    trigger.setAttribute('data-editkit-tooltip', 'More Insert Items');
    trigger.setAttribute('aria-label', 'More Insert Items');
    trigger.innerHTML = `${icons.plus} <span class="editkit-tb-chevron-sm">${icons.chevronDown}</span>`;

    const menu = document.createElement('div');
    menu.classList.add('editkit-tb-dropdown-menu');

    const items = [
      { label: 'Subscript (X₂)', action: () => this.editor.commands.subscript() },
      { label: 'Superscript (X²)', action: () => this.editor.commands.superscript() },
      { label: 'Horizontal Divider', action: () => this.editor.commands.horizontalRule() },
      { label: 'Clear Formatting', action: () => this.editor.commands.clearFormatting() },
      { label: 'Callout Box', action: () => this.editor.commands.blockquote() },
      { label: 'Table of Contents', action: () => alert('Inserted Table of Contents') },
      { label: 'Insert Date / Time', action: () => document.execCommand('insertText', false, new Date().toLocaleDateString()) },
    ];

    for (const it of items) {
      const b = document.createElement('button');
      b.type = 'button';
      b.classList.add('editkit-tb-menu-item');
      b.textContent = it.label;
      b.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        it.action();
        this._closeDropdown();
      });
      menu.appendChild(b);
    }

    trigger.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
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

  // ── Callout / Alert Panels Dropdown (Info, Warning, Error, Success, Note) ──
  private _createPanelDropdown(): HTMLElement {
    const wrap = document.createElement('div');
    wrap.classList.add('editkit-tb-dropdown-wrap');

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.classList.add('editkit-tb-btn');
    trigger.setAttribute('data-editkit-tooltip', 'Panels');
    trigger.setAttribute('aria-label', 'Panels');

    const iconSpan = document.createElement('span');
    iconSpan.classList.add('editkit-tb-btn-icon');
    iconSpan.innerHTML = icons.pin;
    trigger.appendChild(iconSpan);

    const menu = document.createElement('div');
    menu.classList.add('editkit-tb-dropdown-menu', 'editkit-tb-dropdown-menu--panels');

    const items: Array<{
      type: 'info' | 'warning' | 'error' | 'success' | 'note';
      icon: string;
      title: string;
      subtitle: string;
      colorClass: string;
    }> = [
        {
          type: 'info',
          icon: icons.panelInfo,
          title: 'Info',
          subtitle: 'Information panel',
          colorClass: 'editkit-tb-panel-item--info',
        },
        {
          type: 'warning',
          icon: icons.panelWarning,
          title: 'Warning',
          subtitle: 'Warning panel',
          colorClass: 'editkit-tb-panel-item--warning',
        },
        {
          type: 'error',
          icon: icons.panelError,
          title: 'Error',
          subtitle: 'Error panel',
          colorClass: 'editkit-tb-panel-item--error',
        },
        {
          type: 'success',
          icon: icons.panelSuccess,
          title: 'Success',
          subtitle: 'Success panel',
          colorClass: 'editkit-tb-panel-item--success',
        },
        {
          type: 'note',
          icon: icons.panelNote,
          title: 'Note',
          subtitle: 'General note panel',
          colorClass: 'editkit-tb-panel-item--note',
        },
      ];

    for (const item of items) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.classList.add('editkit-tb-menu-item', 'editkit-tb-panel-item', item.colorClass);

      const icon = document.createElement('span');
      icon.classList.add('editkit-tb-panel-item-icon');
      icon.innerHTML = item.icon;

      const textWrap = document.createElement('div');
      textWrap.classList.add('editkit-tb-panel-item-text');

      const title = document.createElement('div');
      title.classList.add('editkit-tb-panel-item-title');
      title.textContent = item.title;

      const sub = document.createElement('div');
      sub.classList.add('editkit-tb-panel-item-sub');
      sub.textContent = item.subtitle;

      textWrap.appendChild(title);
      textWrap.appendChild(sub);

      btn.appendChild(icon);
      btn.appendChild(textWrap);

      btn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        this.editor.commands.insertPanel(item.type);
        this._closeDropdown();
      });

      menu.appendChild(btn);
    }

    trigger.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this._toggleDropdown(wrap);
    });

    wrap.appendChild(trigger);
    wrap.appendChild(menu);
    return wrap;
  }

  // ── 10. Insert Elements Dropdown (Horizontal Line, Upload File, Signature, Editorial >, Blocks >, Patterns >) ──
  private _createInsertElementsDropdown(): HTMLElement {
    const wrap = document.createElement('div');
    wrap.classList.add('editkit-tb-dropdown-wrap', 'editkit-tb-dropdown-wrap--elements');

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.classList.add('editkit-tb-btn', 'editkit-tb-btn--chevron-standalone');
    trigger.setAttribute('data-editkit-tooltip', 'Insert Elements');
    trigger.setAttribute('aria-label', 'Insert Elements');

    const chevron = document.createElement('span');
    chevron.classList.add('editkit-tb-btn-icon');
    chevron.innerHTML = icons.chevronDown;
    trigger.appendChild(chevron);

    const menu = document.createElement('div');
    menu.classList.add('editkit-tb-dropdown-menu', 'editkit-tb-dropdown-menu--elements');

    // 1. Horizontal Line
    const hrBtn = document.createElement('button');
    hrBtn.type = 'button';
    hrBtn.classList.add('editkit-tb-menu-item');
    hrBtn.innerHTML = `
      <span class="editkit-tb-menu-prefix">${icons.horizontalLine}</span>
      <span class="editkit-tb-menu-label">Horizontal Line</span>
    `;
    hrBtn.addEventListener('mousedown', (e) => {
      e.preventDefault();
      this._openDividerModal();
      this._closeDropdown();
    });
    menu.appendChild(hrBtn);

    // 2. Upload File
    const uploadBtn = document.createElement('button');
    uploadBtn.type = 'button';
    uploadBtn.classList.add('editkit-tb-menu-item');
    uploadBtn.innerHTML = `
      <span class="editkit-tb-menu-prefix">${icons.paperclip}</span>
      <span class="editkit-tb-menu-label">Upload File</span>
    `;
    uploadBtn.addEventListener('mousedown', (e) => {
      e.preventDefault();
      this.imageModal.show('dropzone');
      this._closeDropdown();
    });
    menu.appendChild(uploadBtn);

    // 3. Signature
    const sigBtn = document.createElement('button');
    sigBtn.type = 'button';
    sigBtn.classList.add('editkit-tb-menu-item');
    sigBtn.innerHTML = `
      <span class="editkit-tb-menu-prefix">${icons.signature}</span>
      <span class="editkit-tb-menu-label">Signature</span>
    `;
    sigBtn.addEventListener('mousedown', (e) => {
      e.preventDefault();
      this.signatureModal.show();
      this._closeDropdown();
    });
    menu.appendChild(sigBtn);

    // 4. Editorial > (Submenu - Screenshot 1)
    const editorialWrap = document.createElement('div');
    editorialWrap.classList.add('editkit-tb-submenu-wrap');

    const editorialTrigger = document.createElement('button');
    editorialTrigger.type = 'button';
    editorialTrigger.classList.add('editkit-tb-menu-item', 'editkit-tb-menu-item--has-sub');
    editorialTrigger.innerHTML = `
      <span class="editkit-tb-menu-prefix">${icons.pilcrow}</span>
      <span class="editkit-tb-menu-label">Editorial</span>
      <span class="editkit-tb-menu-chevron">${icons.chevronRight}</span>
    `;

    const editorialSub = document.createElement('div');
    editorialSub.classList.add('editkit-tb-submenu');

    const editorialItems = [
      { label: 'Decorative Divider', icon: icons.decDivider, action: () => this._insertDecorativeDivider() },
      { label: 'Section Heading', icon: icons.sectionHeading, action: () => this._insertSectionHeading() },
      { label: 'Pull Quote', icon: icons.pullQuote, action: () => this._insertPullQuote() },
    ];
    editorialItems.forEach(it => {
      const item = document.createElement('button');
      item.type = 'button';
      item.classList.add('editkit-tb-menu-item');
      item.innerHTML = `
        <span class="editkit-tb-menu-prefix">${it.icon}</span>
        <span class="editkit-tb-menu-label">${it.label}</span>
      `;
      item.addEventListener('mousedown', (e) => {
        e.preventDefault();
        it.action();
        this._closeDropdown();
      });
      editorialSub.appendChild(item);
    });

    editorialWrap.appendChild(editorialTrigger);
    editorialWrap.appendChild(editorialSub);
    menu.appendChild(editorialWrap);

    // 5. Blocks > (Submenu - Screenshot 2)
    const blocksWrap = document.createElement('div');
    blocksWrap.classList.add('editkit-tb-submenu-wrap');

    const blocksTrigger = document.createElement('button');
    blocksTrigger.type = 'button';
    blocksTrigger.classList.add('editkit-tb-menu-item', 'editkit-tb-menu-item--has-sub');
    blocksTrigger.innerHTML = `
      <span class="editkit-tb-menu-prefix">${icons.blocks}</span>
      <span class="editkit-tb-menu-label">Blocks</span>
      <span class="editkit-tb-menu-chevron">${icons.chevronRight}</span>
    `;

    const blocksSub = document.createElement('div');
    blocksSub.classList.add('editkit-tb-submenu');

    const blockItems = [
      { label: 'Columns', icon: icons.columns, action: () => this._insert2ColGrid() },
      { label: 'Button', icon: icons.buttonPointer, action: () => this._insertButtonBlock() },
      { label: 'FAQ', icon: icons.faq, action: () => this._insertFAQBlock() },
    ];
    blockItems.forEach(it => {
      const item = document.createElement('button');
      item.type = 'button';
      item.classList.add('editkit-tb-menu-item');
      item.innerHTML = `
        <span class="editkit-tb-menu-prefix">${it.icon}</span>
        <span class="editkit-tb-menu-label">${it.label}</span>
      `;
      item.addEventListener('mousedown', (e) => {
        e.preventDefault();
        it.action();
        this._closeDropdown();
      });
      blocksSub.appendChild(item);
    });

    blocksWrap.appendChild(blocksTrigger);
    blocksWrap.appendChild(blocksSub);
    menu.appendChild(blocksWrap);

    // 6. Patterns > (Submenu - Screenshot 3)
    const patternsWrap = document.createElement('div');
    patternsWrap.classList.add('editkit-tb-submenu-wrap');

    const patternsTrigger = document.createElement('button');
    patternsTrigger.type = 'button';
    patternsTrigger.classList.add('editkit-tb-menu-item', 'editkit-tb-menu-item--has-sub');
    patternsTrigger.innerHTML = `
      <span class="editkit-tb-menu-prefix">${icons.patterns}</span>
      <span class="editkit-tb-menu-label">Patterns</span>
      <span class="editkit-tb-menu-chevron">${icons.chevronRight}</span>
    `;

    const patternsSub = document.createElement('div');
    patternsSub.classList.add('editkit-tb-submenu');

    const patternItems = [
      { label: 'Hero', icon: icons.hero, action: () => this._insertHeroBanner() },
      { label: 'Feature row', icon: icons.featureRow, action: () => this._insertFeatureRow() },
      { label: 'Three-up', icon: icons.threeUp, action: () => this._insertThreeUp() },
      { label: 'CTA band', icon: icons.ctaBand, action: () => this._insertCTABand() },
    ];
    patternItems.forEach(it => {
      const item = document.createElement('button');
      item.type = 'button';
      item.classList.add('editkit-tb-menu-item');
      item.innerHTML = `
        <span class="editkit-tb-menu-prefix">${it.icon}</span>
        <span class="editkit-tb-menu-label">${it.label}</span>
      `;
      item.addEventListener('mousedown', (e) => {
        e.preventDefault();
        it.action();
        this._closeDropdown();
      });
      patternsSub.appendChild(item);
    });

    patternsWrap.appendChild(patternsTrigger);
    patternsWrap.appendChild(patternsSub);
    menu.appendChild(patternsWrap);

    trigger.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this._toggleDropdown(wrap);
    });

    wrap.appendChild(trigger);
    wrap.appendChild(menu);
    return wrap;
  }

  // ── Helper Insert Actions ──

  private _triggerFileUpload(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = () => {
      const file = input.files?.[0];
      if (file) {
        const sizeStr = file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : `${Math.round(file.size / 1024)} KB`;
        const html = `
          <div class="editkit-file-card" contenteditable="false">
            <span class="editkit-file-card-icon">${icons.paperclip}</span>
            <div class="editkit-file-card-info">
              <span class="editkit-file-card-name">${file.name}</span>
              <span class="editkit-file-card-size">${sizeStr}</span>
            </div>
            <a href="#" class="editkit-file-card-download" title="Download">↓</a>
          </div><p><br></p>`;
        document.execCommand('insertHTML', false, html);
      }
    };
    input.click();
  }

  private _insertSignatureBlock(): void {
    const html = `
      <div class="editkit-signature-card" contenteditable="false">
        <div class="editkit-signature-draw"><span class="editkit-signature-symbol">✎</span> <span class="editkit-signature-placeholder">Sign here</span></div>
        <div class="editkit-signature-line"></div>
        <div class="editkit-signature-meta">
          <span class="editkit-signature-name" contenteditable="true">Authorized Signatory</span>
          <span class="editkit-signature-date" contenteditable="true">Date: ${new Date().toLocaleDateString()}</span>
        </div>
      </div><p><br></p>`;
    document.execCommand('insertHTML', false, html);
  }

  private _insertDecorativeDivider(): void {
    this.decDividerModal.show();
  }

  private _insertSectionHeading(): void {
    const headingWrap = document.createElement('div');
    headingWrap.classList.add('editkit-section-heading');
    headingWrap.setAttribute('data-align', 'left');
    headingWrap.setAttribute('data-badge', '01');
    headingWrap.setAttribute('contenteditable', 'false');

    const badgeSpan = document.createElement('span');
    badgeSpan.classList.add('editkit-sec-badge');
    badgeSpan.setAttribute('contenteditable', 'true');
    badgeSpan.setAttribute('spellcheck', 'false');
    badgeSpan.textContent = '01';

    const titleH2 = document.createElement('h2');
    titleH2.classList.add('editkit-sec-title');
    titleH2.setAttribute('contenteditable', 'true');
    titleH2.setAttribute('spellcheck', 'false');
    titleH2.textContent = 'Section title';

    headingWrap.appendChild(badgeSpan);
    headingWrap.appendChild(titleH2);

    this.editor.insertBlockNode(headingWrap);
    this.secHeadingMenu.selectHeading(headingWrap);

    // Focus inside title
    setTimeout(() => {
      const r = document.createRange();
      r.selectNodeContents(titleH2);
      r.collapse(false);
      const s = window.getSelection();
      s?.removeAllRanges();
      s?.addRange(r);
    }, 20);
  }

  private _insertPullQuote(): void {
    const quoteWrap = document.createElement('figure');
    quoteWrap.classList.add('editkit-pull-quote');
    quoteWrap.setAttribute('data-rule-mode', 'full');
    quoteWrap.setAttribute('contenteditable', 'false');

    const topLine = document.createElement('div');
    topLine.classList.add('editkit-pq-line', 'editkit-pq-line--top');

    const quoteBlock = document.createElement('blockquote');
    quoteBlock.classList.add('editkit-pq-quote');
    quoteBlock.setAttribute('contenteditable', 'true');
    quoteBlock.setAttribute('spellcheck', 'false');
    quoteBlock.textContent = 'Pull quote';

    const attrFig = document.createElement('figcaption');
    attrFig.classList.add('editkit-pq-attribution');
    attrFig.setAttribute('contenteditable', 'true');
    attrFig.setAttribute('spellcheck', 'false');
    attrFig.textContent = 'ATTRIBUTION';

    const bottomLine = document.createElement('div');
    bottomLine.classList.add('editkit-pq-line', 'editkit-pq-line--bottom');

    quoteWrap.appendChild(topLine);
    quoteWrap.appendChild(quoteBlock);
    quoteWrap.appendChild(attrFig);
    quoteWrap.appendChild(bottomLine);

    this.editor.insertBlockNode(quoteWrap);
    this.pullQuoteMenu.selectQuote(quoteWrap);

    // Focus inside quote text
    setTimeout(() => {
      const r = document.createRange();
      r.selectNodeContents(quoteBlock);
      r.collapse(false);
      const s = window.getSelection();
      s?.removeAllRanges();
      s?.addRange(r);
    }, 20);
  }

  private _insertButtonBlock(): void {
    const btnWrap = document.createElement('div');
    btnWrap.classList.add('editkit-button-block');
    btnWrap.setAttribute('data-variant', 'filled');
    btnWrap.setAttribute('data-radius', 'rounded');
    btnWrap.setAttribute('data-align', 'left');
    btnWrap.setAttribute('data-color', '#f59e0b');
    btnWrap.setAttribute('contenteditable', 'false');

    const linkEl = document.createElement('a');
    linkEl.classList.add('editkit-btn-element');
    linkEl.setAttribute('href', 'https://');
    linkEl.setAttribute('target', '_blank');
    linkEl.setAttribute('contenteditable', 'true');
    linkEl.setAttribute('spellcheck', 'false');
    linkEl.textContent = 'Button';

    const editIcon = document.createElement('span');
    editIcon.classList.add('editkit-btn-edit-icon');
    editIcon.setAttribute('title', 'Edit link URL');
    editIcon.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>`;

    btnWrap.appendChild(linkEl);
    btnWrap.appendChild(editIcon);

    this.editor.insertBlockNode(btnWrap);
    this.buttonBlockMenu.selectButton(btnWrap);

    // Focus inside button text
    setTimeout(() => {
      const r = document.createRange();
      r.selectNodeContents(linkEl);
      r.collapse(false);
      const s = window.getSelection();
      s?.removeAllRanges();
      s?.addRange(r);
    }, 20);
  }

  private _insertFAQBlock(): void {
    const faqBlock = this.faqManager.createFAQBlockElement();

    this.editor.insertBlockNode(faqBlock);
    this.faqManager.selectBlock(faqBlock);

    // Focus inside first question
    const firstQ = faqBlock.querySelector('.editkit-faq-question') as HTMLElement;
    if (firstQ) {
      setTimeout(() => {
        const r = document.createRange();
        r.selectNodeContents(firstQ);
        r.collapse(false);
        const s = window.getSelection();
        s?.removeAllRanges();
        s?.addRange(r);
      }, 20);
    }
  }

  private _insert2ColGrid(): void {
    this._insertColumnBlock('50-50');
  }

  private _insert3ColGrid(): void {
    this._insertColumnBlock('3-col');
  }

  private _insertColumnBlock(layout: '50-50' | '3-col' | '1-col' | '70-30' | '30-70' = '50-50'): void {
    const colBlock = this.columnBlockManager.createColumnBlockElement(layout);

    this.editor.insertBlockNode(colBlock);

    // Focus inside first column body
    const firstBody = colBlock.querySelector('.editkit-column-body') as HTMLElement;
    if (firstBody) {
      setTimeout(() => {
        const r = document.createRange();
        r.selectNodeContents(firstBody);
        r.collapse(false);
        const s = window.getSelection();
        s?.removeAllRanges();
        s?.addRange(r);
      }, 20);
    }
  }

  private _insertHeroBanner(): void {
    const wrap = document.createElement('div');
    wrap.classList.add('editkit-hero-pattern');

    const h1 = document.createElement('h1');
    h1.classList.add('editkit-hero-headline');
    h1.textContent = 'A headline that sells the page';

    const p = document.createElement('p');
    p.classList.add('editkit-hero-subheadline');
    p.textContent = 'One supporting sentence that explains the value in plain terms.';

    const btnWrap = document.createElement('div');
    btnWrap.classList.add('editkit-button-block');
    btnWrap.setAttribute('data-variant', 'filled');
    btnWrap.setAttribute('data-radius', 'rounded');
    btnWrap.setAttribute('data-align', 'left');
    btnWrap.setAttribute('data-color', '#f59e0b');
    btnWrap.setAttribute('contenteditable', 'false');

    const linkEl = document.createElement('a');
    linkEl.classList.add('editkit-btn-element');
    linkEl.setAttribute('href', 'https://');
    linkEl.setAttribute('target', '_blank');
    linkEl.setAttribute('contenteditable', 'true');
    linkEl.setAttribute('spellcheck', 'false');
    linkEl.textContent = 'Get started';

    const editIcon = document.createElement('span');
    editIcon.classList.add('editkit-btn-edit-icon');
    editIcon.setAttribute('title', 'Edit link URL');
    editIcon.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>`;

    btnWrap.appendChild(linkEl);
    btnWrap.appendChild(editIcon);

    wrap.appendChild(h1);
    wrap.appendChild(p);
    wrap.appendChild(btnWrap);

    this.editor.insertBlockNode(wrap);

    // Focus inside headline for immediate typing
    setTimeout(() => {
      const r = document.createRange();
      r.selectNodeContents(h1);
      r.collapse(false);
      const s = window.getSelection();
      s?.removeAllRanges();
      s?.addRange(r);
    }, 20);
  }

  private _insertFeatureRow(): void {
    const colBlock = this.columnBlockManager.createFeatureRowElement(this.imageModal);
    this.editor.insertBlockNode(colBlock);

    // Focus inside first column title for typing
    const firstTitle = colBlock.querySelector('.editkit-feature-col-title') as HTMLElement;
    if (firstTitle) {
      setTimeout(() => {
        const r = document.createRange();
        r.selectNodeContents(firstTitle);
        r.collapse(false);
        const s = window.getSelection();
        s?.removeAllRanges();
        s?.addRange(r);
      }, 20);
    }
  }

  private _insertThreeUp(): void {
    const colBlock = this.columnBlockManager.createThreeUpElement();
    this.editor.insertBlockNode(colBlock);

    // Focus inside first column title for typing
    const firstTitle = colBlock.querySelector('.editkit-feature-col-title') as HTMLElement;
    if (firstTitle) {
      setTimeout(() => {
        const r = document.createRange();
        r.selectNodeContents(firstTitle);
        r.collapse(false);
        const s = window.getSelection();
        s?.removeAllRanges();
        s?.addRange(r);
      }, 20);
    }
  }

  private _insertCTABand(): void {
    const card = document.createElement('div');
    card.classList.add('editkit-cta-band-card');
    card.setAttribute('data-editkit-block', 'cta-band');
    card.setAttribute('contenteditable', 'false');

    // Ambient Glow Effect
    const glow = document.createElement('div');
    glow.classList.add('editkit-cta-card-glow');
    card.appendChild(glow);

    // Left Content Area
    const info = document.createElement('div');
    info.classList.add('editkit-cta-card-info');
    info.setAttribute('contenteditable', 'true');
    info.setAttribute('spellcheck', 'false');

    const badge = document.createElement('div');
    badge.classList.add('editkit-cta-card-badge');
    badge.innerHTML = `<span class="editkit-cta-badge-dot"></span> ⚡ NEXT-GEN PUBLISHING`;

    const title = document.createElement('h2');
    title.classList.add('editkit-cta-card-title');
    title.textContent = 'Supercharge your workflow today.';

    const desc = document.createElement('p');
    desc.classList.add('editkit-cta-card-desc');
    desc.textContent = 'Join over 10,000+ creators building lightning-fast, structured content with EditKit.';

    const trust = document.createElement('div');
    trust.classList.add('editkit-cta-card-trust');
    trust.innerHTML = `
      <span class="editkit-cta-trust-stars">★★★★★</span>
      <span class="editkit-cta-trust-text">4.9/5 from 1,200+ teams • No credit card required</span>
    `;

    info.appendChild(badge);
    info.appendChild(title);
    info.appendChild(desc);
    info.appendChild(trust);

    // Right Action Area with Button Block
    const action = document.createElement('div');
    action.classList.add('editkit-cta-card-action');
    action.setAttribute('contenteditable', 'false');

    const btnWrap = document.createElement('div');
    btnWrap.classList.add('editkit-button-block');
    btnWrap.setAttribute('data-variant', 'filled');
    btnWrap.setAttribute('data-radius', 'rounded');
    btnWrap.setAttribute('data-align', 'left');
    btnWrap.setAttribute('data-color', '#f59e0b');
    btnWrap.setAttribute('contenteditable', 'false');

    const linkEl = document.createElement('a');
    linkEl.classList.add('editkit-btn-element');
    linkEl.setAttribute('href', 'https://');
    linkEl.setAttribute('target', '_blank');
    linkEl.setAttribute('contenteditable', 'true');
    linkEl.setAttribute('spellcheck', 'false');
    linkEl.textContent = 'Get Started Free →';

    const editIcon = document.createElement('span');
    editIcon.classList.add('editkit-btn-edit-icon');
    editIcon.setAttribute('title', 'Edit link URL');
    editIcon.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>`;

    btnWrap.appendChild(linkEl);
    btnWrap.appendChild(editIcon);

    const actionSub = document.createElement('div');
    actionSub.classList.add('editkit-cta-card-action-sub');
    actionSub.setAttribute('contenteditable', 'true');
    actionSub.setAttribute('spellcheck', 'false');
    actionSub.textContent = 'Instant setup • 14-day free trial';

    action.appendChild(btnWrap);
    action.appendChild(actionSub);

    card.appendChild(info);
    card.appendChild(action);

    this.editor.insertBlockNode(card);

    // Focus inside title
    setTimeout(() => {
      const r = document.createRange();
      r.selectNodeContents(title);
      r.collapse(false);
      const s = window.getSelection();
      s?.removeAllRanges();
      s?.addRange(r);
    }, 20);
  }

  private _addCommentMock(): void {
    const comment = prompt('Add a comment:');
    if (comment) alert(`Comment added: "${comment}"`);
  }

  private _openDividerModal(): void {
    this.dividerModal.show();
  }

  // ── Dropdown Toggle & Close ──
  private _toggleDropdown(wrap: HTMLElement): void {
    TooltipManager.hide();
    if (wrap.classList.contains('editkit-tb-dropdown-wrap--open')) {
      this._closeDropdown();
    } else {
      this._closeDropdown();
      this._syncStates();
      wrap.classList.add('editkit-tb-dropdown-wrap--open');
      this.openDropdown = wrap;
    }
  }

  private _closeDropdown(): void {
    if (this.openDropdown) {
      this.openDropdown.classList.remove('editkit-tb-dropdown-wrap--open');
      this.openDropdown.querySelectorAll('.editkit-tb-submenu-wrap--pinned').forEach(el => {
        el.classList.remove('editkit-tb-submenu-wrap--pinned');
      });
      this.openDropdown = null;
    }
  }

  // ── Sync Active States ──
  private _syncStates(): void {
    // 0. Sync Undo & Redo disabled/enabled states
    if (this.undoBtn) {
      const canUndo = this.editor.can().undo();
      this.undoBtn.disabled = !canUndo;
      this.undoBtn.classList.toggle('editkit-tb-btn--disabled', !canUndo);
    }
    if (this.redoBtn) {
      const canRedo = this.editor.can().redo();
      this.redoBtn.disabled = !canRedo;
      this.redoBtn.classList.toggle('editkit-tb-btn--disabled', !canRedo);
    }

    if (this.boldBtn) {
      this.boldBtn.classList.toggle('editkit-tb-btn--active', this.editor.isActive('bold'));
    }

    const formatItems = this.element.querySelectorAll('[data-format-id]');
    formatItems.forEach(b => {
      const id = b.getAttribute('data-format-id');
      if (id) {
        b.classList.toggle('editkit-tb-menu-item--active', this.editor.isActive(id));
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

    if (this.alignIconSpan && this._currentAlign !== activeAlign) {
      this.alignIconSpan.innerHTML = alignIconMap[activeAlign] || icons.alignLeft;
      this._currentAlign = activeAlign;
    }

    const alignButtons = this.element.querySelectorAll('[data-align-id]');
    alignButtons.forEach(b => {
      const id = b.getAttribute('data-align-id');
      b.classList.toggle('editkit-tb-menu-item--active', id === activeAlign);
    });

    // 2. Sync Line Height items
    const curLH = String(this.editor.commands.getLineHeight() || '1.5');
    const lhButtons = this.element.querySelectorAll('[data-lineheight-id]');
    lhButtons.forEach(b => {
      const id = b.getAttribute('data-lineheight-id');
      b.classList.toggle('editkit-tb-menu-item--active', id === curLH);
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
      b.classList.toggle('editkit-tb-menu-item--active', id === activeBlock);
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

    // 4. Sync Clear All Content button (enabled ONLY when all content is selected)
    if (this.clearAllBtn) {
      const isAll = this._isAllContentSelected();
      this.clearAllBtn.disabled = !isAll;
      this.clearAllBtn.classList.toggle('editkit-tb-btn--disabled', !isAll);
    }
  }

  private _isAllContentSelected(): boolean {
    const contentEl = this.editor.contentEl;
    if (!contentEl) return false;

    // If editor has no content or is empty, cannot be all selected
    const rawText = contentEl.textContent || '';
    const text = rawText.replace(/\s+/g, ' ').trim();
    const hasMedia = contentEl.querySelector('img, table, hr, iframe, video, math, svg') !== null;
    if (!text && !hasMedia) return false;

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return false;

    // Selection must be within editor content
    if (!contentEl.contains(sel.anchorNode) || !contentEl.contains(sel.focusNode)) return false;

    // Check 1: Boundary comparison with full content range (e.g. from selectAll / Ctrl+A)
    try {
      const range = sel.getRangeAt(0);
      const fullRange = document.createRange();
      fullRange.selectNodeContents(contentEl);

      const startSame = range.compareBoundaryPoints(Range.START_TO_START, fullRange) <= 0;
      const endSame = range.compareBoundaryPoints(Range.END_TO_END, fullRange) >= 0;
      if (startSame && endSame) {
        return true;
      }
    } catch { }

    // Check 2: Selected text equals full text
    const selectedText = sel.toString().replace(/\s+/g, ' ').trim();
    if (text.length > 0 && selectedText.length >= text.length && selectedText === text) {
      if (hasMedia) {
        const mediaEls = contentEl.querySelectorAll('img, table, hr, iframe, video');
        for (let i = 0; i < mediaEls.length; i++) {
          if (!sel.containsNode(mediaEls[i], true)) {
            return false;
          }
        }
      }
      return true;
    }

    // Check 3: Check if all meaningful child nodes of contentEl are intersected by selection
    const meaningfulChildren = Array.from(contentEl.childNodes).filter(node => {
      if (node.nodeType === Node.TEXT_NODE) return (node.textContent || '').trim().length > 0;
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        return el.textContent?.trim().length || el.querySelector('img, table, hr, iframe, video');
      }
      return false;
    });

    if (meaningfulChildren.length > 0 && meaningfulChildren.every(child => sel.containsNode(child, true))) {
      return true;
    }

    return false;
  }
}

export function createToolbar(editor: EditKitEditor, config: ToolbarConfig = {}): EditKitToolbar {
  return new EditKitToolbar(editor, config);
}
