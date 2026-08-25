// ============================================================
// EditKit — Image & Signature Crop Modal
// Exact match for Screenshot 3: Interactive 3x3 Crop Box,
// Aspect Ratio Presets (Freeform, Original, 1:1, 4:3, 16:9, 3:4, 9:16),
// Live Dimension Display (492 x 207 px), Reset & Apply.
// ============================================================

import type { EditKitEditor } from '@editkit/core';
import { Modal } from './Modal';

type AspectRatioPreset = 'freeform' | 'original' | '1:1' | '4:3' | '16:9' | '3:4' | '9:16';

export class CropModal extends Modal {
  private targetImg: HTMLImageElement | null = null;
  private previewImgEl!: HTMLImageElement;
  private previewContainer!: HTMLElement;
  private cropBoxEl!: HTMLElement;
  private sizeDisplayEl!: HTMLElement;
  private ratioDisplayEl!: HTMLElement;

  private selectedRatio: AspectRatioPreset = 'freeform';
  private naturalWidth: number = 0;
  private naturalHeight: number = 0;

  // Crop box coordinates relative to preview container
  private cropX: number = 20;
  private cropY: number = 20;
  private cropW: number = 200;
  private cropH: number = 150;

  // Active ratio buttons map
  private ratioBtns: Map<AspectRatioPreset, HTMLButtonElement> = new Map();

  constructor(editor: EditKitEditor) {
    super(editor, {
      className: 'editkit-crop-modal',
      maxWidth: '860px',
    });

    this._buildUI();
  }

  private _buildUI(): void {
    this.bodyEl.innerHTML = '';

    const layout = document.createElement('div');
    layout.classList.add('editkit-crop-layout');

    // ── 1. LEFT: Dark Checkered Preview Canvas ──
    const leftPane = document.createElement('div');
    leftPane.classList.add('editkit-crop-preview-pane');

    this.previewContainer = document.createElement('div');
    this.previewContainer.classList.add('editkit-crop-preview-box');

    this.previewImgEl = document.createElement('img');
    this.previewImgEl.classList.add('editkit-crop-preview-img');
    this.previewImgEl.alt = 'Crop preview';
    this.previewContainer.appendChild(this.previewImgEl);

    // Interactive Crop Selection Box
    this.cropBoxEl = document.createElement('div');
    this.cropBoxEl.classList.add('editkit-crop-box');

    // 3x3 Grid Lines
    const gridLines = document.createElement('div');
    gridLines.classList.add('editkit-crop-grid');
    gridLines.innerHTML = `
      <div class="editkit-crop-grid-h1"></div>
      <div class="editkit-crop-grid-h2"></div>
      <div class="editkit-crop-grid-v1"></div>
      <div class="editkit-crop-grid-v2"></div>
    `;
    this.cropBoxEl.appendChild(gridLines);

    // Handles: 4 Corner squares & 4 edge pills
    this._buildCropHandles();
    this.previewContainer.appendChild(this.cropBoxEl);
    leftPane.appendChild(this.previewContainer);
    layout.appendChild(leftPane);

    // ── 2. RIGHT: Sidebar Controls ──
    const sidebar = document.createElement('div');
    sidebar.classList.add('editkit-crop-sidebar');

    const headerWrap = document.createElement('div');
    headerWrap.classList.add('editkit-crop-header-wrap');

    const titleRow = document.createElement('div');
    titleRow.classList.add('editkit-crop-title-row');

    const title = document.createElement('h3');
    title.classList.add('editkit-crop-title');
    title.textContent = 'Crop';

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.classList.add('editkit-crop-close-btn');
    closeBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
    closeBtn.addEventListener('click', () => this.hide());

    titleRow.appendChild(title);
    titleRow.appendChild(closeBtn);

    const subtitle = document.createElement('p');
    subtitle.classList.add('editkit-crop-subtitle');
    subtitle.textContent = 'Choose an aspect ratio and adjust the crop area, then click Apply.';

    headerWrap.appendChild(titleRow);
    headerWrap.appendChild(subtitle);
    sidebar.appendChild(headerWrap);

    // Aspect Ratio Grid
    const ratioSection = document.createElement('div');
    ratioSection.classList.add('editkit-crop-section');

    const ratioLabel = document.createElement('div');
    ratioLabel.classList.add('editkit-crop-label');
    ratioLabel.textContent = 'ASPECT RATIO';
    ratioSection.appendChild(ratioLabel);

    const ratioGrid = document.createElement('div');
    ratioGrid.classList.add('editkit-crop-ratio-grid');

    const ratios: Array<{ id: AspectRatioPreset; label: string; iconSvg: string }> = [
      {
        id: 'freeform',
        label: 'Freeform',
        iconSvg: `<svg width="18" height="14" viewBox="0 0 18 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="2 2"><rect x="1" y="1" width="16" height="12" rx="2"/></svg>`,
      },
      {
        id: 'original',
        label: 'Original',
        iconSvg: `<svg width="18" height="14" viewBox="0 0 18 14" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="1" width="16" height="12" rx="2"/></svg>`,
      },
      {
        id: '1:1',
        label: '1:1',
        iconSvg: `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="1" width="12" height="12" rx="2"/></svg>`,
      },
      {
        id: '4:3',
        label: '4:3',
        iconSvg: `<svg width="18" height="14" viewBox="0 0 18 14" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="2" width="16" height="10" rx="2"/></svg>`,
      },
      {
        id: '16:9',
        label: '16:9',
        iconSvg: `<svg width="18" height="12" viewBox="0 0 18 12" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="2" width="16" height="8" rx="2"/></svg>`,
      },
      {
        id: '3:4',
        label: '3:4',
        iconSvg: `<svg width="14" height="18" viewBox="0 0 14 18" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="1" width="10" height="16" rx="2"/></svg>`,
      },
      {
        id: '9:16',
        label: '9:16',
        iconSvg: `<svg width="12" height="18" viewBox="0 0 12 18" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="1" width="8" height="16" rx="2"/></svg>`,
      },
    ];

    ratios.forEach(r => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.classList.add('editkit-crop-ratio-btn');
      if (r.id === this.selectedRatio) btn.classList.add('editkit-crop-ratio-btn--active');
      btn.innerHTML = `
        <div class="editkit-crop-ratio-icon">${r.iconSvg}</div>
        <span class="editkit-crop-ratio-name">${r.label}</span>
      `;
      btn.addEventListener('click', () => {
        this.selectedRatio = r.id;
        this._updateRatioBtns();
        this._applyRatioConstraints();
      });
      this.ratioBtns.set(r.id, btn);
      ratioGrid.appendChild(btn);
    });

