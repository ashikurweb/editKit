// ============================================================
// EditKit — Table Border Modal (Image 4 exact match)
// Extends global Modal component with Border Size, Border Color, 2D Picker & Hue Slider
// ============================================================

import type { EditKitEditor, TableBorderSize } from '@editkit/core';
import { Modal } from './Modal';
import { TABLE_CELL_SWATCHES } from './TableCellColorModal';

function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  let r = 0, g = 0, b = 0;
  switch (i % 6) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

function hexToRgb(hex: string): [number, number, number] | null {
  hex = hex.replace('#', '');
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }
  if (hex.length !== 6) return null;
  const num = parseInt(hex, 16);
  if (isNaN(num)) return null;
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0;
  const v = max;
  const d = max - min;
  const s = max === 0 ? 0 : d / max;
  if (max !== min) {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [h, s, v];
}

export class TableBorderModal extends Modal {
  private selectedSize: TableBorderSize = 'thin';
  private currentHex: string = '#bbbbbb';
  private hue: number = 0;
  private sat: number = 0;
  private val: number = 0.73;

  private sizeButtons: Map<TableBorderSize, HTMLButtonElement> = new Map();
  private targetTable: HTMLTableElement | null = null;
  private previewBox!: HTMLElement;
  private hexInput!: HTMLInputElement;
  private satValCanvas!: HTMLElement;
  private satValThumb!: HTMLElement;
  private hueSlider!: HTMLElement;
  private hueThumb!: HTMLElement;
  private swatchesWrap!: HTMLElement;

  constructor(editor: EditKitEditor) {
    super(editor, {
      title: 'Table Border',
      className: 'editkit-table-modal editkit-table-border-modal',
      maxWidth: '440px',
    });

    this._buildUI();
  }

  show(targetTable?: HTMLTableElement): void {
    if (targetTable) this.targetTable = targetTable;
    const table = this.targetTable || this.editor.getActiveTableCell?.()?.table;
    if (table) {
      this.targetTable = table;
      const storedSize = table.getAttribute('data-border-size') as TableBorderSize;
      const storedColor = table.getAttribute('data-border-color');
      if (storedSize) this.selectedSize = storedSize;
      if (storedColor) this._setColor(storedColor);
      this._updateSizeButtons();
    }
    super.show();
  }

  private _buildUI(): void {
    this.bodyEl.innerHTML = '';

    // ── 1. Section: Border Size ──
    const sizeSection = document.createElement('div');
    sizeSection.className = 'editkit-tm-section';

    const sizeTitle = document.createElement('div');
    sizeTitle.className = 'editkit-tm-section-title';
    sizeTitle.textContent = 'Border Size';
    sizeSection.appendChild(sizeTitle);

    const sizeGrid = document.createElement('div');
    sizeGrid.className = 'editkit-tm-size-grid';

    const sizes: { id: TableBorderSize; label: string; lineClass: string }[] = [
      { id: 'none', label: 'None', lineClass: 'editkit-tm-line--none' },
      { id: 'thin', label: 'Thin', lineClass: 'editkit-tm-line--thin' },
      { id: 'medium', label: 'Medium', lineClass: 'editkit-tm-line--medium' },
      { id: 'thick', label: 'Thick', lineClass: 'editkit-tm-line--thick' },
    ];

    sizes.forEach(s => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'editkit-tm-size-btn';
      if (s.id === this.selectedSize) btn.classList.add('editkit-tm-size-btn--active');

      btn.innerHTML = `
        <span class="editkit-tm-size-label">${s.label}</span>
        <span class="editkit-tm-size-line ${s.lineClass}"></span>
      `;

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.selectedSize = s.id;
        this._updateSizeButtons();
      });

