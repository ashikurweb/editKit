// ============================================================
// EditKit — Interactive Table Manager & Floating Overlay
// Includes:
// 1. Column & Row hover bullets (morphing to + icons)
// 2. Centered "+ Above" and "+ Below" insert buttons
// 3. Top-left corner drag grip (:::)
// 4. Header dropdown caret (v) & Full contextual dropdown menu (Image 2)
// 5. Interactive column width resizing on <th> (drag left/right to resize)
// 6. Modals for Cell Color (Image 3), Table Border (Image 4), Table Alignment (Image 5)
// ============================================================

import type { EditKitEditor, TableCellInfo } from '@editkit/core';
import { icons } from './icons';
import { TableCellColorModal } from './TableCellColorModal';
import { TableBorderModal } from './TableBorderModal';
import { TableAlignmentModal } from './TableAlignmentModal';
import { TableStripingModal } from './TableStripingModal';

export class TableFloatingMenu {
  readonly element: HTMLElement;
  private editor: EditKitEditor;

  // Active state
  private activeTable: HTMLTableElement | null = null;
  private activeCell: HTMLTableCellElement | null = null;
  private isVisible: boolean = false;
  private hideTimeout: any = null;

  // UI Elements
  private topControlsWrap: HTMLElement;
  private leftControlsWrap: HTMLElement;
  private bottomControlsWrap: HTMLElement;
  private cornerGrip: HTMLElement;
  private headerCaretBtn: HTMLButtonElement;
  private tableCornerResizer: HTMLElement;
  private dropdownMenuEl: HTMLElement | null = null;
  private dropdownTriggerEl: HTMLElement | null = null;
  private resizeGuideLine: HTMLElement;
  private resizeGuideLineH: HTMLElement;

  // Modals
  private cellColorModal: TableCellColorModal;
  private tableBorderModal: TableBorderModal;
  private tableAlignModal: TableAlignmentModal;
  private tableStripingModal: TableStripingModal;

  // Resizer States
  private isResizing: boolean = false;
  private isRowResizing: boolean = false;
  private isCornerResizing: boolean = false;
  private resizingColIndex: number = -1;
  private resizingRowIndex: number = -1;
  private startX: number = 0;
  private startY: number = 0;
  private startWidth: number = 0;
  private startHeight: number = 0;
  private resizeTargetCell: HTMLElement | null = null;

  private _unsubscribers: (() => void)[] = [];

