// ============================================================
// EditKit — Image Floating Toolbar & 8-Handle Resizer
// Exact match for the EditKit Image Contextual Controls & Resizing
// ============================================================

import type { EditKitEditor } from '@editkit/core';
import { icons } from './icons';

export class ImageFloatingMenu {
  readonly element: HTMLElement;
  private editor: EditKitEditor;
  private activeImg: HTMLImageElement | null = null;
  private resizerBox: HTMLElement;
  private toolbar: HTMLElement;
  private _unsubscribers: (() => void)[] = [];
  private currentRotation: number = 0;

  constructor(editor: EditKitEditor) {
    this.editor = editor;

    // Main wrapper container
    this.element = document.createElement('div');
    this.element.classList.add('editkit-image-overlay-layer');

    // Selection frame box with 8 handles
    this.resizerBox = document.createElement('div');
    this.resizerBox.classList.add('editkit-image-resizer-box');

    // Floating toolbar pill
    this.toolbar = document.createElement('div');
    this.toolbar.classList.add('editkit-image-floating-toolbar');

    this._buildHandles();
    this._buildToolbar();

    this.resizerBox.appendChild(this.toolbar);
    this.element.appendChild(this.resizerBox);

    this._setupListeners();
  }

  mount(container: HTMLElement): void {
    container.appendChild(this.element);
  }

  destroy(): void {
    this._unsubscribers.forEach(fn => fn());
    this.element.remove();
  }

