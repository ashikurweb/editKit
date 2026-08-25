// ============================================================
// Vellora — Floating Selection Bubble Menu
// Exact match for the Eddyter Bubble Toolbar
// ============================================================

import type { VelloraEditor } from '@vellora/core';
import { icons } from './icons';
import { ColorPickerPopover } from './ColorPicker';
import { LinkPopover } from './LinkPopover';

export class BubbleMenu {
  readonly element: HTMLElement;
  private editor: VelloraEditor;
  private linkPopover: LinkPopover;
  private isVisible: boolean = false;
  private colorPickerEl: HTMLElement | null = null;
  private _unsubscribers: (() => void)[] = [];

  constructor(editor: VelloraEditor) {
    this.editor = editor;
    this.linkPopover = new LinkPopover(editor);

    this.element = document.createElement('div');
    this.element.classList.add('vellora-bubble-menu');
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
      b.classList.add('vellora-bubble-btn');
      b.setAttribute('title', tooltip);
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
      d.classList.add('vellora-bubble-divider');
      return d;
    };

    // 1. ✦ AI pill button
    const aiBtn = document.createElement('button');
    aiBtn.type = 'button';
    aiBtn.classList.add('vellora-bubble-btn', 'vellora-bubble-btn--ai');
    aiBtn.innerHTML = `${icons.sparkles} <span>AI</span> <span class="vellora-bubble-chevron">${icons.chevronDown}</span>`;
    aiBtn.addEventListener('mousedown', (e) => {
      e.preventDefault();
      // AI prompt mock
      const selText = window.getSelection()?.toString() || '';
      if (selText) {
        this.editor.commands.bold(); // example AI polish action
      }
    });
    this.element.appendChild(aiBtn);
    this.element.appendChild(divider());

    // 2. Font Size stepper: - 14 +
    const sizeWrap = document.createElement('div');
    sizeWrap.classList.add('vellora-bubble-stepper');

    const minusBtn = document.createElement('button');
    minusBtn.type = 'button';
    minusBtn.classList.add('vellora-bubble-btn', 'vellora-bubble-btn--stepper');
    minusBtn.innerHTML = icons.minus;
    minusBtn.addEventListener('mousedown', (e) => {
      e.preventDefault();
      this.editor.commands.decreaseFontSize();
      sizeDisplay.textContent = String(this.editor.commands.getFontSize());
    });

    const sizeDisplay = document.createElement('span');
    sizeDisplay.classList.add('vellora-bubble-stepper-value');
    sizeDisplay.textContent = '14';

    const plusBtn = document.createElement('button');
    plusBtn.type = 'button';
    plusBtn.classList.add('vellora-bubble-btn', 'vellora-bubble-btn--stepper');
    plusBtn.innerHTML = icons.plus;
    plusBtn.addEventListener('mousedown', (e) => {
      e.preventDefault();
      this.editor.commands.increaseFontSize();
      sizeDisplay.textContent = String(this.editor.commands.getFontSize());
    });

    sizeWrap.appendChild(minusBtn);
    sizeWrap.appendChild(sizeDisplay);
    sizeWrap.appendChild(plusBtn);
    this.element.appendChild(sizeWrap);
    this.element.appendChild(divider());

    // 3. Formatting buttons: B, I, U, S, Code
    this.element.appendChild(btn('bold', 'Bold (Ctrl+B)', () => this.editor.commands.bold(), 'bold'));
    this.element.appendChild(btn('italic', 'Italic (Ctrl+I)', () => this.editor.commands.italic(), 'italic'));
    this.element.appendChild(btn('underline', 'Underline (Ctrl+U)', () => this.editor.commands.underline(), 'underline'));
    this.element.appendChild(btn('strikethrough', 'Strikethrough', () => this.editor.commands.strikethrough(), 'strikethrough'));
    this.element.appendChild(btn('code', 'Inline Code', () => this.editor.commands.code(), 'code'));
    this.element.appendChild(divider());

    // 4. Link button
    const linkBtn = btn('link', 'Add Link (Ctrl+K)', () => {
      this.linkPopover.show(linkBtn.getBoundingClientRect());
    });
    this.element.appendChild(linkBtn);

    // 5. Color picker button
    const colorBtn = document.createElement('button');
    colorBtn.type = 'button';
    colorBtn.classList.add('vellora-bubble-btn');
    colorBtn.setAttribute('title', 'Text & Highlight Color');
    colorBtn.innerHTML = `${icons.textColor}`;
    colorBtn.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this._toggleColorPicker();
    });
    this.element.appendChild(colorBtn);
  }

  private _toggleColorPicker(): void {
    if (this.colorPickerEl) {
      this.colorPickerEl.remove();
      this.colorPickerEl = null;
      return;
    }

    const picker = new ColorPickerPopover(
      this.editor,
      undefined,
      () => {
        this.colorPickerEl?.remove();
        this.colorPickerEl = null;
      }
    );

    this.colorPickerEl = picker.element;
    this.colorPickerEl.style.position = 'absolute';
    this.colorPickerEl.style.top = 'calc(100% + 8px)';
    this.colorPickerEl.style.left = '50%';
    this.colorPickerEl.style.transform = 'translateX(-50%)';
    this.colorPickerEl.style.zIndex = '110';
    this.element.appendChild(this.colorPickerEl);
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
        b.classList.add('vellora-bubble-btn--active');
      } else {
        b.classList.remove('vellora-bubble-btn--active');
      }
    });
  }

  show(): void {
    if (!this.isVisible) {
      this.element.classList.add('vellora-bubble-menu--visible');
      this.isVisible = true;
    }
  }

  hide(): void {
    if (this.isVisible) {
      this.element.classList.remove('vellora-bubble-menu--visible');
      if (this.colorPickerEl) {
        this.colorPickerEl.remove();
        this.colorPickerEl = null;
      }
      this.isVisible = false;
    }
  }
}
