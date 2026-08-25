// ============================================================
// EditKit — Section Heading Floating Toolbar & Component System
// Exact match for user screenshot: Amber dashed focus outline,
// [00] Badge Prefix, Big Title, [Left] [Center] [Right] [01 Badge] | [⧉] [🗑]
// ============================================================

import type { EditKitEditor } from '@editkit/core';
import { icons } from './icons';

export class SectionHeadingMenu {
  readonly element: HTMLElement;
  private editor: EditKitEditor;
  private activeHeading: HTMLElement | null = null;
  private _unsubscribers: (() => void)[] = [];

  constructor(editor: EditKitEditor) {
    this.editor = editor;

    this.element = document.createElement('div');
    this.element.classList.add('editkit-sec-head-floating-menu');

    this._buildToolbar();
    this._setupListeners();
  }

  mount(container: HTMLElement): void {
    container.appendChild(this.element);
  }

  selectHeading(heading: HTMLElement): void {
    if (this.activeHeading) {
      this.activeHeading.classList.remove('editkit-sec-head--focused');
    }

    this.activeHeading = heading;
    this.activeHeading.classList.add('editkit-sec-head--focused');
    this._buildToolbar();
    this.element.classList.add('editkit-sec-head-floating-menu--open');
    this._updatePosition();
  }

  deselect(): void {
    if (this.activeHeading) {
      this.activeHeading.classList.remove('editkit-sec-head--focused');
      this.activeHeading = null;
    }
    this.element.classList.remove('editkit-sec-head-floating-menu--open');
  }

