// ============================================================
// EditKit — Decorative Divider Modal & Insert System
// Exact match for Screenshots 1, 2, and 3:
// 12 styles across 3 families (Labeled Rule, Ornament, Asterism),
// Live search filter, category accordions, and body floating toolbar.
// ============================================================

import type { EditKitEditor } from '@editkit/core';
import { Modal } from './Modal';

export interface DividerStyleItem {
  id: string;
  name: string;
  category: 'labeled' | 'ornament' | 'asterism';
  symbol?: string;
  ruleStyle?: 'thin' | 'thick' | 'dashed' | 'dotted';
  previewHtml: string;
}

export const DIVIDER_STYLES: DividerStyleItem[] = [
  // ── Labeled Rule (4) ──
  {
    id: 'labeled-thin',
    name: 'Thin',
    category: 'labeled',
    ruleStyle: 'thin',
    previewHtml: '<span class="editkit-dvm-prev-line editkit-dvm-prev-line--thin"></span><span class="editkit-dvm-prev-label">LABEL</span><span class="editkit-dvm-prev-line editkit-dvm-prev-line--thin"></span>',
  },
  {
    id: 'labeled-thick',
    name: 'Thick',
    category: 'labeled',
    ruleStyle: 'thick',
    previewHtml: '<span class="editkit-dvm-prev-line editkit-dvm-prev-line--thick"></span><span class="editkit-dvm-prev-label">LABEL</span><span class="editkit-dvm-prev-line editkit-dvm-prev-line--thick"></span>',
  },
  {
    id: 'labeled-dashed',
    name: 'Dashed',
    category: 'labeled',
    ruleStyle: 'dashed',
    previewHtml: '<span class="editkit-dvm-prev-line editkit-dvm-prev-line--dashed"></span><span class="editkit-dvm-prev-label">LABEL</span><span class="editkit-dvm-prev-line editkit-dvm-prev-line--dashed"></span>',
  },
  {
    id: 'labeled-dotted',
    name: 'Dotted',
    category: 'labeled',
    ruleStyle: 'dotted',
    previewHtml: '<span class="editkit-dvm-prev-line editkit-dvm-prev-line--dotted"></span><span class="editkit-dvm-prev-label">LABEL</span><span class="editkit-dvm-prev-line editkit-dvm-prev-line--dotted"></span>',
  },

  // ── Ornament (5) ──
  {
    id: 'ornament-star',
    name: 'Star',
    category: 'ornament',
    symbol: '✦',
    previewHtml: '<span class="editkit-dvm-prev-sym">✦&nbsp;&nbsp;&nbsp;✦&nbsp;&nbsp;&nbsp;✦</span>',
  },
  {
    id: 'ornament-flower',
    name: 'Flower',
    category: 'ornament',
    symbol: '✻',
    previewHtml: '<span class="editkit-dvm-prev-sym">✻&nbsp;&nbsp;&nbsp;✻&nbsp;&nbsp;&nbsp;✻</span>',
  },
  {
    id: 'ornament-diamond',
    name: 'Diamond',
    category: 'ornament',
    symbol: '◆',
    previewHtml: '<span class="editkit-dvm-prev-sym">◆&nbsp;&nbsp;&nbsp;◆&nbsp;&nbsp;&nbsp;◆</span>',
  },
  {
    id: 'ornament-dot',
    name: 'Dot',
    category: 'ornament',
    symbol: '•',
    previewHtml: '<span class="editkit-dvm-prev-sym">•&nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;•</span>',
  },
  {
    id: 'ornament-section',
    name: 'Section mark',
    category: 'ornament',
    symbol: '§',
    previewHtml: '<span class="editkit-dvm-prev-sym">§&nbsp;&nbsp;&nbsp;§&nbsp;&nbsp;&nbsp;§</span>',
  },

  // ── Asterism (3) ──
  {
    id: 'asterism-tri',
    name: 'Asterism',
    category: 'asterism',
    symbol: '⁂',
    previewHtml: '<span class="editkit-dvm-prev-sym editkit-dvm-prev-sym--tri">⁂</span>',
  },
  {
    id: 'asterism-triple-star',
    name: 'Triple star',
    category: 'asterism',
    symbol: '* * *',
    previewHtml: '<span class="editkit-dvm-prev-sym">*&nbsp;&nbsp;&nbsp;*&nbsp;&nbsp;&nbsp;*</span>',
  },
  {
    id: 'asterism-section',
    name: 'Section mark',
    category: 'asterism',
    symbol: '§',
    previewHtml: '<span class="editkit-dvm-prev-sym">§</span>',
  },
];

export class DecorativeDividerModal extends Modal {
  private searchInputEl!: HTMLInputElement;
  private listContainerEl!: HTMLElement;
  private savedRange: Range | null = null;
  private activeStyleId: string = 'ornament-flower';

  constructor(editor: EditKitEditor) {
    super(editor, {
      className: 'editkit-dec-divider-modal',
      maxWidth: '560px',
    });

    this._buildUI();
  }

