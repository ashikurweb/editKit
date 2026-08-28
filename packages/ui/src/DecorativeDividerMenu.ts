// ============================================================
// EditKit — Decorative Divider Floating Toolbar
// Exact match for Screenshot 3: Amber dashed focus outline,
// Quick symbol switcher ([✦] [✻] [◆] [•] [§]), Duplicate [⧉], Delete [🗑].
// ============================================================

import type { EditKitEditor } from '@editkit/core';
import { icons } from './icons';

export class DecorativeDividerMenu {
  readonly element: HTMLElement;
  private editor: EditKitEditor;
  private activeDivider: HTMLElement | null = null;
  private _unsubscribers: (() => void)[] = [];
  private _isDestroyed: boolean = false;

  constructor(editor: EditKitEditor) {
    this.editor = editor;

    this.element = document.createElement('div');
    this.element.classList.add('editkit-dec-div-floating-menu');

    this._buildToolbar();
    this._setupListeners();
  }

  mount(container: HTMLElement): void {
    container.appendChild(this.element);
  }

  selectDivider(div: HTMLElement): void {
    if (this.activeDivider) {
      this.activeDivider.classList.remove('editkit-dec-div--focused');
    }

    this.activeDivider = div;
    this.activeDivider.classList.add('editkit-dec-div--focused');
    this._buildToolbar();
    this.element.classList.add('editkit-dec-div-floating-menu--open');
    this._updatePosition();
  }

  deselect(): void {
    if (this.activeDivider) {
      this.activeDivider.classList.remove('editkit-dec-div--focused');
      this.activeDivider = null;
    }
    this.element.classList.remove('editkit-dec-div-floating-menu--open');
  }