  private _setupListeners(): void {
    // Click on image inside editor
    const onContentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target && target.tagName === 'IMG' && this.editor.contentEl.contains(target)) {
        e.stopPropagation();
        this.selectImage(target as HTMLImageElement);
      } else if (!this.element.contains(target)) {
        this.deselect();
      }
    };

    this.editor.contentEl.addEventListener('click', onContentClick);
    this._unsubscribers.push(() => this.editor.contentEl.removeEventListener('click', onContentClick));

    // Global click outside & Escape key
    const onDocClick = (e: MouseEvent) => {
      if (!this.element.contains(e.target as Node) && e.target !== this.activeImg) {
        this.deselect();
      }
    };

    const onKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this.deselect();
      } else if ((e.key === 'Backspace' || e.key === 'Delete') && this.activeImg && !this.editor.isFocused) {
        this.deleteActiveImage();
      }
    };

    const onScroll = () => this._updatePosition();
    this.editor.contentEl.addEventListener('scroll', onScroll, { passive: true });

    const onWheel = (e: WheelEvent) => {
      this.editor.contentEl.scrollTop += e.deltaY;
      this.editor.contentEl.scrollLeft += e.deltaX;
      this._updatePosition();
    };
    this.element.addEventListener('wheel', onWheel, { passive: true });

    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKeydown);
    window.addEventListener('resize', () => this._updatePosition());
    window.addEventListener('scroll', () => this._updatePosition(), true);

    this._unsubscribers.push(
      () => this.editor.contentEl.removeEventListener('scroll', onScroll),
      () => this.element.removeEventListener('wheel', onWheel),
      () => document.removeEventListener('mousedown', onDocClick),
      () => document.removeEventListener('keydown', onKeydown),
      () => window.removeEventListener('resize', () => this._updatePosition()),
      () => window.removeEventListener('scroll', () => this._updatePosition(), true),
    );
  }

  selectImage(img: HTMLImageElement): void {
    this.activeImg = img;
    this.currentRotation = parseInt(img.getAttribute('data-rotation') || '0', 10);
    this.element.classList.add('editkit-image-overlay-layer--active');
    this._updatePosition();
  }

  deselect(): void {
    this.activeImg = null;
    this.element.classList.remove('editkit-image-overlay-layer--active');
  }

  deleteActiveImage(): void {
    if (!this.activeImg) return;
    const parent = this.activeImg.parentElement;
    this.activeImg.remove();
    this.deselect();
    this.editor.emit('update', { editor: this.editor });
  }

  private _updatePosition(): void {
    if (!this.activeImg || !this.activeImg.isConnected) {
      this.deselect();
      return;
    }

    const imgRect = this.activeImg.getBoundingClientRect();
    if (imgRect.width === 0 && imgRect.height === 0) return;

    const contentRect = this.editor.contentEl.getBoundingClientRect();
    const rootRect = this.editor.root.getBoundingClientRect();

    // Match overlay layer exactly to editor.contentEl to strictly contain the frame
    const layerTop = contentRect.top - rootRect.top;
    const layerLeft = contentRect.left - rootRect.left;
    this.element.style.top = `${layerTop}px`;
    this.element.style.left = `${layerLeft}px`;
    this.element.style.width = `${contentRect.width}px`;
    this.element.style.height = `${contentRect.height}px`;
    this.element.style.overflow = 'hidden';

    // If the image is completely scrolled past the visible content area, hide overlay
    if (imgRect.bottom <= contentRect.top + 5 || imgRect.top >= contentRect.bottom - 5) {
      this.resizerBox.style.display = 'none';
      return;
    } else {
      this.resizerBox.style.display = 'block';
    }

    // Position resizerBox relative to the content area layer
    const top = imgRect.top - contentRect.top;
    const left = imgRect.left - contentRect.left;

    this.resizerBox.style.top = `${top}px`;
    this.resizerBox.style.left = `${left}px`;
    this.resizerBox.style.width = `${imgRect.width}px`;
    this.resizerBox.style.height = `${imgRect.height}px`;

    // Position toolbar: clamp inside the visible area of the image when scrolled near top
    if (top < 42) {
      const maxTop = Math.max(0, imgRect.height - 38);
      const pinnedTop = Math.min(maxTop, -top + 10);
      this.toolbar.style.bottom = 'auto';
      this.toolbar.style.top = `${pinnedTop}px`;
    } else {
      this.toolbar.style.top = 'auto';
      this.toolbar.style.bottom = 'calc(100% + 10px)';
    }
  }

  // ── Build 8 Resize Handles ──
  private _buildHandles(): void {
    const handles = [
      { pos: 'tl', cursor: 'nwse-resize' },
      { pos: 'tc', cursor: 'ns-resize' },
      { pos: 'tr', cursor: 'nesw-resize' },
      { pos: 'ml', cursor: 'ew-resize' },
      { pos: 'mr', cursor: 'ew-resize' },
      { pos: 'bl', cursor: 'nesw-resize' },
      { pos: 'bc', cursor: 'ns-resize' },
      { pos: 'br', cursor: 'nwse-resize' },
    ];

    for (const h of handles) {
      const el = document.createElement('div');
      el.classList.add('editkit-img-handle', `editkit-img-handle--${h.pos}`);
      el.style.cursor = h.cursor;
      this._attachHandleDrag(el, h.pos);
      this.resizerBox.appendChild(el);
    }
  }

  private _attachHandleDrag(handleEl: HTMLElement, pos: string): void {
    handleEl.addEventListener('mousedown', (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!this.activeImg) return;

      const img = this.activeImg;
      const startX = e.clientX;
      const startY = e.clientY;
      const startWidth = img.offsetWidth;
      const startHeight = img.offsetHeight;
      const aspectRatio = startWidth / (startHeight || 1);

      const onMouseMove = (moveEvent: MouseEvent) => {
        const deltaX = moveEvent.clientX - startX;
        const deltaY = moveEvent.clientY - startY;

        let newWidth = startWidth;
        let newHeight = startHeight;

        if (pos === 'br' || pos === 'mr') {
          newWidth = Math.max(60, startWidth + deltaX);
          newHeight = newWidth / aspectRatio;
        } else if (pos === 'bl' || pos === 'ml') {
          newWidth = Math.max(60, startWidth - deltaX);
          newHeight = newWidth / aspectRatio;
        } else if (pos === 'tr') {
          newWidth = Math.max(60, startWidth + deltaX);
          newHeight = newWidth / aspectRatio;
        } else if (pos === 'tl') {
          newWidth = Math.max(60, startWidth - deltaX);
          newHeight = newWidth / aspectRatio;
        } else if (pos === 'bc') {
          newHeight = Math.max(40, startHeight + deltaY);
        } else if (pos === 'tc') {
          newHeight = Math.max(40, startHeight - deltaY);
        }

        img.style.width = `${Math.round(newWidth)}px`;
        img.style.height = (pos === 'bc' || pos === 'tc') ? `${Math.round(newHeight)}px` : 'auto';
        img.style.maxWidth = '100%';

        this._updatePosition();
      };

      const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        this.editor.emit('update', { editor: this.editor });
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });
  }

  // ── Build Floating Toolbar (Screenshot 2 exact 12-button bar) ──
  private _buildToolbar(): void {
    this.toolbar.innerHTML = '';

    const createBtn = (iconHtml: string, title: string, onClick: () => void, isDanger?: boolean, isPill?: boolean, textLabel?: string) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.classList.add('editkit-img-tb-btn');
      if (isDanger) b.classList.add('editkit-img-tb-btn--danger');
      if (isPill) b.classList.add('editkit-img-tb-btn--pill');
      b.setAttribute('title', title);
      b.setAttribute('aria-label', title);
      b.innerHTML = textLabel ? `<span class="editkit-img-tb-pill-text">${textLabel}</span>` : iconHtml;

      b.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
        this._updatePosition();
      });

      return b;
    };

    const addDivider = () => {
      const d = document.createElement('div');
      d.classList.add('editkit-img-tb-divider');
      this.toolbar.appendChild(d);
    };

    // 1. Inline
    this.toolbar.appendChild(createBtn(icons.inlineWrap, 'Inline with text', () => {
      if (!this.activeImg) return;
      this.activeImg.style.display = 'inline-block';
      this.activeImg.style.margin = '0 8px';
      this.activeImg.style.float = 'none';
    }));

    // 2. Break text / Block
    this.toolbar.appendChild(createBtn(icons.breakText, 'Break text (Block)', () => {
      if (!this.activeImg) return;
      this.activeImg.style.display = 'block';
      this.activeImg.style.margin = '1em auto';
      this.activeImg.style.float = 'none';
    }));

    // 3. Align Left
    this.toolbar.appendChild(createBtn(icons.alignImageLeft, 'Align Left', () => {
      if (!this.activeImg) return;
      this.activeImg.style.display = 'inline-block';
      this.activeImg.style.float = 'left';
      this.activeImg.style.margin = '0 16px 12px 0';
    }));

    // 4. Align Center
    this.toolbar.appendChild(createBtn(icons.alignImageCenter, 'Align Center', () => {
      if (!this.activeImg) return;
      this.activeImg.style.display = 'block';
      this.activeImg.style.float = 'none';
      this.activeImg.style.margin = '1em auto';
    }));

    // 5. Align Right
    this.toolbar.appendChild(createBtn(icons.alignImageRight, 'Align Right', () => {
      if (!this.activeImg) return;
      this.activeImg.style.display = 'inline-block';
      this.activeImg.style.float = 'right';
      this.activeImg.style.margin = '0 0 12px 16px';
    }));

    addDivider();

    // 6. Caption Toggle [T]
    this.toolbar.appendChild(createBtn(icons.caption, 'Toggle Caption', () => {
      if (!this.activeImg) return;
      const nextEl = this.activeImg.nextElementSibling;
      if (nextEl && nextEl.classList.contains('editkit-image-caption')) {
        nextEl.remove();
      } else {
        const cap = document.createElement('figcaption');
        cap.classList.add('editkit-image-caption');
        cap.textContent = this.activeImg.alt || 'Add image caption...';
        cap.setAttribute('contenteditable', 'true');
        this.activeImg.insertAdjacentElement('afterend', cap);
      }
    }));

    // 7. Reset Size / Crop
    this.toolbar.appendChild(createBtn(icons.crop, 'Reset size (100%)', () => {
      if (!this.activeImg) return;
      this.activeImg.style.width = '100%';
      this.activeImg.style.height = 'auto';
    }));

    // 8. Rotate ↻
    this.toolbar.appendChild(createBtn(icons.rotate, 'Rotate 90°', () => {
      if (!this.activeImg) return;
      this.currentRotation = (this.currentRotation + 90) % 360;
      this.activeImg.setAttribute('data-rotation', String(this.currentRotation));
      this.activeImg.style.transform = `rotate(${this.currentRotation}deg)`;
    }));

    // 9. Frame / Border
    this.toolbar.appendChild(createBtn(icons.frame, 'Toggle Frame / Border', () => {
      if (!this.activeImg) return;
      this.activeImg.classList.toggle('editkit-image--framed');
    }));

    // 10. ALT Text Button
    this.toolbar.appendChild(createBtn('', 'Edit Alt Text', () => {
      if (!this.activeImg) return;
      const newAlt = prompt('Enter Alt Text (description for image):', this.activeImg.alt || '');
      if (newAlt !== null) {
        this.activeImg.alt = newAlt;
      }
    }, false, true, 'ALT'));

    // 11. Open Link ↗
    this.toolbar.appendChild(createBtn(icons.externalLink, 'Open image in new tab', () => {
      if (this.activeImg?.src) {
        window.open(this.activeImg.src, '_blank');
      }
    }));

    addDivider();

    // 12. Delete 🗑
    this.toolbar.appendChild(createBtn(icons.trash, 'Delete image', () => {
      this.deleteActiveImage();
    }, true));
  }
}
