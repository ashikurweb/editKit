// ============================================================
// EditKit — Global Base Modal Component
// Provides common overlay, container, header, close & lifecycle
// ============================================================

import type { EditKitEditor } from '@editkit/core';
import { icons } from './icons';

export interface ModalOptions {
  title?: string;
  className?: string;
  maxWidth?: string;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
}

export class Modal {
  readonly overlayEl: HTMLElement;
  readonly modalEl: HTMLElement;
  readonly headerEl: HTMLElement;
  readonly titleEl: HTMLElement;
  readonly closeBtn: HTMLButtonElement;
  readonly bodyEl: HTMLElement;

  protected editor: EditKitEditor;
  protected options: ModalOptions;
  private _isMounted: boolean = false;
  private _keydownHandler: (e: KeyboardEvent) => void;

  constructor(editor: EditKitEditor, options: ModalOptions = {}) {
    this.editor = editor;
    this.options = {
      closeOnOverlayClick: true,
      closeOnEscape: true,
      ...options,
    };

    // 1. Overlay
    this.overlayEl = document.createElement('div');
    this.overlayEl.classList.add('editkit-modal-overlay');
    this.overlayEl.setAttribute('role', 'dialog');
    this.overlayEl.setAttribute('aria-modal', 'true');

    // 2. Modal Container
    this.modalEl = document.createElement('div');
    this.modalEl.classList.add('editkit-modal');
    if (this.options.className) {
      this.modalEl.classList.add(...this.options.className.split(' ').filter(Boolean));
    }
    if (this.options.maxWidth) {
      this.modalEl.style.maxWidth = this.options.maxWidth;
    }

    // 3. Header & Close Button
    this.headerEl = document.createElement('div');
    this.headerEl.classList.add('editkit-modal-header');

    this.titleEl = document.createElement('h3');
    this.titleEl.classList.add('editkit-modal-title');
    this.titleEl.textContent = this.options.title || '';

    this.closeBtn = document.createElement('button');
    this.closeBtn.type = 'button';
    this.closeBtn.classList.add('editkit-modal-close');
    this.closeBtn.setAttribute('title', 'Close (Esc)');
    this.closeBtn.setAttribute('aria-label', 'Close');
    this.closeBtn.innerHTML = icons.close;
    this.closeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.hide();
    });

    if (this.options.title) {
      this.headerEl.appendChild(this.titleEl);
    }
    this.headerEl.appendChild(this.closeBtn);

    // 4. Body
    this.bodyEl = document.createElement('div');
    this.bodyEl.classList.add('editkit-modal-body');

    this.modalEl.appendChild(this.headerEl);
    this.modalEl.appendChild(this.bodyEl);
    this.overlayEl.appendChild(this.modalEl);

    // 5. Overlay Click Listener
    this.overlayEl.addEventListener('mousedown', (e: MouseEvent) => {
      if (e.target === this.overlayEl && this.options.closeOnOverlayClick) {
        this.hide();
      }
    });

    // 6. Escape Key Listener
    this._keydownHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && this.isOpen() && this.options.closeOnEscape) {
        this.hide();
      }
    };
    document.addEventListener('keydown', this._keydownHandler);
  }

  isOpen(): boolean {
    return this.overlayEl.classList.contains('editkit-modal-overlay--open');
  }

  show(): void {
    if (!this._isMounted || !this.overlayEl.parentElement) {
      document.body.appendChild(this.overlayEl);
      this._isMounted = true;
    }
    this.overlayEl.classList.add('editkit-modal-overlay--open');
    this.options.onOpen?.();
  }

  hide(): void {
    if (this.isOpen()) {
      this.overlayEl.classList.remove('editkit-modal-overlay--open');
      this.options.onClose?.();
    }
  }

  setTitle(title: string): void {
    this.titleEl.textContent = title;
    if (title && !this.titleEl.parentElement) {
      this.headerEl.insertBefore(this.titleEl, this.closeBtn);
    }
  }

  destroy(): void {
    document.removeEventListener('keydown', this._keydownHandler);
    this.overlayEl.remove();
  }
}
