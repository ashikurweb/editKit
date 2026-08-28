// ============================================================
// EditKit — Document Preview Modal Component
// Responsive Reading Canvas with Device Switcher & Export
// ============================================================

import type { EditKitEditor } from '@editkit/core';
import { Modal } from './Modal';
import { icons } from './icons';

export type PreviewDevice = 'desktop' | 'tablet' | 'mobile';

export class PreviewModal extends Modal {
  private currentDevice: PreviewDevice = 'desktop';
  private previewContentEl!: HTMLElement;
  private statsBadgeEl!: HTMLElement;
  private deviceButtons: Map<PreviewDevice, HTMLButtonElement> = new Map();

  constructor(editor: EditKitEditor) {
    super(editor, {
      title: 'Document Preview',
      className: 'editkit-preview-modal',
      maxWidth: '1060px',
    });

    this._buildPreviewUI();
  }

  private _buildPreviewUI(): void {
    // Custom controls in the header
    const headerControls = document.createElement('div');
    headerControls.className = 'editkit-preview-header-controls';

    // 1. Device Switcher
    const switcher = document.createElement('div');
    switcher.className = 'editkit-preview-device-switcher';

    const devices: { id: PreviewDevice; icon: string; label: string }[] = [
      { id: 'desktop', icon: icons.monitor, label: 'Desktop' },
      { id: 'tablet', icon: icons.tablet, label: 'Tablet' },
      { id: 'mobile', icon: icons.smartphone, label: 'Mobile' },
    ];

    devices.forEach(d => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = `editkit-preview-device-btn ${d.id === this.currentDevice ? 'editkit-preview-device-btn--active' : ''}`;
      b.setAttribute('title', d.label);
      b.setAttribute('aria-label', d.label);
      b.innerHTML = `${d.icon} <span>${d.label}</span>`;
      b.addEventListener('click', () => this.setDevice(d.id));
      switcher.appendChild(b);
      this.deviceButtons.set(d.id, b);
    });

    headerControls.appendChild(switcher);

    // 2. Stats Badge
    this.statsBadgeEl = document.createElement('span');
    this.statsBadgeEl.className = 'editkit-preview-stats-badge';
    headerControls.appendChild(this.statsBadgeEl);

    // Insert controls before the close button in header
    this.headerEl.insertBefore(headerControls, this.closeBtn);

    // Modal Body: Scrollable viewport + Paper sheet
    this.bodyEl.innerHTML = '';
    const viewport = document.createElement('div');
    viewport.className = 'editkit-preview-viewport';

    this.previewContentEl = document.createElement('div');
    this.previewContentEl.className = 'editkit-preview-paper editkit-content';
    this.previewContentEl.setAttribute('contenteditable', 'false');

    viewport.appendChild(this.previewContentEl);
    this.bodyEl.appendChild(viewport);
  }

  setDevice(device: PreviewDevice): void {
    this.currentDevice = device;
    this.deviceButtons.forEach((btn, id) => {
      btn.classList.toggle('editkit-preview-device-btn--active', id === device);
    });

    this.previewContentEl.classList.remove(
      'editkit-preview-paper--desktop',
      'editkit-preview-paper--tablet',
      'editkit-preview-paper--mobile'
    );
    this.previewContentEl.classList.add(`editkit-preview-paper--${device}`);
  }

  private _updateContent(): void {
    const rawHTML = this.editor.getHTML();
    this.previewContentEl.innerHTML = rawHTML || '<p style="color: var(--editkit-text-dim); font-style: italic;">No document content yet.</p>';

    // Calculate word and character stats
    const text = this.previewContentEl.textContent || '';
    const cleanText = text.replace(/\s+/g, ' ').trim();
    const words = cleanText ? cleanText.split(' ').length : 0;
    const chars = cleanText.length;
    const readTime = Math.max(1, Math.ceil(words / 200));

    this.statsBadgeEl.textContent = `${words} words • ${chars} chars • ${readTime} min read`;
  }

  override show(): void {
    this._updateContent();
    this.setDevice(this.currentDevice);
    super.show();
  }
}
