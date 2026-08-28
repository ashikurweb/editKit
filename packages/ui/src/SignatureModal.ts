// ============================================================
// EditKit — Draw & Upload Signature Modal
// Exact match for Screenshot 1: Canvas Drawing, Color Swatches,
// Stroke Size, Undo/Redo, Baseline Guide, Upload & Export.
// ============================================================

import type { EditKitEditor } from '@editkit/core';
import { Modal } from './Modal';
import { icons } from './icons';

interface StrokePoint {
  x: number;
  y: number;
}

interface Stroke {
  color: string;
  size: number;
  points: StrokePoint[];
}

export class SignatureModal extends Modal {
  private canvasEl!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private nameInputEl!: HTMLInputElement;
  private uploadInputEl!: HTMLInputElement;

  private currentColor: string = '#000000';
  private currentSize: number = 4;
  private strokes: Stroke[] = [];
  private redoStrokes: Stroke[] = [];
  private currentStroke: Stroke | null = null;
  private isDrawing: boolean = false;
  private savedRange: Range | null = null;

  // UI elements
  private undoBtn!: HTMLButtonElement;
  private redoBtn!: HTMLButtonElement;
  private clearBtn!: HTMLButtonElement;
  private swatches: HTMLButtonElement[] = [];
  private sizeButtons: HTMLButtonElement[] = [];
  private _globalUnsubscribers: (() => void)[] = [];

  constructor(editor: EditKitEditor) {
    super(editor, {
      className: 'editkit-signature-modal',
      maxWidth: '680px',
    });

    this._buildUI();
  }

