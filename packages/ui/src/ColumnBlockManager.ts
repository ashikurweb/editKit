// ============================================================
// EditKit — Column Block Manager & Interactive Multi-Column System
// Exact match for User Screenshots:
// 1. Column Block with dashed border, COL headers, + block pill, & floating layout controls
// 2. + block Command Menu with Search, Quick Actions & Blocks
// ============================================================

import type { EditKitEditor } from '@editkit/core';
import { icons } from './icons';

export interface CommandMenuItem {
  id: string;
  label: string;
  category: string;
  icon: string;
  badge?: string;
  action: (targetBody: HTMLElement, editor: EditKitEditor) => void;
}

export class ColumnBlockManager {
  private editor: EditKitEditor;
  private activeMenu: HTMLElement | null = null;
  private activeColumnBody: HTMLElement | null = null;
  private _unsubscribers: (() => void)[] = [];
  private _isDestroyed: boolean = false;

  constructor(editor: EditKitEditor) {
    this.editor = editor;
    this._setupListeners();
  }

  destroy(): void {
    if (this._isDestroyed) return;
    this._isDestroyed = true;
    this._unsubscribers.forEach(fn => fn());
    this._unsubscribers = [];
    this._closeMenu();
  }

  // ── 1. Create Column Block Element (Matches Image 1) ──
  createColumnBlockElement(layout: '50-50' | '3-col' | '1-col' | '70-30' | '30-70' = '50-50'): HTMLElement {
    const container = document.createElement('div');
    container.classList.add('editkit-columns-container');
    container.setAttribute('data-editkit-block', 'columns');
    container.setAttribute('data-layout', layout);
    container.setAttribute('contenteditable', 'false');

    // Drag Gripper Handle
    const handle = document.createElement('div');
    handle.classList.add('editkit-columns-handle');
    handle.title = 'Drag Columns';
    handle.innerHTML = `<span></span><span></span><span></span><span></span><span></span><span></span>`;
    container.appendChild(handle);

    // Columns Row
    const row = document.createElement('div');
    row.classList.add('editkit-columns-row');

    const colCount = layout === '3-col' ? 3 : layout === '1-col' ? 1 : 2;
    for (let i = 1; i <= colCount; i++) {
      row.appendChild(this._createColumnItem(i));
    }
    container.appendChild(row);

    // Floating Controls
    const controls = this._createControls(container, layout);
    container.appendChild(controls);

    return container;
  }