  constructor(editor: EditKitEditor) {
    this.editor = editor;

    // Modals
    this.cellColorModal = new TableCellColorModal(editor);
    this.tableBorderModal = new TableBorderModal(editor);
    this.tableAlignModal = new TableAlignmentModal(editor);
    this.tableStripingModal = new TableStripingModal(editor);

    // Root overlay container
    this.element = document.createElement('div');
    this.element.classList.add('editkit-table-overlay');

    // 1. Top Controls (Pill + Above & Column bullets)
    this.topControlsWrap = document.createElement('div');
    this.topControlsWrap.classList.add('editkit-table-top-controls');
    this.element.appendChild(this.topControlsWrap);

    // 2. Left Controls (Row bullets)
    this.leftControlsWrap = document.createElement('div');
    this.leftControlsWrap.classList.add('editkit-table-left-controls');
    this.element.appendChild(this.leftControlsWrap);

    // 3. Bottom Controls (Pill + Below)
    this.bottomControlsWrap = document.createElement('div');
    this.bottomControlsWrap.classList.add('editkit-table-bottom-controls');
    this.element.appendChild(this.bottomControlsWrap);

    // 4. Corner Grip handle
    this.cornerGrip = document.createElement('div');
    this.cornerGrip.classList.add('editkit-table-corner-grip');
    this.cornerGrip.setAttribute('title', 'Table options');
    this.cornerGrip.innerHTML = icons.grip || `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="8" cy="6" r="1.5"/><circle cx="16" cy="6" r="1.5"/>
        <circle cx="8" cy="12" r="1.5"/><circle cx="16" cy="12" r="1.5"/>
        <circle cx="8" cy="18" r="1.5"/><circle cx="16" cy="18" r="1.5"/>
      </svg>
    `;
    this.cornerGrip.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this._toggleDropdown(this.cornerGrip);
    });
    this.element.appendChild(this.cornerGrip);

    // 5. Header Caret Dropdown Button (v)
    this.headerCaretBtn = document.createElement('button');
    this.headerCaretBtn.type = 'button';
    this.headerCaretBtn.classList.add('editkit-table-header-caret');
    this.headerCaretBtn.setAttribute('title', 'Table options');
    this.headerCaretBtn.innerHTML = icons.chevronDown || `
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <polyline points="6 9 12 15 18 9"/>
      </svg>
    `;
    this.headerCaretBtn.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this._toggleDropdown(this.headerCaretBtn);
    });
    this.element.appendChild(this.headerCaretBtn);

    // 6. Bottom-Right Corner Resizer (Square Shape Resizing)
    this.tableCornerResizer = document.createElement('div');
    this.tableCornerResizer.classList.add('editkit-table-corner-resizer');
    this.tableCornerResizer.setAttribute('title', 'Resize table shape');
    this.tableCornerResizer.innerHTML = `
      <svg width="8" height="8" viewBox="0 0 10 10" fill="currentColor">
        <path d="M8 0v8H0v2h10V0H8z"/>
      </svg>
    `;
    this.tableCornerResizer.addEventListener('mousedown', (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      this._startTableCornerResize(e);
    });
    this.element.appendChild(this.tableCornerResizer);

    // 7. Vertical & Horizontal Resize guide lines
    this.resizeGuideLine = document.createElement('div');
    this.resizeGuideLine.classList.add('editkit-table-resize-guide');
    this.element.appendChild(this.resizeGuideLine);

    this.resizeGuideLineH = document.createElement('div');
    this.resizeGuideLineH.classList.add('editkit-table-resize-guide--h');
    this.element.appendChild(this.resizeGuideLineH);

    this._setupEventListeners();
  }

  mount(container: HTMLElement): void {
    container.appendChild(this.element);
  }

  destroy(): void {
    this._unsubscribers.forEach(fn => fn());
    this.cellColorModal.destroy();
    this.tableBorderModal.destroy();
    this.tableAlignModal.destroy();
    this.tableStripingModal.destroy();
    if (this.dropdownMenuEl) {
      this.dropdownMenuEl.remove();
    }
    this.element.remove();
  }

  private _setupEventListeners(): void {
    // 1. Table selection events from editor
    const unsub = this.editor.on('tableSelect', ({ cellInfo }) => {
      if (cellInfo) {
        this.activeTable = cellInfo.table;
        this.activeCell = cellInfo.cell;
        this._updateOverlay();
      } else if (!this._isMouseOverTableOrMenu()) {
        this._scheduleHide();
      }
    });
    this._unsubscribers.push(unsub);

    // 2. Mousemove / Mouseover on editor content to detect tables
    const onContentMouseMove = (e: MouseEvent) => {
      if (this.isResizing) return;
      const target = e.target as HTMLElement;
      const table = target?.closest('table') as HTMLTableElement | null;
      if (table && this.editor.contentEl.contains(table)) {
        if (this.hideTimeout) {
          clearTimeout(this.hideTimeout);
          this.hideTimeout = null;
        }
        if (this.activeTable !== table || !this.isVisible) {
          this.activeTable = table;
          const cell = target.closest('td, th') as HTMLTableCellElement | null;
          if (cell) this.activeCell = cell;
          this._updateOverlay();
        }
      } else if (!this._isMouseOverTableOrMenu() && !this.isResizing && !this.dropdownMenuEl) {
        this._scheduleHide();
      }
    };

    this.editor.contentEl.addEventListener('mousemove', onContentMouseMove);
    this.element.addEventListener('mouseenter', () => {
      if (this.hideTimeout) {
        clearTimeout(this.hideTimeout);
        this.hideTimeout = null;
      }
    });
    this.element.addEventListener('mouseleave', () => {
      if (!this.dropdownMenuEl && !this.isResizing) {
        this._scheduleHide();
      }
    });

    // 3. Global click listener to close dropdown menu
    const onDocClick = (e: MouseEvent) => {
      if (this.dropdownMenuEl && !this.dropdownMenuEl.contains(e.target as Node) && !this.headerCaretBtn.contains(e.target as Node) && !this.cornerGrip.contains(e.target as Node)) {
        this._closeDropdown();
      }
    };
    document.addEventListener('mousedown', onDocClick);

    // 4. Scroll & wheel event handling
    const onScroll = () => {
      if (this.activeTable && this.isVisible) {
        this._updatePositionsOnly();
      }
    };
    this.editor.contentEl.addEventListener('scroll', onScroll, { passive: true });

    const onWheel = (e: WheelEvent) => {
      this.editor.contentEl.scrollTop += e.deltaY;
      this.editor.contentEl.scrollLeft += e.deltaX;
      if (this.activeTable && this.isVisible) {
        this._updatePositionsOnly();
      }
    };
    this.element.addEventListener('wheel', onWheel, { passive: true });

    window.addEventListener('resize', onScroll);
    window.addEventListener('scroll', onScroll, true);

    this._unsubscribers.push(() => {
      this.editor.contentEl.removeEventListener('mousemove', onContentMouseMove);
      this.editor.contentEl.removeEventListener('scroll', onScroll);
      this.element.removeEventListener('wheel', onWheel);
      document.removeEventListener('mousedown', onDocClick);
      window.removeEventListener('resize', onScroll);
      window.removeEventListener('scroll', onScroll, true);
    });
  }

  private _isMouseOverTableOrMenu(): boolean {
    if (this.dropdownMenuEl) return true;
    return false;
  }

  private _scheduleHide(): void {
    if (this.hideTimeout) clearTimeout(this.hideTimeout);
    this.hideTimeout = setTimeout(() => {
      const activeCell = this.editor.getActiveTableCell?.();
      if (!activeCell && !this.isResizing && !this.dropdownMenuEl) {
        this.hide();
      }
    }, 200);
  }

  show(): void {
    if (!this.isVisible) {
      this.element.classList.add('editkit-table-overlay--visible');
      this.isVisible = true;
    }
  }

  hide(): void {
    if (this.isVisible) {
      this.element.classList.remove('editkit-table-overlay--visible');
      this._closeDropdown();
      this.isVisible = false;
      this.activeTable = null;
      this.activeCell = null;
    }
  }

  // ── Overlay Position & Handle Generation ──
  private _updateOverlay(): void {
    if (!this.activeTable || !this.activeTable.isConnected) {
      this.hide();
      return;
    }

    this.show();
    this._renderControls();
    this._updatePositionsOnly();
  }

  private _renderControls(): void {
    if (!this.activeTable) return;

    const table = this.activeTable;
    const editorRect = this.editor.root.getBoundingClientRect();
    const tableRect = table.getBoundingClientRect();

    // ── 1. Top Controls (+ Above Button & Column Bullets) ──
    this.topControlsWrap.innerHTML = '';

    // "+ Above" button
    const addAboveBtn = document.createElement('button');
    addAboveBtn.type = 'button';
    addAboveBtn.className = 'editkit-table-pill-btn editkit-table-pill-btn--top';
    addAboveBtn.innerHTML = `<span>+ Above</span>`;
    addAboveBtn.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this._addRowAt(0, 'above');
    });
    this.topControlsWrap.appendChild(addAboveBtn);

    // Column Bullets (One for each column)
    const firstRow = table.rows[0];
    if (firstRow) {
      const totalCols = firstRow.cells.length;
      for (let c = 0; c < totalCols; c++) {
        const cell = firstRow.cells[c];
        const bullet = document.createElement('button');
        bullet.type = 'button';
        bullet.className = 'editkit-table-col-bullet';
        bullet.setAttribute('data-col-index', String(c));
        bullet.setAttribute('title', 'Add column');
        bullet.innerHTML = `
          <span class="editkit-bullet-dot"></span>
          <span class="editkit-bullet-plus">+</span>
        `;

        bullet.addEventListener('mousedown', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this._addColumnAt(c);
        });

        this.topControlsWrap.appendChild(bullet);
      }
    }

    // ── 2. Left Controls (Row Bullets) ──
    this.leftControlsWrap.innerHTML = '';
    const totalRows = table.rows.length;
    for (let r = 0; r < totalRows; r++) {
      const row = table.rows[r];
      const bullet = document.createElement('button');
      bullet.type = 'button';
      bullet.className = 'editkit-table-row-bullet';
      bullet.setAttribute('data-row-index', String(r));
      bullet.setAttribute('title', 'Add row');
      bullet.innerHTML = `
        <span class="editkit-bullet-dot"></span>
        <span class="editkit-bullet-plus">+</span>
      `;

      bullet.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this._addRowAt(r, 'below');
      });

      this.leftControlsWrap.appendChild(bullet);
    }

    // ── 3. Bottom Controls (+ Below Button) ──
    this.bottomControlsWrap.innerHTML = '';
    const addBelowBtn = document.createElement('button');
    addBelowBtn.type = 'button';
    addBelowBtn.className = 'editkit-table-pill-btn editkit-table-pill-btn--bottom';
    addBelowBtn.innerHTML = `<span>+ Below</span>`;
    addBelowBtn.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this._addRowAt(totalRows - 1, 'below');
    });
    this.bottomControlsWrap.appendChild(addBelowBtn);

    // ── 4. Attach Column & Row Resizers ──
    this._attachColumnResizers();
    this._attachRowResizers();
  }

  private _updatePositionsOnly(): void {
    if (!this.activeTable || !this.activeTable.isConnected) {
      this.hide();
      return;
    }
    const table = this.activeTable;
    const editorRect = this.editor.root.getBoundingClientRect();
    const tableRect = table.getBoundingClientRect();
    const contentRect = this.editor.contentEl.getBoundingClientRect();

    // 1. Check if the table is completely outside the visible content area
    if (
      tableRect.bottom <= contentRect.top + 2 ||
      tableRect.top >= contentRect.bottom - 2 ||
      tableRect.right <= contentRect.left + 2 ||
      tableRect.left >= contentRect.right - 2
    ) {
      this.topControlsWrap.style.display = 'none';
      this.leftControlsWrap.style.display = 'none';
      this.bottomControlsWrap.style.display = 'none';
      this.cornerGrip.style.display = 'none';
      this.headerCaretBtn.style.display = 'none';
      this.tableCornerResizer.style.display = 'none';
      this._closeDropdown();
      return;
    }

    const tableTop = tableRect.top - editorRect.top;
    const tableLeft = tableRect.left - editorRect.left;
    const tableWidth = tableRect.width;
    const tableHeight = tableRect.height;

    // 2. Corner Grip (::: handle)
    // Check if the top-left corner is scrolled out of view or would overlap toolbar
    const cornerTop = tableRect.top - 20;
    const cornerLeft = tableRect.left - 20;
    if (cornerTop < contentRect.top || cornerTop > contentRect.bottom || cornerLeft < contentRect.left - 10) {
      this.cornerGrip.style.display = 'none';
    } else {
      this.cornerGrip.style.display = 'flex';
      this.cornerGrip.style.top = `${tableTop - 20}px`;
      this.cornerGrip.style.left = `${tableLeft - 20}px`;
    }

    // 3. Top Controls (+ Above button & Column Bullets)
    // Top controls need at least 32px above the table top inside contentRect to not overlap toolbar
    const topControlsTop = tableRect.top - 32;
    if (topControlsTop < contentRect.top || tableRect.top > contentRect.bottom) {
      this.topControlsWrap.style.display = 'none';
    } else {
      this.topControlsWrap.style.display = 'block';
      this.topControlsWrap.style.top = `${tableTop - 18}px`;
      this.topControlsWrap.style.left = `${tableLeft}px`;
      this.topControlsWrap.style.width = `${tableWidth}px`;

      // Position "+ Above" centered
      const addAboveBtn = this.topControlsWrap.querySelector('.editkit-table-pill-btn--top') as HTMLElement;
      if (addAboveBtn) {
        addAboveBtn.style.left = `${tableWidth / 2}px`;
        addAboveBtn.style.top = '-14px';
      }

      // Position Column Bullets at center of each column
      const firstRow = table.rows[0];
      if (firstRow) {
        const colBullets = this.topControlsWrap.querySelectorAll('.editkit-table-col-bullet');
        for (let c = 0; c < firstRow.cells.length; c++) {
          const cell = firstRow.cells[c];
          const cellRect = cell.getBoundingClientRect();
          const bullet = colBullets[c] as HTMLElement;
          if (bullet) {
            // Check if column is within horizontal visible bounds
            if (cellRect.right < contentRect.left || cellRect.left > contentRect.right) {
              bullet.style.display = 'none';
            } else {
              bullet.style.display = 'inline-flex';
              const colCenter = (cellRect.left - tableRect.left) + cellRect.width / 2;
              bullet.style.left = `${colCenter}px`;
            }
          }
        }
      }
    }

    // 4. Left Controls (Row Bullets)
    if (tableRect.left - 20 < contentRect.left - 10 || tableRect.left > contentRect.right) {
      this.leftControlsWrap.style.display = 'none';
    } else {
      this.leftControlsWrap.style.display = 'block';
      this.leftControlsWrap.style.top = `${tableTop}px`;
      this.leftControlsWrap.style.left = `${tableLeft - 18}px`;
      this.leftControlsWrap.style.height = `${tableHeight}px`;

      // Position Row Bullets at center of each visible row
      const rowBullets = this.leftControlsWrap.querySelectorAll('.editkit-table-row-bullet');
      for (let r = 0; r < table.rows.length; r++) {
        const row = table.rows[r];
        const rowRect = row.getBoundingClientRect();
        const bullet = rowBullets[r] as HTMLElement;
        if (bullet) {
          // If this row is scrolled out above contentRect or below contentRect, hide bullet
          if (rowRect.bottom < contentRect.top + 8 || rowRect.top > contentRect.bottom - 8) {
            bullet.style.display = 'none';
          } else {
            bullet.style.display = 'inline-flex';
            const rowCenter = (rowRect.top - tableRect.top) + rowRect.height / 2;
            bullet.style.top = `${rowCenter}px`;
          }
        }
      }
    }

    // 5. Bottom Controls (+ Below Button)
    // Needs 30px below table bottom inside contentRect
    if (tableRect.bottom + 30 > contentRect.bottom || tableRect.bottom < contentRect.top) {
      this.bottomControlsWrap.style.display = 'none';
    } else {
      this.bottomControlsWrap.style.display = 'block';
      this.bottomControlsWrap.style.top = `${tableTop + tableHeight + 10}px`;
      this.bottomControlsWrap.style.left = `${tableLeft}px`;
      this.bottomControlsWrap.style.width = `${tableWidth}px`;

      const addBelowBtn = this.bottomControlsWrap.querySelector('.editkit-table-pill-btn--bottom') as HTMLElement;
      if (addBelowBtn) {
        addBelowBtn.style.left = `${tableWidth / 2}px`;
      }
    }

    // 6. Bottom-Right Corner Resizer
    if (
      tableRect.bottom > contentRect.bottom ||
      tableRect.bottom < contentRect.top ||
      tableRect.right > contentRect.right ||
      tableRect.right < contentRect.left
    ) {
      this.tableCornerResizer.style.display = 'none';
    } else {
      this.tableCornerResizer.style.display = 'block';
      this.tableCornerResizer.style.top = `${tableTop + tableHeight - 7}px`;
      this.tableCornerResizer.style.left = `${tableLeft + tableWidth - 7}px`;
    }

    // 7. Header Caret Button (v) inside the active header cell
    const firstRow = table.rows[0];
    const activeCol = this.activeCell ? this.activeCell.cellIndex : (firstRow ? firstRow.cells.length - 1 : 0);
    const targetHeader = (firstRow && firstRow.cells[activeCol]) || firstRow?.cells[0];
    if (targetHeader) {
      const headerCellRect = targetHeader.getBoundingClientRect();
      if (
        headerCellRect.bottom <= contentRect.top + 10 ||
        headerCellRect.top >= contentRect.bottom - 10 ||
        headerCellRect.right <= contentRect.left ||
        headerCellRect.left >= contentRect.right
      ) {
        this.headerCaretBtn.style.display = 'none';
      } else {
        this.headerCaretBtn.style.display = 'flex';
        this.headerCaretBtn.style.top = `${headerCellRect.top - editorRect.top + 6}px`;
        this.headerCaretBtn.style.left = `${headerCellRect.right - editorRect.left - 26}px`;
      }
    } else {
      this.headerCaretBtn.style.display = 'none';
    }

    // 8. Update Dropdown position if open
    if (this.dropdownMenuEl && this.dropdownTriggerEl) {
      const triggerRect = this.dropdownTriggerEl.getBoundingClientRect();
      if (triggerRect.bottom <= contentRect.top || triggerRect.top >= contentRect.bottom) {
        this._closeDropdown();
      } else {
        this.dropdownMenuEl.style.top = `${triggerRect.bottom - editorRect.top + 4}px`;
        this.dropdownMenuEl.style.left = `${triggerRect.left - editorRect.left}px`;
      }
    }
  }

  // ── Column Width Resizing on <th> & <td> Columns ──
  private _attachColumnResizers(): void {
    if (!this.activeTable) return;
    const table = this.activeTable;

    for (let r = 0; r < table.rows.length; r++) {
      const row = table.rows[r];
      const isHeader = r === 0;

      // Remove existing col resizers in this row
      row.querySelectorAll('.editkit-table-col-resizer').forEach(el => el.remove());

      for (let c = 0; c < row.cells.length; c++) {
        const cell = row.cells[c] as HTMLElement;

        // Left edge divider for the very first column
        if (c === 0 && isHeader) {
          const leftResizer = document.createElement('div');
          leftResizer.className = 'editkit-table-col-resizer editkit-table-col-resizer--left';
          leftResizer.setAttribute('contenteditable', 'false');
          leftResizer.innerHTML = `
            <span class="editkit-table-col-resizer-bar"></span>
            <span class="editkit-table-col-resizer-bar"></span>
          `;
          cell.appendChild(leftResizer);
        }

        // Right column divider handle on every cell in this column
        const resizer = document.createElement('div');
        resizer.className = 'editkit-table-col-resizer';
        resizer.setAttribute('contenteditable', 'false');
        resizer.innerHTML = isHeader ? `
          <span class="editkit-table-col-resizer-tab"></span>
          <span class="editkit-table-col-resizer-bar"></span>
          <span class="editkit-table-col-resizer-bar"></span>
        ` : `
          <span class="editkit-table-col-resizer-bar" style="opacity: 0.2;"></span>
        `;

        resizer.addEventListener('mousedown', (e: MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();
          this._startColumnResize(e, c);
        });

        cell.appendChild(resizer);
      }
    }
  }

  private _startColumnResize(e: MouseEvent, colIndex: number): void {
    if (!this.activeTable) return;
    const table = this.activeTable;
    const firstRow = table.rows[0];
    if (!firstRow) return;

    this.isResizing = true;
    this.resizingColIndex = colIndex;
    this.startX = e.clientX;

    // Freeze all current column widths and set tableLayout: fixed
    const colWidths = Array.from(firstRow.cells).map(c => Math.round((c as HTMLElement).getBoundingClientRect().width));
    const totalTableWidth = colWidths.reduce((a, b) => a + b, 0);
    table.style.tableLayout = 'fixed';
    table.style.minWidth = '0px';
    table.style.maxWidth = 'none';
    table.style.width = `${totalTableWidth}px`;

    for (const row of Array.from(table.rows)) {
      for (let i = 0; i < row.cells.length; i++) {
        const c = row.cells[i] as HTMLElement;
        c.style.width = `${colWidths[i]}px`;
        c.style.minWidth = `${colWidths[i]}px`;
        c.style.boxSizing = 'border-box';
      }
    }

    const startColWidth = colWidths[colIndex];
    const editorRect = this.editor.root.getBoundingClientRect();
    const tableRect = table.getBoundingClientRect();

    // Show resize guide line
    this.resizeGuideLine.style.display = 'block';
    this.resizeGuideLine.style.top = `${tableRect.top - editorRect.top}px`;
    this.resizeGuideLine.style.height = `${tableRect.height}px`;
    this.resizeGuideLine.style.left = `${e.clientX - editorRect.left}px`;

    document.body.classList.add('editkit-col-resizing');

    const onMouseMove = (ev: MouseEvent) => {
      if (!this.isResizing || !this.activeTable) return;
      const deltaX = ev.clientX - this.startX;
      const newColWidth = Math.max(45, startColWidth + deltaX);

      // Update guide line position
      this.resizeGuideLine.style.left = `${ev.clientX - editorRect.left}px`;

      // Apply real-time column width
      for (const row of Array.from(this.activeTable.rows)) {
        const target = row.cells[colIndex];
        if (target) {
          target.style.width = `${newColWidth}px`;
          target.style.minWidth = `${newColWidth}px`;
        }
      }

      // Update total table width
      const newTableWidth = colWidths.reduce((sum, w, i) => sum + (i === colIndex ? newColWidth : w), 0);
      this.activeTable.style.width = `${newTableWidth}px`;

      this._updatePositionsOnly();
    };

    const onMouseUp = () => {
      if (this.isResizing) {
        this.isResizing = false;
        this.resizeGuideLine.style.display = 'none';
        document.body.classList.remove('editkit-col-resizing');

        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);

        (this.editor as any)._saveHistory?.();
        (this.editor as any)._emitUpdate?.();

        this._updatePositionsOnly();
      }
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  // ── Corner Table Resizer (Square Shape & Proportional Table Resizing) ──
  private _startTableCornerResize(e: MouseEvent): void {
    if (!this.activeTable) return;
    const table = this.activeTable;
    const firstRow = table.rows[0];
    if (!firstRow) return;

    this.isCornerResizing = true;
    const startX = e.clientX;
    const startY = e.clientY;
    const startTableRect = table.getBoundingClientRect();
    const startTableWidth = startTableRect.width;
    const startTableHeight = startTableRect.height;

    const startColWidths = Array.from(firstRow.cells).map(c => (c as HTMLElement).getBoundingClientRect().width);
    const startRowHeights = Array.from(table.rows).map(r => (r as HTMLElement).getBoundingClientRect().height);

    table.style.tableLayout = 'fixed';
    document.body.classList.add('editkit-table-resizing');

    const onMouseMove = (ev: MouseEvent) => {
      if (!this.isCornerResizing || !this.activeTable) return;
      const deltaX = ev.clientX - startX;
      const deltaY = ev.clientY - startY;

      const newTableWidth = Math.max(180, Math.round(startTableWidth + deltaX));
      const widthRatio = newTableWidth / startTableWidth;

      this.activeTable.style.width = `${newTableWidth}px`;

      // Scale column widths proportionally
      for (const row of Array.from(this.activeTable.rows)) {
        for (let i = 0; i < row.cells.length; i++) {
          const cell = row.cells[i];
          const newColW = Math.max(40, Math.round(startColWidths[i] * widthRatio));
          cell.style.width = `${newColW}px`;
          cell.style.minWidth = `${newColW}px`;
        }
      }

      // Scale row heights proportionally if resized vertically (square/rectangle shape)
      const newTableHeight = Math.max(80, Math.round(startTableHeight + deltaY));
      const heightRatio = newTableHeight / startTableHeight;
      for (let r = 0; r < this.activeTable.rows.length; r++) {
        const row = this.activeTable.rows[r];
        const newRowH = Math.max(28, Math.round(startRowHeights[r] * heightRatio));
        row.style.height = `${newRowH}px`;
        for (const cell of Array.from(row.cells)) {
          (cell as HTMLElement).style.height = `${newRowH}px`;
        }
      }

      this._updatePositionsOnly();
    };

    const onMouseUp = () => {
      if (this.isCornerResizing) {
        this.isCornerResizing = false;
        document.body.classList.remove('editkit-table-resizing');

        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);

        (this.editor as any)._saveHistory?.();
        (this.editor as any)._emitUpdate?.();

        this._updatePositionsOnly();
      }
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  // ── Row Height Resizing on Rows ──
  private _attachRowResizers(): void {
    if (!this.activeTable) return;
    const table = this.activeTable;

    for (let r = 0; r < table.rows.length; r++) {
      const row = table.rows[r];

      // Remove existing row resizers
      row.querySelectorAll('.editkit-table-row-resizer').forEach(el => el.remove());

      for (let c = 0; c < row.cells.length; c++) {
        const cell = row.cells[c] as HTMLElement;
        const resizer = document.createElement('div');
        resizer.className = 'editkit-table-row-resizer';
        resizer.setAttribute('contenteditable', 'false');
        resizer.innerHTML = '<span class="editkit-table-row-resizer-line"></span>';

        resizer.addEventListener('mousedown', (e: MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();
          this._startRowResize(e, row, r);
        });

        cell.appendChild(resizer);
      }
    }
  }

  private _startRowResize(e: MouseEvent, row: HTMLTableRowElement, rowIndex: number): void {
    if (!this.activeTable) return;

    this.isRowResizing = true;
    this.resizingRowIndex = rowIndex;
    this.startY = e.clientY;
    this.startHeight = row.getBoundingClientRect().height;

    const editorRect = this.editor.root.getBoundingClientRect();
    const tableRect = this.activeTable.getBoundingClientRect();

    // Show horizontal resize guide line
    this.resizeGuideLineH.style.display = 'block';
    this.resizeGuideLineH.style.left = `${tableRect.left - editorRect.left}px`;
    this.resizeGuideLineH.style.width = `${tableRect.width}px`;
    this.resizeGuideLineH.style.top = `${e.clientY - editorRect.top}px`;

    document.body.classList.add('editkit-row-resizing');

    const onMouseMove = (ev: MouseEvent) => {
      if (!this.isRowResizing || !this.activeTable) return;
      const deltaY = ev.clientY - this.startY;
      const newHeight = Math.max(32, this.startHeight + deltaY);

      this.resizeGuideLineH.style.top = `${ev.clientY - editorRect.top}px`;

      row.style.height = `${newHeight}px`;
      for (const cell of Array.from(row.cells)) {
        (cell as HTMLElement).style.height = `${newHeight}px`;
      }

      this._updatePositionsOnly();
    };

    const onMouseUp = () => {
      if (this.isRowResizing) {
        this.isRowResizing = false;
        this.resizeGuideLineH.style.display = 'none';
        document.body.classList.remove('editkit-row-resizing');

        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);

        (this.editor as any)._saveHistory?.();
        (this.editor as any)._emitUpdate?.();

        this._updatePositionsOnly();
      }
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  // ── Row & Column Insertion Helpers ──
  private _addRowAt(rowIndex: number, position: 'above' | 'below'): void {
    if (!this.activeTable) return;
    const table = this.activeTable;
    const firstRow = table.rows[0];
    const totalCols = firstRow?.cells.length || 3;

    const newRow = document.createElement('tr');
    newRow.style.height = '40px';
    for (let c = 0; c < totalCols; c++) {
      const td = document.createElement('td');
      td.innerHTML = '<br>';
      if (firstRow && firstRow.cells[c]) {
        td.style.width = (firstRow.cells[c] as HTMLElement).style.width || '110px';
        td.style.minWidth = (firstRow.cells[c] as HTMLElement).style.minWidth || '110px';
      }
      newRow.appendChild(td);
    }

    const refRow = table.rows[rowIndex];
    if (position === 'above') {
      refRow.parentNode!.insertBefore(newRow, refRow);
    } else {
      refRow.parentNode!.insertBefore(newRow, refRow.nextSibling);
    }

    (this.editor as any)._saveHistory?.();
    (this.editor as any)._emitUpdate?.();
    this._updateOverlay();
  }

  private _addColumnAt(colIndex: number): void {
    if (!this.activeTable) return;
    const table = this.activeTable;

    const newColWidth = 110;
    if (table.style.width) {
      const currentWidth = parseInt(table.style.width, 10) || table.getBoundingClientRect().width;
      table.style.width = `${currentWidth + newColWidth}px`;
    }

    for (const r of Array.from(table.rows)) {
      const isHeader = r.parentElement?.tagName === 'THEAD' || r.cells[0]?.tagName === 'TH';
      const newCell = document.createElement(isHeader ? 'th' : 'td');
      newCell.innerHTML = '<br>';
      newCell.style.width = `${newColWidth}px`;
      newCell.style.minWidth = `${newColWidth}px`;

      if (colIndex + 1 >= r.cells.length) {
        r.appendChild(newCell);
      } else {
        r.insertBefore(newCell, r.cells[colIndex + 1]);
      }
    }

    (this.editor as any)._saveHistory?.();
    (this.editor as any)._emitUpdate?.();
    this._updateOverlay();
  }

  // ── Dropdown Menu (Image 2 exact match) ──
  private _toggleDropdown(triggerEl: HTMLElement): void {
    if (this.dropdownMenuEl) {
      this._closeDropdown();
      return;
    }

    this.dropdownTriggerEl = triggerEl;
    this.dropdownMenuEl = document.createElement('div');
    this.dropdownMenuEl.className = 'editkit-table-dropdown-menu';

    const addItem = (label: string, action: () => void, isDanger?: boolean) => {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'editkit-table-dropdown-item';
      if (isDanger) item.classList.add('editkit-table-dropdown-item--danger');
      item.textContent = label;

      item.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this._closeDropdown();
        action();
      });

      this.dropdownMenuEl!.appendChild(item);
    };

    const isFull = this.activeTable ? (this.activeTable.classList.contains('editkit-table--fullwidth') || this.activeTable.style.width === '100%') : false;

    // 1. Background Color -> Image 3 Modal
    addItem('Background Color', () => {
      this.cellColorModal.show(this.activeCell || undefined);
    });

    // 2. Table Border -> Image 4 Modal
    addItem('Table Border', () => {
      this.tableBorderModal.show(this.activeTable || undefined);
    });

    // 3. Full width toggle
    addItem(isFull ? 'Full width ✓' : 'Full width', () => {
      if (this.activeTable) {
        this.editor.commands.toggleTableFullWidth(this.activeTable);
      } else {
        this.editor.commands.toggleTableFullWidth();
      }
      requestAnimationFrame(() => {
        this._updateOverlay();
      });
      setTimeout(() => {
        this._updateOverlay();
      }, 50);
    });

    // 4. Table Alignment -> Image 5 Modal
    addItem('Table Alignment', () => {
      this.tableAlignModal.show(this.activeTable || undefined, undefined, 'table');
    });

    // 5. Cell Alignment
    addItem('Cell Alignment', () => {
      this.tableAlignModal.show(this.activeTable || undefined, this.activeCell || undefined, 'cell');
    });

    // 6. Odd Row Striping Color -> Image Exact Match Modal
    addItem('Odd Row Striping Color', () => {
      this.tableStripingModal.show(this.activeTable || undefined);
    });

    // 7. Insert Row Above
    addItem('Insert Row Above', () => {
      this.editor.commands.addRowAbove(this.activeTable || undefined, this.activeCell || undefined);
      this._updateOverlay();
    });

    // 8. Insert Row Below
    addItem('Insert Row Below', () => {
      this.editor.commands.addRowBelow(this.activeTable || undefined, this.activeCell || undefined);
      this._updateOverlay();
    });

    // 9. Insert Paragraph Above Table
    addItem('Insert Paragraph Above Table', () => {
      this.editor.commands.insertParagraphAboveTable(this.activeTable || undefined);
    });

    // 10. Insert Paragraph Below Table
    addItem('Insert Paragraph Below Table', () => {
      this.editor.commands.insertParagraphBelowTable(this.activeTable || undefined);
    });

    // 11. Insert Column Left
    addItem('Insert Column Left', () => {
      this.editor.commands.addColumnLeft(this.activeTable || undefined, this.activeCell || undefined);
      this._updateOverlay();
    });

    // 12. Insert Column Right
    addItem('Insert Column Right', () => {
      this.editor.commands.addColumnRight(this.activeTable || undefined, this.activeCell || undefined);
      this._updateOverlay();
    });

    // 13. Delete Column (Red)
    addItem('Delete Column', () => {
      this.editor.commands.deleteColumn(this.activeTable || undefined, this.activeCell || undefined);
      this._updateOverlay();
    }, true);

    // 14. Delete Row (Red)
    addItem('Delete Row', () => {
      this.editor.commands.deleteRow(this.activeTable || undefined, this.activeCell || undefined);
      this._updateOverlay();
    }, true);

    // 15. Delete Table (Red)
    addItem('Delete Table', () => {
      this.editor.commands.deleteTable(this.activeTable || undefined);
      this.hide();
    }, true);

    // 16. Row Header toggle
    const hasHeaderRow = this.activeTable ? Boolean(this.activeTable.querySelector('thead')) : false;
    addItem(hasHeaderRow ? 'Remove Row Header' : 'Add Row Header', () => {
      this.editor.commands.toggleHeaderRow(this.activeTable || undefined);
      this._updateOverlay();
    });

    // 17. Column Header toggle
    const firstCell = this.activeTable?.rows[0]?.cells[0];
    const hasHeaderCol = this.activeTable ? (firstCell?.tagName === 'TH' && !hasHeaderRow) : false;
    addItem(hasHeaderCol ? 'Remove Column Header' : 'Add Column Header', () => {
      this.editor.commands.toggleHeaderColumn(this.activeTable || undefined);
      this._updateOverlay();
    });

    // Position Dropdown below trigger
    const triggerRect = triggerEl.getBoundingClientRect();
    const editorRect = this.editor.root.getBoundingClientRect();

    let top = triggerRect.bottom - editorRect.top + 4;
    let left = triggerRect.left - editorRect.left;

    this.dropdownMenuEl.style.top = `${top}px`;
    this.dropdownMenuEl.style.left = `${left}px`;

    this.element.appendChild(this.dropdownMenuEl);
  }

  private _closeDropdown(): void {
    if (this.dropdownMenuEl) {
      this.dropdownMenuEl.remove();
      this.dropdownMenuEl = null;
    }
    this.dropdownTriggerEl = null;
  }
}