  private _buildToolbar(): void {
    this.element.innerHTML = '';
    if (!this.activeDivider) return;

    const divType = this.activeDivider.getAttribute('data-divider-type') || 'ornament';
    const currentSym = this.activeDivider.getAttribute('data-symbol') || '';
    const currentRule = this.activeDivider.getAttribute('data-rule-style') || '';

    // 1. Contextual Switcher Buttons
    if (divType === 'asterism') {
      const asterismSymbols = [
        { label: '⁂', sym: '⁂', title: 'Asterism' },
        { label: '✻', sym: '✻', title: 'Flower / Stars' },
        { label: '§', sym: '§', title: 'Section mark' },
      ];

      asterismSymbols.forEach(item => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.classList.add('editkit-dec-div-tb-btn');
        btn.textContent = item.label;
        btn.setAttribute('title', item.title);
        if (currentSym === item.sym || (!currentSym && item.sym === '⁂')) {
          btn.classList.add('editkit-dec-div-tb-btn--active');
        }
        btn.addEventListener('mousedown', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this._setSymbol(item.sym);
        });
        this.element.appendChild(btn);
      });
    } else if (divType === 'labeled') {
      const ruleStyles = [
        { id: 'thin', label: '─', title: 'Thin' },
        { id: 'thick', label: '━', title: 'Thick' },
        { id: 'dashed', label: '╌', title: 'Dashed' },
        { id: 'dotted', label: '┄', title: 'Dotted' },
      ];

      ruleStyles.forEach(item => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.classList.add('editkit-dec-div-tb-btn');
        btn.textContent = item.label;
        btn.setAttribute('title', item.title);
        if (currentRule === item.id || (!currentRule && item.id === 'dashed')) {
          btn.classList.add('editkit-dec-div-tb-btn--active');
        }
        btn.addEventListener('mousedown', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this._setRuleStyle(item.id);
        });
        this.element.appendChild(btn);
      });
    } else {
      // ornament
      const ornamentSymbols = ['✦', '✻', '◆', '•', '§'];
      ornamentSymbols.forEach(sym => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.classList.add('editkit-dec-div-tb-btn');
        btn.textContent = sym;
        btn.setAttribute('title', `Set symbol to ${sym}`);
        if (currentSym === sym || (!currentSym && sym === '✦')) {
          btn.classList.add('editkit-dec-div-tb-btn--active');
        }
        btn.addEventListener('mousedown', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this._setSymbol(sym);
        });
        this.element.appendChild(btn);
      });
    }

    // Divider
    const div = document.createElement('div');
    div.classList.add('editkit-dec-div-tb-divider');
    this.element.appendChild(div);

    // 2. Duplicate / Copy button ⧉
    const dupBtn = document.createElement('button');
    dupBtn.type = 'button';
    dupBtn.classList.add('editkit-dec-div-tb-btn');
    dupBtn.setAttribute('title', 'Duplicate divider');
    dupBtn.innerHTML = icons.copy || `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
    dupBtn.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this._duplicateDivider();
    });
    this.element.appendChild(dupBtn);

    // 3. Delete button 🗑
    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.classList.add('editkit-dec-div-tb-btn', 'editkit-dec-div-tb-btn--danger');
    delBtn.setAttribute('title', 'Delete divider');
    delBtn.innerHTML = icons.trash || `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`;
    delBtn.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this._deleteDivider();
    });
    this.element.appendChild(delBtn);
  }

  private _setRuleStyle(style: string): void {
    if (!this.activeDivider) return;
    this.activeDivider.setAttribute('data-rule-style', style);
    const lines = this.activeDivider.querySelectorAll('.editkit-dec-div-line');
    lines.forEach(l => {
      l.className = `editkit-dec-div-line editkit-dec-div-line--${style}`;
    });
    this._buildToolbar();
    this.editor.emit('update', { editor: this.editor });
  }

  private _setupListeners(): void {
    const onContentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const divider = target.closest('.editkit-decorative-divider') as HTMLElement;
      if (divider && this.editor.contentEl.contains(divider)) {
        this.selectDivider(divider);
      } else if (!this.element.contains(target)) {
        this.deselect();
      }
    };

    const onKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this.deselect();
      } else if ((e.key === 'Backspace' || e.key === 'Delete') && this.activeDivider && !this.editor.isFocused) {
        this._deleteDivider();
      }
    };

    const onScroll = () => this._updatePosition();
    this.editor.contentEl.addEventListener('scroll', onScroll, { passive: true });
    const onWindowResize = () => this._updatePosition();
    const onWindowScroll = () => this._updatePosition();
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('scroll', onWindowScroll, true);
    document.addEventListener('mousedown', onContentClick);
    document.addEventListener('keydown', onKeydown);

    this._unsubscribers.push(
      () => this.editor.contentEl.removeEventListener('scroll', onScroll),
      () => window.removeEventListener('resize', onWindowResize),
      () => window.removeEventListener('scroll', onWindowScroll, true),
      () => document.removeEventListener('mousedown', onContentClick),
      () => document.removeEventListener('keydown', onKeydown),
    );
  }

  private _updatePosition(): void {
    if (!this.activeDivider || !this.element.classList.contains('editkit-dec-div-floating-menu--open')) return;

    const divRect = this.activeDivider.getBoundingClientRect();
    const rootRect = (this.editor.root as HTMLElement).getBoundingClientRect();

    const top = divRect.top - rootRect.top - 42;
    const left = divRect.left - rootRect.left + 24;

    this.element.style.top = `${Math.max(8, top)}px`;
    this.element.style.left = `${Math.max(8, left)}px`;
  }

  private _setSymbol(sym: string): void {
    if (!this.activeDivider) return;

    this.activeDivider.setAttribute('data-symbol', sym);
    const symEl = this.activeDivider.querySelector('.editkit-dec-div-symbol');
    if (symEl) {
      if (this.activeDivider.classList.contains('editkit-dec-div--asterism')) {
        symEl.innerHTML = sym;
      } else {
        symEl.innerHTML = `${sym}&nbsp;&nbsp;&nbsp;${sym}&nbsp;&nbsp;&nbsp;${sym}`;
      }
    }
    this._buildToolbar();
    this.editor.emit('update', { editor: this.editor });
  }

  private _duplicateDivider(): void {
    if (!this.activeDivider) return;

    const clone = this.activeDivider.cloneNode(true) as HTMLElement;
    clone.classList.remove('editkit-dec-div--focused');

    const p = document.createElement('p');
    p.innerHTML = '<br>';

    this.activeDivider.parentNode?.insertBefore(clone, this.activeDivider.nextSibling);
    this.activeDivider.parentNode?.insertBefore(p, clone.nextSibling);

    this.editor.emit('update', { editor: this.editor });
    this.selectDivider(clone);
  }

  private _deleteDivider(): void {
    if (!this.activeDivider) return;

    const toRemove = this.activeDivider;
    this.deselect();
    toRemove.remove();
    this.editor.emit('update', { editor: this.editor });
  }

  destroy(): void {
    if (this._isDestroyed) return;
    this._isDestroyed = true;
    this._unsubscribers.forEach(u => u());
    this._unsubscribers = [];
    this.element.remove();
  }
}