  private _buildToolbar(): void {
    this.element.innerHTML = '';
    if (!this.activeHeading) return;

    const align = this.activeHeading.getAttribute('data-align') || 'left';
    const badge = this.activeHeading.getAttribute('data-badge') || '00';

    // Helper for buttons
    const createBtn = (iconHtml: string, title: string, onClick: () => void, isActive?: boolean, isDanger?: boolean, textLabel?: string) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.classList.add('editkit-sec-head-tb-btn');
      if (isActive) b.classList.add('editkit-sec-head-tb-btn--active');
      if (isDanger) b.classList.add('editkit-sec-head-tb-btn--danger');
      if (textLabel) b.classList.add('editkit-sec-head-tb-btn--text');
      b.setAttribute('title', title);
      b.innerHTML = textLabel || iconHtml;
      b.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      });
      return b;
    };

    const addDivider = () => {
      const d = document.createElement('div');
      d.classList.add('editkit-sec-head-tb-divider');
      this.element.appendChild(d);
    };

    // 1. Align Left [ ≡ ]
    this.element.appendChild(createBtn(icons.alignLeft, 'Align Left', () => {
      this._setAlign('left');
    }, align === 'left'));

    // 2. Align Center [ ≡ ]
    this.element.appendChild(createBtn(icons.alignCenter, 'Align Center', () => {
      this._setAlign('center');
    }, align === 'center'));

    // 3. Align Right [ ≡ ]
    this.element.appendChild(createBtn(icons.alignRight, 'Align Right', () => {
      this._setAlign('right');
    }, align === 'right'));

    // 4. Badge Toggle / Cycle [ 01 ]
    this.element.appendChild(createBtn('', 'Toggle / Change Section Badge', () => {
      this._cycleBadge();
    }, false, false, badge || '01'));

    addDivider();

    // 5. Duplicate ⧉
    this.element.appendChild(createBtn(icons.copy || `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`, 'Duplicate Heading', () => {
      this._duplicateHeading();
    }));

    // 6. Delete 🗑
    this.element.appendChild(createBtn(icons.trash || `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`, 'Delete Heading', () => {
      this._deleteHeading();
    }, false, true));
  }

  private _setAlign(align: 'left' | 'center' | 'right'): void {
    if (!this.activeHeading) return;
    this.activeHeading.setAttribute('data-align', align);
    this._buildToolbar();
    this.editor.emit('update', { editor: this.editor });
  }

  private _cycleBadge(): void {
    if (!this.activeHeading) return;

    const badges = ['01', '02', '03', '04', '05', '§', '#', '00', ''];
    const current = this.activeHeading.getAttribute('data-badge') || '01';
    const nextIdx = (badges.indexOf(current) + 1) % badges.length;
    const nextBadge = badges[nextIdx];

    this.activeHeading.setAttribute('data-badge', nextBadge);
    const badgeEl = this.activeHeading.querySelector('.editkit-sec-badge') as HTMLElement;
    if (badgeEl) {
      if (nextBadge) {
        badgeEl.style.display = 'inline-flex';
        badgeEl.textContent = nextBadge;
      } else {
        badgeEl.style.display = 'none';
      }
    }
    this._buildToolbar();
    this.editor.emit('update', { editor: this.editor });
  }

  private _duplicateHeading(): void {
    if (!this.activeHeading) return;

    const clone = this.activeHeading.cloneNode(true) as HTMLElement;
    clone.classList.remove('editkit-sec-head--focused');

    // Auto-increment badge number if numeric (e.g. 01 -> 02 -> 03 -> 04)
    const currentBadge = this.activeHeading.getAttribute('data-badge') || '01';
    const num = parseInt(currentBadge, 10);
    let nextBadge = currentBadge;
    if (!isNaN(num)) {
      nextBadge = String(num + 1).padStart(2, '0');
    }
    clone.setAttribute('data-badge', nextBadge);

    const badgeEl = clone.querySelector('.editkit-sec-badge') as HTMLElement;
    if (badgeEl) {
      badgeEl.textContent = nextBadge;
      badgeEl.style.display = nextBadge ? 'inline-flex' : 'none';
    }

    this.activeHeading.parentNode?.insertBefore(clone, this.activeHeading.nextSibling);

    this.editor.emit('update', { editor: this.editor });
    this.selectHeading(clone);
  }

  private _deleteHeading(): void {
    if (!this.activeHeading) return;

    const toRemove = this.activeHeading;
    this.deselect();
    toRemove.remove();
    this.editor.emit('update', { editor: this.editor });
  }

  private _setupListeners(): void {
    const onContentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const heading = target.closest('.editkit-section-heading') as HTMLElement;
      if (heading && this.editor.contentEl.contains(heading)) {
        this.selectHeading(heading);
      } else if (!this.element.contains(target)) {
        this.deselect();
      }
    };

    const onKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this.deselect();
      } else if ((e.key === 'Backspace' || e.key === 'Delete') && this.activeHeading && !this.editor.isFocused) {
        this._deleteHeading();
      }
    };

    const onScroll = () => this._updatePosition();
    this.editor.contentEl.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => this._updatePosition());
    window.addEventListener('scroll', () => this._updatePosition(), true);
    document.addEventListener('mousedown', onContentClick);
    document.addEventListener('keydown', onKeydown);

    this._unsubscribers.push(
      () => this.editor.contentEl.removeEventListener('scroll', onScroll),
      () => window.removeEventListener('resize', () => this._updatePosition()),
      () => window.removeEventListener('scroll', () => this._updatePosition(), true),
      () => document.removeEventListener('mousedown', onContentClick),
      () => document.removeEventListener('keydown', onKeydown),
    );
  }

  private _updatePosition(): void {
    if (!this.activeHeading || !this.element.classList.contains('editkit-sec-head-floating-menu--open')) return;

    const headRect = this.activeHeading.getBoundingClientRect();
    const rootRect = (this.editor.root as HTMLElement).getBoundingClientRect();

    const top = headRect.bottom - rootRect.top + 4;
    const left = headRect.left - rootRect.left + 4;

    this.element.style.top = `${Math.max(4, top)}px`;
    this.element.style.left = `${Math.max(4, left)}px`;
  }

  destroy(): void {
    this._unsubscribers.forEach(u => u());
    this.element.remove();
  }
}
