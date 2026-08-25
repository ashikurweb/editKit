// ============================================================
// Vellora — Global Reusable Toast Notification Component
// Supports warning, success, info, and error notifications
// ============================================================

import type { VelloraEditor } from '@vellora/core';
import { icons } from './icons';

export type ToastType = 'warning' | 'success' | 'info' | 'error';

export interface ToastOptions {
  message: string;
  type?: ToastType;
  duration?: number;
}

export class Toast {
  private static activeToast: HTMLElement | null = null;
  private static hideTimer: any = null;

  /**
   * Displays a global toast notification within the editor container
   */
  static show(editor: VelloraEditor, options: ToastOptions | string): HTMLElement {
    const opts: ToastOptions = typeof options === 'string'
      ? { message: options, type: 'warning', duration: 2500 }
      : { type: 'warning', duration: 2500, ...options };

    // Dismiss existing toast immediately
    if (this.activeToast) {
      clearTimeout(this.hideTimer);
      this.activeToast.remove();
      this.activeToast = null;
    }

    const toast = document.createElement('div');
    toast.classList.add('vellora-toast', `vellora-toast--${opts.type}`);
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'polite');

    let iconSvg = icons.alertTriangle;
    if (opts.type === 'success') iconSvg = icons.check;
    else if (opts.type === 'error') iconSvg = icons.close;
    else if (opts.type === 'info') iconSvg = icons.sparkles;

    toast.innerHTML = `
      <span class="vellora-toast-icon">${iconSvg}</span>
      <span class="vellora-toast-msg">${opts.message}</span>
    `;

    const targetContainer = editor.root || document.body;
    targetContainer.appendChild(toast);
    this.activeToast = toast;

    // Click to dismiss
    toast.addEventListener('click', () => {
      this.dismiss(toast);
    });

    // Auto dismiss after duration
    if (opts.duration && opts.duration > 0) {
      this.hideTimer = setTimeout(() => {
        this.dismiss(toast);
      }, opts.duration);
    }

    return toast;
  }

  static dismiss(toastEl?: HTMLElement | null): void {
    const target = toastEl || this.activeToast;
    if (!target) return;

    target.classList.add('vellora-toast--hiding');
    setTimeout(() => {
      target.remove();
      if (this.activeToast === target) {
        this.activeToast = null;
      }
    }, 200);
  }
}

/** Convenience helper function */
export function showToast(editor: VelloraEditor, options: ToastOptions | string): HTMLElement {
  return Toast.show(editor, options);
}
