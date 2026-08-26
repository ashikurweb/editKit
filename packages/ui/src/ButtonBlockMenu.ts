// ============================================================
// EditKit — Button Block Floating Toolbar & Component System
// Exact match for user screenshots:
// 1. Edit popover: [Button text] [https://...] | [Done] [✕]
// 2. Floating menu: [Filled] [Outline] | [≡ ˇ] | [匚] [⊏] [⊂] | [A] | [⧉] [🗑]
// ============================================================

import type { EditKitEditor } from '@editkit/core';
import { icons } from './icons';
import { ColorPickerPopover } from './ColorPicker';

export class ButtonBlockMenu {
  readonly element: HTMLElement;
  private editor: EditKitEditor;
  private activeButton: HTMLElement | null = null;
  private colorPicker: ColorPickerPopover | null = null;
  private alignDropdownEl: HTMLElement | null = null;
  private editPopoverEl: HTMLElement | null = null;
  private _unsubscribers: (() => void)[] = [];

  constructor(editor: EditKitEditor) {
    this.editor = editor;

    this.element = document.createElement('div');
    this.element.classList.add('editkit-btn-floating-menu');

    this._buildToolbar();
    this._setupListeners();
  }

  mount(container: HTMLElement): void {
    container.appendChild(this.element);
  }

  selectButton(btnWrap: HTMLElement): void {
    if (this.activeButton) {
      this.activeButton.classList.remove('editkit-button-block--focused');
    }

    this.activeButton = btnWrap;
    this.activeButton.classList.add('editkit-button-block--focused');
    this._closePopups();
    this._buildToolbar();
    this.element.classList.add('editkit-btn-floating-menu--open');
    this._updatePosition();
  }

  deselect(): void {
    if (this.activeButton) {
      this.activeButton.classList.remove('editkit-button-block--focused');
      this.activeButton = null;
    }
    this._closePopups();
    this.element.classList.remove('editkit-btn-floating-menu--open');
  }

  private _closePopups(): void {
    if (this.colorPicker) {
      this.colorPicker.element.remove();
      this.colorPicker = null;
    }
    if (this.alignDropdownEl) {
      this.alignDropdownEl.remove();
      this.alignDropdownEl = null;
    }
    if (this.editPopoverEl) {
      this.editPopoverEl.remove();
      this.editPopoverEl = null;
    }
  }

