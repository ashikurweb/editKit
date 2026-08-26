// ============================================================
// EditKit — Table Alignment Modal (Image 5 exact match)
// Extends global Modal component with Horizontal & Vertical Alignment Cards
// ============================================================

import type { EditKitEditor, TableHorizontalAlign, TableVerticalAlign } from '@editkit/core';
import { Modal } from './Modal';
import { icons } from './icons';

export class TableAlignmentModal extends Modal {
  private currentHAlign: TableHorizontalAlign = 'left';
  private currentVAlign: TableVerticalAlign = 'top';
  private targetTable: HTMLTableElement | null = null;
  private targetCell: HTMLTableCellElement | null = null;
  private mode: 'table' | 'cell' = 'table';

  private hCards: Map<TableHorizontalAlign, HTMLButtonElement> = new Map();
  private vCards: Map<TableVerticalAlign, HTMLButtonElement> = new Map();

  constructor(editor: EditKitEditor) {
    super(editor, {
      title: 'Table Alignment',
      className: 'editkit-table-modal editkit-table-align-modal',
      maxWidth: '460px',
    });

    this._buildUI();
  }

  show(targetTable?: HTMLTableElement, targetCell?: HTMLTableCellElement, mode: 'table' | 'cell' = 'table'): void {
    if (targetTable) this.targetTable = targetTable;
    if (targetCell) this.targetCell = targetCell;
    this.mode = mode;

    if (this.titleEl) {
      this.titleEl.textContent = mode === 'cell' ? 'Cell Alignment' : 'Table Alignment';
    }

    const info = this.editor.getActiveTableCell?.();
    const table = this.targetTable || info?.table;
    const cell = this.targetCell || info?.cell;

    if (table) {
      this.targetTable = table;
      const storedAlign = table.getAttribute('data-align') as TableHorizontalAlign;
      if (storedAlign) this.currentHAlign = storedAlign;
    }
    if (cell) {
      this.targetCell = cell;
      if (mode === 'cell' && cell.style.textAlign) {
        this.currentHAlign = cell.style.textAlign as TableHorizontalAlign;
      }
      const cellVAlign = cell.style.verticalAlign as TableVerticalAlign;
      if (cellVAlign) this.currentVAlign = cellVAlign;
    }
    this._updateCards();
    super.show();
  }

  private _buildUI(): void {
    this.bodyEl.innerHTML = '';

    // ── 1. Horizontal Alignment Section ──
    const hSection = document.createElement('div');
    hSection.className = 'editkit-tm-section';

    const hTitle = document.createElement('div');
    hTitle.className = 'editkit-tm-section-title';
    hTitle.textContent = 'Horizontal Alignment';
    hSection.appendChild(hTitle);

    const hGrid = document.createElement('div');
    hGrid.className = 'editkit-tm-align-grid';

    const hOptions: { id: TableHorizontalAlign; label: string; icon: string }[] = [
      { id: 'left', label: 'Left', icon: icons.alignLeft },
      { id: 'center', label: 'Center', icon: icons.alignCenter },
      { id: 'right', label: 'Right', icon: icons.alignRight },
    ];

    hOptions.forEach(opt => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'editkit-tm-align-card';
      if (opt.id === this.currentHAlign) card.classList.add('editkit-tm-align-card--active');

      card.innerHTML = `
        <span class="editkit-tm-align-icon">${opt.icon}</span>
        <span class="editkit-tm-align-label">${opt.label}</span>
      `;

      card.addEventListener('click', (e) => {
        e.preventDefault();
        this.currentHAlign = opt.id;
        this._updateCards();
        if (this.mode === 'table') {
          this.editor.commands.setTableAlignment(opt.id, this.targetTable || undefined);
        } else {
          this.editor.commands.setCellAlignment(opt.id, undefined, this.targetCell || undefined, this.targetTable || undefined);
        }
      });

      this.hCards.set(opt.id, card);
      hGrid.appendChild(card);
    });

    hSection.appendChild(hGrid);
    this.bodyEl.appendChild(hSection);

    // ── 2. Vertical Alignment Section ──
    const vSection = document.createElement('div');
    vSection.className = 'editkit-tm-section';

    const vTitle = document.createElement('div');
    vTitle.className = 'editkit-tm-section-title';
    vTitle.textContent = 'Vertical Alignment';
    vSection.appendChild(vTitle);

    const vGrid = document.createElement('div');
    vGrid.className = 'editkit-tm-align-grid';

    const vOptions: { id: TableVerticalAlign; label: string; icon: string }[] = [
      { id: 'top', label: 'Top', icon: icons.alignTop || '↑' },
      { id: 'middle', label: 'Middle', icon: icons.alignMiddle || '↕' },
      { id: 'bottom', label: 'Bottom', icon: icons.alignBottom || '↓' },
    ];

    vOptions.forEach(opt => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'editkit-tm-align-card';
      if (opt.id === this.currentVAlign) card.classList.add('editkit-tm-align-card--active');

      card.innerHTML = `
        <span class="editkit-tm-align-icon">${opt.icon}</span>
        <span class="editkit-tm-align-label">${opt.label}</span>
      `;

      card.addEventListener('click', (e) => {
        e.preventDefault();
        this.currentVAlign = opt.id;
        this._updateCards();
        this.editor.commands.setCellAlignment(undefined, opt.id, this.targetCell || undefined, this.targetTable || undefined);
      });

      this.vCards.set(opt.id, card);
      vGrid.appendChild(card);
    });

    vSection.appendChild(vGrid);
    this.bodyEl.appendChild(vSection);
  }

  private _updateCards(): void {
    this.hCards.forEach((card, id) => {
      if (id === this.currentHAlign) {
        card.classList.add('editkit-tm-align-card--active');
      } else {
        card.classList.remove('editkit-tm-align-card--active');
      }
    });

    this.vCards.forEach((card, id) => {
      if (id === this.currentVAlign) {
        card.classList.add('editkit-tm-align-card--active');
      } else {
        card.classList.remove('editkit-tm-align-card--active');
      }
    });
  }
}
