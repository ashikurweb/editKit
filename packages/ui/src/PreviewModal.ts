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
  private copyBtn!: HTMLButtonElement;
  private printBtn!: HTMLButtonElement;
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

    // 3. Action Buttons (Copy HTML & Print)
    const actionsGroup = document.createElement('div');
    actionsGroup.className = 'editkit-preview-actions';

    this.copyBtn = document.createElement('button');
    this.copyBtn.type = 'button';
    this.copyBtn.className = 'editkit-preview-action-btn';
    this.copyBtn.innerHTML = `${icons.copy} <span>Copy HTML</span>`;
    this.copyBtn.addEventListener('click', () => this._copyHTML());
    actionsGroup.appendChild(this.copyBtn);

    this.printBtn = document.createElement('button');
    this.printBtn.type = 'button';
    this.printBtn.className = 'editkit-preview-action-btn editkit-preview-action-btn--primary';
    this.printBtn.innerHTML = `${icons.printer} <span>Print / PDF</span>`;
    this.printBtn.addEventListener('click', () => this._printDocument());
    actionsGroup.appendChild(this.printBtn);

    headerControls.appendChild(actionsGroup);

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

  private async _copyHTML(): Promise<void> {
    try {
      const html = this.editor.getHTML();
      await navigator.clipboard.writeText(html);
      const originalHTML = this.copyBtn.innerHTML;
      this.copyBtn.innerHTML = `<span>✓ Copied!</span>`;
      this.copyBtn.classList.add('editkit-preview-action-btn--success');
      setTimeout(() => {
        this.copyBtn.innerHTML = originalHTML;
        this.copyBtn.classList.remove('editkit-preview-action-btn--success');
      }, 2000);
    } catch {
      alert('Failed to copy HTML to clipboard.');
    }
  }

  private _printDocument(): void {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      window.print();
      return;
    }
    const html = this.editor.getHTML();
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Document Print Preview</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              color: #111;
              line-height: 1.6;
              padding: 40px;
              max-width: 800px;
              margin: 0 auto;
            }
            table { width: 100%; border-collapse: collapse; margin: 16px 0; }
            th, td { border: 1px solid #ccc; padding: 8px 12px; }
            th { background: #f4f4f4; }
            img { max-width: 100%; height: auto; }
            blockquote { border-left: 4px solid #7c3aed; margin: 16px 0; padding: 8px 16px; background: #f9f9fb; }
            code { background: #f1f1f1; padding: 2px 5px; border-radius: 3px; font-family: monospace; }
            pre { background: #f8f8f8; padding: 12px; border-radius: 6px; overflow-x: auto; }
            hr { border: none; border-top: 1px solid #ddd; margin: 24px 0; }
          </style>
        </head>
        <body>
          ${html}
          <script>
            window.onload = () => { window.print(); window.close(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }

  override show(): void {
    this._updateContent();
    this.setDevice(this.currentDevice);
    super.show();
  }
}
