// ============================================================
// EditKit — In-Place Floating Link Popover & Hover Preview/Editor
// Supports hover preview on existing links + direct in-place editing
// Warning popup toast if user attempts to link with no text selected
// ============================================================

import type { EditKitEditor } from '@editkit/core';
import { icons } from './icons';
import { showToast } from './Toast';

function normalizeLinkURL(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const compact = trimmed.replace(/[\u0000-\u0020\u007f-\u009f]/g, '');
  const scheme = compact.match(/^([a-z][a-z0-9+.-]*):/i)?.[1]?.toLowerCase();
  if (scheme) {
    return ['http', 'https', 'mailto', 'tel'].includes(scheme) ? trimmed : null;
  }
  if (/^(?:#|\/|\.\/|\.\.\/|\?)/.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export class LinkPopover {
  readonly element: HTMLElement;
  private editor: EditKitEditor;
  private savedRange: Range | null = null;
  private targetAnchor: HTMLAnchorElement | null = null;
  private mode: 'preview' | 'edit' = 'edit';

  private inputEl!: HTMLInputElement;
  private isVisible: boolean = false;
  private justOpened: boolean = false;
  private hideTimeout: ReturnType<typeof setTimeout> | null = null;
  private focusTimeout: ReturnType<typeof setTimeout> | null = null;
  private justOpenedTimeout: ReturnType<typeof setTimeout> | null = null;
  private onCloseCallback?: () => void;
  private _unsubscribers: (() => void)[] = [];
  private _isDestroyed: boolean = false;

  constructor(editor: EditKitEditor, onClose?: () => void) {
    this.editor = editor;
    this.onCloseCallback = onClose;

    this.element = document.createElement('div');
    this.element.classList.add('editkit-link-popover');
    this.element.setAttribute('role', 'dialog');
    this.element.setAttribute('aria-label', 'Link menu');

    this._setupGlobalListeners();
  }

  private _render(): void {
    this.element.innerHTML = '';

    if (this.mode === 'preview' && this.targetAnchor) {
      this._renderPreviewMode();
    } else {
      this._renderEditMode();
    }
  }

  // ── 1. Preview Mode: [ 🔗 URL ↗ ] | [ ✎ Edit ] | [ 🗑 Remove ] ──
  private _renderPreviewMode(): void {
    const url = this.targetAnchor?.getAttribute('href') || 'https://';
    const safeURL = normalizeLinkURL(url);

    // Link URL display with external open icon
    const linkPreview = document.createElement('a');
    linkPreview.classList.add('editkit-link-preview-url');
    linkPreview.href = safeURL || '#';
    linkPreview.target = '_blank';
    linkPreview.rel = 'noopener noreferrer';
    linkPreview.title = url;

    const displayUrl = url.replace(/^https?:\/\//i, '');
    const display = document.createElement('span');
    display.textContent = displayUrl;
    linkPreview.innerHTML = icons.link;
    linkPreview.append(document.createTextNode(' '), display, document.createTextNode(' '));
    linkPreview.insertAdjacentHTML('beforeend', icons.externalLink);
    if (!safeURL) linkPreview.addEventListener('click', event => event.preventDefault());

    // Divider
    const div1 = document.createElement('div');
    div1.classList.add('editkit-link-popover-divider');

    // Edit button (✎)
    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.classList.add('editkit-link-action-btn', 'editkit-link-action-btn--edit');
    editBtn.setAttribute('title', 'Edit link');
    editBtn.setAttribute('aria-label', 'Edit link');
    editBtn.innerHTML = `${icons.edit} <span>Edit</span>`;
    editBtn.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.mode = 'edit';
      this._render();
      if (this.focusTimeout) clearTimeout(this.focusTimeout);
      this.focusTimeout = setTimeout(() => {
        this.inputEl.focus();
        this.inputEl.select();
        this.focusTimeout = null;
      }, 40);
    });

    // Divider
    const div2 = document.createElement('div');
    div2.classList.add('editkit-link-popover-divider');

    // Unlink button (🗑)
    const unlinkBtn = document.createElement('button');
    unlinkBtn.type = 'button';
    unlinkBtn.classList.add('editkit-link-action-btn', 'editkit-link-action-btn--unlink');
    unlinkBtn.setAttribute('title', 'Remove link');
    unlinkBtn.setAttribute('aria-label', 'Remove link');
    unlinkBtn.innerHTML = icons.unlink || icons.trash;
    unlinkBtn.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this._removeLink();
    });

    this.element.appendChild(linkPreview);
    this.element.appendChild(div1);
    this.element.appendChild(editBtn);
    this.element.appendChild(div2);
    this.element.appendChild(unlinkBtn);
  }

  // ── 2. Edit Mode: [ Input ] [ ✓ Apply ] [ ✕ Cancel ] ──
  private _renderEditMode(): void {
    const existingHref = this.targetAnchor?.getAttribute('href') || '';

    this.inputEl = document.createElement('input');
    this.inputEl.type = 'url';
    this.inputEl.classList.add('editkit-link-input');
    this.inputEl.placeholder = 'https://';
    this.inputEl.value = existingHref || 'https://';

    // Green check apply button
    const applyBtn = document.createElement('button');
    applyBtn.type = 'button';
    applyBtn.classList.add('editkit-link-apply-btn');
    applyBtn.setAttribute('title', 'Apply Link (Enter)');
    applyBtn.setAttribute('aria-label', 'Apply Link');
    applyBtn.innerHTML = icons.check;
    applyBtn.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this._applyLink();
    });

    // Close / Cancel button
    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.classList.add('editkit-link-cancel-btn');
    cancelBtn.setAttribute('title', 'Cancel (Esc)');
    cancelBtn.setAttribute('aria-label', 'Cancel');
    cancelBtn.innerHTML = icons.close;
    cancelBtn.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.hide();
    });

    // Keyboard handlers
    this.inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this._applyLink();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        this.hide();
      }
    });

    this.element.appendChild(this.inputEl);
    this.element.appendChild(applyBtn);
    this.element.appendChild(cancelBtn);
  }

  private _setupGlobalListeners(): void {
    // 1. Track selection range when selection changes
    const unsubscribeSelection = this.editor.on('selectionUpdate', () => {
      if (this.isVisible && this.mode === 'edit') return;
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0 && this.editor.contentEl.contains(sel.anchorNode)) {
        this.savedRange = sel.getRangeAt(0).cloneRange();

        // Check if selection is inside an anchor
        const anchor = this._findAnchor(sel.anchorNode);
        if (anchor && (!this.isVisible || this.targetAnchor !== anchor)) {
          this.targetAnchor = anchor;
          this.showPreview(anchor);
        } else if (!anchor && this.mode === 'preview' && this.isVisible) {
          this.hide();
        }
      }
    });
    this._unsubscribers.push(unsubscribeSelection);

    // 2. Mouseover on links inside editor content
    const onContentMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = (target.tagName === 'A' ? target : target.closest('a')) as HTMLAnchorElement | null;
      if (anchor && this.editor.contentEl.contains(anchor)) {
        if (this.hideTimeout) clearTimeout(this.hideTimeout);
        this.targetAnchor = anchor;
        this.showPreview(anchor);
      }
    };
    this.editor.contentEl.addEventListener('mouseover', onContentMouseOver);

    // Mouseleave handler with grace delay
    const onContentMouseOut = (e: MouseEvent) => {
      const related = e.relatedTarget as Node | null;
      if (this.element.contains(related)) return;

      if (this.isVisible && this.mode === 'preview') {
        this.hideTimeout = setTimeout(() => {
          this.hide();
        }, 300);
      }
    };
    this.editor.contentEl.addEventListener('mouseout', onContentMouseOut);

    const onPopoverMouseEnter = () => {
      if (this.hideTimeout) clearTimeout(this.hideTimeout);
    };
    this.element.addEventListener('mouseenter', onPopoverMouseEnter);

    const onPopoverMouseLeave = () => {
      if (this.isVisible && this.mode === 'preview') {
        this.hideTimeout = setTimeout(() => {
          this.hide();
        }, 200);
      }
    };
    this.element.addEventListener('mouseleave', onPopoverMouseLeave);

    // Close on click outside
    const onDocumentMouseDown = (e: MouseEvent) => {
      if (!this.isVisible || this.justOpened) return;
      const target = e.target as Node;
      if (!this.element.contains(target)) {
        this.hide();
      }
    };
    document.addEventListener('mousedown', onDocumentMouseDown);

    // Close on Escape
    const onDocumentKeyDown = (e: KeyboardEvent) => {
      if (!this.isVisible) return;
      if (e.key === 'Escape') {
        this.hide();
      }
    };
    document.addEventListener('keydown', onDocumentKeyDown);

    this._unsubscribers.push(
      () => this.editor.contentEl.removeEventListener('mouseover', onContentMouseOver),
      () => this.editor.contentEl.removeEventListener('mouseout', onContentMouseOut),
      () => this.element.removeEventListener('mouseenter', onPopoverMouseEnter),
      () => this.element.removeEventListener('mouseleave', onPopoverMouseLeave),
      () => document.removeEventListener('mousedown', onDocumentMouseDown),
      () => document.removeEventListener('keydown', onDocumentKeyDown),
    );
  }

  showPreview(anchor: HTMLAnchorElement): void {
    if (this.hideTimeout) clearTimeout(this.hideTimeout);
    this.targetAnchor = anchor;
    this.mode = 'preview';
    this._render();
    this._mountAndPosition(anchor.getBoundingClientRect());
  }

  showEdit(anchor?: HTMLAnchorElement, targetRect?: DOMRect): void {
    if (this.hideTimeout) clearTimeout(this.hideTimeout);
    if (anchor) this.targetAnchor = anchor;
    this.mode = 'edit';
    this._render();

    let rect: DOMRect | null = targetRect || null;
    if (!rect) {
      if (this.targetAnchor) {
        rect = this.targetAnchor.getBoundingClientRect();
      } else if (this.savedRange) {
        rect = this.savedRange.getBoundingClientRect();
      }
    }

    if (!rect || (rect.width === 0 && rect.height === 0)) {
      rect = this.editor.contentEl.getBoundingClientRect();
    }

    this._mountAndPosition(rect);

    if (this.focusTimeout) clearTimeout(this.focusTimeout);
    this.focusTimeout = setTimeout(() => {
      this.inputEl?.focus();
      this.inputEl?.select();
      this.focusTimeout = null;
    }, 40);
  }

  show(targetRect?: DOMRect): void {
    const sel = window.getSelection();
    let hasSelectedText = false;
    let anchor: HTMLAnchorElement | null = null;

    if (sel && sel.rangeCount > 0 && this.editor.contentEl.contains(sel.anchorNode)) {
      this.savedRange = sel.getRangeAt(0).cloneRange();
      anchor = this._findAnchor(sel.anchorNode);
      hasSelectedText = !sel.isCollapsed && sel.toString().trim().length > 0;
    } else if (this.savedRange) {
      hasSelectedText = !this.savedRange.collapsed && this.savedRange.toString().trim().length > 0;
      anchor = this._findAnchor(this.savedRange.startContainer);
    }

    // If no text is selected and cursor is not inside an existing link -> Show Global Warning Toast!
    if (!hasSelectedText && !anchor) {
      showToast(this.editor, {
        message: 'Please select text first to insert a link',
        type: 'warning',
        duration: 2500,
      });
      return;
    }

    this.targetAnchor = anchor;
    this.showEdit(anchor ?? undefined, targetRect);
  }

  hide(): void {
    if (this.isVisible) {
      this.element.classList.remove('editkit-link-popover--visible');
      this.isVisible = false;
      this.targetAnchor = null;
      this.mode = 'edit';
      this.onCloseCallback?.();
    }
  }

  private _mountAndPosition(rect: DOMRect): void {
    this.justOpened = true;
    if (this.justOpenedTimeout) clearTimeout(this.justOpenedTimeout);
    this.justOpenedTimeout = setTimeout(() => {
      this.justOpened = false;
      this.justOpenedTimeout = null;
    }, 150);

    if (!this.element.parentElement) {
      this.editor.root.appendChild(this.element);
    }

    this.element.classList.add('editkit-link-popover--visible');
    this.isVisible = true;

    const rootRect = this.editor.root.getBoundingClientRect();
    const top = (rect.bottom - rootRect.top) + 6;
    let left = (rect.left - rootRect.left);

    const popoverWidth = this.element.offsetWidth || 300;
    if (left + popoverWidth > rootRect.width - 12) {
      left = Math.max(12, rootRect.width - popoverWidth - 12);
    }
    if (left < 12) left = 12;

    this.element.style.top = `${top}px`;
    this.element.style.left = `${left}px`;
  }

  private _applyLink(): void {
    const rawUrl = this.inputEl.value.trim();
    if (!rawUrl || rawUrl === 'https://' || rawUrl === 'http://') {
      this._removeLink();
      return;
    }

    const url = normalizeLinkURL(rawUrl);
    if (!url) {
      this.inputEl.setCustomValidity('Use a safe http(s), mailto, tel, or relative URL.');
      this.inputEl.reportValidity();
      return;
    }
    this.inputEl.setCustomValidity('');

    if (this.targetAnchor && this.targetAnchor.isConnected) {
      this.targetAnchor.setAttribute('href', url);
      this.targetAnchor.setAttribute('target', '_blank');
      this.targetAnchor.setAttribute('rel', 'noopener noreferrer');
      this.editor.emit('update', { editor: this.editor });
    } else {
      this._restoreSelection();
      this.editor.commands.setLink({ url, target: '_blank' });
    }

    this.hide();
  }

  private _removeLink(): void {
    if (this.targetAnchor && this.targetAnchor.isConnected) {
      const parent = this.targetAnchor.parentNode;
      if (parent) {
        while (this.targetAnchor.firstChild) {
          parent.insertBefore(this.targetAnchor.firstChild, this.targetAnchor);
        }
        this.targetAnchor.remove();
        this.editor.emit('update', { editor: this.editor });
      }
    } else {
      this._restoreSelection();
      this.editor.commands.unsetLink();
    }
    this.hide();
  }

  private _findAnchor(node: Node | null): HTMLAnchorElement | null {
    let current: Node | null = node;
    while (current && current !== this.editor.contentEl) {
      if (current.nodeType === Node.ELEMENT_NODE && (current as HTMLElement).tagName === 'A') {
        return current as HTMLAnchorElement;
      }
      current = current.parentNode;
    }
    return null;
  }

  private _restoreSelection(): void {
    if (!this.savedRange) return;
    this.editor.focus();
    const sel = window.getSelection();
    if (sel) {
      sel.removeAllRanges();
      sel.addRange(this.savedRange);
    }
  }

  destroy(): void {
    if (this._isDestroyed) return;
    this._isDestroyed = true;
    if (this.hideTimeout) clearTimeout(this.hideTimeout);
    if (this.focusTimeout) clearTimeout(this.focusTimeout);
    if (this.justOpenedTimeout) clearTimeout(this.justOpenedTimeout);
    this.hideTimeout = null;
    this.focusTimeout = null;
    this.justOpenedTimeout = null;
    this._unsubscribers.forEach(unsubscribe => unsubscribe());
    this._unsubscribers = [];
    this.savedRange = null;
    this.targetAnchor = null;
    this.isVisible = false;
    this.element.remove();
  }
}