      this.sizeButtons.set(s.id, btn);
      sizeGrid.appendChild(btn);
    });

    sizeSection.appendChild(sizeGrid);
    this.bodyEl.appendChild(sizeSection);

    // ── 2. Section: Border Color ──
    const colorSection = document.createElement('div');
    colorSection.className = 'editkit-tm-section';

    const colorTitle = document.createElement('div');
    colorTitle.className = 'editkit-tm-section-title';
    colorTitle.textContent = 'Border Color';
    colorSection.appendChild(colorTitle);

    // Hex input row
    const hexRow = document.createElement('div');
    hexRow.className = 'editkit-tm-hex-row';

    const hexLabel = document.createElement('span');
    hexLabel.className = 'editkit-tm-hex-label';
    hexLabel.textContent = 'Hex';

    const inputWrap = document.createElement('div');
    inputWrap.className = 'editkit-tm-hex-input-wrap';

    this.hexInput = document.createElement('input');
    this.hexInput.type = 'text';
    this.hexInput.className = 'editkit-tm-hex-input';
    this.hexInput.value = this.currentHex;
    this.hexInput.spellcheck = false;

    this.hexInput.addEventListener('input', () => {
      let val = this.hexInput.value.trim();
      if (!val.startsWith('#')) val = '#' + val;
      const rgb = hexToRgb(val);
      if (rgb) {
        this.currentHex = val;
        const [h, s, v] = rgbToHsv(...rgb);
        this.hue = h;
        this.sat = s;
        this.val = v;
        this._updateVisuals();
      }
    });

    inputWrap.appendChild(this.hexInput);

    this.previewBox = document.createElement('div');
    this.previewBox.className = 'editkit-tm-preview-box';
    this.previewBox.style.backgroundColor = this.currentHex;

    hexRow.appendChild(hexLabel);
    hexRow.appendChild(inputWrap);
    hexRow.appendChild(this.previewBox);
    colorSection.appendChild(hexRow);

    // Swatches Row
    this.swatchesWrap = document.createElement('div');
    this.swatchesWrap.className = 'editkit-tm-swatches-row';

    for (const color of TABLE_CELL_SWATCHES) {
      const swatch = document.createElement('button');
      swatch.type = 'button';
      swatch.className = 'editkit-tm-swatch';
      swatch.style.backgroundColor = color;
      swatch.setAttribute('data-color', color.toLowerCase());

      swatch.addEventListener('click', (e) => {
        e.preventDefault();
        this._setColor(color);
      });

      this.swatchesWrap.appendChild(swatch);
    }
    colorSection.appendChild(this.swatchesWrap);

    // 2D Sat/Val canvas
    const canvasWrap = document.createElement('div');
    canvasWrap.className = 'editkit-tm-canvas-wrap';

    this.satValCanvas = document.createElement('div');
    this.satValCanvas.className = 'editkit-tm-satval-canvas';

    const whiteGrad = document.createElement('div');
    whiteGrad.className = 'editkit-tm-satval-white';
    const blackGrad = document.createElement('div');
    blackGrad.className = 'editkit-tm-satval-black';

    this.satValThumb = document.createElement('div');
    this.satValThumb.className = 'editkit-tm-satval-thumb';

    this.satValCanvas.appendChild(whiteGrad);
    this.satValCanvas.appendChild(blackGrad);
    this.satValCanvas.appendChild(this.satValThumb);
    canvasWrap.appendChild(this.satValCanvas);
    colorSection.appendChild(canvasWrap);

    this._setupSatValDragging();

    // Rainbow Hue slider
    const sliderWrap = document.createElement('div');
    sliderWrap.className = 'editkit-tm-hue-wrap';

    this.hueSlider = document.createElement('div');
    this.hueSlider.className = 'editkit-tm-hue-slider';

    this.hueThumb = document.createElement('div');
    this.hueThumb.className = 'editkit-tm-hue-thumb';

    this.hueSlider.appendChild(this.hueThumb);
    sliderWrap.appendChild(this.hueSlider);
    colorSection.appendChild(sliderWrap);

    this._setupHueDragging();

    this.bodyEl.appendChild(colorSection);

    // ── 3. Apply Border Button ──
    const applyBtn = document.createElement('button');
    applyBtn.type = 'button';
    applyBtn.className = 'editkit-tm-apply-btn';
    applyBtn.textContent = 'Apply Border';

    applyBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.editor.commands.setTableBorder({
        size: this.selectedSize,
        color: this.currentHex,
      }, this.targetTable || undefined);
      this.hide();
    });

    this.bodyEl.appendChild(applyBtn);

    this._updateVisuals();
  }

  private _updateSizeButtons(): void {
    this.sizeButtons.forEach((btn, id) => {
      if (id === this.selectedSize) {
        btn.classList.add('editkit-tm-size-btn--active');
      } else {
        btn.classList.remove('editkit-tm-size-btn--active');
      }
    });
  }

  private _setupSatValDragging(): void {
    const handleMove = (e: MouseEvent) => {
      const rect = this.satValCanvas.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));

      this.sat = x / rect.width;
      this.val = 1 - (y / rect.height);

      const [r, g, b] = hsvToRgb(this.hue, this.sat, this.val);
      this.currentHex = rgbToHex(r, g, b);
      this._updateVisuals();
    };

    this.satValCanvas.addEventListener('mousedown', (e) => {
      e.preventDefault();
      handleMove(e);

      const onMouseMove = (ev: MouseEvent) => handleMove(ev);
      const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });
  }

  private _setupHueDragging(): void {
    const handleMove = (e: MouseEvent) => {
      const rect = this.hueSlider.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      this.hue = x / rect.width;

      const [r, g, b] = hsvToRgb(this.hue, this.sat, this.val);
      this.currentHex = rgbToHex(r, g, b);
      this._updateVisuals();
    };

    this.hueSlider.addEventListener('mousedown', (e) => {
      e.preventDefault();
      handleMove(e);

      const onMouseMove = (ev: MouseEvent) => handleMove(ev);
      const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });
  }

  private _setColor(color: string): void {
    this.currentHex = color;
    const rgb = hexToRgb(color);
    if (rgb) {
      const [h, s, v] = rgbToHsv(...rgb);
      this.hue = h;
      this.sat = s;
      this.val = v;
      this._updateVisuals();
    }
  }

  private _updateVisuals(): void {
    const [hr, hg, hb] = hsvToRgb(this.hue, 1, 1);
    const pureHueHex = rgbToHex(hr, hg, hb);
    if (this.satValCanvas) {
      this.satValCanvas.style.backgroundColor = pureHueHex;
    }

    if (this.satValThumb) {
      this.satValThumb.style.left = `${this.sat * 100}%`;
      this.satValThumb.style.top = `${(1 - this.val) * 100}%`;
      this.satValThumb.style.backgroundColor = this.currentHex;
    }

    if (this.hueThumb) {
      this.hueThumb.style.left = `${this.hue * 100}%`;
      this.hueThumb.style.backgroundColor = pureHueHex;
    }

    if (this.previewBox) {
      this.previewBox.style.backgroundColor = this.currentHex;
    }

    if (this.hexInput) {
      this.hexInput.value = this.currentHex.toUpperCase();
    }

    if (this.swatchesWrap) {
      this.swatchesWrap.querySelectorAll('.editkit-tm-swatch').forEach(btn => {
        const c = btn.getAttribute('data-color');
        if (c === this.currentHex.toLowerCase()) {
          btn.classList.add('editkit-tm-swatch--active');
        } else {
          btn.classList.remove('editkit-tm-swatch--active');
        }
      });
    }
  }
}
