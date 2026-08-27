// ============================================================
// EditKit — Floating Selection Bubble Menu (Exact Match for Image 2)
// Stepper + Align Dropdown + Marks (B, I, U, S, Code) + Link + Color Picker
// ============================================================

import type { EditKitEditor } from '@editkit/core';
import { icons } from './icons';
import { ColorPickerPopover } from './ColorPicker';
import { LinkPopover } from './LinkPopover';
import { TooltipManager } from './Tooltip';

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

export class BubbleMenu {
  readonly element: HTMLElement;
  private editor: EditKitEditor;
  private linkPopover: LinkPopover;
  private isVisible: boolean = false;
  private fontLabel?: HTMLElement;
  private sizeDisplay!: HTMLElement;
  private activeDropdown: HTMLElement | null = null;
  private _unsubscribers: (() => void)[] = [];

  constructor(editor: EditKitEditor) {
    this.editor = editor;
    this.linkPopover = new LinkPopover(editor);

    this.element = document.createElement('div');
    this.element.classList.add('editkit-bubble-menu');
    this.element.setAttribute('role', 'toolbar');
    this.element.setAttribute('aria-label', 'Floating selection menu');

    this._buildUI();

    // Listen to selection changes
    const unsub = this.editor.on('selectionUpdate', () => this._checkSelection());
    this._unsubscribers.push(unsub);

    const unsubBlur = this.editor.on('blur', () => {
      setTimeout(() => {
        if (!this.editor.isFocused && !this.element.contains(document.activeElement)) {
          this.hide();
        }
      }, 150);
    });
    this._unsubscribers.push(unsubBlur);

    // Close open dropdowns when clicking outside bubble menu
    document.addEventListener('mousedown', (e) => {
      if (!this.element.contains(e.target as Node)) {
        this._closeAllDropdowns();
      }
    });
  }

  mount(container: HTMLElement): void {
    container.appendChild(this.element);
  }

  destroy(): void {
    this._unsubscribers.forEach(fn => fn());
    this.element.remove();
  }

  private _buildUI(): void {
    this.element.innerHTML = '';

    const btn = (iconKey: string, tooltip: string, action: () => void, isActiveKey?: string) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.classList.add('editkit-bubble-btn');
      b.setAttribute('data-editkit-tooltip', tooltip);
      b.setAttribute('aria-label', tooltip);
      b.innerHTML = icons[iconKey] || iconKey;
      b.addEventListener('mousedown', (e) => {
        e.preventDefault();
        action();
        this._updateActiveStates();
      });
      if (isActiveKey) b.setAttribute('data-active-key', isActiveKey);
      return b;
    };

    const divider = () => {
      const d = document.createElement('div');
      d.classList.add('editkit-bubble-divider');
      return d;
    };

    // ── 0. Font Family Dropdown: [ DM Sans ˅ ] ──
    this.element.appendChild(this._createFontDropdown());

    this.element.appendChild(divider());

    // ── 1. Font Size Stepper: [ -  16  + ] ──
    const sizeWrap = document.createElement('div');
    sizeWrap.classList.add('editkit-bubble-stepper');

    const minusBtn = document.createElement('button');
    minusBtn.type = 'button';
    minusBtn.classList.add('editkit-bubble-btn', 'editkit-bubble-btn--stepper');
    minusBtn.innerHTML = icons.minus;
    minusBtn.setAttribute('title', 'Decrease font size');
    minusBtn.addEventListener('mousedown', (e) => {
      e.preventDefault();
      this.editor.commands.decreaseFontSize();
      this.sizeDisplay.textContent = String(this.editor.commands.getFontSize());
    });

    this.sizeDisplay = document.createElement('span');
    this.sizeDisplay.classList.add('editkit-bubble-stepper-value');
    this.sizeDisplay.textContent = String(this.editor.commands.getFontSize() || 16);

    const plusBtn = document.createElement('button');
    plusBtn.type = 'button';
    plusBtn.classList.add('editkit-bubble-btn', 'editkit-bubble-btn--stepper');
    plusBtn.innerHTML = icons.plus;
    plusBtn.setAttribute('title', 'Increase font size');
    plusBtn.addEventListener('mousedown', (e) => {
      e.preventDefault();
      this.editor.commands.increaseFontSize();
      this.sizeDisplay.textContent = String(this.editor.commands.getFontSize());
    });

    sizeWrap.appendChild(minusBtn);
    sizeWrap.appendChild(this.sizeDisplay);
    sizeWrap.appendChild(plusBtn);
    this.element.appendChild(sizeWrap);

    this.element.appendChild(divider());

    // ── 2. Alignment Dropdown: [ ≡ ˅ ] ──
    this.element.appendChild(this._createAlignDropdown());

    this.element.appendChild(divider());