  private _buildUI(): void {
    this.bodyEl.innerHTML = '';

    // ── Header Customization ──
    const tagEl = document.createElement('div');
    tagEl.classList.add('editkit-sig-modal-tag');
    tagEl.innerHTML = '<span class="editkit-sig-modal-tag-dot">●</span> SIGNATURE';

    const headerLeft = document.createElement('div');
    headerLeft.appendChild(tagEl);

    this.titleEl.textContent = 'Draw your signature';
    headerLeft.appendChild(this.titleEl);

    const headerRight = document.createElement('div');
    headerRight.classList.add('editkit-sig-header-right');

    const uploadBtn = document.createElement('button');
    uploadBtn.type = 'button';
    uploadBtn.classList.add('editkit-sig-upload-btn');
    uploadBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
      <span>Upload signature</span>
    `;
    uploadBtn.addEventListener('click', () => this.uploadInputEl.click());

    this.uploadInputEl = document.createElement('input');
    this.uploadInputEl.type = 'file';
    this.uploadInputEl.accept = 'image/*';
    this.uploadInputEl.style.display = 'none';
    this.uploadInputEl.addEventListener('change', (e) => this._handleFileUpload(e));

    headerRight.appendChild(uploadBtn);
    headerRight.appendChild(this.uploadInputEl);
    headerRight.appendChild(this.closeBtn);

    this.headerEl.innerHTML = '';
    this.headerEl.appendChild(headerLeft);
    this.headerEl.appendChild(headerRight);

    // ── Name Field ──
    const nameWrap = document.createElement('div');
    nameWrap.classList.add('editkit-sig-name-wrap');

    const nameLabel = document.createElement('label');
    nameLabel.classList.add('editkit-sig-name-label');
    nameLabel.textContent = 'Name';

    this.nameInputEl = document.createElement('input');
    this.nameInputEl.type = 'text';
    this.nameInputEl.classList.add('editkit-sig-name-input');
    this.nameInputEl.value = 'Editkit Support';
    this.nameInputEl.placeholder = 'Your name or title...';

    nameWrap.appendChild(nameLabel);
    nameWrap.appendChild(this.nameInputEl);
    this.bodyEl.appendChild(nameWrap);

    // ── Controls Row: Color Swatches & Stroke Sizes ──
    const controlsRow = document.createElement('div');
    controlsRow.classList.add('editkit-sig-controls-row');

    // Left: Colors
    const colorGroup = document.createElement('div');
    colorGroup.classList.add('editkit-sig-color-group');

    const colorLabel = document.createElement('span');
    colorLabel.classList.add('editkit-sig-control-label');
    colorLabel.textContent = 'Color';
    colorGroup.appendChild(colorLabel);

    const swatchesWrap = document.createElement('div');
    swatchesWrap.classList.add('editkit-sig-swatches');

    const colors = ['#ffffff', '#000000', '#8b5cf6', '#3b82f6', '#06b6d4', '#84cc16'];
    colors.forEach(c => {
      const swatch = document.createElement('button');
      swatch.type = 'button';
      swatch.classList.add('editkit-sig-swatch');
      swatch.style.backgroundColor = c;
      swatch.setAttribute('data-color', c);
      if (c === this.currentColor) swatch.classList.add('editkit-sig-swatch--active');
      swatch.addEventListener('click', () => {
        this.currentColor = c;
        this.swatches.forEach(s => s.classList.toggle('editkit-sig-swatch--active', s.getAttribute('data-color') === c));
      });
      this.swatches.push(swatch);
      swatchesWrap.appendChild(swatch);
    });
    colorGroup.appendChild(swatchesWrap);
    controlsRow.appendChild(colorGroup);

    // Right: Stroke Sizes (3 dots pill)
    const sizePill = document.createElement('div');
    sizePill.classList.add('editkit-sig-size-pill');

    const sizes = [
      { size: 2, dotClass: 'editkit-sig-dot--sm' },
      { size: 4, dotClass: 'editkit-sig-dot--md' },
      { size: 6, dotClass: 'editkit-sig-dot--lg' },
    ];

    sizes.forEach(s => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.classList.add('editkit-sig-size-btn');
      if (s.size === this.currentSize) btn.classList.add('editkit-sig-size-btn--active');
      btn.innerHTML = `<span class="editkit-sig-dot ${s.dotClass}"></span>`;
      btn.addEventListener('click', () => {
        this.currentSize = s.size;
        this.sizeButtons.forEach((b, idx) => b.classList.toggle('editkit-sig-size-btn--active', sizes[idx].size === s.size));
      });
      this.sizeButtons.push(btn);
      sizePill.appendChild(btn);
    });
    controlsRow.appendChild(sizePill);

    this.bodyEl.appendChild(controlsRow);

    // ── Drawing Canvas Board ──
    const canvasWrap = document.createElement('div');
    canvasWrap.classList.add('editkit-sig-canvas-wrap');

    // Canvas action buttons
    const canvasActions = document.createElement('div');
    canvasActions.classList.add('editkit-sig-canvas-actions');

    this.undoBtn = document.createElement('button');
    this.undoBtn.type = 'button';
    this.undoBtn.classList.add('editkit-sig-action-btn');
    this.undoBtn.title = 'Undo (Ctrl+Z)';
    this.undoBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>`;
    this.undoBtn.addEventListener('click', () => this._undo());

    this.redoBtn = document.createElement('button');
    this.redoBtn.type = 'button';
    this.redoBtn.classList.add('editkit-sig-action-btn');
    this.redoBtn.title = 'Redo (Ctrl+Y)';
    this.redoBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/></svg>`;
    this.redoBtn.addEventListener('click', () => this._redo());

    this.clearBtn = document.createElement('button');
    this.clearBtn.type = 'button';
    this.clearBtn.classList.add('editkit-sig-action-btn', 'editkit-sig-clear-btn');
    this.clearBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"/><path d="M22 21H7"/><path d="m5 11 9 9"/></svg>
      <span>Clear Board</span>
    `;
    this.clearBtn.addEventListener('click', () => this._clear());

    canvasActions.appendChild(this.undoBtn);
    canvasActions.appendChild(this.redoBtn);
    canvasActions.appendChild(this.clearBtn);
    canvasWrap.appendChild(canvasActions);

    // Actual HTML Canvas
    this.canvasEl = document.createElement('canvas');
    this.canvasEl.classList.add('editkit-sig-canvas');
    this.canvasEl.width = 640 * 2; // Hi-DPI
    this.canvasEl.height = 280 * 2;
    this.ctx = this.canvasEl.getContext('2d')!;
    this.ctx.scale(2, 2);
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    this._setupCanvasEvents();
    canvasWrap.appendChild(this.canvasEl);

    // Baseline Guide
    const baseline = document.createElement('div');
    baseline.classList.add('editkit-sig-baseline');
    baseline.innerHTML = `
      <div class="editkit-sig-baseline-line"></div>
      <div class="editkit-sig-baseline-text">Sign here — draw large to avoid blank space.</div>
    `;
    canvasWrap.appendChild(baseline);

    this.bodyEl.appendChild(canvasWrap);

    // ── Footer Actions ──
    const footer = document.createElement('div');
    footer.classList.add('editkit-sig-footer');

    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.classList.add('editkit-sig-cancel-btn');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.addEventListener('click', () => this.hide());

    const insertBtn = document.createElement('button');
    insertBtn.type = 'button';
    insertBtn.classList.add('editkit-sig-insert-btn');
    insertBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      <span>Insert</span>
    `;
    insertBtn.addEventListener('click', () => this._insertSignature());

    footer.appendChild(cancelBtn);
    footer.appendChild(insertBtn);
    this.bodyEl.appendChild(footer);
  }

  private _setupCanvasEvents(): void {
    const getPos = (e: MouseEvent | Touch): StrokePoint => {
      const rect = this.canvasEl.getBoundingClientRect();
      const scaleX = 640 / rect.width;
      const scaleY = 280 / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    };

    const startDraw = (pos: StrokePoint) => {
      this.isDrawing = true;
      this.currentStroke = {
        color: this.currentColor,
        size: this.currentSize,
        points: [pos],
      };
      this.strokes.push(this.currentStroke);
      this.redoStrokes = [];
      this._redraw();
    };

    const drawMove = (pos: StrokePoint) => {
      if (!this.isDrawing || !this.currentStroke) return;
      this.currentStroke.points.push(pos);
      this._redraw();
    };

    const endDraw = () => {
      this.isDrawing = false;
      this.currentStroke = null;
    };

    // Mouse listeners
    this.canvasEl.addEventListener('mousedown', (e) => {
      e.preventDefault();
      startDraw(getPos(e));
    });

    const onWindowMouseMove = (e: MouseEvent) => {
      if (!this.isDrawing) return;
      drawMove(getPos(e));
    };
    window.addEventListener('mousemove', onWindowMouseMove);

    const onWindowMouseUp = () => {
      if (this.isDrawing) endDraw();
    };
    window.addEventListener('mouseup', onWindowMouseUp);
    this._globalUnsubscribers.push(
      () => window.removeEventListener('mousemove', onWindowMouseMove),
      () => window.removeEventListener('mouseup', onWindowMouseUp),
    );

    // Touch listeners
    this.canvasEl.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        e.preventDefault();
        startDraw(getPos(e.touches[0]));
      }
    }, { passive: false });

    this.canvasEl.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0 && this.isDrawing) {
        e.preventDefault();
        drawMove(getPos(e.touches[0]));
      }
    }, { passive: false });

    this.canvasEl.addEventListener('touchend', () => {
      if (this.isDrawing) endDraw();
    });
  }

  private _redraw(): void {
    this.ctx.clearRect(0, 0, 640, 280);

    for (const stroke of this.strokes) {
      if (stroke.points.length === 0) continue;

      this.ctx.strokeStyle = stroke.color;
      this.ctx.lineWidth = stroke.size;
      this.ctx.beginPath();

      if (stroke.points.length === 1) {
        const pt = stroke.points[0];
        this.ctx.fillStyle = stroke.color;
        this.ctx.arc(pt.x, pt.y, stroke.size / 2, 0, Math.PI * 2);
        this.ctx.fill();
        continue;
      }

      this.ctx.moveTo(stroke.points[0].x, stroke.points[0].y);

      for (let i = 1; i < stroke.points.length - 1; i++) {
        const xc = (stroke.points[i].x + stroke.points[i + 1].x) / 2;
        const yc = (stroke.points[i].y + stroke.points[i + 1].y) / 2;
        this.ctx.quadraticCurveTo(stroke.points[i].x, stroke.points[i].y, xc, yc);
      }

      const last = stroke.points[stroke.points.length - 1];
      const prev = stroke.points[stroke.points.length - 2];
      this.ctx.quadraticCurveTo(prev.x, prev.y, last.x, last.y);
      this.ctx.stroke();
    }
  }

  private _undo(): void {
    if (this.strokes.length === 0) return;
    const s = this.strokes.pop();
    if (s) {
      this.redoStrokes.push(s);
      this._redraw();
    }
  }

  private _redo(): void {
    if (this.redoStrokes.length === 0) return;
    const s = this.redoStrokes.pop();
    if (s) {
      this.strokes.push(s);
      this._redraw();
    }
  }

  private _clear(): void {
    this.strokes = [];
    this.redoStrokes = [];
    this._redraw();
  }

  private _handleFileUpload(e: Event): void {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      const img = new Image();
      img.onload = () => {
        this.ctx.clearRect(0, 0, 640, 280);
        // Draw centered and scaled
        const scale = Math.min((640 - 40) / img.width, (280 - 40) / img.height, 1);
        const w = img.width * scale;
        const h = img.height * scale;
        const x = (640 - w) / 2;
        const y = (280 - h) / 2;
        this.ctx.drawImage(img, x, y, w, h);
      };
      img.src = loadEvt.target?.result as string;
    };
    reader.readAsDataURL(file);
    this.uploadInputEl.value = '';
  }

  private _insertSignature(): void {
    if (this.strokes.length === 0 && this._isCanvasBlank()) {
      alert('Please draw or upload your signature before inserting.');
      return;
    }

    const name = this.nameInputEl.value.trim() || 'Signature';

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }) + ` at ` + now.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    const cardDataUrl = this._exportSignatureCard(name, dateStr);

    if (this.savedRange) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(this.savedRange);
      }
    }

    // Insert signature card image into editor
    this.editor.commands.insertImage({
      src: cardDataUrl,
      alt: `Signature by ${name} (${dateStr})`,
      title: `${name} — ${dateStr}`,
      width: '360px',
    });

    this.hide();
  }

  private _exportSignatureCard(name: string, dateStr: string): string {
    const scale = 2;
    const cardW = 380 * scale;
    const cardH = 250 * scale;
    const radius = 14 * scale;

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = cardW;
    exportCanvas.height = cardH;
    const ctx = exportCanvas.getContext('2d')!;

    // 1. White rounded card background
    ctx.beginPath();
    ctx.moveTo(radius, 0);
    ctx.lineTo(cardW - radius, 0);
    ctx.quadraticCurveTo(cardW, 0, cardW, radius);
    ctx.lineTo(cardW, cardH - radius);
    ctx.quadraticCurveTo(cardW, cardH, cardW - radius, cardH);
    ctx.lineTo(radius, cardH);
    ctx.quadraticCurveTo(0, cardH, 0, cardH - radius);
    ctx.lineTo(0, radius);
    ctx.quadraticCurveTo(0, 0, radius, 0);
    ctx.closePath();

    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1.5 * scale;
    ctx.stroke();

    // 2. Draw drawn signature centered in top section (height = 175 * scale)
    const sigSectionH = 175 * scale;
    const fitScale = Math.min((cardW - 40 * scale) / this.canvasEl.width, (sigSectionH - 24 * scale) / this.canvasEl.height);
    const drawW = this.canvasEl.width * fitScale;
    const drawH = this.canvasEl.height * fitScale;
    const drawX = (cardW - drawW) / 2;
    const drawY = (sigSectionH - drawH) / 2 + 6 * scale;

    ctx.drawImage(this.canvasEl, drawX, drawY, drawW, drawH);

    // 3. Divider line
    ctx.beginPath();
    ctx.moveTo(0, sigSectionH);
    ctx.lineTo(cardW, sigSectionH);
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1 * scale;
    ctx.stroke();

    // 4. Metadata footer: "by {Name}" and "{Timestamp}"
    ctx.fillStyle = '#0f172a';
    ctx.font = `700 ${13 * scale}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`;
    ctx.fillText(`by ${name}`, 18 * scale, sigSectionH + 28 * scale);

    ctx.fillStyle = '#64748b';
    ctx.font = `500 ${11 * scale}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`;
    ctx.fillText(dateStr, 18 * scale, sigSectionH + 52 * scale);

    return exportCanvas.toDataURL('image/png');
  }

  private _isCanvasBlank(): boolean {
    const blank = document.createElement('canvas');
    blank.width = this.canvasEl.width;
    blank.height = this.canvasEl.height;
    return this.canvasEl.toDataURL() === blank.toDataURL();
  }

  override show(): void {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && this.editor.contentEl.contains(sel.anchorNode)) {
      this.savedRange = sel.getRangeAt(0).cloneRange();
    } else {
      this.savedRange = null;
    }

    super.show();
    this._clear();
  }

  override destroy(): void {
    if (this._isDestroyed) return;
    this.isDrawing = false;
    this.currentStroke = null;
    this.savedRange = null;
    this._globalUnsubscribers.forEach(unsubscribe => unsubscribe());
    this._globalUnsubscribers = [];
    super.destroy();
  }
}