  // ── 2. Create Feature Row Element (Exact Match for User Screenshot) ──
  createFeatureRowElement(imageModal?: any): HTMLElement {
    const container = document.createElement('div');
    container.classList.add('editkit-columns-container', 'editkit-feature-row-container');
    container.setAttribute('data-editkit-block', 'columns');
    container.setAttribute('data-layout', '50-50');
    container.setAttribute('contenteditable', 'false');

    // Drag Gripper Handle
    const handle = document.createElement('div');
    handle.classList.add('editkit-columns-handle');
    handle.title = 'Drag Columns';
    handle.innerHTML = `<span></span><span></span><span></span><span></span><span></span><span></span>`;
    container.appendChild(handle);

    // Columns Row
    const row = document.createElement('div');
    row.classList.add('editkit-columns-row');

    // ── COL 1 ──
    const col1 = document.createElement('div');
    col1.classList.add('editkit-column-item');
    col1.setAttribute('data-col', '1');

    const header1 = document.createElement('div');
    header1.classList.add('editkit-column-header');
    header1.setAttribute('contenteditable', 'false');
    const label1 = document.createElement('span');
    label1.classList.add('editkit-column-label');
    label1.textContent = 'COL 1';
    const addBtn1 = document.createElement('button');
    addBtn1.type = 'button';
    addBtn1.classList.add('editkit-column-add-btn');
    addBtn1.textContent = '+ block';
    header1.appendChild(label1);
    header1.appendChild(addBtn1);

    const body1 = document.createElement('div');
    body1.classList.add('editkit-column-body');
    body1.setAttribute('contenteditable', 'true');
    body1.setAttribute('spellcheck', 'false');

    const h3_1 = document.createElement('h3');
    h3_1.classList.add('editkit-feature-col-title');
    h3_1.textContent = 'Feature name.';

    const p1 = document.createElement('p');
    p1.classList.add('editkit-feature-col-desc');
    p1.textContent = 'A short description of what it does and why it matters.';

    body1.appendChild(h3_1);
    body1.appendChild(p1);

    col1.appendChild(header1);
    col1.appendChild(body1);

    addBtn1.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this._toggleMenu(addBtn1, body1);
    });

    // ── COL 2 ──
    const col2 = document.createElement('div');
    col2.classList.add('editkit-column-item');
    col2.setAttribute('data-col', '2');

    const header2 = document.createElement('div');
    header2.classList.add('editkit-column-header');
    header2.setAttribute('contenteditable', 'false');
    const label2 = document.createElement('span');
    label2.classList.add('editkit-column-label');
    label2.textContent = 'COL 2';
    const addBtn2 = document.createElement('button');
    addBtn2.type = 'button';
    addBtn2.classList.add('editkit-column-add-btn');
    addBtn2.textContent = '+ block';
    header2.appendChild(label2);
    header2.appendChild(addBtn2);

    const body2 = document.createElement('div');
    body2.classList.add('editkit-column-body');
    body2.setAttribute('contenteditable', 'true');
    body2.setAttribute('spellcheck', 'false');

    const h3_2 = document.createElement('h3');
    h3_2.classList.add('editkit-feature-col-title');
    h3_2.textContent = 'Product preview.';

    const p2 = document.createElement('p');
    p2.classList.add('editkit-feature-col-desc');
    p2.textContent = 'Add a supporting image below.';

    // Image Upload Placeholder Box
    const placeholder = document.createElement('div');
    placeholder.classList.add('editkit-feature-img-placeholder');
    placeholder.setAttribute('contenteditable', 'false');
    placeholder.setAttribute('role', 'button');
    placeholder.setAttribute('tabindex', '0');
    placeholder.setAttribute('title', 'Click to upload image');

    const iconBox = document.createElement('div');
    iconBox.classList.add('editkit-fip-icon');
    iconBox.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/><line x1="16" y1="5" x2="16" y2="11"/><line x1="13" y1="8" x2="19" y2="8"/></svg>`;

    const titleEl = document.createElement('div');
    titleEl.classList.add('editkit-fip-title');
    titleEl.textContent = 'Add image';

    const subEl = document.createElement('div');
    subEl.classList.add('editkit-fip-sub');
    subEl.textContent = 'Click to upload';

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.classList.add('editkit-fip-file-input');
    fileInput.style.display = 'none';

    placeholder.appendChild(iconBox);
    placeholder.appendChild(titleEl);
    placeholder.appendChild(subEl);
    placeholder.appendChild(fileInput);

    // Image upload handler
    const handleFile = (file: File) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const src = ev.target?.result as string;
        if (src) {
          const img = document.createElement('img');
          img.src = src;
          img.alt = file.name || 'Product preview';
          img.classList.add('editkit-feature-img');
          placeholder.replaceWith(img);
          this.editor.emit('update', { editor: this.editor });
        }
      };
      reader.readAsDataURL(file);
    };

    placeholder.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (imageModal) {
        imageModal.show('dropzone', (data: { src: string; alt?: string }) => {
          const img = document.createElement('img');
          img.src = data.src;
          img.alt = data.alt || 'Product preview';
          img.classList.add('editkit-feature-img');
          placeholder.replaceWith(img);
          this.editor.emit('update', { editor: this.editor });
        });
      } else {
        fileInput.click();
      }
    });

    fileInput.addEventListener('change', () => {
      if (fileInput.files && fileInput.files[0]) {
        handleFile(fileInput.files[0]);
      }
    });

    // Drag and Drop support
    placeholder.addEventListener('dragover', (e) => {
      e.preventDefault();
      placeholder.classList.add('editkit-fip--dragover');
    });
    placeholder.addEventListener('dragleave', () => {
      placeholder.classList.remove('editkit-fip--dragover');
    });
    placeholder.addEventListener('drop', (e) => {
      e.preventDefault();
      placeholder.classList.remove('editkit-fip--dragover');
      if (e.dataTransfer?.files && e.dataTransfer.files[0]) {
        handleFile(e.dataTransfer.files[0]);
      }
    });

    body2.appendChild(h3_2);
    body2.appendChild(p2);
    body2.appendChild(placeholder);

    col2.appendChild(header2);
    col2.appendChild(body2);

    addBtn2.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this._toggleMenu(addBtn2, body2);
    });

    row.appendChild(col1);
    row.appendChild(col2);
    container.appendChild(row);

    // Floating Controls
    const controls = this._createControls(container, '50-50');
    container.appendChild(controls);

    return container;
  }

  // ── 3. Create Three-up Pattern Element (Exact Match for User Screenshot) ──
  createThreeUpElement(): HTMLElement {
    const container = document.createElement('div');
    container.classList.add('editkit-columns-container', 'editkit-three-up-container');
    container.setAttribute('data-editkit-block', 'columns');
    container.setAttribute('data-layout', '3-col');
    container.setAttribute('contenteditable', 'false');

    // Drag Gripper Handle
    const handle = document.createElement('div');
    handle.classList.add('editkit-columns-handle');
    handle.title = 'Drag Columns';
    handle.innerHTML = `<span></span><span></span><span></span><span></span><span></span><span></span>`;
    container.appendChild(handle);

    // Columns Row
    const row = document.createElement('div');
    row.classList.add('editkit-columns-row');

    const colData = [
      { col: 1, title: 'Fast', desc: 'Integrate in 10 minutes.' },
      { col: 2, title: 'Native', desc: 'Built on Lexical.' },
      { col: 3, title: 'AI-ready', desc: 'Per-block actions.' },
    ];

    colData.forEach((d) => {
      const col = document.createElement('div');
      col.classList.add('editkit-column-item');
      col.setAttribute('data-col', String(d.col));

      const header = document.createElement('div');
      header.classList.add('editkit-column-header');
      header.setAttribute('contenteditable', 'false');
      const label = document.createElement('span');
      label.classList.add('editkit-column-label');
      label.textContent = `COL ${d.col}`;
      const addBtn = document.createElement('button');
      addBtn.type = 'button';
      addBtn.classList.add('editkit-column-add-btn');
      addBtn.textContent = '+ block';
      header.appendChild(label);
      header.appendChild(addBtn);

      const body = document.createElement('div');
      body.classList.add('editkit-column-body');
      body.setAttribute('contenteditable', 'true');
      body.setAttribute('spellcheck', 'false');

      const h3 = document.createElement('h3');
      h3.classList.add('editkit-feature-col-title');
      h3.textContent = d.title;

      const p = document.createElement('p');
      p.classList.add('editkit-feature-col-desc');
      p.textContent = d.desc;

      body.appendChild(h3);
      body.appendChild(p);

      col.appendChild(header);
      col.appendChild(body);

      addBtn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this._toggleMenu(addBtn, body);
      });

      row.appendChild(col);
    });

    container.appendChild(row);

    // Floating Controls
    const controls = this._createControls(container, '3-col');
    container.appendChild(controls);

    return container;
  }

  private _createControls(container: HTMLElement, layout: string): HTMLElement {
    const controls = document.createElement('div');
    controls.classList.add('editkit-columns-controls');
    controls.setAttribute('contenteditable', 'false');

    const layouts = [
      {
        id: '50-50',
        title: '2 Columns (50/50)',
        icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="8" height="16" rx="2"></rect><rect x="13" y="4" width="8" height="16" rx="2"></rect></svg>`,
      },
      {
        id: '3-col',
        title: '3 Columns (Equal)',
        icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="5.5" height="16" rx="1.5"></rect><rect x="9.25" y="4" width="5.5" height="16" rx="1.5"></rect><rect x="16.5" y="4" width="5.5" height="16" rx="1.5"></rect></svg>`,
      },
      {
        id: '1-col',
        title: '1 Column (Full width)',
        icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"></rect></svg>`,
      },
      {
        id: '70-30',
        title: '2 Columns (70/30 Left Heavy)',
        icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="11" height="16" rx="2"></rect><rect x="16" y="4" width="5" height="16" rx="2"></rect></svg>`,
      },
      {
        id: '30-70',
        title: '2 Columns (30/70 Right Heavy)',
        icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="5" height="16" rx="2"></rect><rect x="10" y="4" width="11" height="16" rx="2"></rect></svg>`,
      },
    ];

    layouts.forEach(l => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.classList.add('editkit-columns-ctrl-btn');
      if (l.id === layout) btn.classList.add('editkit-columns-ctrl-btn--active');
      btn.setAttribute('data-layout-id', l.id);
      btn.title = l.title;
      btn.setAttribute('aria-label', l.title);
      btn.innerHTML = l.icon;

      btn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this._switchLayout(container, l.id as any);
        controls.querySelectorAll('.editkit-columns-ctrl-btn').forEach(b => b.classList.remove('editkit-columns-ctrl-btn--active'));
        btn.classList.add('editkit-columns-ctrl-btn--active');
      });

      controls.appendChild(btn);
    });

    const divider = document.createElement('div');
    divider.classList.add('editkit-columns-ctrl-divider');
    controls.appendChild(divider);

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.classList.add('editkit-columns-ctrl-btn', 'editkit-columns-ctrl-btn--delete');
    deleteBtn.title = 'Delete Column Block';
    deleteBtn.setAttribute('aria-label', 'Delete Column Block');
    deleteBtn.innerHTML = icons.trash || `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`;

    deleteBtn.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this._closeMenu();
      container.remove();
    });

    controls.appendChild(deleteBtn);
    return controls;
  }

  private _createColumnItem(index: number): HTMLElement {
    const col = document.createElement('div');
    col.classList.add('editkit-column-item');
    col.setAttribute('data-col', String(index));

    // Header: COL label (Left) + "+ block" pill (Right)
    const header = document.createElement('div');
    header.classList.add('editkit-column-header');
    header.setAttribute('contenteditable', 'false');

    const label = document.createElement('span');
    label.classList.add('editkit-column-label');
    label.textContent = `COL ${index}`;

    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.classList.add('editkit-column-add-btn');
    addBtn.textContent = '+ block';
    addBtn.setAttribute('title', 'Insert block');

    header.appendChild(label);
    header.appendChild(addBtn);

    // Body: Editable content area
    const body = document.createElement('div');
    body.classList.add('editkit-column-body');
    body.setAttribute('contenteditable', 'true');
    body.setAttribute('spellcheck', 'false');

    const p = document.createElement('p');
    p.textContent = `Column ${index} content...`;
    body.appendChild(p);

    col.appendChild(header);
    col.appendChild(body);

    addBtn.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this._toggleMenu(addBtn, body);
    });

    return col;
  }

  private _switchLayout(container: HTMLElement, layout: '50-50' | '3-col' | '1-col' | '70-30' | '30-70'): void {
    container.setAttribute('data-layout', layout);
    const row = container.querySelector('.editkit-columns-row');
    if (!row) return;

    const existingCols = Array.from(row.querySelectorAll('.editkit-column-item'));
    const needed = layout === '3-col' ? 3 : layout === '1-col' ? 1 : 2;

    if (existingCols.length < needed) {
      for (let i = existingCols.length + 1; i <= needed; i++) {
        row.appendChild(this._createColumnItem(i));
      }
    } else if (existingCols.length > needed) {
      // Remove excess columns from the right
      for (let i = existingCols.length - 1; i >= needed; i--) {
        existingCols[i].remove();
      }
    }
  }

  // ── 2. + block Command Dropdown Menu (Matches Image 2) ──
  private _toggleMenu(anchorBtn: HTMLElement, targetBody: HTMLElement): void {
    if (this.activeMenu) {
      this._closeMenu();
      if (this.activeColumnBody === targetBody) return;
    }

    this.activeColumnBody = targetBody;
    this.activeMenu = this._buildMenu(targetBody);
    document.body.appendChild(this.activeMenu);

    // Position menu directly under anchorBtn
    const btnRect = anchorBtn.getBoundingClientRect();
    const menuWidth = 240;
    let left = btnRect.right - menuWidth;
    let top = btnRect.bottom + 6;

    if (left < 10) left = 10;
    if (left + menuWidth > window.innerWidth - 10) {
      left = window.innerWidth - menuWidth - 10;
    }

    this.activeMenu.style.top = `${top}px`;
    this.activeMenu.style.left = `${left}px`;
    this.activeMenu.classList.add('editkit-bcm--visible');

    const searchInput = this.activeMenu.querySelector('.editkit-bcm-search-input') as HTMLInputElement | null;
    if (searchInput) {
      setTimeout(() => searchInput.focus(), 30);
    }
  }

  private _closeMenu(): void {
    if (this.activeMenu) {
      this.activeMenu.remove();
      this.activeMenu = null;
      this.activeColumnBody = null;
    }
  }

  private _buildMenu(targetBody: HTMLElement): HTMLElement {
    const menu = document.createElement('div');
    menu.classList.add('editkit-block-command-menu');
    menu.setAttribute('contenteditable', 'false');
    menu.addEventListener('mousedown', (e) => e.stopPropagation());

    // Search header
    const searchWrap = document.createElement('div');
    searchWrap.classList.add('editkit-bcm-search-wrap');

    const searchIcon = document.createElement('span');
    searchIcon.classList.add('editkit-bcm-search-icon');
    searchIcon.innerHTML = icons.search || `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`;

    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.classList.add('editkit-bcm-search-input');
    searchInput.placeholder = 'Search commands...';
    searchInput.spellcheck = false;

    searchWrap.appendChild(searchIcon);
    searchWrap.appendChild(searchInput);
    menu.appendChild(searchWrap);

    // List container
    const list = document.createElement('div');
    list.classList.add('editkit-bcm-list');

    const items: CommandMenuItem[] = [
      // BLOCKS
      {
        id: 'p',
        label: 'Paragraph',
        category: 'BLOCKS',
        icon: icons.pilcrow,
        badge: 'P',
        action: (body) => {
          const p = document.createElement('p');
          p.textContent = 'New paragraph text...';
          body.appendChild(p);
          this._focusNode(p);
        },
      },
      {
        id: 'h1',
        label: 'Heading 1',
        category: 'BLOCKS',
        icon: 'H1',
        badge: 'H1',
        action: (body) => {
          const h1 = document.createElement('h1');
          h1.textContent = 'Heading 1';
          body.appendChild(h1);
          this._focusNode(h1);
        },
      },
      {
        id: 'h2',
        label: 'Heading 2',
        category: 'BLOCKS',
        icon: 'H2',
        badge: 'H2',
        action: (body) => {
          const h2 = document.createElement('h2');
          h2.textContent = 'Heading 2';
          body.appendChild(h2);
          this._focusNode(h2);
        },
      },
      {
        id: 'h3',
        label: 'Heading 3',
        category: 'BLOCKS',
        icon: 'H3',
        badge: 'H3',
        action: (body) => {
          const h3 = document.createElement('h3');
          h3.textContent = 'Heading 3';
          body.appendChild(h3);
          this._focusNode(h3);
        },
      },
      {
        id: 'h4',
        label: 'Heading 4',
        category: 'BLOCKS',
        icon: 'H4',
        badge: 'H4',
        action: (body) => {
          const h4 = document.createElement('h4');
          h4.textContent = 'Heading 4';
          body.appendChild(h4);
          this._focusNode(h4);
        },
      },
      {
        id: 'h5',
        label: 'Heading 5',
        category: 'BLOCKS',
        icon: 'H5',
        badge: 'H5',
        action: (body) => {
          const h5 = document.createElement('h5');
          h5.textContent = 'Heading 5';
          body.appendChild(h5);
          this._focusNode(h5);
        },
      },
      {
        id: 'h6',
        label: 'Heading 6',
        category: 'BLOCKS',
        icon: 'H6',
        badge: 'H6',
        action: (body) => {
          const h6 = document.createElement('h6');
          h6.textContent = 'Heading 6';
          body.appendChild(h6);
          this._focusNode(h6);
        },
      },
      {
        id: 'quote',
        label: 'Quote',
        category: 'BLOCKS',
        icon: icons.quote || `❝`,
        badge: 'Q',
        action: (body) => {
          const q = document.createElement('blockquote');
          q.innerHTML = '<p>Quote text here...</p>';
          body.appendChild(q);
          this._focusNode(q);
        },
      },
      {
        id: 'code',
        label: 'Code block',
        category: 'BLOCKS',
        icon: icons.codeBlock || `&lt;/&gt;`,
        badge: 'Code',
        action: (body) => {
          const pre = document.createElement('pre');
          pre.innerHTML = '<code>// Write code here...</code>';
          body.appendChild(pre);
          this._focusNode(pre);
        },
      },
      {
        id: 'bullet-list',
        label: 'Bulleted list',
        category: 'BLOCKS',
        icon: icons.bulletList || `•`,
        action: (body) => {
          const ul = document.createElement('ul');
          ul.innerHTML = '<li>List item 1</li><li>List item 2</li>';
          body.appendChild(ul);
          this._focusNode(ul);
        },
      },
      {
        id: 'numbered-list',
        label: 'Numbered list',
        category: 'BLOCKS',
        icon: icons.numberedList || `1.`,
        action: (body) => {
          const ol = document.createElement('ol');
          ol.innerHTML = '<li>Item 1</li><li>Item 2</li>';
          body.appendChild(ol);
          this._focusNode(ol);
        },
      },
      {
        id: 'table',
        label: 'Table',
        category: 'BLOCKS',
        icon: icons.table || `⊞`,
        action: (body) => {
          const tbl = document.createElement('table');
          tbl.classList.add('editkit-table');
          tbl.innerHTML = `
            <thead><tr><th>Header 1</th><th>Header 2</th></tr></thead>
            <tbody><tr><td>Cell 1</td><td>Cell 2</td></tr></tbody>
          `;
          body.appendChild(tbl);
          this._focusNode(tbl);
        },
      },
      {
        id: 'callout',
        label: 'Callout / Alert',
        category: 'BLOCKS',
        icon: icons.sparkles || `ℹ`,
        action: (body) => {
          const callout = document.createElement('div');
          callout.classList.add('editkit-alert-panel', 'editkit-alert-info');
          callout.innerHTML = `<span class="editkit-alert-icon">💡</span><div class="editkit-alert-content"><p>Note or highlight information...</p></div>`;
          body.appendChild(callout);
          this._focusNode(callout);
        },
      },
      {
        id: 'divider',
        label: 'Divider',
        category: 'BLOCKS',
        icon: icons.divider || `―`,
        action: (body) => {
          const hr = document.createElement('hr');
          hr.classList.add('editkit-divider');
          body.appendChild(hr);
        },
      },
      {
        id: 'image',
        label: 'Image',
        category: 'BLOCKS',
        icon: icons.image || `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`,
        badge: 'Img',
        action: (body) => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/*';
          input.onchange = () => {
            if (input.files && input.files[0]) {
              const file = input.files[0];
              const reader = new FileReader();
              reader.onload = (e) => {
                const img = document.createElement('img');
                img.src = e.target?.result as string;
                img.alt = file.name;
                img.classList.add('editkit-feature-img');
                body.appendChild(img);
                this.editor.emit('update', { editor: this.editor });
              };
              reader.readAsDataURL(file);
            }
          };
          input.click();
        },
      },
    ];

    const renderList = (filterText: string = '') => {
      list.innerHTML = '';
      const query = filterText.toLowerCase().trim();
      const filtered = items.filter(it => !query || it.label.toLowerCase().includes(query) || it.category.toLowerCase().includes(query));

      if (filtered.length === 0) {
        const empty = document.createElement('div');
        empty.classList.add('editkit-bcm-empty');
        empty.textContent = 'No matching commands';
        list.appendChild(empty);
        return;
      }

      let currentCat = '';
      filtered.forEach((it) => {
        if (it.category !== currentCat) {
          currentCat = it.category;
          const catHeader = document.createElement('div');
          catHeader.classList.add('editkit-bcm-category');
          catHeader.textContent = currentCat;
          list.appendChild(catHeader);
        }

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.classList.add('editkit-bcm-item');

        const left = document.createElement('div');
        left.classList.add('editkit-bcm-item-left');

        const iconSpan = document.createElement('span');
        iconSpan.classList.add('editkit-bcm-item-icon');
        iconSpan.innerHTML = it.icon;

        const labelSpan = document.createElement('span');
        labelSpan.classList.add('editkit-bcm-item-label');
        labelSpan.textContent = it.label;

        left.appendChild(iconSpan);
        left.appendChild(labelSpan);
        btn.appendChild(left);

        if (it.badge) {
          const badgeSpan = document.createElement('span');
          badgeSpan.classList.add('editkit-bcm-item-badge');
          badgeSpan.textContent = it.badge;
          btn.appendChild(badgeSpan);
        }

        btn.addEventListener('mousedown', (e) => {
          e.preventDefault();
          e.stopPropagation();
          it.action(targetBody, this.editor);
          this._closeMenu();
        });

        list.appendChild(btn);
      });
    };

    renderList();

    searchInput.addEventListener('input', () => {
      renderList(searchInput.value);
    });

    menu.appendChild(list);
    return menu;
  }

  private _focusNode(node: HTMLElement): void {
    const range = document.createRange();
    const sel = window.getSelection();
    range.selectNodeContents(node);
    range.collapse(false);
    sel?.removeAllRanges();
    sel?.addRange(range);
  }

  private _setupListeners(): void {
    // Close menu when clicking anywhere outside
    const onMouseDown = (e: MouseEvent) => {
      if (this.activeMenu && !this.activeMenu.contains(e.target as Node)) {
        this._closeMenu();
      }
    };
    document.addEventListener('mousedown', onMouseDown);
    this._unsubscribers.push(() => document.removeEventListener('mousedown', onMouseDown));

    // Handle delegated clicks on + block inside columns
    const onEditorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const addBtn = target.closest('.editkit-column-add-btn') as HTMLElement | null;
      if (addBtn && this.editor.contentEl.contains(addBtn)) {
        e.preventDefault();
        e.stopPropagation();
        const colItem = addBtn.closest('.editkit-column-item');
        const body = colItem?.querySelector('.editkit-column-body') as HTMLElement | null;
        if (body) {
          this._toggleMenu(addBtn, body);
        }
      }
    };

    this.editor.contentEl.addEventListener('click', onEditorClick);
    this._unsubscribers.push(() => this.editor.contentEl.removeEventListener('click', onEditorClick));
  }
}