    // ── 3. Marks: Bold, Italic, Underline, Strikethrough, Code ──
    this.element.appendChild(btn('bold', 'Bold (Ctrl+B)', () => this.editor.commands.bold(), 'bold'));
    this.element.appendChild(btn('italic', 'Italic (Ctrl+I)', () => this.editor.commands.italic(), 'italic'));
    this.element.appendChild(btn('underline', 'Underline (Ctrl+U)', () => this.editor.commands.underline(), 'underline'));
    this.element.appendChild(btn('strikethrough', 'Strikethrough', () => this.editor.commands.strikethrough(), 'strikethrough'));
    this.element.appendChild(btn('code', 'Inline Code', () => this.editor.commands.code(), 'code'));

    this.element.appendChild(divider());

    // ── 4. Link Button ──
    const linkBtn = btn('link', 'Add Link (Ctrl+K)', () => {
      this.linkPopover.show(linkBtn.getBoundingClientRect());
    });
    this.element.appendChild(linkBtn);

    // ── 5. Color Picker: A ──
    this.element.appendChild(this._createColorDropdown());
  }

  private _createFontDropdown(): HTMLElement {
    const wrap = document.createElement('div');
    wrap.className = 'editkit-bubble-dropdown-wrap';

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'editkit-bubble-pill-btn';
    trigger.setAttribute('data-editkit-tooltip', 'Font family');
    trigger.setAttribute('aria-label', 'Font family');

    this.fontLabel = document.createElement('span');
    this.fontLabel.className = 'editkit-bubble-pill-text';
    this.fontLabel.textContent = this.editor.commands.getFontFamily();

    const chevron = document.createElement('span');
    chevron.className = 'editkit-bubble-chevron';
    chevron.innerHTML = icons.chevronDown;

    trigger.appendChild(this.fontLabel);
    trigger.appendChild(chevron);

    const menu = document.createElement('div');
    menu.className = 'editkit-bubble-dropdown-menu editkit-bubble-dropdown-menu--font';

    for (const font of FONT_FAMILIES) {
      const it = document.createElement('button');
      it.type = 'button';
      it.className = 'editkit-bubble-menu-item';
      it.style.fontFamily = `"${font}", sans-serif`;
      it.textContent = font;

      it.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.editor.commands.setFontFamily(font);
        if (this.fontLabel) this.fontLabel.textContent = font;
        this._closeAllDropdowns();
      });

      menu.appendChild(it);
    }

    trigger.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      TooltipManager.hide();
      const isOpen = wrap.classList.contains('editkit-bubble-dropdown-wrap--open');
      this._closeAllDropdowns();
      if (!isOpen) {
        wrap.classList.add('editkit-bubble-dropdown-wrap--open');
        this.activeDropdown = wrap;
      }
    });

    wrap.appendChild(trigger);
    wrap.appendChild(menu);
    return wrap;
  }

  private _createAlignDropdown(): HTMLElement {
    const wrap = document.createElement('div');
    wrap.className = 'editkit-bubble-dropdown-wrap';

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'editkit-bubble-btn editkit-bubble-btn--chevron';
    trigger.setAttribute('data-editkit-tooltip', 'Alignment');
    trigger.setAttribute('aria-label', 'Alignment');
    trigger.innerHTML = `${icons.alignLeft} <span class="editkit-bubble-chevron">${icons.chevronDown}</span>`;

    const menu = document.createElement('div');
    menu.className = 'editkit-bubble-dropdown-menu';

    const items = [
      { id: 'left', icon: icons.alignLeft, label: 'Align Left', action: () => this.editor.commands.setTextAlign('left') },
      { id: 'center', icon: icons.alignCenter, label: 'Align Center', action: () => this.editor.commands.setTextAlign('center') },
      { id: 'right', icon: icons.alignRight, label: 'Align Right', action: () => this.editor.commands.setTextAlign('right') },
      { id: 'justify', icon: icons.alignJustify, label: 'Align Justify', action: () => this.editor.commands.setTextAlign('justify') },
    ];

    items.forEach(it => {
      const itBtn = document.createElement('button');
      itBtn.type = 'button';
      itBtn.className = 'editkit-bubble-menu-item';
      itBtn.innerHTML = `<span class="editkit-bubble-menu-icon">${it.icon}</span> <span>${it.label}</span>`;
      itBtn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        it.action();
        wrap.classList.remove('editkit-bubble-dropdown-wrap--open');
        this.activeDropdown = null;
        trigger.innerHTML = `${it.icon} <span class="editkit-bubble-chevron">${icons.chevronDown}</span>`;
      });
      menu.appendChild(itBtn);
    });

    trigger.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      TooltipManager.hide();
      const isOpen = wrap.classList.contains('editkit-bubble-dropdown-wrap--open');
      this._closeAllDropdowns();
      if (!isOpen) {
        wrap.classList.add('editkit-bubble-dropdown-wrap--open');
        this.activeDropdown = wrap;
      }
    });

    wrap.appendChild(trigger);
    wrap.appendChild(menu);
    return wrap;
  }

  private _createColorDropdown(): HTMLElement {
    const wrap = document.createElement('div');
    wrap.className = 'editkit-bubble-dropdown-wrap';

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'editkit-bubble-btn editkit-bubble-btn--color';
    trigger.setAttribute('data-editkit-tooltip', 'Text & Highlight Color');
    trigger.setAttribute('aria-label', 'Text & Highlight Color');
    trigger.innerHTML = `<span class="editkit-bubble-color-label">A</span><span class="editkit-bubble-color-bar"></span>`;

    const popover = new ColorPickerPopover(
      this.editor,
      (color, mode) => {
        if (mode === 'text') {
          this.editor.commands.setTextColor(color);
          const bar = trigger.querySelector('.editkit-bubble-color-bar') as HTMLElement | null;
          if (bar) bar.style.backgroundColor = color;
        } else {
          this.editor.commands.setHighlight(color);
        }
      },
      () => {
        wrap.classList.remove('editkit-bubble-dropdown-wrap--open');
        this.activeDropdown = null;
      }
    );

    trigger.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      TooltipManager.hide();
      const isOpen = wrap.classList.contains('editkit-bubble-dropdown-wrap--open');
      this._closeAllDropdowns();
      if (!isOpen) {
        wrap.classList.add('editkit-bubble-dropdown-wrap--open');
        this.activeDropdown = wrap;
      }
    });

    wrap.appendChild(trigger);
    wrap.appendChild(popover.element);
    return wrap;
  }

  private _closeAllDropdowns(): void {
    if (this.activeDropdown) {
      this.activeDropdown.classList.remove('editkit-bubble-dropdown-wrap--open');
      this.activeDropdown = null;
    }
  }

  private _checkSelection(): void {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !this.editor.contentEl.contains(sel.anchorNode)) {
      this.hide();
      return;
    }

    const text = sel.toString().trim();
    if (!text) {
      this.hide();
      return;
    }

    // Do not show bubble menu if cursor is inside table (table menu takes priority)
    if (this.editor.getActiveTableCell()) {
      this.hide();
      return;
    }

    // If a dropdown is currently open, don't recalculate position to prevent jumping
    if (this.activeDropdown) {
      this._updateActiveStates();
      return;
    }

    const range = sel.getRangeAt(0);
    const rangeRect = range.getBoundingClientRect();
    const editorRect = this.editor.root.getBoundingClientRect();

    this.show();
    this._updateActiveStates();

    let top = rangeRect.top - editorRect.top - 48;
    let left = rangeRect.left - editorRect.left + (rangeRect.width / 2) - (this.element.offsetWidth / 2);

    if (top < 10) {
      top = rangeRect.bottom - editorRect.top + 8;
    }

    // Keep within bounds
    const maxLeft = editorRect.width - this.element.offsetWidth - 12;
    left = Math.max(8, Math.min(left, maxLeft));

    this.element.style.transform = `translate(${left}px, ${top}px)`;
  }

  private _updateActiveStates(): void {
    const btns = this.element.querySelectorAll('[data-active-key]');
    btns.forEach((b) => {
      const key = b.getAttribute('data-active-key');
      if (key && this.editor.isActive(key)) {
        b.classList.add('editkit-bubble-btn--active');
      } else {
        b.classList.remove('editkit-bubble-btn--active');
      }
    });

    if (this.fontLabel) {
      this.fontLabel.textContent = this.editor.commands.getFontFamily();
    }

    if (this.sizeDisplay) {
      this.sizeDisplay.textContent = String(this.editor.commands.getFontSize() || 16);
    }

    const alignTrigger = this.element.querySelector('.editkit-bubble-btn--chevron');
    if (alignTrigger) {
      if (this.editor.isActive('textAlign', { align: 'center' })) {
        alignTrigger.innerHTML = `${icons.alignCenter} <span class="editkit-bubble-chevron">${icons.chevronDown}</span>`;
      } else if (this.editor.isActive('textAlign', { align: 'right' })) {
        alignTrigger.innerHTML = `${icons.alignRight} <span class="editkit-bubble-chevron">${icons.chevronDown}</span>`;
      } else if (this.editor.isActive('textAlign', { align: 'justify' })) {
        alignTrigger.innerHTML = `${icons.alignJustify} <span class="editkit-bubble-chevron">${icons.chevronDown}</span>`;
      } else {
        alignTrigger.innerHTML = `${icons.alignLeft} <span class="editkit-bubble-chevron">${icons.chevronDown}</span>`;
      }
    }
  }

  show(): void {
    if (!this.isVisible) {
      this.element.classList.add('editkit-bubble-menu--visible');
      this.isVisible = true;
    }
  }

  hide(): void {
    if (this.isVisible) {
      this._closeAllDropdowns();
      this.element.classList.remove('editkit-bubble-menu--visible');
      this.isVisible = false;
    }
  }
}
