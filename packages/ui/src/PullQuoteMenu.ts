// ============================================================
// EditKit — Pull Quote Floating Toolbar & Component System
// Exact match for user screenshots: [Full] [Short] [None] | [⧉] [🗑]
// ============================================================

import type { EditKitEditor } from '@editkit/core';
import { icons } from './icons';

export class PullQuoteMenu {
  readonly element: HTMLElement;
  private editor: EditKitEditor;
  private activeQuote: HTMLElement | null = null;
  private _unsubscribers: (() => void)[] = [];

  constructor(editor: EditKitEditor) {
    this.editor = editor;

    this.element = document.createElement('div');
    this.element.classList.add('editkit-pq-floating-menu');

    this._buildToolbar();
    this._setupListeners();
  }

  mount(container: HTMLElement): void {
    container.appendChild(this.element);
  }

  selectQuote(quote: HTMLElement): void {
    if (this.activeQuote) {
      this.activeQuote.classList.remove('editkit-pull-quote--focused');
    }

    this.activeQuote = quote;
    this.activeQuote.classList.add('editkit-pull-quote--focused');
    this._buildToolbar();
    this.element.classList.add('editkit-pq-floating-menu--open');
    this._updatePosition();
  }

  deselect(): void {
    if (this.activeQuote) {
      this.activeQuote.classList.remove('editkit-pull-quote--focused');
      this.activeQuote = null;
    }
    this.element.classList.remove('editkit-pq-floating-menu--open');
  }

  private _buildToolbar(): void {
    this.element.innerHTML = '';
    if (!this.activeQuote) return;

    const currentMode = this.activeQuote.getAttribute('data-rule-mode') || 'full';

    // Helper for buttons
    const createBtn = (textLabel: string, title: string, onClick: () => void, isActive?: boolean, isDanger?: boolean, iconHtml?: string) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.classList.add('editkit-pq-tb-btn');
      if (isActive) b.classList.add('editkit-pq-tb-btn--active');
      if (isDanger) b.classList.add('editkit-pq-tb-btn--danger');
      b.setAttribute('title', title);
      b.innerHTML = iconHtml || textLabel;
      b.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      });
      return b;
    };

    const addDivider = () => {
      const d = document.createElement('div');
      d.classList.add('editkit-pq-tb-divider');
      this.element.appendChild(d);
    };

    // 1. Mode Buttons: [ Full ] [ Short ] [ None ]
    this.element.appendChild(createBtn('Full', 'Full width border lines', () => {
      this._setRuleMode('full');
    }, currentMode === 'full'));

    this.element.appendChild(createBtn('Short', 'Short centered border lines', () => {
      this._setRuleMode('short');
    }, currentMode === 'short'));

    this.element.appendChild(createBtn('None', 'No border lines', () => {
      this._setRuleMode('none');
    }, currentMode === 'none'));

    addDivider();

    // 2. Duplicate ⧉
    this.element.appendChild(createBtn('', 'Duplicate Pull Quote', () => {
      this._duplicateQuote();
    }, false, false, icons.copy || `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`));

    // 3. Delete 🗑
    this.element.appendChild(createBtn('', 'Delete Pull Quote', () => {
      this._deleteQuote();
    }, false, true, icons.trash || `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`));
  }

  private _setRuleMode(mode: 'full' | 'short' | 'none'): void {
    if (!this.activeQuote) return;
    this.activeQuote.setAttribute('data-rule-mode', mode);
    this._buildToolbar();
    this.editor.emit('update', { editor: this.editor });
  }

  private _duplicateQuote(): void {
    if (!this.activeQuote) return;

    const clone = this.activeQuote.cloneNode(true) as HTMLElement;
    clone.classList.remove('editkit-pull-quote--focused');

    this.activeQuote.parentNode?.insertBefore(clone, this.activeQuote.nextSibling);

    this.editor.emit('update', { editor: this.editor });
    this.selectQuote(clone);
  }

  private _deleteQuote(): void {
    if (!this.activeQuote) return;

    const toRemove = this.activeQuote;
    this.deselect();
    toRemove.remove();
    this.editor.emit('update', { editor: this.editor });
  }

  private _setupListeners(): void {
    const onContentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const quote = target.closest('.editkit-pull-quote') as HTMLElement;
      if (quote && this.editor.contentEl.contains(quote)) {
        this.selectQuote(quote);
      } else if (!this.element.contains(target)) {
        this.deselect();
      }
    };

    const onKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this.deselect();
      } else if ((e.key === 'Backspace' || e.key === 'Delete') && this.activeQuote && !this.editor.isFocused) {
        this._deleteQuote();
      }
    };

    const onScroll = () => this._updatePosition();
    this.editor.contentEl.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => this._updatePosition());
    window.addEventListener('scroll', () => this._updatePosition(), true);
    document.addEventListener('mousedown', onContentClick);
    document.addEventListener('keydown', onKeydown);

    this._unsubscribers.push(
      () => this.editor.contentEl.removeEventListener('scroll', onScroll),
      () => window.removeEventListener('resize', () => this._updatePosition()),
      () => window.removeEventListener('scroll', () => this._updatePosition(), true),
      () => document.removeEventListener('mousedown', onContentClick),
      () => document.removeEventListener('keydown', onKeydown),
    );
  }

  private _updatePosition(): void {
    if (!this.activeQuote || !this.element.classList.contains('editkit-pq-floating-menu--open')) return;

    const quoteRect = this.activeQuote.getBoundingClientRect();
    const rootRect = (this.editor.root as HTMLElement).getBoundingClientRect();

    const top = quoteRect.bottom - rootRect.top + 4;
    const left = quoteRect.left - rootRect.left + 4;

    this.element.style.top = `${Math.max(4, top)}px`;
    this.element.style.left = `${Math.max(4, left)}px`;
  }

  destroy(): void {
    this._unsubscribers.forEach(u => u());
    this.element.remove();
  }
}
