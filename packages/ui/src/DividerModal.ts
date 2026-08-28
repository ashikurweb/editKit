// ============================================================
// EditKit — Customize Horizontal Line / Divider Modal
// Extends global reusable Modal component
// ============================================================

import type { EditKitEditor } from '@editkit/core';
import { Modal } from './Modal';

export class DividerModal extends Modal {
  private selectedColor: string = '#000000';
  private selectedStyle: 'solid' | 'dashed' | 'dotted' | 'double' = 'solid';
  private selectedWidth: '100%' | '80%' | '40%' | '20%' = '100%';
  private selectedThickness: number = 1;

  // DOM references
  private colorHexLabel!: HTMLElement;
  private hexInputEl!: HTMLInputElement;
  private colorPickerInput!: HTMLInputElement;
  private colorSquarePreview!: HTMLElement;
  private swatchesList: HTMLElement[] = [];

  private styleLabel!: HTMLElement;
  private styleCards: Map<string, HTMLElement> = new Map();

  private widthLabel!: HTMLElement;
  private widthPills: Map<string, HTMLElement> = new Map();

  private thicknessBadge!: HTMLElement;
  private thicknessSlider!: HTMLInputElement;
  private thicknessTicks: HTMLElement[] = [];

  private previewLineEl!: HTMLElement;
  private insertBtn!: HTMLButtonElement;
  private cancelBtn!: HTMLButtonElement;

  constructor(editor: EditKitEditor) {
    super(editor, {
      title: 'Customize horizontal line',
      className: 'editkit-divider-modal',
      maxWidth: '460px',
    });

    this._buildUI();
    this._updateAll();
  }