  private _buildUI(): void {
    this.bodyEl.innerHTML = '';

    // Header title & sub
    this.titleEl.textContent = 'Insert divider';
    const subTitle = document.createElement('div');
    subTitle.classList.add('editkit-dec-dvm-sub');
    subTitle.textContent = '12 styles · 3 families';

    const headerLeft = document.createElement('div');
    headerLeft.appendChild(this.titleEl);
    headerLeft.appendChild(subTitle);

    this.headerEl.innerHTML = '';
    this.headerEl.appendChild(headerLeft);
    this.headerEl.appendChild(this.closeBtn);

    // Search bar
    const searchWrap = document.createElement('div');
    searchWrap.classList.add('editkit-dec-dvm-search-wrap');
    searchWrap.innerHTML = `
      <svg class="editkit-dec-dvm-search-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <input type="text" class="editkit-dec-dvm-search-input" placeholder="Search dividers..." />
    `;
    this.searchInputEl = searchWrap.querySelector('.editkit-dec-dvm-search-input')!;
    this.searchInputEl.addEventListener('input', () => this._renderList());
    this.bodyEl.appendChild(searchWrap);

    // Scrollable List of Categories & Cards
    this.listContainerEl = document.createElement('div');
    this.listContainerEl.classList.add('editkit-dec-dvm-list');
    this.bodyEl.appendChild(this.listContainerEl);

    this._renderList();
  }

  private _renderList(): void {
    this.listContainerEl.innerHTML = '';
    const query = this.searchInputEl?.value.trim().toLowerCase() || '';

    const categories: Array<{ id: 'labeled' | 'ornament' | 'asterism'; title: string; count: number }> = [
      { id: 'labeled', title: 'LABELED RULE', count: 4 },
      { id: 'ornament', title: 'ORNAMENT', count: 5 },
      { id: 'asterism', title: 'ASTERISM', count: 3 },
    ];

    categories.forEach(cat => {
      const items = DIVIDER_STYLES.filter(s => s.category === cat.id && (!query || s.name.toLowerCase().includes(query) || cat.title.toLowerCase().includes(query)));
      if (items.length === 0) return;

      // Category Header with Arrow
      const catHeader = document.createElement('div');
      catHeader.classList.add('editkit-dec-dvm-cat-header');
      catHeader.innerHTML = `
        <div class="editkit-dec-dvm-cat-left">
          <span class="editkit-dec-dvm-cat-title">${cat.title}</span>
          <span class="editkit-dec-dvm-cat-count">${items.length}</span>
        </div>
        <svg class="editkit-dec-dvm-cat-arrow" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
      `;

      // Cards Grid
      const grid = document.createElement('div');
      grid.classList.add('editkit-dec-dvm-grid');

      items.forEach(item => {
        const card = document.createElement('button');
        card.type = 'button';
        card.classList.add('editkit-dec-dvm-card');
        if (item.id === this.activeStyleId) {
          card.classList.add('editkit-dec-dvm-card--active');
        }

        card.innerHTML = `
          <div class="editkit-dec-dvm-card-preview">${item.previewHtml}</div>
          <div class="editkit-dec-dvm-card-name">${item.name}</div>
        `;

        card.addEventListener('click', () => {
          this.activeStyleId = item.id;
          this._insertStyle(item);
        });

        grid.appendChild(card);
      });

      this.listContainerEl.appendChild(catHeader);
      this.listContainerEl.appendChild(grid);
    });
  }

  private _insertStyle(item: DividerStyleItem): void {
    if (this.savedRange) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(this.savedRange);
      }
    }

    let dividerHtml = '';
    if (item.category === 'labeled') {
      dividerHtml = `
        <div class="editkit-decorative-divider editkit-dec-div--labeled" data-divider-type="labeled" data-rule-style="${item.ruleStyle || 'dashed'}" contenteditable="false" data-editkit-runtime-attrs>
          <span class="editkit-dec-div-line editkit-dec-div-line--${item.ruleStyle || 'dashed'}"></span>
          <span class="editkit-dec-div-label" contenteditable="true" spellcheck="false" data-editkit-runtime-attrs>LABEL</span>
          <span class="editkit-dec-div-line editkit-dec-div-line--${item.ruleStyle || 'dashed'}"></span>
        </div>
      `;
    } else if (item.category === 'ornament') {
      const sym = item.symbol || '✦';
      dividerHtml = `
        <div class="editkit-decorative-divider editkit-dec-div--ornament" data-divider-type="ornament" data-symbol="${sym}" contenteditable="false" data-editkit-runtime-attrs>
          <span class="editkit-dec-div-symbol">${sym}&nbsp;&nbsp;&nbsp;${sym}&nbsp;&nbsp;&nbsp;${sym}</span>
        </div>
      `;
    } else {
      // asterism
      const sym = item.symbol || '⁂';
      dividerHtml = `
        <div class="editkit-decorative-divider editkit-dec-div--asterism" data-divider-type="asterism" data-symbol="${sym}" contenteditable="false" data-editkit-runtime-attrs>
          <span class="editkit-dec-div-symbol">${sym}</span>
        </div>
      `;
    }

    const wrapper = document.createElement('div');
    wrapper.innerHTML = dividerHtml + '<p><br></p>';

    const block = this.editor.commands.getActiveBlock?.() || null;
    const contentEl = this.editor.contentEl;

    const frag = document.createDocumentFragment();
    while (wrapper.firstChild) {
      frag.appendChild(wrapper.firstChild);
    }

    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && contentEl.contains(sel.anchorNode)) {
      const range = sel.getRangeAt(0);
      range.collapse(false);
      range.insertNode(frag);
    } else if (block && block !== contentEl && block.parentNode) {
      block.parentNode.insertBefore(frag, block.nextSibling);
    } else {
      contentEl.appendChild(frag);
    }

    this.editor.emit('update', { editor: this.editor });
    this.hide();
  }

  override show(): void {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && this.editor.contentEl.contains(sel.anchorNode)) {
      this.savedRange = sel.getRangeAt(0).cloneRange();
    } else {
      this.savedRange = null;
    }

    super.show();
    if (this.searchInputEl) {
      this.searchInputEl.value = '';
      this._renderList();
      setTimeout(() => this.searchInputEl.focus(), 50);
    }
  }
}
