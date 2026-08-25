// ============================================================
// Vellora — Image Upload & Insert Modal
// Extends global reusable Modal component with Staging, Progress & URL insertion
// ============================================================

import type { VelloraEditor } from '@vellora/core';
import { Modal } from './Modal';
import { icons } from './icons';

interface StagedImage {
  id: string;
  file: File;
  dataUrl: string;
  name: string;
  alt: string;
}

export class ImageModal extends Modal {
  private currentView: 'dropzone' | 'url' = 'dropzone';
  private stagedImages: StagedImage[] = [];
  private isUploading: boolean = false;

  constructor(editor: VelloraEditor) {
    super(editor, {
      className: 'vellora-image-modal',
      maxWidth: '640px',
    });

    this._setupImageListeners();
  }

  show(initialView: 'dropzone' | 'url' = 'dropzone'): void {
    this.currentView = initialView;
    this._renderView();
    super.show();
  }

  hide(): void {
    if (this.isUploading) return;
    super.hide();
    this.currentView = 'dropzone';
    this.stagedImages = [];
  }

  private _setupImageListeners(): void {
    // Support direct clipboard paste when modal is open
    document.addEventListener('paste', (e: ClipboardEvent) => {
      if (!this.isOpen() || this.isUploading) return;

      if (this.currentView === 'url' && document.activeElement?.tagName === 'INPUT') {
        return;
      }

      if (e.clipboardData?.items) {
        for (const item of Array.from(e.clipboardData.items)) {
          if (item.type.startsWith('image/')) {
            const file = item.getAsFile();
            if (file) {
              e.preventDefault();
              this._stageFiles([file]);
              return;
            }
          }
        }
      }

      const text = (e.clipboardData?.getData('text/plain') || '').trim();
      if (text) {
        const isImageUrl = /^https?:\/\/.+\.(png|jpg|jpeg|gif|webp|svg|avif)(\?.*)?$/i.test(text)
          || /^data:image\/[a-zA-Z+]+;base64,/.test(text)
          || (/^https?:\/\/(images\.unsplash\.com|cdn\.|i\.imgur\.com|media\.)/i.test(text));

        if (isImageUrl) {
          e.preventDefault();
          this.editor.commands.insertImage({ src: text, alt: 'Inserted image' });
          this.hide();
        }
      }
    });
  }

  private _renderView(): void {
    this.bodyEl.innerHTML = '';

    if (this.currentView === 'dropzone') {
      this._renderDropzoneView();
    } else {
      this._renderUrlView();
    }
  }

