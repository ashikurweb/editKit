// ============================================================
// EditKit — Cell Background Color Modal (Image 3 exact match)
// Extends global Modal component with Hex, Swatches, 2D Picker & Hue Slider
// ============================================================

import type { EditKitEditor } from '@editkit/core';
import { Modal } from './Modal';

export const TABLE_CELL_SWATCHES = [
  '#ef4444', '#f97316', '#eab308', '#854d0e', '#84cc16', '#15803d', '#d946ef',
  '#8b5cf6', '#3b82f6', '#14b8a6', '#bef264', '#000000', '#4b5563', '#9ca3af', '#ffffff'
];

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

export class TableCellColorModal extends Modal {
  private currentHex: string = '#6B7280';
  private hue: number = 0.6;
  private sat: number = 0.5;
  private val: number = 0.5;
  private targetCell: HTMLTableCellElement | null = null;

  private previewBox!: HTMLElement;
  private hexInput!: HTMLInputElement;
  private satValCanvas!: HTMLElement;
  private satValThumb!: HTMLElement;
  private hueSlider!: HTMLElement;
  private hueThumb!: HTMLElement;
  private swatchesWrap!: HTMLElement;

  constructor(editor: EditKitEditor) {
    super(editor, {
      title: 'Cell Background Color',
      className: 'editkit-table-modal editkit-table-color-modal',
      maxWidth: '440px',
    });

    this._buildUI();
  }

  show(initialOrCell?: string | HTMLTableCellElement): void {
    if (initialOrCell instanceof HTMLElement) {
      this.targetCell = initialOrCell;
      if (this.targetCell.style.backgroundColor) {
        this._setColor(this.targetCell.style.backgroundColor);
      }
    } else if (typeof initialOrCell === 'string') {
      this.targetCell = this.editor.getActiveTableCell?.()?.cell ?? null;
      this._setColor(initialOrCell);
    } else {
      this.targetCell = this.editor.getActiveTableCell?.()?.cell ?? null;
      if (this.targetCell && this.targetCell.style.backgroundColor) {
        this._setColor(this.targetCell.style.backgroundColor);
      }
    }
    super.show();
  }

  private _buildUI(): void {
    this.bodyEl.innerHTML = '';

    // ── 1. Hex Row: "Hex" label + Input (left) & Preview Box (right) ──
    const hexRow = document.createElement('div');
    hexRow.className = 'editkit-tm-hex-row';

    const hexLeft = document.createElement('div');
    hexLeft.className = 'editkit-tm-hex-left';

    const hexLabel = document.createElement('span');
    hexLabel.className = 'editkit-tm-hex-label';
    hexLabel.textContent = 'Hex';

    this.hexInput = document.createElement('input');
    this.hexInput.type = 'text';
    this.hexInput.className = 'editkit-tm-hex-input';
    this.hexInput.value = this.currentHex.toLowerCase();
    this.hexInput.maxLength = 7;

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

    hexLeft.appendChild(hexLabel);
    hexLeft.appendChild(this.hexInput);

    this.previewBox = document.createElement('div');
    this.previewBox.className = 'editkit-tm-preview-box';
    this.previewBox.style.backgroundColor = this.currentHex;

    hexRow.appendChild(hexLeft);
    hexRow.appendChild(this.previewBox);
    this.bodyEl.appendChild(hexRow);

    // ── 2. Preset Swatches Row ──
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
    this.bodyEl.appendChild(this.swatchesWrap);

    // ── 3. 2D Saturation / Value Gradient Canvas ──
    const satValWrap = document.createElement('div');
    satValWrap.className = 'editkit-tm-satval-wrap';

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
    satValWrap.appendChild(this.satValCanvas);
    this.bodyEl.appendChild(satValWrap);

    this._setupSatValDragging();

    // ── 4. Rainbow Hue Slider Bar ──
    const sliderWrap = document.createElement('div');
    sliderWrap.className = 'editkit-tm-hue-wrap';

    this.hueSlider = document.createElement('div');
    this.hueSlider.className = 'editkit-tm-hue-slider';

    this.hueThumb = document.createElement('div');
    this.hueThumb.className = 'editkit-tm-hue-thumb';

    this.hueSlider.appendChild(this.hueThumb);
    sliderWrap.appendChild(this.hueSlider);
    this.bodyEl.appendChild(sliderWrap);

    this._setupHueDragging();

    // ── 5. Apply Button (Full width white pill button) ──
    const applyBtn = document.createElement('button');
    applyBtn.type = 'button';
    applyBtn.className = 'editkit-tm-apply-btn';
    applyBtn.textContent = 'Apply Color';

    applyBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (this.targetCell) {
        this.targetCell.style.backgroundColor = this.currentHex;
        (this.editor as any)._saveHistory?.();
        (this.editor as any)._emitUpdate?.();
      } else {
        this.editor.commands.setCellBackground(this.currentHex);
      }
      this.hide();
    });

    this.bodyEl.appendChild(applyBtn);

    this._updateVisuals();
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
      this.hexInput.value = this.currentHex.toLowerCase();
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
