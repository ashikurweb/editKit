// ============================================================
// Vellora — Advanced Color Picker Popover (100% EDDYTER Match)
// Tabs + Hex Bar + Preset Swatches + Full 2D HSV Custom Picker
// ============================================================

import type { VelloraEditor } from '@vellora/core';

export const EDDYTER_EXACT_PALETTE = [
  // Row 1
  '#ffffff', '#3b82f6', '#67e8f9', '#2dd4bf', '#fbbf24', '#f87171', '#d946ef',
  // Row 2
  '#4b5563', '#2563eb', '#38bdf8', '#10b981', '#ef4444', '#f97316', '#a855f7',
  // Row 3
  '#000000', '#1e40af', '#334155', '#84cc16', '#92400e', '#991b1b', '#581c87',
];

// ── Color Utilities ──
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

export class ColorPickerPopover {
  readonly element: HTMLElement;
  private editor: VelloraEditor;
  private currentMode: 'text' | 'background' = 'text';

  // State
  private currentHex: string = '#000000';
  private hue: number = 0; // 0 to 1
  private sat: number = 1; // 0 to 1
  private val: number = 1; // 0 to 1
  private isCustomPickerOpen: boolean = true;

  // DOM Elements
  private previewBox!: HTMLElement;
  private hexInput!: HTMLInputElement;
  private satValCanvas!: HTMLElement;
  private satValThumb!: HTMLElement;
  private hueSlider!: HTMLElement;
  private hueThumb!: HTMLElement;
  private swatchesWrap!: HTMLElement;

  private onApplyCallback?: (color: string, mode: 'text' | 'background') => void;
  private onCloseCallback?: () => void;

  constructor(
    editor: VelloraEditor,
    onApply?: (color: string, mode: 'text' | 'background') => void,
    onClose?: () => void
  ) {
    this.editor = editor;
    this.onApplyCallback = onApply;
    this.onCloseCallback = onClose;

    this.element = document.createElement('div');
    this.element.classList.add('vellora-color-picker');

    this._render();
  }

  private _render(): void {
    this.element.innerHTML = '';

    // ── 1. Top Tabs (Text A | Background) ──
    const tabs = document.createElement('div');
    tabs.classList.add('vellora-color-tabs');

    const textTab = document.createElement('button');
    textTab.type = 'button';
    textTab.classList.add('vellora-color-tab');
    if (this.currentMode === 'text') textTab.classList.add('vellora-color-tab--active');
    textTab.innerHTML = `<span>Text</span> <span class="vellora-color-tab-pill">A</span>`;
    textTab.addEventListener('mousedown', (e) => {
      e.preventDefault();
      this.currentMode = 'text';
      textTab.classList.add('vellora-color-tab--active');
      bgTab.classList.remove('vellora-color-tab--active');
    });

    const bgTab = document.createElement('button');
    bgTab.type = 'button';
    bgTab.classList.add('vellora-color-tab');
    if (this.currentMode === 'background') bgTab.classList.add('vellora-color-tab--active');
    bgTab.innerHTML = `<span>Background</span>`;
    bgTab.addEventListener('mousedown', (e) => {
      e.preventDefault();
      this.currentMode = 'background';
      bgTab.classList.add('vellora-color-tab--active');
      textTab.classList.remove('vellora-color-tab--active');
    });

    tabs.appendChild(textTab);
    tabs.appendChild(bgTab);
    this.element.appendChild(tabs);

    // ── 2. "Colours" Title ──
    const title = document.createElement('div');
    title.classList.add('vellora-color-section-title');
    title.textContent = 'Colours';
    this.element.appendChild(title);

    // ── 3. Hex Input Bar with Preview Swatch ──
    const hexRow = document.createElement('div');
    hexRow.classList.add('vellora-color-hex-bar');

    this.previewBox = document.createElement('div');
    this.previewBox.classList.add('vellora-color-preview-box');
    this.previewBox.style.backgroundColor = this.currentHex;

    const hexInputBox = document.createElement('div');
    hexInputBox.classList.add('vellora-color-hex-box');

    const hashSpan = document.createElement('span');
    hashSpan.classList.add('vellora-color-hash-symbol');
    hashSpan.textContent = '#';

    this.hexInput = document.createElement('input');
    this.hexInput.type = 'text';
    this.hexInput.classList.add('vellora-color-hex-text');
    this.hexInput.value = this.currentHex.replace('#', '');
    this.hexInput.maxLength = 6;
    this.hexInput.spellcheck = false;

    this.hexInput.addEventListener('input', () => {
      const val = this.hexInput.value.trim();
      if (val.length === 3 || val.length === 6) {
        const rgb = hexToRgb(val);
        if (rgb) {
          this.currentHex = '#' + val;
          const [h, s, v] = rgbToHsv(...rgb);
          this.hue = h;
          this.sat = s;
          this.val = v;
          this._updateCustomPickerVisuals();
          this._applyCurrentColor();
        }
      }
    });

    hexInputBox.appendChild(hashSpan);
    hexInputBox.appendChild(this.hexInput);
    hexRow.appendChild(this.previewBox);
    hexRow.appendChild(hexInputBox);
    this.element.appendChild(hexRow);

    // ── 4. Preset Palette (3 rows x 7 swatches) ──
    this.swatchesWrap = document.createElement('div');
    this.swatchesWrap.classList.add('vellora-color-swatches-grid');

    for (const color of EDDYTER_EXACT_PALETTE) {
      const swatch = document.createElement('button');
      swatch.type = 'button';
      swatch.classList.add('vellora-color-swatch-btn');
      swatch.style.backgroundColor = color;
      swatch.setAttribute('data-color', color.toLowerCase());

      if (color.toLowerCase() === this.currentHex.toLowerCase()) {
        swatch.classList.add('vellora-color-swatch-btn--active');
      }

      swatch.addEventListener('mousedown', (e) => {
        e.preventDefault();
        this._setColor(color);
      });

      this.swatchesWrap.appendChild(swatch);
    }
    this.element.appendChild(this.swatchesWrap);

    // ── 5. Collapsible "▼ Custom Picker" Header ──
    const customHeader = document.createElement('div');
    customHeader.classList.add('vellora-color-custom-header');
    customHeader.innerHTML = `
      <span class="vellora-color-custom-arrow">${this.isCustomPickerOpen ? '▼' : '▶'}</span>
      <span class="vellora-color-custom-title">Custom Picker</span>
    `;

    const customBody = document.createElement('div');
    customBody.classList.add('vellora-color-custom-body');
    if (!this.isCustomPickerOpen) customBody.style.display = 'none';

    customHeader.addEventListener('mousedown', (e) => {
      e.preventDefault();
      this.isCustomPickerOpen = !this.isCustomPickerOpen;
      customBody.style.display = this.isCustomPickerOpen ? 'block' : 'none';
      customHeader.querySelector('.vellora-color-custom-arrow')!.textContent = this.isCustomPickerOpen ? '▼' : '▶';
    });

    this.element.appendChild(customHeader);

    // ── 6. 2D Saturation / Value Box ──
    this.satValCanvas = document.createElement('div');
    this.satValCanvas.classList.add('vellora-color-satval-canvas');

    const whiteGrad = document.createElement('div');
    whiteGrad.classList.add('vellora-color-satval-white');
    const blackGrad = document.createElement('div');
    blackGrad.classList.add('vellora-color-satval-black');

    this.satValThumb = document.createElement('div');
    this.satValThumb.classList.add('vellora-color-satval-thumb');

    this.satValCanvas.appendChild(whiteGrad);
    this.satValCanvas.appendChild(blackGrad);
    this.satValCanvas.appendChild(this.satValThumb);
    customBody.appendChild(this.satValCanvas);

    this._setupSatValDragging();

    // ── 7. Hue Slider Bar ──
    const hueWrap = document.createElement('div');
    hueWrap.classList.add('vellora-color-hue-wrap');

    this.hueSlider = document.createElement('div');
    this.hueSlider.classList.add('vellora-color-hue-slider');

    this.hueThumb = document.createElement('div');
    this.hueThumb.classList.add('vellora-color-hue-thumb');

    this.hueSlider.appendChild(this.hueThumb);
    hueWrap.appendChild(this.hueSlider);
    customBody.appendChild(hueWrap);

    this._setupHueDragging();

    this.element.appendChild(customBody);

    // Initial visual sync
    this._updateCustomPickerVisuals();
  }