  private _buildUI(): void {
    // 0. Header subtitle tag (● DIVIDER)
    const tagEl = document.createElement('div');
    tagEl.classList.add('editkit-divider-modal-tag');
    tagEl.innerHTML = '<span class="editkit-divider-modal-tag-dot">●</span> DIVIDER';
    this.headerEl.insertBefore(tagEl, this.titleEl);

    // ── 1. COLOR SECTION ──
    const colorSection = document.createElement('div');
    colorSection.classList.add('editkit-dvm-section');

    const colorHeader = document.createElement('div');
    colorHeader.classList.add('editkit-dvm-header');

    const colorTitle = document.createElement('span');
    colorTitle.classList.add('editkit-dvm-title');
    colorTitle.textContent = 'COLOR';

    this.colorHexLabel = document.createElement('span');
    this.colorHexLabel.classList.add('editkit-dvm-meta');
    this.colorHexLabel.textContent = 'HEX #000000';

    colorHeader.appendChild(colorTitle);
    colorHeader.appendChild(this.colorHexLabel);
    colorSection.appendChild(colorHeader);

    // Swatches row + custom input
    const colorRow = document.createElement('div');
    colorRow.classList.add('editkit-dvm-color-row');

    const swatchesWrap = document.createElement('div');
    swatchesWrap.classList.add('editkit-dvm-swatches');

    const presetColors = [
      '#000000',
      '#4b5563',
      '#ef4444',
      '#22c55e',
      '#3b82f6',
      '#eab308',
      '#ec4899',
      '#06b6d4',
      '#f59e0b',
      '#8b5cf6',
    ];

    presetColors.forEach(c => {
      const swatch = document.createElement('button');
      swatch.type = 'button';
      swatch.classList.add('editkit-dvm-swatch');
      swatch.style.backgroundColor = c;
      swatch.setAttribute('data-color', c);
      swatch.addEventListener('click', () => {
        this.selectedColor = c;
        this._updateAll();
      });
      this.swatchesList.push(swatch);
      swatchesWrap.appendChild(swatch);
    });
    colorRow.appendChild(swatchesWrap);

    // Custom Hex Input Box
    const customColorBox = document.createElement('div');
    customColorBox.classList.add('editkit-dvm-custom-color');

    this.colorSquarePreview = document.createElement('div');
    this.colorSquarePreview.classList.add('editkit-dvm-color-square');
    this.colorSquarePreview.style.backgroundColor = this.selectedColor;

    this.colorPickerInput = document.createElement('input');
    this.colorPickerInput.type = 'color';
    this.colorPickerInput.value = this.selectedColor;
    this.colorPickerInput.classList.add('editkit-dvm-hidden-color-input');
    this.colorPickerInput.addEventListener('input', (e) => {
      this.selectedColor = (e.target as HTMLInputElement).value;
      this._updateAll();
    });
    this.colorSquarePreview.appendChild(this.colorPickerInput);
    this.colorSquarePreview.addEventListener('click', () => {
      this.colorPickerInput.click();
    });

    const hashSpan = document.createElement('span');
    hashSpan.classList.add('editkit-dvm-hash');
    hashSpan.textContent = '#';

    this.hexInputEl = document.createElement('input');
    this.hexInputEl.type = 'text';
    this.hexInputEl.classList.add('editkit-dvm-hex-input');
    this.hexInputEl.value = '000000';
    this.hexInputEl.maxLength = 6;
    this.hexInputEl.addEventListener('input', () => {
      let val = this.hexInputEl.value.replace(/[^0-9A-Fa-f]/g, '');
      if (val.length === 6 || val.length === 3) {
        this.selectedColor = '#' + val;
        this._updateAll(false);
      }
    });

    customColorBox.appendChild(this.colorSquarePreview);
    customColorBox.appendChild(hashSpan);
    customColorBox.appendChild(this.hexInputEl);
    colorRow.appendChild(customColorBox);

    colorSection.appendChild(colorRow);
    this.bodyEl.appendChild(colorSection);

    // ── 2. STYLE SECTION ──
    const styleSection = document.createElement('div');
    styleSection.classList.add('editkit-dvm-section');

    const styleHeader = document.createElement('div');
    styleHeader.classList.add('editkit-dvm-header');

    const styleTitle = document.createElement('span');
    styleTitle.classList.add('editkit-dvm-title');
    styleTitle.textContent = 'STYLE';

    this.styleLabel = document.createElement('span');
    this.styleLabel.classList.add('editkit-dvm-meta');
    this.styleLabel.textContent = 'solid';

    styleHeader.appendChild(styleTitle);
    styleHeader.appendChild(this.styleLabel);
    styleSection.appendChild(styleHeader);

    const styleGrid = document.createElement('div');
    styleGrid.classList.add('editkit-dvm-style-grid');

    const styles: Array<{ id: 'solid' | 'dashed' | 'dotted' | 'double'; label: string; lineClass: string }> = [
      { id: 'solid', label: 'Solid', lineClass: 'editkit-dvm-line--solid' },
      { id: 'dashed', label: 'Dashed', lineClass: 'editkit-dvm-line--dashed' },
      { id: 'dotted', label: 'Dotted', lineClass: 'editkit-dvm-line--dotted' },
      { id: 'double', label: 'Double', lineClass: 'editkit-dvm-line--double' },
    ];

    styles.forEach(s => {
      const card = document.createElement('button');
      card.type = 'button';
      card.classList.add('editkit-dvm-style-card');
      card.innerHTML = `
        <div class="editkit-dvm-style-line ${s.lineClass}"></div>
        <span class="editkit-dvm-style-name">${s.label}</span>
      `;
      card.addEventListener('click', () => {
        this.selectedStyle = s.id;
        this._updateAll();
      });
      this.styleCards.set(s.id, card);
      styleGrid.appendChild(card);
    });
    styleSection.appendChild(styleGrid);
    this.bodyEl.appendChild(styleSection);

    // ── 3. WIDTH SECTION ──
    const widthSection = document.createElement('div');
    widthSection.classList.add('editkit-dvm-section');

    const widthHeader = document.createElement('div');
    widthHeader.classList.add('editkit-dvm-header');

    const widthTitle = document.createElement('span');
    widthTitle.classList.add('editkit-dvm-title');
    widthTitle.textContent = 'WIDTH';

    this.widthLabel = document.createElement('span');
    this.widthLabel.classList.add('editkit-dvm-meta');
    this.widthLabel.textContent = '100%';

    widthHeader.appendChild(widthTitle);
    widthHeader.appendChild(this.widthLabel);
    widthSection.appendChild(widthHeader);

    const widthGrid = document.createElement('div');
    widthGrid.classList.add('editkit-dvm-width-grid');

    const widths: Array<{ id: '100%' | '80%' | '40%' | '20%'; label: string }> = [
      { id: '100%', label: 'Full' },
      { id: '80%', label: '80%' },
      { id: '40%', label: '40%' },
      { id: '20%', label: '20%' },
    ];

    widths.forEach(w => {
      const pill = document.createElement('button');
      pill.type = 'button';
      pill.classList.add('editkit-dvm-width-pill');
      pill.textContent = w.label;
      pill.addEventListener('click', () => {
        this.selectedWidth = w.id;
        this._updateAll();
      });
      this.widthPills.set(w.id, pill);
      widthGrid.appendChild(pill);
    });
    widthSection.appendChild(widthGrid);
    this.bodyEl.appendChild(widthSection);

    // ── 4. THICKNESS SECTION ──
    const thickSection = document.createElement('div');
    thickSection.classList.add('editkit-dvm-section');

    const thickHeader = document.createElement('div');
    thickHeader.classList.add('editkit-dvm-header');

    const thickTitle = document.createElement('span');
    thickTitle.classList.add('editkit-dvm-title');
    thickTitle.textContent = 'THICKNESS';

    this.thicknessBadge = document.createElement('span');
    this.thicknessBadge.classList.add('editkit-dvm-thick-badge');
    this.thicknessBadge.innerHTML = '<span class="editkit-dvm-thick-num">1</span><span class="editkit-dvm-thick-unit">PX</span>';

    thickHeader.appendChild(thickTitle);
    thickHeader.appendChild(this.thicknessBadge);
    thickSection.appendChild(thickHeader);

    // Range Slider
    const sliderWrap = document.createElement('div');
    sliderWrap.classList.add('editkit-dvm-slider-wrap');

    const TICK_VALUES = [0.5, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    this.thicknessSlider = document.createElement('input');
    this.thicknessSlider.type = 'range';
    this.thicknessSlider.min = '0';
    this.thicknessSlider.max = (TICK_VALUES.length - 1).toString();
    this.thicknessSlider.step = '1';
    this.thicknessSlider.value = '1';
    this.thicknessSlider.classList.add('editkit-dvm-slider');
    this.thicknessSlider.addEventListener('input', () => {
      const idx = parseInt(this.thicknessSlider.value, 10);
      this.selectedThickness = TICK_VALUES[idx];
      this._updateAll();
    });
    sliderWrap.appendChild(this.thicknessSlider);

    // Tick labels
    const ticksRow = document.createElement('div');
    ticksRow.classList.add('editkit-dvm-ticks');
    TICK_VALUES.forEach((tv, idx) => {
      const tick = document.createElement('span');
      tick.classList.add('editkit-dvm-tick');
      tick.textContent = tv.toString();
      tick.setAttribute('data-idx', idx.toString());
      tick.setAttribute('data-val', tv.toString());
      tick.addEventListener('click', () => {
        this.selectedThickness = tv;
        this.thicknessSlider.value = idx.toString();
        this._updateAll();
      });
      this.thicknessTicks.push(tick);
      ticksRow.appendChild(tick);
    });
    sliderWrap.appendChild(ticksRow);
    thickSection.appendChild(sliderWrap);
    this.bodyEl.appendChild(thickSection);

    // ── 5. PREVIEW SECTION ──
    const prevSection = document.createElement('div');
    prevSection.classList.add('editkit-dvm-section');

    const prevHeader = document.createElement('div');
    prevHeader.classList.add('editkit-dvm-header');

    const prevTitle = document.createElement('span');
    prevTitle.classList.add('editkit-dvm-title');
    prevTitle.textContent = 'PREVIEW';

    prevHeader.appendChild(prevTitle);
    prevSection.appendChild(prevHeader);

    const prevBox = document.createElement('div');
    prevBox.classList.add('editkit-dvm-preview-box');

    this.previewLineEl = document.createElement('div');
    this.previewLineEl.classList.add('editkit-dvm-preview-line');
    prevBox.appendChild(this.previewLineEl);
    prevSection.appendChild(prevBox);
    this.bodyEl.appendChild(prevSection);

    // ── 6. FOOTER ACTIONS ──
    const footer = document.createElement('div');
    footer.classList.add('editkit-dvm-footer');

    this.cancelBtn = document.createElement('button');
    this.cancelBtn.type = 'button';
    this.cancelBtn.classList.add('editkit-dvm-cancel-btn');
    this.cancelBtn.textContent = 'Cancel';
    this.cancelBtn.addEventListener('click', () => this.hide());

    this.insertBtn = document.createElement('button');
    this.insertBtn.type = 'button';
    this.insertBtn.classList.add('editkit-dvm-insert-btn');
    this.insertBtn.textContent = 'Insert rule';
    this.insertBtn.addEventListener('click', () => this._insertRule());

    footer.appendChild(this.cancelBtn);
    footer.appendChild(this.insertBtn);
    this.bodyEl.appendChild(footer);
  }

  private _updateAll(updateInputText: boolean = true): void {
    const TICK_VALUES = [0.5, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const cleanHex = this.selectedColor.toUpperCase();
    this.colorHexLabel.textContent = `HEX ${cleanHex}`;
    if (updateInputText) {
      this.hexInputEl.value = cleanHex.replace('#', '');
    }
    this.colorSquarePreview.style.backgroundColor = this.selectedColor;
    this.colorPickerInput.value = this.selectedColor;

    // Swatches active state
    this.swatchesList.forEach(s => {
      const match = (s.getAttribute('data-color') || '').toLowerCase() === this.selectedColor.toLowerCase();
      s.classList.toggle('editkit-dvm-swatch--active', match);
    });

    // Style active state
    this.styleLabel.textContent = this.selectedStyle;
    this.styleCards.forEach((card, styleKey) => {
      card.classList.toggle('editkit-dvm-style-card--active', styleKey === this.selectedStyle);
    });

    // Width active state
    this.widthLabel.textContent = this.selectedWidth;
    this.widthPills.forEach((pill, widthKey) => {
      pill.classList.toggle('editkit-dvm-width-pill--active', widthKey === this.selectedWidth);
    });

    // Thickness active state
    this.thicknessBadge.innerHTML = `<span class="editkit-dvm-thick-num">${this.selectedThickness}</span><span class="editkit-dvm-thick-unit">PX</span>`;
    const curIdx = TICK_VALUES.indexOf(this.selectedThickness);
    const validIdx = curIdx >= 0 ? curIdx : 1;
    this.thicknessSlider.value = validIdx.toString();

    const sliderPercent = (validIdx / (TICK_VALUES.length - 1)) * 100;
    this.thicknessSlider.style.background = `linear-gradient(to right, #6366f1 0%, #6366f1 ${sliderPercent}%, var(--editkit-divider-slider-track, #232636) ${sliderPercent}%, var(--editkit-divider-slider-track, #232636) 100%)`;

    this.thicknessTicks.forEach((tick, idx) => {
      tick.classList.toggle('editkit-dvm-tick--active', idx === validIdx);
    });

    // Update Live Preview Line
    this.previewLineEl.style.width = this.selectedWidth;
    this.previewLineEl.style.border = 'none';
    if (this.selectedStyle === 'double') {
      const dThick = Math.max(this.selectedThickness * 2, 3);
      this.previewLineEl.style.borderTop = `${dThick}px double ${this.selectedColor}`;
    } else {
      this.previewLineEl.style.borderTop = `${this.selectedThickness}px ${this.selectedStyle} ${this.selectedColor}`;
    }
  }

  private savedRange: Range | null = null;

  private _insertRule(): void {
    if (this.savedRange) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(this.savedRange);
      }
    }

    (this.editor.commands as any).insertCustomDivider({
      color: this.selectedColor,
      style: this.selectedStyle,
      width: this.selectedWidth,
      thickness: this.selectedThickness,
    });

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
    this._updateAll();
  }
}
