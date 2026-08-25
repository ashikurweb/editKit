// ============================================================
// Vellora — Contextual Table Floating Menu
// Appears automatically when active in a table cell
// ============================================================

import type { VelloraEditor, TableCellInfo } from '@vellora/core';
import { icons } from './icons';
import { ColorPickerPopover } from './ColorPicker';

export class TableFloatingMenu {
  readonly element: HTMLElement;
  private editor: VelloraEditor;
  private isVisible: boolean = false;
  private colorPickerEl: HTMLElement | null = null;
  private _unsubscribers: (() => void)[] = [];

  constructor(editor: VelloraEditor) {
    this.editor = editor;

    this.element = document.createElement('div');
    this.element.classList.add('vellora-table-floating-menu');
    this.element.setAttribute('role', 'toolbar');
    this.element.setAttribute('aria-label', 'Table actions');

    this._buildUI();

    // Listen to table selection events
    const unsub = this.editor.on('tableSelect', ({ cellInfo }) => {
      this._updatePosition(cellInfo);
    });
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

    const btn = (iconKey: string, tooltip: string, action: () => void, isDanger?: boolean) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.classList.add('vellora-table-btn');
      if (isDanger) b.classList.add('vellora-table-btn--danger');
      b.setAttribute('data-vellora-tooltip', tooltip);
      b.setAttribute('aria-label', tooltip);
      b.innerHTML = icons[iconKey] || iconKey;
      b.addEventListener('mousedown', (e) => {
        e.preventDefault();
        action();
      });
      return b;
    };

    const divider = () => {
      const d = document.createElement('div');
      d.classList.add('vellora-table-btn-divider');
      return d;
    };

    // Label indicator
    const label = document.createElement('span');
    label.classList.add('vellora-table-menu-label');
    label.innerHTML = `${icons.table} <span>Table</span>`;
    this.element.appendChild(label);
    this.element.appendChild(divider());

    // Row actions
    this.element.appendChild(btn('addRowAbove', 'Insert Row Above', () => this.editor.commands.addRowAbove()));
    this.element.appendChild(btn('addRowBelow', 'Insert Row Below', () => this.editor.commands.addRowBelow()));
    this.element.appendChild(btn('deleteRow', 'Delete Current Row', () => this.editor.commands.deleteRow(), true));
    this.element.appendChild(divider());

    // Column actions
    this.element.appendChild(btn('addColLeft', 'Insert Column Left', () => this.editor.commands.addColumnLeft()));
    this.element.appendChild(btn('addColRight', 'Insert Column Right', () => this.editor.commands.addColumnRight()));
    this.element.appendChild(btn('deleteCol', 'Delete Current Column', () => this.editor.commands.deleteColumn(), true));
    this.element.appendChild(divider());

    // Header & Cell Styling
    this.element.appendChild(btn('tableHeader', 'Toggle Header Row', () => this.editor.commands.toggleHeaderRow()));

    // Cell Background Color button
    const colorBtn = document.createElement('button');
    colorBtn.type = 'button';
    colorBtn.classList.add('vellora-table-btn');
    colorBtn.setAttribute('data-vellora-tooltip', 'Cell Background Color');
    colorBtn.setAttribute('aria-label', 'Cell Background Color');
    colorBtn.innerHTML = icons.highlightColor;
    colorBtn.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this._toggleColorPicker(colorBtn);
    });
    this.element.appendChild(colorBtn);

    this.element.appendChild(divider());

    // Delete table
    this.element.appendChild(btn('deleteTable', 'Delete Entire Table', () => this.editor.commands.deleteTable(), true));
  }

  private _toggleColorPicker(trigger: HTMLElement): void {
    if (this.colorPickerEl) {
      this.colorPickerEl.remove();
      this.colorPickerEl = null;
      return;
    }

    const picker = new ColorPickerPopover(
      this.editor,
      (color) => {
        this.editor.commands.setCellBackground(color);
        this.colorPickerEl?.remove();
        this.colorPickerEl = null;
      },
      () => {
        this.colorPickerEl?.remove();
        this.colorPickerEl = null;
      }
    );

    this.colorPickerEl = picker.element;
    this.colorPickerEl.style.position = 'absolute';
    this.colorPickerEl.style.top = 'calc(100% + 6px)';
    this.colorPickerEl.style.right = '0';
    this.colorPickerEl.style.zIndex = '110';
    this.element.appendChild(this.colorPickerEl);
  }

  private _updatePosition(cellInfo: TableCellInfo | null): void {
    if (!cellInfo) {
      this.hide();
      return;
    }

    this.show();
    const cellRect = cellInfo.cell.getBoundingClientRect();
    const editorRect = this.editor.root.getBoundingClientRect();

    // Position floating menu right above or below the table / cell
    let top = cellRect.top - editorRect.top - 44;
    let left = cellRect.left - editorRect.left;

    if (top < 10) {
      top = cellRect.bottom - editorRect.top + 8;
    }

    // Keep within bounds
    const maxLeft = editorRect.width - this.element.offsetWidth - 12;
    left = Math.max(8, Math.min(left, maxLeft));

    this.element.style.transform = `translate(${left}px, ${top}px)`;
  }

  show(): void {
    if (!this.isVisible) {
      this.element.classList.add('vellora-table-floating-menu--visible');
      this.isVisible = true;
    }
  }

  hide(): void {
    if (this.isVisible) {
      this.element.classList.remove('vellora-table-floating-menu--visible');
      if (this.colorPickerEl) {
        this.colorPickerEl.remove();
        this.colorPickerEl = null;
      }
      this.isVisible = false;
    }
  }
}