  // ── 1. Dropzone View ──
  private _renderDropzoneView(): void {
    const dropzone = document.createElement('div');
    dropzone.classList.add('vellora-img-dropzone');

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.multiple = true;
    fileInput.classList.add('vellora-img-file-input');
    fileInput.style.display = 'none';

    fileInput.addEventListener('change', () => {
      if (fileInput.files && fileInput.files.length > 0) {
        this._stageFiles(Array.from(fileInput.files));
      }
    });

    const iconBadge = document.createElement('div');
    iconBadge.classList.add('vellora-img-icon-badge');
    iconBadge.innerHTML = icons.image;

    const title = document.createElement('h3');
    title.classList.add('vellora-img-dropzone-title');
    title.textContent = 'Drop your images here';

    const subtitle = document.createElement('p');
    subtitle.classList.add('vellora-img-dropzone-subtitle');
    subtitle.textContent = 'PNG, JPG, GIF or other image files — select as many as you like';

    dropzone.appendChild(iconBadge);
    dropzone.appendChild(title);
    dropzone.appendChild(subtitle);
    dropzone.appendChild(fileInput);

    dropzone.addEventListener('click', () => {
      if (!this.isUploading) fileInput.click();
    });

    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      if (!this.isUploading) dropzone.classList.add('vellora-img-dropzone--dragover');
    });

    dropzone.addEventListener('dragleave', () => {
      dropzone.classList.remove('vellora-img-dropzone--dragover');
    });

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('vellora-img-dropzone--dragover');
      if (!this.isUploading && e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        this._stageFiles(Array.from(e.dataTransfer.files));
      }
    });

    this.bodyEl.appendChild(dropzone);

    // ── Staged Images List ──
    if (this.stagedImages.length > 0) {
      const stagingWrap = document.createElement('div');
      stagingWrap.classList.add('vellora-img-staging-wrap');

      const stagingHeader = document.createElement('div');
      stagingHeader.classList.add('vellora-img-staging-header');
      stagingHeader.innerHTML = `
        <span class="vellora-img-count-text">${this.stagedImages.length} image${this.stagedImages.length > 1 ? 's' : ''} selected</span>
      `;

      const clearBtn = document.createElement('button');
      clearBtn.type = 'button';
      clearBtn.classList.add('vellora-img-clear-all-btn');
      clearBtn.textContent = 'Clear all';
      clearBtn.addEventListener('click', () => {
        if (!this.isUploading) {
          this.stagedImages = [];
          this._renderView();
        }
      });
      stagingHeader.appendChild(clearBtn);
      stagingWrap.appendChild(stagingHeader);

      const list = document.createElement('div');
      list.classList.add('vellora-img-staged-list');

      for (const item of this.stagedImages) {
        const card = document.createElement('div');
        card.classList.add('vellora-img-staged-card');

        // Thumbnail
        const thumb = document.createElement('img');
        thumb.classList.add('vellora-img-staged-thumb');
        thumb.src = item.dataUrl;

        // Meta (File Name & Alt Text input)
        const meta = document.createElement('div');
        meta.classList.add('vellora-img-staged-meta');

        const name = document.createElement('div');
        name.classList.add('vellora-img-staged-name');
        name.textContent = item.name;

        const altInput = document.createElement('input');
        altInput.type = 'text';
        altInput.classList.add('vellora-img-staged-alt');
        altInput.placeholder = 'Alt text (describes this image)';
        altInput.value = item.alt;
        altInput.addEventListener('input', () => {
          item.alt = altInput.value;
        });

        meta.appendChild(name);
        meta.appendChild(altInput);

        // Delete button
        const delBtn = document.createElement('button');
        delBtn.type = 'button';
        delBtn.classList.add('vellora-img-staged-del');
        delBtn.setAttribute('title', 'Remove image');
        delBtn.innerHTML = icons.trash;
        delBtn.addEventListener('click', () => {
          if (!this.isUploading) {
            this.stagedImages = this.stagedImages.filter(x => x.id !== item.id);
            this._renderView();
          }
        });

        card.appendChild(thumb);
        card.appendChild(meta);
        card.appendChild(delBtn);
        list.appendChild(card);
      }

      stagingWrap.appendChild(list);

      // Upload Button with animated progress
      const uploadBtn = document.createElement('button');
      uploadBtn.type = 'button';
      uploadBtn.classList.add('vellora-img-upload-btn');
      uploadBtn.innerHTML = `
        <span class="vellora-img-upload-bar"></span>
        <span class="vellora-img-upload-inner">
          <span class="vellora-img-upload-icon">${icons.upload}</span>
          <span class="vellora-img-upload-text">Upload ${this.stagedImages.length} image${this.stagedImages.length > 1 ? 's' : ''}</span>
        </span>
      `;

      uploadBtn.addEventListener('click', () => {
        this._startUploadAnimation(uploadBtn);
      });

      stagingWrap.appendChild(uploadBtn);
      this.bodyEl.appendChild(stagingWrap);
    }

    // OR divider
    const orDivider = document.createElement('div');
    orDivider.classList.add('vellora-img-or-divider');
    orDivider.textContent = 'OR';

    // Insert via URL button
    const actionCenter = document.createElement('div');
    actionCenter.classList.add('vellora-img-actions-center');

    const urlBtn = document.createElement('button');
    urlBtn.type = 'button';
    urlBtn.classList.add('vellora-img-url-btn');
    urlBtn.innerHTML = `${icons.link} <span>Insert via URL</span>`;
    urlBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (!this.isUploading) {
        this.currentView = 'url';
        this._renderView();
      }
    });

    actionCenter.appendChild(urlBtn);

    this.bodyEl.appendChild(orDivider);
    this.bodyEl.appendChild(actionCenter);
  }

  private _startUploadAnimation(btn: HTMLElement): void {
    if (this.isUploading || this.stagedImages.length === 0) return;
    this.isUploading = true;
    btn.classList.add('vellora-img-upload-btn--loading');

    const bar = btn.querySelector('.vellora-img-upload-bar') as HTMLElement;
    const text = btn.querySelector('.vellora-img-upload-text') as HTMLElement;

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 8) + 4;
      if (progress > 100) progress = 100;

      if (bar) bar.style.width = `${progress}%`;
      if (text) text.textContent = `Uploading ${progress}%`;

      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          for (const item of this.stagedImages) {
            this.editor.commands.insertImage({
              src: item.dataUrl,
              alt: item.alt || item.name,
            });
          }
          this.isUploading = false;
          this.stagedImages = [];
          this.hide();
        }, 250);
      }
    }, 40);
  }

  private _stageFiles(files: File[]): void {
    const valid = files.filter(f => f.type.startsWith('image/'));
    if (valid.length === 0) return;

    let loaded = 0;
    valid.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        if (dataUrl) {
          this.stagedImages.push({
            id: Math.random().toString(36).substring(2, 9),
            file,
            dataUrl,
            name: file.name,
            alt: '',
          });
        }
        loaded++;
        if (loaded === valid.length) {
          this._renderView();
        }
      };
      reader.readAsDataURL(file);
    });
  }

  // ── 2. URL View ──
  private _renderUrlView(): void {
    const form = document.createElement('div');
    form.classList.add('vellora-img-url-form');

    // 1. Image URL field
    const urlGroup = document.createElement('div');
    urlGroup.classList.add('vellora-img-form-group');

    const urlLabel = document.createElement('label');
    urlLabel.classList.add('vellora-img-form-label');
    urlLabel.textContent = 'Image URL';

    const urlInput = document.createElement('input');
    urlInput.type = 'url';
    urlInput.classList.add('vellora-img-input', 'vellora-img-input--url');
    urlInput.placeholder = 'https://example.com/image.jpg';

    urlGroup.appendChild(urlLabel);
    urlGroup.appendChild(urlInput);

    // 2. Alt Text field
    const altGroup = document.createElement('div');
    altGroup.classList.add('vellora-img-form-group');

    const altLabel = document.createElement('label');
    altLabel.classList.add('vellora-img-form-label');
    altLabel.textContent = 'Alt Text';

    const altInput = document.createElement('input');
    altInput.type = 'text';
    altInput.classList.add('vellora-img-input', 'vellora-img-input--alt');
    altInput.placeholder = 'Descriptive alternative text';

    altGroup.appendChild(altLabel);
    altGroup.appendChild(altInput);

    // 3. Action button
    const actions = document.createElement('div');
    actions.classList.add('vellora-img-form-actions');

    const submitBtn = document.createElement('button');
    submitBtn.type = 'button';
    submitBtn.classList.add('vellora-img-submit-btn');
    submitBtn.textContent = 'Insert Image';

    const handleInsert = () => {
      const src = urlInput.value.trim();
      const alt = altInput.value.trim() || 'Inserted image';
      if (src) {
        this.editor.commands.insertImage({ src, alt });
        this.hide();
      } else {
        urlInput.focus();
      }
    };

    submitBtn.addEventListener('click', handleInsert);

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleInsert();
      }
    };
    urlInput.addEventListener('keydown', handleKey);
    altInput.addEventListener('keydown', handleKey);

    actions.appendChild(submitBtn);

    form.appendChild(urlGroup);
    form.appendChild(altGroup);
    form.appendChild(actions);

    this.bodyEl.appendChild(form);

    setTimeout(() => {
      urlInput.focus();
    }, 50);
  }
}
