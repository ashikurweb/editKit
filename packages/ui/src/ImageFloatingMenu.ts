import type { EditKitEditor } from '@editkit/core';
import { icons } from './icons';
import { CropModal } from './CropModal';

export class ImageFloatingMenu {
  readonly element: HTMLElement;
  private editor: EditKitEditor;
  private activeImg: HTMLImageElement | null = null;
  private resizerBox: HTMLElement;
  private toolbar: HTMLElement;
  private cropModal: CropModal;
  private _unsubscribers: (() => void)[] = [];
  private currentRotation: number = 0;
  private _isDestroyed: boolean = false;
  private _activeDragCleanup: (() => void) | null = null;

  constructor(editor: EditKitEditor) {
    this.editor = editor;
    this.cropModal = new CropModal(editor);

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
    this._unsubscribers.push(this.editor.on('destroy', () => this.destroy()));
  }

  mount(container: HTMLElement): void {
    container.appendChild(this.element);
  }

  destroy(): void {
    if (this._isDestroyed) return;
    this._isDestroyed = true;
    this._activeDragCleanup?.();
    this._activeDragCleanup = null;
    this._unsubscribers.forEach(fn => fn());
    this._unsubscribers = [];
    this.cropModal.destroy();
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
    const onWindowResize = () => this._updatePosition();
    const onWindowScroll = () => this._updatePosition();
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('scroll', onWindowScroll, true);

    this._unsubscribers.push(
      () => this.editor.contentEl.removeEventListener('scroll', onScroll),
      () => this.element.removeEventListener('wheel', onWheel),
      () => document.removeEventListener('mousedown', onDocClick),
      () => document.removeEventListener('keydown', onKeydown),
      () => window.removeEventListener('resize', onWindowResize),
      () => window.removeEventListener('scroll', onWindowScroll, true),
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
  // ── Build 8 Resize Handles (Screenshot 2 exact match) ──
  private _buildHandles(): void {
    const handles = [
      { pos: 'tl', type: 'corner', cursor: 'nwse-resize' },
      { pos: 'tc', type: 'pill-h', cursor: 'ns-resize' },
      { pos: 'tr', type: 'corner', cursor: 'nesw-resize' },
      { pos: 'ml', type: 'pill-v', cursor: 'ew-resize' },
      { pos: 'mr', type: 'pill-v', cursor: 'ew-resize' },
      { pos: 'bl', type: 'corner', cursor: 'nesw-resize' },
      { pos: 'bc', type: 'pill-h', cursor: 'ns-resize' },
      { pos: 'br', type: 'corner', cursor: 'nwse-resize' },
    ];

    for (const h of handles) {
      const el = document.createElement('div');
      el.classList.add('editkit-img-handle', `editkit-img-handle--${h.pos}`, `editkit-img-handle--${h.type}`);
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

        // Middle Horizontal Pills (ml, mr) -> Change Width ONLY
        if (pos === 'mr') {
          newWidth = Math.max(40, startWidth + deltaX);
        } else if (pos === 'ml') {
          newWidth = Math.max(40, startWidth - deltaX);
        }
        // Middle Vertical Pills (tc, bc) -> Change Height ONLY
        else if (pos === 'bc') {
          newHeight = Math.max(30, startHeight + deltaY);
        } else if (pos === 'tc') {
          newHeight = Math.max(30, startHeight - deltaY);
        }
        // Corner Handles (tl, tr, bl, br) -> Change both (Proportional if Shift is held)
        else if (pos === 'br') {
          newWidth = Math.max(40, startWidth + deltaX);
          newHeight = moveEvent.shiftKey ? (newWidth / aspectRatio) : Math.max(30, startHeight + deltaY);
        } else if (pos === 'bl') {
          newWidth = Math.max(40, startWidth - deltaX);
          newHeight = moveEvent.shiftKey ? (newWidth / aspectRatio) : Math.max(30, startHeight + deltaY);
        } else if (pos === 'tr') {
          newWidth = Math.max(40, startWidth + deltaX);
          newHeight = moveEvent.shiftKey ? (newWidth / aspectRatio) : Math.max(30, startHeight - deltaY);
        } else if (pos === 'tl') {
          newWidth = Math.max(40, startWidth - deltaX);
          newHeight = moveEvent.shiftKey ? (newWidth / aspectRatio) : Math.max(30, startHeight - deltaY);
        }

        img.style.width = `${Math.round(newWidth)}px`;
        img.style.height = `${Math.round(newHeight)}px`;
        img.style.maxWidth = '100%';

        this._updatePosition();
      };

      const cleanupDragListeners = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        if (this._activeDragCleanup === cleanupDragListeners) {
          this._activeDragCleanup = null;
        }
      };

      const onMouseUp = () => {
        cleanupDragListeners();
        if (this._isDestroyed) return;
        this.editor.emit('update', { editor: this.editor });
      };

      this._activeDragCleanup?.();
      this._activeDragCleanup = cleanupDragListeners;
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
      this.activeImg.style.margin = '1em 0';
      this.activeImg.style.float = 'none';
    }));

    addDivider();

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

    // 7. Crop / Resize Modal
    this.toolbar.appendChild(createBtn(icons.crop, 'Crop / Resize Image', () => {
      if (!this.activeImg) return;
      this.cropModal.openForImage(this.activeImg);
    }));

    // 8. Frame / Border
    this.toolbar.appendChild(createBtn(icons.frame, 'Toggle Frame / Border', () => {
      if (!this.activeImg) return;
      this.activeImg.classList.toggle('editkit-image--framed');
    }));

    // 9. ALT Text Button with Popup
    const altBtn = createBtn('', 'Edit Alt Text', () => {
      if (!this.activeImg) return;
      if (this.altPopoverEl.classList.contains('editkit-alt-popover--open')) {
        this._hideAltPopover();
      } else {
        this._showAltPopover();
      }
    }, false, true, 'ALT');
    this.toolbar.appendChild(altBtn);

    // 10. Open Link ↗
    this.toolbar.appendChild(createBtn(icons.externalLink, 'Open image in new tab', () => {
      if (this.activeImg?.src) {
        this._openImageInNewTab(this.activeImg.src, this.activeImg.alt || 'Image Preview');
      }
    }));

    // 11. Delete 🗑
    this.toolbar.appendChild(createBtn(icons.trash, 'Delete image', () => {
      this.deleteActiveImage();
    }, true));

    // Build the Alt text popover container inside the toolbar
    this._buildAltPopover();
  }

  private _openImageInNewTab(src: string, title: string): void {
    if (!src) return;

    if (src.startsWith('data:')) {
      const newTab = window.open('', '_blank');
      if (newTab) {
        newTab.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 24px;
      background: #0f1015;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    img {
      max-width: 95vw;
      max-height: 90vh;
      object-fit: contain;
      box-shadow: 0 16px 48px rgba(0, 0, 0, 0.85);
      border-radius: 8px;
    }
  </style>
</head>
<body>
  <img src="${src}" alt="${title}">
</body>
</html>`);
        newTab.document.close();
      }
    } else {
      window.open(src, '_blank', 'noopener,noreferrer');
    }
  }

  private altPopoverEl!: HTMLElement;
  private altInputEl!: HTMLInputElement;

  private _buildAltPopover(): void {
    this.altPopoverEl = document.createElement('div');
    this.altPopoverEl.classList.add('editkit-alt-popover');
    this.altPopoverEl.innerHTML = `
      <div class="editkit-alt-title">Text alternative</div>
      <div class="editkit-alt-row">
        <input type="text" class="editkit-alt-input" placeholder="Describe this image...">
        <button type="button" class="editkit-alt-save-btn">Save</button>
      </div>
    `;

    this.altInputEl = this.altPopoverEl.querySelector('.editkit-alt-input')!;
    const saveBtn = this.altPopoverEl.querySelector('.editkit-alt-save-btn')!;

    saveBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this._saveAlt();
    });

    this.altInputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this._saveAlt();
      } else if (e.key === 'Escape') {
        this._hideAltPopover();
      }
    });

    this.altPopoverEl.addEventListener('mousedown', (e) => e.stopPropagation());
    this.toolbar.appendChild(this.altPopoverEl);
  }

  private _showAltPopover(): void {
    if (!this.activeImg) return;
    this.altInputEl.value = this.activeImg.alt || '';
    this.altPopoverEl.classList.add('editkit-alt-popover--open');
    setTimeout(() => {
      this.altInputEl.focus();
      this.altInputEl.select();
    }, 30);
  }

  private _hideAltPopover(): void {
    this.altPopoverEl.classList.remove('editkit-alt-popover--open');
  }

  private _saveAlt(): void {
    if (this.activeImg) {
      const val = this.altInputEl.value.trim();
      this.activeImg.alt = val;
      this.activeImg.title = val;
      this.editor.emit('update', { editor: this.editor });
    }
    this._hideAltPopover();
  }
}