  // ── 2D Saturation / Brightness Drag Handler ──
  private _setupSatValDragging(): void {
    const handleMove = (e: MouseEvent) => {
      const rect = this.satValCanvas.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));

      this.sat = x / rect.width;
      this.val = 1 - (y / rect.height);

      this._computeAndUpdateHex();
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

  // ── Rainbow Hue Slider Drag Handler ──
  private _setupHueDragging(): void {
    const handleMove = (e: MouseEvent) => {
      const rect = this.hueSlider.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      this.hue = x / rect.width;
      this._computeAndUpdateHex();
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

  private _computeAndUpdateHex(): void {
    const [r, g, b] = hsvToRgb(this.hue, this.sat, this.val);
    this.currentHex = rgbToHex(r, g, b);
    this._updateCustomPickerVisuals();
    this._applyCurrentColor();
  }

  private _updateCustomPickerVisuals(): void {
    // 1. Base Hue Color on 2D canvas
    const [hr, hg, hb] = hsvToRgb(this.hue, 1, 1);
    const pureHueHex = rgbToHex(hr, hg, hb);
    this.satValCanvas.style.backgroundColor = pureHueHex;

    // 2. Position 2D Thumb
    const xPct = this.sat * 100;
    const yPct = (1 - this.val) * 100;
    this.satValThumb.style.left = `${xPct}%`;
    this.satValThumb.style.top = `${yPct}%`;
    this.satValThumb.style.backgroundColor = this.currentHex;

    // 3. Position Hue Thumb
    const hueXPct = this.hue * 100;
    this.hueThumb.style.left = `${hueXPct}%`;
    this.hueThumb.style.backgroundColor = pureHueHex;

    // 4. Update Preview Box & Input
    this.previewBox.style.backgroundColor = this.currentHex;
    this.hexInput.value = this.currentHex.replace('#', '');

    // 5. Update Active Swatch
    this.swatchesWrap?.querySelectorAll('.vellora-color-swatch-btn').forEach(btn => {
      const col = btn.getAttribute('data-color');
      if (col === this.currentHex.toLowerCase()) {
        btn.classList.add('vellora-color-swatch-btn--active');
      } else {
        btn.classList.remove('vellora-color-swatch-btn--active');
      }
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
      this._updateCustomPickerVisuals();
    }
    this._applyCurrentColor();
  }

  private _applyCurrentColor(): void {
    if (this.onApplyCallback) {
      this.onApplyCallback(this.currentHex, this.currentMode);
    } else {
      if (this.currentMode === 'text') {
        this.editor.commands.setTextColor(this.currentHex);
      } else {
        this.editor.commands.setHighlight(this.currentHex);
      }
    }
  }
}