  private _buildToolbar(): void {
    this.element.innerHTML = '';
    if (!this.activeButton) return;

    const variant = this.activeButton.getAttribute('data-variant') || 'filled';
    const radius = this.activeButton.getAttribute('data-radius') || 'rounded';
    const align = this.activeButton.getAttribute('data-align') || 'left';
    const color = this.activeButton.getAttribute('data-color') || '#f59e0b';

    const createBtn = (title: string, onClick: (btnEl: HTMLElement) => void, isActive?: boolean, isDanger?: boolean, innerHtml?: string, textLabel?: string) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.classList.add('editkit-btn-tb-btn');
      if (isActive) b.classList.add('editkit-btn-tb-btn--active');
      if (isDanger) b.classList.add('editkit-btn-tb-btn--danger');
      b.setAttribute('title', title);
      b.innerHTML = innerHtml || textLabel || '';
      b.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick(b);
      });
      return b;
    };

    const addDivider = () => {
      const d = document.createElement('div');
      d.classList.add('editkit-btn-tb-divider');
      this.element.appendChild(d);
    };

    // 1. Variant: [ Filled ] [ Outline ]
    this.element.appendChild(createBtn('Filled style', () => this._setVariant('filled'), variant === 'filled', false, '', 'Filled'));
    this.element.appendChild(createBtn('Outline style', () => this._setVariant('outline'), variant === 'outline', false, '', 'Outline'));

    addDivider();

    // 2. Alignment Dropdown [ ≡ ˇ ]
    const alignIcons: Record<string, string> = {
      left: icons.alignLeft || '≡',
      center: icons.alignCenter || '≡',
      right: icons.alignRight || '≡',
    };
    const alignBtn = createBtn('Alignment Options', (b) => this._toggleAlignDropdown(b), false, false, `
      <span>${alignIcons[align] || icons.alignLeft}</span>
      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
    `);
    this.element.appendChild(alignBtn);

    addDivider();

    // 3. Border Radius: [ 匚 ] [ ⊏ ] [ ⊂ ]
    this.element.appendChild(createBtn('Small radius (4px)', () => this._setRadius('small'), radius === 'small', false, `
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 19V5h16v14"/></svg>
    `));
    this.element.appendChild(createBtn('Medium radius (8px)', () => this._setRadius('rounded'), radius === 'rounded', false, `
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 19V8a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v11"/></svg>
    `));
    this.element.appendChild(createBtn('Full pill radius', () => this._setRadius('pill'), radius === 'pill', false, `
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="6" width="18" height="12" rx="6"/></svg>
    `));

    addDivider();

    // 4. Color Swatch [ <u>A</u> ] -> Opens ColorPickerPopover
    this.element.appendChild(createBtn('Pick Button Color', (b) => this._toggleColorPicker(b), false, false, `
      <span class="editkit-btn-tb-color-icon" style="--btn-curr-col: ${color};">
        <span class="editkit-btn-tb-color-a">A</span>
        <span class="editkit-btn-tb-color-bar" style="background: ${color};"></span>
      </span>
    `));

    addDivider();

    // 5. Duplicate ⧉
    this.element.appendChild(createBtn('Duplicate button', () => this._duplicateButton(), false, false, icons.copy || `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`));

    // 6. Delete 🗑
    this.element.appendChild(createBtn('Delete button', () => this._deleteButton(), false, true, icons.trash || `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`));
  }

  private _showEditPopover(): void {
    if (!this.activeButton) return;
    this._closePopups();

    const linkEl = this.activeButton.querySelector('.editkit-btn-element') as HTMLAnchorElement;
    if (!linkEl) return;

    const currentText = linkEl.textContent || 'Button';
    const currentHref = linkEl.getAttribute('href') || 'https://';

    const popover = document.createElement('div');
    popover.classList.add('editkit-btn-edit-popover');

    // 1. Text Input
    const labelInput = document.createElement('input');
    labelInput.type = 'text';
    labelInput.classList.add('editkit-btn-edit-input', 'editkit-btn-edit-input--label');
    labelInput.value = currentText;
    labelInput.placeholder = 'Button text';

    // 2. URL Input
    const urlInput = document.createElement('input');
    urlInput.type = 'text';
    urlInput.classList.add('editkit-btn-edit-input', 'editkit-btn-edit-input--url');
    urlInput.value = currentHref;
    urlInput.placeholder = 'https://...';

    // 3. Divider
    const divider = document.createElement('div');
    divider.classList.add('editkit-btn-edit-divider');

    // 4. Done Button
    const doneBtn = document.createElement('button');
    doneBtn.type = 'button';
    doneBtn.classList.add('editkit-btn-edit-done');
    doneBtn.textContent = 'Done';

    // 5. Close icon
    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.classList.add('editkit-btn-edit-close');
    closeBtn.innerHTML = `✕`;

    const applyChanges = () => {
      const newText = labelInput.value.trim() || 'Button';
      const newUrl = urlInput.value.trim() || '#';
      linkEl.textContent = newText;
      linkEl.setAttribute('href', newUrl);
      this.editor.emit('update', { editor: this.editor });
      this._closePopups();
      this._updatePosition();
    };

    doneBtn.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      applyChanges();
    });

    closeBtn.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this._closePopups();
      this._updatePosition();
    });

    labelInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        applyChanges();
      } else if (e.key === 'Escape') {
        this._closePopups();
        this._updatePosition();
      }
    });

    urlInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        applyChanges();
      } else if (e.key === 'Escape') {
        this._closePopups();
        this._updatePosition();
      }
    });

    popover.appendChild(labelInput);
    popover.appendChild(urlInput);
    popover.appendChild(divider);
    popover.appendChild(doneBtn);
    popover.appendChild(closeBtn);

    (this.editor.root as HTMLElement).appendChild(popover);
    this.editPopoverEl = popover;

    this._updatePosition();

    // Auto-focus url input
    setTimeout(() => {
      urlInput.focus();
      urlInput.select();
    }, 20);
  }

  private _setVariant(variant: 'filled' | 'outline'): void {
    if (!this.activeButton) return;
    this.activeButton.setAttribute('data-variant', variant);
    this._buildToolbar();
    this.editor.emit('update', { editor: this.editor });
  }

  private _toggleAlignDropdown(anchorBtn: HTMLElement): void {
    if (this.alignDropdownEl) {
      this.alignDropdownEl.remove();
      this.alignDropdownEl = null;
      return;
    }
    this._closePopups();

    const dropdown = document.createElement('div');
    dropdown.classList.add('editkit-btn-align-dropdown');

    const options: Array<{ id: 'left' | 'center' | 'right'; label: string; icon: string }> = [
      { id: 'left', label: 'Left Align', icon: icons.alignLeft || '≡' },
      { id: 'center', label: 'Center Align', icon: icons.alignCenter || '≡' },
      { id: 'right', label: 'Right Align', icon: icons.alignRight || '≡' },
    ];

    options.forEach(opt => {
      const item = document.createElement('button');
      item.type = 'button';
      item.classList.add('editkit-btn-align-item');
      item.innerHTML = `
        <span class="editkit-btn-align-item-icon">${opt.icon}</span>
        <span class="editkit-btn-align-item-label">${opt.label}</span>
      `;
      item.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this._setAlign(opt.id);
        this._closePopups();
      });
      dropdown.appendChild(item);
    });

    this.element.appendChild(dropdown);
    this.alignDropdownEl = dropdown;

    const btnRect = anchorBtn.getBoundingClientRect();
    const tbRect = this.element.getBoundingClientRect();
    dropdown.style.left = `${btnRect.left - tbRect.left}px`;
    dropdown.style.top = `calc(100% + 6px)`;
  }

  private _setAlign(align: 'left' | 'center' | 'right'): void {
    if (!this.activeButton) return;
    this.activeButton.setAttribute('data-align', align);
    this._buildToolbar();
    this.editor.emit('update', { editor: this.editor });
  }

  private _setRadius(radius: 'small' | 'rounded' | 'pill'): void {
    if (!this.activeButton) return;
    this.activeButton.setAttribute('data-radius', radius);
    this._buildToolbar();
    this.editor.emit('update', { editor: this.editor });
  }

  private _toggleColorPicker(anchorBtn: HTMLElement): void {
    if (this.colorPicker) {
      this.colorPicker.element.remove();
      this.colorPicker = null;
      return;
    }
    this._closePopups();

    this.colorPicker = new ColorPickerPopover(
      this.editor,
      (color: string) => {
        this._setColor(color);
      },
      () => {
        this._closePopups();
      }
    );

    this.colorPicker.element.classList.add('editkit-color-picker--bubble', 'editkit-btn-color-picker-popover');
    this.element.appendChild(this.colorPicker.element);

    const btnRect = anchorBtn.getBoundingClientRect();
    const tbRect = this.element.getBoundingClientRect();
    this.colorPicker.element.style.position = 'absolute';
    this.colorPicker.element.style.left = `${Math.min(btnRect.left - tbRect.left, tbRect.width - 240)}px`;
    this.colorPicker.element.style.top = `calc(100% + 6px)`;
    this.colorPicker.element.style.zIndex = '120';
  }

  private _setColor(color: string): void {
    if (!this.activeButton) return;
    this.activeButton.setAttribute('data-color', color);
    const linkEl = this.activeButton.querySelector('.editkit-btn-element') as HTMLElement;
    if (linkEl) {
      linkEl.style.setProperty('--editkit-btn-color', color);
    }
    const colorBar = this.element.querySelector('.editkit-btn-tb-color-bar') as HTMLElement;
    if (colorBar) {
      colorBar.style.background = color;
    }
    this.editor.emit('update', { editor: this.editor });
  }

  private _duplicateButton(): void {
    if (!this.activeButton) return;

    const clone = this.activeButton.cloneNode(true) as HTMLElement;
    clone.classList.remove('editkit-button-block--focused');

    this.activeButton.parentNode?.insertBefore(clone, this.activeButton.nextSibling);

    this.editor.emit('update', { editor: this.editor });
    this.selectButton(clone);
  }

  private _deleteButton(): void {
    if (!this.activeButton) return;

    const toRemove = this.activeButton;
    this.deselect();
    toRemove.remove();
    this.editor.emit('update', { editor: this.editor });
  }

  private _setupListeners(): void {
    const onContentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Do not close if clicking inside active popup or toolbar
      if (this.colorPicker && this.colorPicker.element.contains(target)) {
        return;
      }
      if (this.alignDropdownEl && this.alignDropdownEl.contains(target)) {
        return;
      }
      if (this.editPopoverEl && this.editPopoverEl.contains(target)) {
        return;
      }

      // Check edit pencil icon click
      const editIcon = target.closest('.editkit-btn-edit-icon') as HTMLElement;
      if (editIcon) {
        e.preventDefault();
        e.stopPropagation();
        const btnBlock = editIcon.closest('.editkit-button-block') as HTMLElement;
        if (btnBlock && this.editor.contentEl.contains(btnBlock)) {
          this.selectButton(btnBlock);
          this._showEditPopover();
        }
        return;
      }

      const btnBlock = target.closest('.editkit-button-block') as HTMLElement;
      if (btnBlock && this.editor.contentEl.contains(btnBlock)) {
        this.selectButton(btnBlock);
      } else if (!this.element.contains(target)) {
        this.deselect();
      }
    };

    const onKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this.deselect();
      } else if ((e.key === 'Backspace' || e.key === 'Delete') && this.activeButton && !this.editor.isFocused && !this.editPopoverEl) {
        this._deleteButton();
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
    if (!this.activeButton || !this.element.classList.contains('editkit-btn-floating-menu--open')) return;

    const btnRect = this.activeButton.getBoundingClientRect();
    const rootRect = (this.editor.root as HTMLElement).getBoundingClientRect();

    if (this.editPopoverEl) {
      let top = btnRect.top - rootRect.top - 42;
      if (top < 10) {
        top = btnRect.bottom - rootRect.top + 6;
      }
      const left = Math.max(8, btnRect.left - rootRect.left);
      this.editPopoverEl.style.top = `${Math.max(4, top)}px`;
      this.editPopoverEl.style.left = `${Math.max(4, left)}px`;

      const popRect = this.editPopoverEl.getBoundingClientRect();
      const tbTop = popRect.bottom - rootRect.top + 4;
      this.element.style.top = `${Math.max(4, tbTop)}px`;
      this.element.style.left = `${Math.max(4, left)}px`;
    } else {
      let top = btnRect.top - rootRect.top - 36;
      if (top < 10) {
        top = btnRect.bottom - rootRect.top + 6;
      }
      const left = Math.max(8, btnRect.left - rootRect.left);
      this.element.style.top = `${top}px`;
      this.element.style.left = `${left}px`;
    }
  }

  destroy(): void {
    this._unsubscribers.forEach(u => u());
    this._closePopups();
    this.element.remove();
  }
}