    ratioSection.appendChild(ratioGrid);
    sidebar.appendChild(ratioSection);

    // Info Meta Card
    const infoCard = document.createElement('div');
    infoCard.classList.add('editkit-crop-info-card');

    const sizeRow = document.createElement('div');
    sizeRow.classList.add('editkit-crop-info-row');
    sizeRow.innerHTML = `
      <span class="editkit-crop-info-label">Crop size</span>
      <span class="editkit-crop-info-val editkit-crop-info-val--blue" id="crop-size-val">492 × 207 px</span>
    `;
    this.sizeDisplayEl = sizeRow.querySelector('#crop-size-val')!;

    const ratioRow = document.createElement('div');
    ratioRow.classList.add('editkit-crop-info-row');
    ratioRow.innerHTML = `
      <span class="editkit-crop-info-label">Aspect ratio</span>
      <span class="editkit-crop-info-val" id="crop-ratio-val">Freeform</span>
    `;
    this.ratioDisplayEl = ratioRow.querySelector('#crop-ratio-val')!;

    infoCard.appendChild(sizeRow);
    infoCard.appendChild(ratioRow);
    sidebar.appendChild(infoCard);

    // Footer Actions
    const footer = document.createElement('div');
    footer.classList.add('editkit-crop-footer');

    const resetBtn = document.createElement('button');
    resetBtn.type = 'button';
    resetBtn.classList.add('editkit-crop-reset-btn');
    resetBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
      <span>Reset</span>
    `;
    resetBtn.addEventListener('click', () => this._resetCrop());

    const rightBtns = document.createElement('div');
    rightBtns.classList.add('editkit-crop-footer-right');

    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.classList.add('editkit-crop-cancel-btn');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.addEventListener('click', () => this.hide());

    const applyBtn = document.createElement('button');
    applyBtn.type = 'button';
    applyBtn.classList.add('editkit-crop-apply-btn');
    applyBtn.textContent = 'Apply';
    applyBtn.addEventListener('click', () => this._applyCrop());

    rightBtns.appendChild(cancelBtn);
    rightBtns.appendChild(applyBtn);

    footer.appendChild(resetBtn);
    footer.appendChild(rightBtns);
    sidebar.appendChild(footer);

    layout.appendChild(sidebar);
    this.bodyEl.appendChild(layout);

    this._setupDragAndResize();
  }

  private _buildCropHandles(): void {
    // 4 Corners (squares) and 4 Edges (pills)
    const handles = [
      { id: 'tl', type: 'corner', cursor: 'nwse-resize' },
      { id: 'tr', type: 'corner', cursor: 'nesw-resize' },
      { id: 'bl', type: 'corner', cursor: 'nesw-resize' },
      { id: 'br', type: 'corner', cursor: 'nwse-resize' },
      { id: 'tc', type: 'pill', cursor: 'ns-resize' },
      { id: 'bc', type: 'pill', cursor: 'ns-resize' },
      { id: 'ml', type: 'pill', cursor: 'ew-resize' },
      { id: 'mr', type: 'pill', cursor: 'ew-resize' },
    ];

    handles.forEach(h => {
      const el = document.createElement('div');
      el.classList.add('editkit-crop-handle', `editkit-crop-handle--${h.id}`, `editkit-crop-handle--${h.type}`);
      el.setAttribute('data-handle', h.id);
      this.cropBoxEl.appendChild(el);
    });
  }

  private _setupDragAndResize(): void {
    let activeHandle: string | null = null;
    let isMovingBox = false;
    let startX = 0;
    let startY = 0;
    let startBoxX = 0;
    let startBoxY = 0;
    let startBoxW = 0;
    let startBoxH = 0;

    this.cropBoxEl.addEventListener('mousedown', (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const handleAttr = target.getAttribute('data-handle');

      startX = e.clientX;
      startY = e.clientY;
      startBoxX = this.cropX;
      startBoxY = this.cropY;
      startBoxW = this.cropW;
      startBoxH = this.cropH;

      if (handleAttr) {
        e.stopPropagation();
        e.preventDefault();
        activeHandle = handleAttr;
      } else {
        e.preventDefault();
        isMovingBox = true;
      }
    });

    window.addEventListener('mousemove', (e: MouseEvent) => {
      if (!activeHandle && !isMovingBox) return;

      const pRect = this.previewImgEl.getBoundingClientRect();
      const maxW = pRect.width || 480;
      const maxH = pRect.height || 300;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      if (isMovingBox) {
        this.cropX = Math.max(0, Math.min(maxW - this.cropW, startBoxX + dx));
        this.cropY = Math.max(0, Math.min(maxH - this.cropH, startBoxY + dy));
      } else if (activeHandle) {
        let newW = startBoxW;
        let newH = startBoxH;
        let newX = startBoxX;
        let newY = startBoxY;

        if (activeHandle.includes('r')) newW = Math.max(40, Math.min(maxW - startBoxX, startBoxW + dx));
        if (activeHandle.includes('b')) newH = Math.max(30, Math.min(maxH - startBoxY, startBoxH + dy));
        if (activeHandle.includes('l')) {
          const delta = Math.min(dx, startBoxW - 40);
          newX = Math.max(0, startBoxX + delta);
          newW = startBoxW - (newX - startBoxX);
        }
        if (activeHandle.includes('t')) {
          const delta = Math.min(dy, startBoxH - 30);
          newY = Math.max(0, startBoxY + delta);
          newH = startBoxH - (newY - startBoxY);
        }

        this.cropX = newX;
        this.cropY = newY;
        this.cropW = newW;
        this.cropH = newH;
      }

      this._renderCropBox();
    });

    window.addEventListener('mouseup', () => {
      activeHandle = null;
      isMovingBox = false;
    });
  }

  private _updateRatioBtns(): void {
    this.ratioBtns.forEach((btn, ratioKey) => {
      btn.classList.toggle('editkit-crop-ratio-btn--active', ratioKey === this.selectedRatio);
    });
    this.ratioDisplayEl.textContent = this.selectedRatio.charAt(0).toUpperCase() + this.selectedRatio.slice(1);
  }

  private _applyRatioConstraints(): void {
    const pRect = this.previewImgEl.getBoundingClientRect();
    const maxW = pRect.width || 480;
    const maxH = pRect.height || 300;

    let targetRatio: number | null = null;
    switch (this.selectedRatio) {
      case '1:1': targetRatio = 1; break;
      case '4:3': targetRatio = 4 / 3; break;
      case '16:9': targetRatio = 16 / 9; break;
      case '3:4': targetRatio = 3 / 4; break;
      case '9:16': targetRatio = 9 / 16; break;
      case 'original': targetRatio = this.naturalWidth / (this.naturalHeight || 1); break;
      case 'freeform':
      default:
        targetRatio = null;
        break;
    }

    if (targetRatio) {
      this.cropW = Math.min(maxW - this.cropX, this.cropW);
      this.cropH = this.cropW / targetRatio;
      if (this.cropH > maxH - this.cropY) {
        this.cropH = maxH - this.cropY;
        this.cropW = this.cropH * targetRatio;
      }
    }

    this._renderCropBox();
  }

  private _renderCropBox(): void {
    this.cropBoxEl.style.left = `${this.cropX}px`;
    this.cropBoxEl.style.top = `${this.cropY}px`;
    this.cropBoxEl.style.width = `${this.cropW}px`;
    this.cropBoxEl.style.height = `${this.cropH}px`;

    // Calculate actual pixel dimensions
    const pRect = this.previewImgEl.getBoundingClientRect();
    const scaleX = (this.naturalWidth || pRect.width || 1) / (pRect.width || 1);
    const scaleY = (this.naturalHeight || pRect.height || 1) / (pRect.height || 1);

    const realW = Math.round(this.cropW * scaleX);
    const realH = Math.round(this.cropH * scaleY);
    this.sizeDisplayEl.textContent = `${realW} × ${realH} px`;
  }

  private _resetCrop(): void {
    const pRect = this.previewImgEl.getBoundingClientRect();
    const maxW = pRect.width || 480;
    const maxH = pRect.height || 300;

    this.cropX = 20;
    this.cropY = 20;
    this.cropW = maxW - 40;
    this.cropH = maxH - 40;
    this.selectedRatio = 'freeform';
    this._updateRatioBtns();
    this._renderCropBox();
  }

  private _applyCrop(): void {
    if (!this.targetImg) return;

    const pRect = this.previewImgEl.getBoundingClientRect();
    const scaleX = this.naturalWidth / (pRect.width || 1);
    const scaleY = this.naturalHeight / (pRect.height || 1);

    const sourceX = this.cropX * scaleX;
    const sourceY = this.cropY * scaleY;
    const sourceW = this.cropW * scaleX;
    const sourceH = this.cropH * scaleY;

    const canvas = document.createElement('canvas');
    canvas.width = sourceW;
    canvas.height = sourceH;
    const ctx = canvas.getContext('2d')!;

    const tempImg = new Image();
    tempImg.crossOrigin = 'anonymous';
    tempImg.onload = () => {
      ctx.drawImage(tempImg, sourceX, sourceY, sourceW, sourceH, 0, 0, sourceW, sourceH);
      const croppedDataUrl = canvas.toDataURL('image/png');
      if (this.targetImg) {
        this.targetImg.src = croppedDataUrl;
        this.editor.emit('update', { editor: this.editor });
      }
      this.hide();
    };
    tempImg.src = this.targetImg.src;
  }

  openForImage(img: HTMLImageElement): void {
    this.targetImg = img;
    this.previewImgEl.src = img.src;

    const tmp = new Image();
    tmp.onload = () => {
      this.naturalWidth = tmp.naturalWidth || tmp.width;
      this.naturalHeight = tmp.naturalHeight || tmp.height;
      this.show();

      setTimeout(() => {
        this._resetCrop();
      }, 50);
    };
    tmp.src = img.src;
  }
}
