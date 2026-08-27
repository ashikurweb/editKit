// ============================================================
// EditKit — Core Editor Engine
// Built 100% from scratch. Zero external dependencies.
// ============================================================

import { EventEmitter } from './events';
import { ExtensionManager, Extension } from './Extension';
import type {
  EditKitConfig,
  EditKitEvents,
  EditorJSON,
  NodeJSON,
  MarkJSON,
  SavedSelection,
  HistoryEntry,
  TextAlign,
  HeadingLevel,
  TableOptions,
  TableCellInfo,
  TableBorderOptions,
  TableHorizontalAlign,
  TableVerticalAlign,
  BulletListStyle,
  NumberedListStyle,
  PanelType,
  DividerOptions,
} from './types';

// ── Block-level tag set ──────────────────────────────────────
const BLOCK_TAGS = new Set([
  'P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
  'BLOCKQUOTE', 'PRE', 'UL', 'OL', 'LI', 'HR',
  'DIV', 'TABLE', 'TR', 'TD', 'TH', 'THEAD', 'TBODY',
]);

// ── Mark ↔ tag mapping ──────────────────────────────────────
const MARK_TAG_MAP: Record<string, string> = {
  bold: 'STRONG',
  italic: 'EM',
  underline: 'U',
  strikethrough: 'S',
  code: 'CODE',
  keyboard: 'KBD',
  kbd: 'KBD',
  subscript: 'SUB',
  superscript: 'SUP',
};

const TAG_MARK_MAP: Record<string, string> = {
  'STRONG': 'bold',
  'B': 'bold',
  'EM': 'italic',
  'I': 'italic',
  'U': 'underline',
  'S': 'strikethrough',
  'STRIKE': 'strikethrough',
  'DEL': 'strikethrough',
  'CODE': 'code',
  'KBD': 'keyboard',
  'SUB': 'subscript',
  'SUP': 'superscript',
};

// ── History Manager ──────────────────────────────────────────
class HistoryManager {
  private stack: HistoryEntry[] = [];
  private index: number = -1;
  private maxSize: number;
  private _lastSaveTime: number = 0;

  constructor(maxSize: number = 100) {
    this.maxSize = maxSize;
  }

  push(entry: HistoryEntry): void {
    if (this.index >= 0 && this.stack[this.index]?.html === entry.html) return;

    this.stack = this.stack.slice(0, this.index + 1);
    this.stack.push(entry);

    if (this.stack.length > this.maxSize) {
      this.stack.shift();
    } else {
      this.index++;
    }
    this._lastSaveTime = Date.now();
  }

  undo(): HistoryEntry | null {
    if (!this.canUndo()) return null;
    this.index--;
    return this.stack[this.index] ?? null;
  }

  redo(): HistoryEntry | null {
    if (!this.canRedo()) return null;
    this.index++;
    return this.stack[this.index] ?? null;
  }

  canUndo(): boolean {
    return this.index > 0;
  }

  canRedo(): boolean {
    return this.index < this.stack.length - 1;
  }

  get lastSaveTime(): number {
    return this._lastSaveTime;
  }
}

// ── Helper: get node path relative to root ───────────────────
function getNodePath(root: Node, target: Node): number[] {
  const path: number[] = [];
  let current: Node | null = target;
  while (current && current !== root) {
    const parent: Node | null = current.parentNode;
    if (!parent) break;
    const children = Array.from(parent.childNodes);
    const idx = children.indexOf(current as ChildNode);
    if (idx === -1) break;
    path.unshift(idx);
    current = parent;
  }
  return path;
}

// ── Helper: get node from path ───────────────────────────────
function getNodeFromPath(root: Node, path: number[]): Node | null {
  let current: Node = root;
  for (const idx of path) {
    if (!current.childNodes[idx]) return null;
    current = current.childNodes[idx];
  }
  return current;
}

// ── Helper: find closest block ancestor ──────────────────────
function findClosestBlock(node: Node, root: Node): HTMLElement | null {
  let current: Node | null = node;
  while (current && current !== root) {
    if (
      current.nodeType === Node.ELEMENT_NODE &&
      BLOCK_TAGS.has((current as HTMLElement).tagName)
    ) {
      return current as HTMLElement;
    }
    current = current.parentNode;
  }
  return null;
}

// ── Helper: get all selected blocks ──────────────────────────
function getSelectedBlocks(root: HTMLElement): HTMLElement[] {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return [];

  const range = selection.getRangeAt(0);
  const blocks: HTMLElement[] = [];

  for (const child of Array.from(root.childNodes)) {
    if (child.nodeType !== Node.ELEMENT_NODE) continue;
    const el = child as HTMLElement;
    if (range.intersectsNode(el)) {
      blocks.push(el);
    }
  }

  if (blocks.length === 0) {
    const block = findClosestBlock(range.startContainer, root);
    if (block) blocks.push(block);
  }

  return blocks;
}


// ════════════════════════════════════════════════════════════════
// ██╗   ██╗███████╗██╗     ██╗      ██████╗ ██████╗  █████╗
// ██║   ██║██╔════╝██║     ██║     ██╔═══██╗██╔══██╗██╔══██╗
// ██║   ██║█████╗  ██║     ██║     ██║   ██║██████╔╝███████║
// ╚██╗ ██╔╝██╔══╝  ██║     ██║     ██║   ██║██╔══██╗██╔══██║
//  ╚████╔╝ ███████╗███████╗███████╗╚██████╔╝██║  ██║██║  ██║
//   ╚═══╝  ╚══════╝╚══════╝╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝
// ════════════════════════════════════════════════════════════════

export class EditKitEditor extends EventEmitter<EditKitEvents> {
  /** The root container element (.editkit) */
  readonly root: HTMLElement;
  /** The contenteditable element (.editkit-content) */
  readonly contentEl: HTMLElement;
  /** Extension & Plugin Manager */
  readonly extensionManager: ExtensionManager;

  private _config: EditKitConfig;
  private _history: HistoryManager;
  private _isComposing: boolean = false;
  private _isMounted: boolean = false;
  private _historyDebounce: ReturnType<typeof setTimeout> | null = null;
  private _selectionChangeHandler: (() => void) | null = null;
  private _lastActiveTableCell: TableCellInfo | null = null;
  private _lastActiveTable: HTMLTableElement | null = null;
  private _lastActiveCell: HTMLTableCellElement | null = null;
  private _currentFontSize: number = 14;
  private _currentFontFamily: string = 'DM Sans';
  private _currentLineHeight: string = '1.5';

  constructor(config: EditKitConfig = {}) {
    super();
    this._config = {
      editable: true,
      theme: 'dark',
      placeholder: 'Start writing or type "/" for commands...',
      autofocus: false,
      historyDepth: 100,
      defaultFontFamily: 'DM Sans',
      defaultFontSize: 14,
      ...config,
    };

    this._currentFontSize = this._config.defaultFontSize || 14;
    this._currentFontFamily = this._config.defaultFontFamily || 'DM Sans';
    this._history = new HistoryManager(this._config.historyDepth);

    // ── Create DOM ──
    this.root = document.createElement('div');
    this.root.classList.add('editkit');
    this.root.setAttribute('data-editkit', '');
    this.root.setAttribute('data-editkit-theme', this._config.theme!);

    this.contentEl = document.createElement('div');
    this.contentEl.classList.add('editkit-content');
    this.contentEl.setAttribute('contenteditable', String(this._config.editable));
    this.contentEl.setAttribute('role', 'textbox');
    this.contentEl.setAttribute('aria-multiline', 'true');
    this.contentEl.setAttribute('aria-label', 'Rich text editor');
    this.contentEl.setAttribute('spellcheck', 'true');
    this.contentEl.setAttribute('data-placeholder', this._config.placeholder!);

    // Apply default font settings
    this.contentEl.style.fontFamily = `"${this._currentFontFamily}", -apple-system, sans-serif`;
    this.contentEl.style.fontSize = `${this._currentFontSize}px`;

    // Set initial content
    if (this._config.content) {
      this.contentEl.innerHTML = this._config.content;
    } else {
      this.contentEl.innerHTML = '<p><br></p>';
      this.contentEl.classList.add('editkit-content--empty');
    }

    this.root.appendChild(this.contentEl);

    // ── Extension Manager ──
    this.extensionManager = new ExtensionManager(this, this._config.extensions || []);

    // ── Set up event listeners ──
    this._setupListeners();

    // ── Save initial history state ──
    this._saveHistory();

    // ── Auto-mount if element provided ──
    if (this._config.element) {
      const el = typeof this._config.element === 'string'
        ? document.querySelector(this._config.element) as HTMLElement
        : this._config.element;
      if (el) this.mount(el);
    }
  }

  // ═══════════════════════════════════════════
  // Public: Mount / Destroy
  // ═══════════════════════════════════════════

  /** Mount the editor into a container element */
  mount(container: HTMLElement): void {
    if (this._isMounted) return;
    container.appendChild(this.root);
    this._isMounted = true;

    if (this._config.autofocus) {
      requestAnimationFrame(() => this.focus('end'));
    }

    this.emit('create', { editor: this });
    this._config.onCreate?.(this);
  }

  /** Destroy the editor and clean up */
  destroy(): void {
    this.emit('destroy', { editor: this });
    this.extensionManager.emitDestroy();
    if (this._selectionChangeHandler) {
      document.removeEventListener('selectionchange', this._selectionChangeHandler);
    }
    this.root.remove();
    this.removeAllListeners();
    this._isMounted = false;
  }

  // ═══════════════════════════════════════════
  // Public: Content Access
  // ═══════════════════════════════════════════

  /** Get editor content as HTML string */
  getHTML(): string {
    return this.contentEl.innerHTML;
  }

  /** Get editor content as JSON document */
  getJSON(): EditorJSON {
    return {
      type: 'doc',
      content: this._parseNodesToJSON(this.contentEl),
      version: 1,
    };
  }

  /** Get plain text content */
  getText(): string {
    return (this.contentEl.innerText || '').trim();
  }

  /** Set editor content from HTML string */
  setContent(html: string, emitUpdate: boolean = true): void {
    this.contentEl.innerHTML = html || '<p><br></p>';
    this._saveHistory();
    if (emitUpdate) this._emitUpdate();
  }

  /** Clear all content */
  clearContent(emitUpdate: boolean = true): void {
    this.contentEl.classList.remove('editkit-content--empty');
    this.contentEl.innerHTML = '<p><br></p>';
    this._saveHistory();
    // Force DOM reflow to restart CSS reveal animation
    void this.contentEl.offsetWidth;
    this.contentEl.classList.add('editkit-content--empty');
    this.focus('start');
    if (emitUpdate) {
      this.emit('update', { editor: this });
      this.extensionManager.emitUpdate();
      this._config.onUpdate?.(this);
    }
  }

  /** Check if editor content is empty */
  get isEmpty(): boolean {
    if (this.contentEl.querySelector('table, img, hr, .editkit-columns-container, .editkit-faq-block, .editkit-button-block, .editkit-pull-quote, .editkit-section-heading-block, .editkit-hero-banner, .editkit-hero-pattern, .editkit-feature-row, .editkit-cta-band, .editkit-cta-band-pattern, .editkit-cta-band-card, .editkit-panel, .editkit-grid, .editkit-math-block, .editkit-signature-wrap, pre, blockquote, ul, ol, iframe, video, audio')) {
      return false;
    }
    const text = (this.contentEl.textContent || this.contentEl.innerText || '').replace(/[\u200B\u00A0\s]/g, '').trim();
    return !text || text === '';
  }

  /** Insert a custom block element at the current selection or replace empty editor */
  insertBlockNode(node: HTMLElement): void {
    const contentEl = this.contentEl;
    contentEl.classList.remove('editkit-content--empty');

    const p = document.createElement('p');
    p.innerHTML = '<br>';

    const frag = document.createDocumentFragment();
    frag.appendChild(node);
    frag.appendChild(p);

    if (this.isEmpty) {
      contentEl.innerHTML = '';
      contentEl.appendChild(frag);
    } else {
      const block = this.commands.getActiveBlock?.() || null;
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0 && contentEl.contains(sel.anchorNode)) {
        const range = sel.getRangeAt(0);
        // If current block is just an empty paragraph, replace it
        const anchorEl = sel.anchorNode instanceof HTMLElement ? sel.anchorNode : sel.anchorNode?.parentElement;
        const currentP = anchorEl?.closest('p');
        if (currentP && currentP.parentNode && (!currentP.textContent || currentP.textContent.trim() === '')) {
          currentP.parentNode.insertBefore(frag, currentP);
          currentP.remove();
        } else {
          range.collapse(false);
          range.insertNode(frag);
        }
      } else if (block && block !== contentEl && block.parentNode) {
        block.parentNode.insertBefore(frag, block.nextSibling);
      } else {
        contentEl.appendChild(frag);
      }
    }

    this._emitUpdate();
  }

  // ═══════════════════════════════════════════
  // Public: Focus / Blur / Editable
  // ═══════════════════════════════════════════

  focus(position?: 'start' | 'end' | 'all'): void {
    this.contentEl.focus();
    if (position === 'end') {
      this._moveCursorToEnd();
    } else if (position === 'start') {
      this._moveCursorToStart();
    } else if (position === 'all') {
      this._selectAll();
    }
  }

  blur(): void {
    this.contentEl.blur();
  }

  get isFocused(): boolean {
    return document.activeElement === this.contentEl || this.contentEl.contains(document.activeElement);
  }

  setEditable(editable: boolean): void {
    this._config.editable = editable;
    this.contentEl.setAttribute('contenteditable', String(editable));
  }

  get isEditable(): boolean {
    return this._config.editable ?? true;
  }

  // ═══════════════════════════════════════════
  // Public: Theme
  // ═══════════════════════════════════════════

  setTheme(theme: 'light' | 'dark' | 'system'): void {
    this._config.theme = theme;
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.root.setAttribute('data-editkit-theme', prefersDark ? 'dark' : 'light');
    } else {
      this.root.setAttribute('data-editkit-theme', theme);
    }
  }

  getTheme(): string {
    return this._config.theme || 'dark';
  }

  // ═══════════════════════════════════════════
  // Public: Commands
  // ═══════════════════════════════════════════

  readonly commands = {
    // ── Inline Formatting ──
    bold: () => this._toggleInlineFormat('bold'),
    italic: () => this._toggleInlineFormat('italic'),
    underline: () => this._toggleInlineFormat('underline'),
    strikethrough: () => this._toggleInlineFormat('strikethrough'),
    code: () => this._toggleInlineTag('CODE'),
    keyboardInput: () => this._toggleInlineTag('KBD'),
    subscript: () => this._toggleInlineFormat('subscript'),
    superscript: () => this._toggleInlineFormat('superscript'),

    // ── Typography & Font ──
    setFontFamily: (family: string) => this._setFontFamily(family),
    setFontSize: (sizeInPx: number) => this._setFontSize(sizeInPx),
    increaseFontSize: () => this._setFontSize(this._currentFontSize + 1),
    decreaseFontSize: () => this._setFontSize(Math.max(8, this._currentFontSize - 1)),
    getFontSize: () => this._currentFontSize,
    getFontFamily: () => this._currentFontFamily,

    // ── Text Color & Background ──
    setTextColor: (color: string) => this._setInlineStyle('color', color),
    setHighlight: (color: string) => this._setInlineStyle('backgroundColor', color),
    removeTextColor: () => this._removeInlineStyle('color'),
    removeHighlight: () => this._removeInlineStyle('backgroundColor'),

    // ── Block Formatting ──
    paragraph: () => this._setBlockType('P'),
    heading: (level: HeadingLevel) => this._setBlockType(`H${level}`),
    blockquote: () => this._toggleWrapBlock('BLOCKQUOTE'),
    codeBlock: () => this._setBlockType('PRE'),
    horizontalRule: () => this._insertHorizontalRule(),

    // ── Lists ──
    bulletList: (style?: BulletListStyle) => this._toggleList('UL', style),
    orderedList: (style?: NumberedListStyle) => this._toggleList('OL', undefined, style),
    taskList: () => this._toggleTaskList(),
    indent: () => this._indent(),
    outdent: () => this._outdent(),

    // ── Alignment & Spacing ──
    alignLeft: () => this._setAlignment('left'),
    alignCenter: () => this._setAlignment('center'),
    alignRight: () => this._setAlignment('right'),
    alignJustify: () => this._setAlignment('justify'),
    setTextAlign: (alignment: TextAlign) => this._setAlignment(alignment),
    setLineHeight: (height: string | number) => this._setLineHeight(height),
    getLineHeight: () => this._currentLineHeight,

    // ── Tables (First-Class Feature) ──
    insertTable: (options?: TableOptions) => this._insertTable(options),
    deleteTable: (table?: HTMLTableElement) => this._deleteTable(table),
    addRowAbove: (table?: HTMLTableElement, cell?: HTMLTableCellElement) => this._tableAddRow('above', table, cell),
    addRowBelow: (table?: HTMLTableElement, cell?: HTMLTableCellElement) => this._tableAddRow('below', table, cell),
    deleteRow: (table?: HTMLTableElement, cell?: HTMLTableCellElement) => this._tableDeleteRow(table, cell),
    addColumnLeft: (table?: HTMLTableElement, cell?: HTMLTableCellElement) => this._tableAddColumn('left', table, cell),
    addColumnRight: (table?: HTMLTableElement, cell?: HTMLTableCellElement) => this._tableAddColumn('right', table, cell),
    deleteColumn: (table?: HTMLTableElement, cell?: HTMLTableCellElement) => this._tableDeleteColumn(table, cell),
    toggleHeaderRow: (table?: HTMLTableElement) => this._tableToggleHeaderRow(table),
    toggleHeaderColumn: (table?: HTMLTableElement) => this._tableToggleHeaderColumn(table),
    setCellBackground: (color: string, cell?: HTMLTableCellElement) => this._tableSetCellBackground(color, cell),
    setTableBorderColor: (color: string, table?: HTMLTableElement) => this._tableSetBorderColor(color, table),
    setTableBorder: (options: TableBorderOptions, table?: HTMLTableElement) => this._tableSetBorder(options, table),
    toggleTableFullWidth: (table?: HTMLTableElement) => this._tableToggleFullWidth(table),
    setTableFullWidth: (fullWidth: boolean, table?: HTMLTableElement) => this._tableSetFullWidth(fullWidth, table),
    setTableAlignment: (horizontal: TableHorizontalAlign, table?: HTMLTableElement) => this._tableSetAlignment(horizontal, table),
    setCellAlignment: (horizontal?: TableHorizontalAlign, vertical?: TableVerticalAlign, cell?: HTMLTableCellElement, table?: HTMLTableElement) => this._tableSetCellAlignment(horizontal, vertical, cell, table),
    setOddRowStriping: (color?: string | boolean, table?: HTMLTableElement) => this._tableSetOddRowStriping(color, table),
    insertParagraphAboveTable: (table?: HTMLTableElement) => this._tableInsertParagraphAbove(table),
    insertParagraphBelowTable: (table?: HTMLTableElement) => this._tableInsertParagraphBelow(table),
    setColumnWidth: (colIndex: number, width: number | string, table?: HTMLTableElement) => this._tableSetColumnWidth(colIndex, width, table),

    // ── Media & Links ──
    insertImage: (opts: { src: string; alt?: string; title?: string; width?: string; height?: string }) => this._insertImage(opts),
    setLink: (opts: { url: string; target?: string }) => this._setLink(opts),
    unsetLink: () => this._unsetLink(),
    insertMath: (opts: { latex: string; type: 'block' | 'inline' }) => this._insertMath(opts),
    insertPanel: (type: PanelType = 'info', initialContent?: string) => this._insertPanel(type, initialContent),
    insertCallout: (type: PanelType = 'info', initialContent?: string) => this._insertPanel(type, initialContent),
    insertDivider: (options?: DividerOptions) => this._insertCustomDivider(options),
    insertCustomDivider: (options?: DividerOptions) => this._insertCustomDivider(options),

    // ── History ──
    undo: () => this._undo(),
    redo: () => this._redo(),

    // ── Document & Selection ──
    selectAll: () => {
      this.focus('all');
      this.emit('selectionUpdate', { editor: this });
    },
    clearContent: () => this.clearContent(),
    clearAll: () => this.clearContent(),
    getActiveBlock: () => this._getActiveBlock(),
    clearFormatting: () => this._clearFormatting(),
  };

  // ═══════════════════════════════════════════
  // Public: State Queries
  // ═══════════════════════════════════════════

  /** Check if a format or block type is currently active */
  isActive(type: string, attrs?: Record<string, any>): boolean {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || !this.contentEl.contains(sel.anchorNode)) return false;

    // Check inline marks
    if (MARK_TAG_MAP[type.toLowerCase()]) {
      const tag = MARK_TAG_MAP[type.toLowerCase()];
      return this._isWrappedIn(tag);
    }

    // Check blockquote
    const upperType = type.toUpperCase();
    if (upperType === 'BLOCKQUOTE') {
      return this._isInsideTag('BLOCKQUOTE');
    }

    // Check panel / callout
    if (upperType === 'PANEL' || upperType === 'CALLOUT') {
      return this.getActivePanel() !== null;
    }

    // Check headings
    const headingMatch = type.match(/^heading(\d)$/i) || type.match(/^h(\d)$/i);
    if (headingMatch) {
      const block = this._getActiveBlock();
      return block?.tagName === `H${headingMatch[1]}`;
    }

    // Check block type
    const block = this._getActiveBlock();
    if (block) {
      if (upperType === 'PARAGRAPH' || upperType === 'P') return block.tagName === 'P';
      if (upperType === 'PRE' || upperType === 'CODEBLOCK') return block.tagName === 'PRE';
      return block.tagName === upperType;
    }

    // Check alignment
    if (type.startsWith('align')) {
      const align = type.replace('align', '').toLowerCase() as TextAlign;
      const blocks = getSelectedBlocks(this.contentEl);
      return blocks.every(b => (b.style.textAlign || 'left') === align);
    }

    // Check list
    if (upperType === 'BULLETLIST' || upperType === 'UL') return this._isInsideTag('UL');
    if (upperType === 'ORDEREDLIST' || upperType === 'OL') return this._isInsideTag('OL');
    if (upperType === 'TABLE') return this._isInsideTag('TABLE');

    return false;
  }

  /** Check if cursor is currently inside a panel / callout */
  getActivePanel(): { panel: HTMLElement; body: HTMLElement; type: PanelType } | null {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;

    let node: Node | null = sel.anchorNode;
    while (node && node !== this.contentEl) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        if (el.classList.contains('editkit-panel')) {
          const body = (el.querySelector('.editkit-panel-body') as HTMLElement) || el;
          const type = (el.getAttribute('data-panel-type') as PanelType) || 'info';
          return { panel: el, body, type };
        }
      }
      node = node.parentNode;
    }
    return null;
  }

  /** Check if cursor is currently inside a table */
  getActiveTableCell(): TableCellInfo | null {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;

    let node: Node | null = sel.anchorNode;
    let cell: HTMLTableCellElement | null = null;
    let row: HTMLTableRowElement | null = null;
    let table: HTMLTableElement | null = null;

    while (node && node !== this.contentEl) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        if (!cell && (el.tagName === 'TD' || el.tagName === 'TH')) {
          cell = el as HTMLTableCellElement;
        }
        if (!row && el.tagName === 'TR') {
          row = el as HTMLTableRowElement;
        }
        if (!table && el.tagName === 'TABLE') {
          table = el as HTMLTableElement;
          break;
        }
      }
      node = node.parentNode;
    }

    if (!cell || !row || !table) return null;

    const rows = Array.from(table.rows);
    const rowIndex = rows.indexOf(row);
    const cells = Array.from(row.cells);
    const colIndex = cells.indexOf(cell);

    const info: TableCellInfo = {
      cell,
      row,
      table,
      rowIndex,
      colIndex,
      totalRows: rows.length,
      totalCols: row.cells.length,
      isHeader: cell.tagName === 'TH',
    };

    this._lastActiveTableCell = info;
    this._lastActiveTable = table;
    this._lastActiveCell = cell;

    return info;
  }

  /** Check available commands */
  can() {
    return {
      undo: () => this._history.canUndo(),
      redo: () => this._history.canRedo(),
      tableAction: () => this.getActiveTableCell() !== null,
    };
  }

  // ═══════════════════════════════════════════
  // Private: Event Listeners
  // ═══════════════════════════════════════════

  private _setupListeners(): void {
    // Keyboard shortcuts & Navigation
    this.contentEl.addEventListener('keydown', (e) => this._handleKeydown(e));

    // Input tracking for history
    this.contentEl.addEventListener('input', () => this._handleInput());

    // Composition (IME)
    this.contentEl.addEventListener('compositionstart', () => { this._isComposing = true; });
    this.contentEl.addEventListener('compositionend', () => {
      this._isComposing = false;
      this._handleInput();
    });

    // Focus / blur
    this.contentEl.addEventListener('focus', (e) => {
      this.root.classList.add('editkit--focused');
      this.emit('focus', { editor: this, event: e });
      this._config.onFocus?.(this);
    });
    this.contentEl.addEventListener('blur', (e) => {
      this.root.classList.remove('editkit--focused');
      this.emit('blur', { editor: this, event: e });
      this._config.onBlur?.(this);
    });

    // Paste handling
    this.contentEl.addEventListener('paste', (e) => this._handlePaste(e));

    // Selection change
    this._selectionChangeHandler = () => {
      if (!this.isFocused) return;
      this.emit('selectionUpdate', { editor: this });
      this.emit('tableSelect', { cellInfo: this.getActiveTableCell() });
      this.extensionManager.emitSelectionChange();
      this._config.onSelectionUpdate?.(this);
    };
    document.addEventListener('selectionchange', this._selectionChangeHandler);
  }

  // ═══════════════════════════════════════════
  // Private: Keyboard Handling
  // ═══════════════════════════════════════════

  private _handleKeydown(e: KeyboardEvent): void {
    if (this._isComposing) return;

    // Custom extension shortcuts
    const extShortcuts = this.extensionManager.getAllKeyboardShortcuts();
    for (const [combo, handler] of Object.entries(extShortcuts)) {
      // Check simple combo matching
      if (this._matchKeyCombo(combo, e)) {
        if (handler(this, e) !== false) {
          e.preventDefault();
          return;
        }
      }
    }

    const mod = e.metaKey || e.ctrlKey;

    // Built-in standard shortcuts
    if (mod && e.key === 'b') {
      e.preventDefault();
      this.commands.bold();
    } else if (mod && e.key === 'i') {
      e.preventDefault();
      this.commands.italic();
    } else if (mod && e.key === 'u') {
      e.preventDefault();
      this.commands.underline();
    } else if (mod && e.shiftKey && (e.key === 'S' || e.key === 's' || e.key === 'X' || e.key === 'x')) {
      e.preventDefault();
      this.commands.strikethrough();
    } else if (mod && (e.key === 'k' || e.key === 'K')) {
      e.preventDefault();
      this.emit('openLinkPopover', { editor: this });
    } else if (mod && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      this.commands.undo();
    } else if (e.key === 'Backspace') {
      const panelInfo = this.getActivePanel();
      if (panelInfo) {
        const { panel, body } = panelInfo;
        const text = body.textContent || '';
        if (text.trim() === '' || body.innerHTML === '<p><br></p>' || body.innerHTML === '<br>' || body.innerHTML === '') {
          e.preventDefault();
          const prev = panel.previousElementSibling as HTMLElement;
          const next = panel.nextElementSibling as HTMLElement;
          panel.remove();
          
          const target = prev || next || this.contentEl;
          const range = document.createRange();
          range.selectNodeContents(target);
          range.collapse(false);
          const sel = window.getSelection();
          sel?.removeAllRanges();
          sel?.addRange(range);
          
          this._saveHistory();
          this._emitUpdate();
          return;
        }
      }
    } else if (mod && ((e.key === 'z' && e.shiftKey) || e.key === 'y')) {
      e.preventDefault();
      this.commands.redo();
    } else if (e.key === 'Tab') {
      this._handleTabKey(e);
    } else if (e.key === 'Enter' && !e.shiftKey) {
      this._handleEnterKey(e);
    }
  }

  private _matchKeyCombo(combo: string, e: KeyboardEvent): boolean {
    const parts = combo.toLowerCase().split(/[-+]/);
    const modRequired = parts.includes('ctrl') || parts.includes('mod') || parts.includes('meta');
    const shiftRequired = parts.includes('shift');
    const altRequired = parts.includes('alt');
    const key = parts[parts.length - 1];

    const hasMod = e.metaKey || e.ctrlKey;
    if (modRequired !== hasMod) return false;
    if (shiftRequired !== e.shiftKey) return false;
    if (altRequired !== e.altKey) return false;

    return e.key.toLowerCase() === key;
  }

  private _handleTabKey(e: KeyboardEvent): void {
    const cellInfo = this.getActiveTableCell();
    if (cellInfo) {
      e.preventDefault();
      if (e.shiftKey) {
        // Shift+Tab: move to previous cell
        this._navigateTableCell(cellInfo, 'prev');
      } else {
        // Tab: move to next cell (or add row if at end)
        this._navigateTableCell(cellInfo, 'next');
      }
      return;
    }

    if (this._isInsideTag('LI')) {
      e.preventDefault();
      if (e.shiftKey) {
        this.commands.outdent();
      } else {
        this.commands.indent();
      }
    }
  }

  private _handleEnterKey(e: KeyboardEvent): void {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    const block = this._getActiveBlock();
    if (!block) return;

    // Inside a table cell — keep enter inside cell
    if (block.tagName === 'TD' || block.tagName === 'TH' || this._isInsideTag('TABLE')) {
      return; // Standard behavior or default line break
    }

    // Inside panel / callout
    const panelInfo = this.getActivePanel();
    if (panelInfo) {
      const { panel, body } = panelInfo;
      const paragraphs = Array.from(body.querySelectorAll('p'));
      const activeBlock = this._getActiveBlock();
      if (paragraphs.length > 1 && activeBlock === paragraphs[paragraphs.length - 1] && (activeBlock.textContent || '').trim() === '') {
        e.preventDefault();
        activeBlock.remove();
        let next = panel.nextElementSibling as HTMLElement;
        if (!next || next.tagName !== 'P') {
          next = document.createElement('p');
          next.innerHTML = '<br>';
          panel.parentNode!.insertBefore(next, panel.nextSibling);
        }
        const range = document.createRange();
        range.selectNodeContents(next);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
        this._saveHistory();
        this._emitUpdate();
        return;
      }
    }

    // Inside heading — create clean paragraph below
    if (/^H[1-6]$/.test(block.tagName)) {
      e.preventDefault();
      const range = sel.getRangeAt(0);

      const afterRange = document.createRange();
      afterRange.setStart(range.endContainer, range.endOffset);
      afterRange.setEndAfter(block.lastChild || block);
      const afterContent = afterRange.extractContents();

      const p = document.createElement('p');
      if (afterContent.textContent?.trim()) {
        p.appendChild(afterContent);
      } else {
        p.innerHTML = '<br>';
      }

      block.parentNode!.insertBefore(p, block.nextSibling);

      const newRange = document.createRange();
      newRange.setStart(p, 0);
      newRange.collapse(true);
      sel.removeAllRanges();
      sel.addRange(newRange);

      this._saveHistory();
      this._emitUpdate();
    }
  }

  private _handleInput(): void {
    if (this._isComposing) return;

    if (this._historyDebounce) clearTimeout(this._historyDebounce);
    this._historyDebounce = setTimeout(() => {
      this._saveHistory();
    }, 300);

    this._emitUpdate();
  }

  private _handlePaste(e: ClipboardEvent): void {
    e.preventDefault();

    // 1. Check for image files or screenshot blobs from clipboard
    if (e.clipboardData?.items) {
      for (const item of Array.from(e.clipboardData.items)) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
              const dataUrl = ev.target?.result as string;
              if (dataUrl) {
                this.commands.insertImage({ src: dataUrl, alt: 'Pasted image' });
              }
            };
            reader.readAsDataURL(file);
            return;
          }
        }
      }
    }

    const html = e.clipboardData?.getData('text/html');
    const text = (e.clipboardData?.getData('text/plain') || '').trim();

    // 2. Check if pasted text is an image URL
    const isImageUrl = /^https?:\/\/.+\.(png|jpg|jpeg|gif|webp|svg|avif)(\?.*)?$/i.test(text)
      || /^data:image\/[a-zA-Z+]+;base64,/.test(text)
      || (/^https?:\/\/(images\.unsplash\.com|cdn\.|i\.imgur\.com|media\.)/i.test(text));

    if (isImageUrl) {
      this.commands.insertImage({ src: text, alt: 'Inserted image' });
      return;
    }

    if (html) {
      const sanitized = this._sanitizeHTML(html);
      this._insertHTML(sanitized);
    } else {
      const paragraphs = text.split(/\n\n|\n/).filter(Boolean);
      if (paragraphs.length <= 1) {
        document.execCommand('insertText', false, text);
      } else {
        const phtml = paragraphs.map(p => `<p>${this._escapeHTML(p)}</p>`).join('');
        this._insertHTML(phtml);
      }
    }

    this._saveHistory();
    this._emitUpdate();
  }

  // ═══════════════════════════════════════════
  // Private: Typography & Formatting
  // ═══════════════════════════════════════════

  private _setFontFamily(family: string): void {
    this._currentFontFamily = family;
    this.contentEl.style.fontFamily = `"${family}", -apple-system, sans-serif`;
    this._emitUpdate();
  }

  private _setFontSize(sizeInPx: number): void {
    this._currentFontSize = sizeInPx;
    const sel = window.getSelection();
    if (sel && !sel.isCollapsed && this.contentEl.contains(sel.anchorNode)) {
      this._setInlineStyle('fontSize', `${sizeInPx}px`);
    } else {
      this.contentEl.style.fontSize = `${sizeInPx}px`;
    }
    this._emitUpdate();
  }

  private _toggleInlineFormat(command: string): void {
    this._ensureFocus();
    document.execCommand(command, false);
    this._saveHistory();
    this._emitUpdate();
  }

  private _toggleInlineTag(tagName: string): void {
    this._ensureFocus();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    const range = sel.getRangeAt(0);

    if (this._isWrappedIn(tagName)) {
      this._unwrapClosest(tagName);
    } else if (!range.collapsed) {
      const wrapper = document.createElement(tagName);
      const contents = range.extractContents();
      wrapper.appendChild(contents);
      range.insertNode(wrapper);

      const newRange = document.createRange();
      newRange.selectNodeContents(wrapper);
      sel.removeAllRanges();
      sel.addRange(newRange);
    }

    this._saveHistory();
    this._emitUpdate();
  }

  private _setInlineStyle(prop: string, value: string): void {
    this._ensureFocus();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;

    const range = sel.getRangeAt(0);
    const span = document.createElement('span');
    (span.style as any)[prop] = value;
    const contents = range.extractContents();
    span.appendChild(contents);
    range.insertNode(span);

    const newRange = document.createRange();
    newRange.selectNodeContents(span);
    sel.removeAllRanges();
    sel.addRange(newRange);

    this._saveHistory();
    this._emitUpdate();
  }

  private _removeInlineStyle(prop: string): void {
    this._ensureFocus();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    let node: Node | null = sel.anchorNode;
    while (node && node !== this.contentEl) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        if (el.tagName === 'SPAN' && (el.style as any)[prop]) {
          (el.style as any)[prop] = '';
          if (!el.getAttribute('style')?.trim()) {
            const parent = el.parentNode!;
            while (el.firstChild) parent.insertBefore(el.firstChild, el);
            parent.removeChild(el);
          }
          break;
        }
      }
      node = node.parentNode;
    }

    this._saveHistory();
    this._emitUpdate();
  }

  private _setBlockType(tagName: string): void {
    this._ensureFocus();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    const blocks = getSelectedBlocks(this.contentEl);
    if (blocks.length === 0) return;

    for (const block of blocks) {
      const li = block.closest('li');
      if (li && tagName !== 'P') continue;

      if (block.tagName === tagName) {
        const p = document.createElement('P');
        p.innerHTML = block.innerHTML;
        if (block.style.textAlign) p.style.textAlign = block.style.textAlign;
        block.parentNode!.replaceChild(p, block);
      } else {
        const newBlock = document.createElement(tagName);
        newBlock.innerHTML = block.innerHTML;
        if (block.style.textAlign) newBlock.style.textAlign = block.style.textAlign;
        block.parentNode!.replaceChild(newBlock, block);
      }
    }

    this._restoreFocusToContent();
    this._saveHistory();
    this._emitUpdate();
  }

  private _toggleWrapBlock(wrapperTag: string): void {
    this._ensureFocus();
    const block = this._getActiveBlock();
    if (!block) return;

    const existingWrapper = block.closest(wrapperTag.toLowerCase());
    if (existingWrapper && this.contentEl.contains(existingWrapper)) {
      const parent = existingWrapper.parentNode!;
      while (existingWrapper.firstChild) {
        parent.insertBefore(existingWrapper.firstChild, existingWrapper);
      }
      parent.removeChild(existingWrapper);
    } else {
      const wrapper = document.createElement(wrapperTag);
      block.parentNode!.insertBefore(wrapper, block);
      wrapper.appendChild(block);
    }

    this._restoreFocusToContent();
    this._saveHistory();
    this._emitUpdate();
  }

  private _insertHorizontalRule(): void {
    this._ensureFocus();
    const block = this._getActiveBlock();
    if (!block) return;

    const hr = document.createElement('hr');
    const p = document.createElement('p');
    p.innerHTML = '<br>';

    block.parentNode!.insertBefore(hr, block.nextSibling);
    block.parentNode!.insertBefore(p, hr.nextSibling);

    const sel = window.getSelection();
    const range = document.createRange();
    range.setStart(p, 0);
    range.collapse(true);
    sel?.removeAllRanges();
    sel?.addRange(range);

    this._saveHistory();
    this._emitUpdate();
  }

  private _toggleList(listTag: 'UL' | 'OL', bulletStyle?: BulletListStyle, numStyle?: NumberedListStyle): void {
    this._ensureFocus();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    const existingList = this._findAncestor(sel.anchorNode, listTag) as HTMLElement | null;
    if (existingList) {
      if (bulletStyle && listTag === 'UL') {
        existingList.style.listStyleType = bulletStyle === 'default' ? 'disc' : bulletStyle;
        this._saveHistory();
        this._emitUpdate();
        return;
      }
      if (numStyle && listTag === 'OL') {
        existingList.style.listStyleType = numStyle;
        this._saveHistory();
        this._emitUpdate();
        return;
      }

      // Unwrap list
      const items = Array.from(existingList.querySelectorAll(':scope > li'));
      const parent = existingList.parentNode!;
      for (const item of items) {
        const p = document.createElement('p');
        p.innerHTML = item.innerHTML;
        parent.insertBefore(p, existingList);
      }
      parent.removeChild(existingList);
    } else {
      const otherTag = listTag === 'UL' ? 'OL' : 'UL';
      const otherList = this._findAncestor(sel.anchorNode, otherTag) as HTMLElement | null;
      if (otherList) {
        const newList = document.createElement(listTag);
        newList.innerHTML = otherList.innerHTML;
        if (bulletStyle && listTag === 'UL') newList.style.listStyleType = bulletStyle;
        if (numStyle && listTag === 'OL') newList.style.listStyleType = numStyle;
        otherList.parentNode!.replaceChild(newList, otherList);
      } else {
        const blocks = getSelectedBlocks(this.contentEl);
        if (blocks.length === 0) return;

        const list = document.createElement(listTag);
        if (bulletStyle && listTag === 'UL') list.style.listStyleType = bulletStyle;
        if (numStyle && listTag === 'OL') list.style.listStyleType = numStyle;
        blocks[0].parentNode!.insertBefore(list, blocks[0]);

        for (const block of blocks) {
          const li = document.createElement('li');
          li.innerHTML = block.innerHTML;
          list.appendChild(li);
          block.remove();
        }
      }
    }

    this._restoreFocusToContent();
    this._saveHistory();
    this._emitUpdate();
  }

  private _toggleTaskList(): void {
    this._ensureFocus();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    const existingList = this._findAncestor(sel.anchorNode, 'UL');
    if (existingList?.classList.contains('editkit-task-list')) {
      const items = Array.from(existingList.querySelectorAll(':scope > li'));
      const parent = existingList.parentNode!;
      for (const item of items) {
        const p = document.createElement('p');
        const checkbox = item.querySelector('input[type="checkbox"]');
        checkbox?.remove();
        p.innerHTML = item.innerHTML;
        parent.insertBefore(p, existingList);
      }
      parent.removeChild(existingList);
    } else {
      const blocks = getSelectedBlocks(this.contentEl);
      if (blocks.length === 0) return;

      const list = document.createElement('ul');
      list.classList.add('editkit-task-list');
      blocks[0].parentNode!.insertBefore(list, blocks[0]);

      for (const block of blocks) {
        const li = document.createElement('li');
        li.classList.add('editkit-task-item');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.classList.add('editkit-task-checkbox');
        checkbox.addEventListener('change', () => {
          li.classList.toggle('editkit-task-done', checkbox.checked);
          this._saveHistory();
          this._emitUpdate();
        });
        li.appendChild(checkbox);
        const span = document.createElement('span');
        span.innerHTML = block.innerHTML;
        li.appendChild(span);
        list.appendChild(li);
        block.remove();
      }
    }

    this._restoreFocusToContent();
    this._saveHistory();
    this._emitUpdate();
  }

  private _indent(): void {
    this._ensureFocus();
    const sel = window.getSelection();
    if (!sel) return;

    const li = this._findAncestor(sel.anchorNode, 'LI') as HTMLElement | null;
    if (!li) return;

    const prevLi = li.previousElementSibling;
    if (!prevLi) return;

    const parentList = li.parentElement!;
    const listTag = parentList.tagName;
    let subList = prevLi.querySelector(`:scope > ${listTag.toLowerCase()}`);
    if (!subList) {
      subList = document.createElement(listTag);
      prevLi.appendChild(subList);
    }
    subList.appendChild(li);

    this._restoreFocusToContent();
    this._saveHistory();
    this._emitUpdate();
  }

  private _outdent(): void {
    this._ensureFocus();
    const sel = window.getSelection();
    if (!sel) return;

    const li = this._findAncestor(sel.anchorNode, 'LI') as HTMLElement | null;
    if (!li) return;

    const parentList = li.parentElement;
    if (!parentList) return;

    const grandParentLi = parentList.parentElement;
    if (!grandParentLi || grandParentLi.tagName !== 'LI') return;

    const grandParentList = grandParentLi.parentElement!;
    grandParentList.insertBefore(li, grandParentLi.nextSibling);

    if (parentList.children.length === 0) {
      parentList.remove();
    }

    this._restoreFocusToContent();
    this._saveHistory();
    this._emitUpdate();
  }

  private _setAlignment(align: TextAlign): void {
    this._ensureFocus();
    const blocks = getSelectedBlocks(this.contentEl);
    for (const block of blocks) {
      block.style.textAlign = align === 'left' ? '' : align;
    }
    this._saveHistory();
    this._emitUpdate();
  }

  private _setLineHeight(height: string | number): void {
    this._ensureFocus();
    this._currentLineHeight = String(height);
    const blocks = getSelectedBlocks(this.contentEl);
    for (const block of blocks) {
      block.style.lineHeight = String(height);
    }
    this._saveHistory();
    this._emitUpdate();
  }

  private _clearFormatting(): void {
    this._ensureFocus();
    document.execCommand('removeFormat', false);

    const blocks = getSelectedBlocks(this.contentEl);
    for (const block of blocks) {
      if (block.tagName !== 'P') {
        const p = document.createElement('p');
        p.innerHTML = block.innerHTML;
        block.parentNode!.replaceChild(p, block);
      }
      (block as HTMLElement).style.textAlign = '';
      (block as HTMLElement).style.fontSize = '';
      (block as HTMLElement).style.fontFamily = '';
    }

    this._saveHistory();
    this._emitUpdate();
  }

  // ═══════════════════════════════════════════
  // Private: Table Operations (First-Class)
  // ═══════════════════════════════════════════

  private _insertTable(options: TableOptions = {}): void {
    this._ensureFocus();
    const rowsCount = Math.max(1, options.rows ?? 3);
    const colsCount = Math.max(1, options.cols ?? 3);
    const withHeader = options.withHeaderRow ?? true;

    const table = document.createElement('table');
    table.classList.add('editkit-table');
    if (options.striped) table.classList.add('editkit-table--striped');

    if (withHeader) {
      const thead = document.createElement('thead');
      const headerRow = document.createElement('tr');
      for (let c = 0; c < colsCount; c++) {
        const th = document.createElement('th');
        th.innerHTML = `Header ${c + 1}`;
        headerRow.appendChild(th);
      }
      thead.appendChild(headerRow);
      table.appendChild(thead);
    }

    const tbody = document.createElement('tbody');
    const startRow = withHeader ? 1 : 0;
    for (let r = startRow; r < rowsCount; r++) {
      const tr = document.createElement('tr');
      for (let c = 0; c < colsCount; c++) {
        const td = document.createElement('td');
        td.innerHTML = '<br>';
        tr.appendChild(td);
      }
      tbody.appendChild(tr);
    }
    table.appendChild(tbody);

    this.contentEl.classList.remove('editkit-content--empty');

    if (this.isEmpty) {
      this.contentEl.innerHTML = '';
      this.contentEl.appendChild(table);
    } else {
      const block = this._getActiveBlock();
      if (block && block !== this.contentEl) {
        if (!block.textContent || block.textContent.trim() === '') {
          block.parentNode!.insertBefore(table, block);
          block.remove();
        } else {
          block.parentNode!.insertBefore(table, block.nextSibling);
        }
      } else {
        this.contentEl.appendChild(table);
      }
    }

    // Add trailing paragraph after table for easy escape
    const p = document.createElement('p');
    p.innerHTML = '<br>';
    table.parentNode!.insertBefore(p, table.nextSibling);

    // Focus the first cell
    const firstCell = table.querySelector('td, th') as HTMLElement;
    if (firstCell) {
      const range = document.createRange();
      range.selectNodeContents(firstCell);
      range.collapse(true);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }

    this._saveHistory();
    this._emitUpdate();
  }

  private _resolveTableInfo(targetTable?: HTMLTableElement, targetCell?: HTMLTableCellElement): TableCellInfo | { table: HTMLTableElement; cell: HTMLTableCellElement; row: HTMLTableRowElement; colIndex: number; rowIndex: number; totalRows: number; totalCols: number; isHeader: boolean } | null {
    if (targetTable && targetTable.isConnected) {
      const rows = Array.from(targetTable.rows);
      const row = (targetCell ? (targetCell.closest('tr') as HTMLTableRowElement | null) : null) || rows[0] || null;
      const cell = targetCell || (row ? (row.cells[0] as HTMLTableCellElement | null) : null) || (targetTable.querySelector('td, th') as HTMLTableCellElement | null);
      if (!cell || !row) return null;
      const rowIndex = rows.indexOf(row);
      const colIndex = Array.from(row.cells).indexOf(cell);
      return {
        table: targetTable,
        cell,
        row,
        rowIndex: Math.max(0, rowIndex),
        colIndex: Math.max(0, colIndex),
        totalRows: rows.length,
        totalCols: row.cells.length,
        isHeader: cell.tagName === 'TH',
      };
    }

    const current = this.getActiveTableCell();
    if (current && current.table && current.table.isConnected) {
      return current;
    }

    if (this._lastActiveTableCell && this._lastActiveTableCell.table && this._lastActiveTableCell.table.isConnected) {
      return this._lastActiveTableCell;
    }

    if (this._lastActiveTable && this._lastActiveTable.isConnected) {
      const rows = Array.from(this._lastActiveTable.rows);
      const row = rows[0] || null;
      const cell = (this._lastActiveCell && this._lastActiveCell.isConnected) ? this._lastActiveCell : (this._lastActiveTable.querySelector('td, th') as HTMLTableCellElement | null);
      if (!cell || !row) return null;
      return {
        table: this._lastActiveTable,
        cell,
        row,
        rowIndex: 0,
        colIndex: 0,
        totalRows: rows.length,
        totalCols: row.cells.length,
        isHeader: cell.tagName === 'TH',
      };
    }

    return null;
  }

  private _tableAddRow(position: 'above' | 'below', targetTable?: HTMLTableElement, targetCell?: HTMLTableCellElement): void {
    const info = this._resolveTableInfo(targetTable, targetCell);
    if (!info) return;

    const { table, row, totalCols } = info;
    const newRow = document.createElement('tr');
    for (let c = 0; c < totalCols; c++) {
      const td = document.createElement('td');
      td.innerHTML = '<br>';
      newRow.appendChild(td);
    }

    if (position === 'above') {
      row.parentNode!.insertBefore(newRow, row);
    } else {
      row.parentNode!.insertBefore(newRow, row.nextSibling);
    }

    this._focusCell(newRow.cells[0]);
    this._saveHistory();
    this._emitUpdate();
  }

  private _tableDeleteRow(targetTable?: HTMLTableElement, targetCell?: HTMLTableCellElement): void {
    const info = this._resolveTableInfo(targetTable, targetCell);
    if (!info) return;

    const { table, row, totalRows } = info;
    if (totalRows <= 1) {
      this._deleteTable(table);
      return;
    }

    const nextRow = (row.nextElementSibling || row.previousElementSibling) as HTMLTableRowElement | null;
    row.remove();

    if (nextRow && nextRow.cells.length > 0) {
      this._focusCell(nextRow.cells[0]);
    }

    this._saveHistory();
    this._emitUpdate();
  }

  private _tableAddColumn(position: 'left' | 'right', targetTable?: HTMLTableElement, targetCell?: HTMLTableCellElement): void {
    const info = this._resolveTableInfo(targetTable, targetCell);
    if (!info) return;

    const { table, colIndex } = info;
    const insertIdx = position === 'left' ? colIndex : colIndex + 1;

    for (const r of Array.from(table.rows)) {
      const isHeader = r.parentElement?.tagName === 'THEAD' || r.cells[0]?.tagName === 'TH';
      const newCell = document.createElement(isHeader ? 'th' : 'td');
      newCell.innerHTML = isHeader ? 'Header' : '<br>';

      if (insertIdx >= r.cells.length) {
        r.appendChild(newCell);
      } else {
        r.insertBefore(newCell, r.cells[insertIdx]);
      }
    }

    if (table.classList.contains('editkit-table--fullwidth') || table.style.width === '100%') {
      const rows = Array.from(table.rows);
      const totalCols = rows[0]?.cells.length || 1;
      const colPercent = `${(100 / totalCols).toFixed(2)}%`;
      for (const row of rows) {
        for (let i = 0; i < row.cells.length; i++) {
          const cell = row.cells[i] as HTMLElement;
          cell.style.width = colPercent;
          cell.style.minWidth = '40px';
        }
      }
    }

    this._saveHistory();
    this._emitUpdate();
  }

  private _tableDeleteColumn(targetTable?: HTMLTableElement, targetCell?: HTMLTableCellElement): void {
    const info = this._resolveTableInfo(targetTable, targetCell);
    if (!info) return;

    const { table, colIndex, totalCols } = info;
    if (totalCols <= 1) {
      this._deleteTable(table);
      return;
    }

    for (const r of Array.from(table.rows)) {
      if (r.cells[colIndex]) {
        r.cells[colIndex].remove();
      }
    }

    if (table.classList.contains('editkit-table--fullwidth') || table.style.width === '100%') {
      const rows = Array.from(table.rows);
      const remainingCols = rows[0]?.cells.length || 1;
      const colPercent = `${(100 / remainingCols).toFixed(2)}%`;
      for (const row of rows) {
        for (let i = 0; i < row.cells.length; i++) {
          const cell = row.cells[i] as HTMLElement;
          cell.style.width = colPercent;
          cell.style.minWidth = '40px';
        }
      }
    }

    this._saveHistory();
    this._emitUpdate();
  }

  private _tableToggleHeaderRow(targetTable?: HTMLTableElement): void {
    const info = this._resolveTableInfo(targetTable);
    if (!info) return;

    const { table } = info;
    const thead = table.querySelector('thead');
    if (thead) {
      // Remove header: convert <th> to <td> and move to tbody
      const tbody = table.querySelector('tbody') || table;
      const tr = thead.querySelector('tr');
      if (tr) {
        const newTr = document.createElement('tr');
        for (const th of Array.from(tr.cells)) {
          const td = document.createElement('td');
          td.innerHTML = th.innerHTML;
          newTr.appendChild(td);
        }
        tbody.insertBefore(newTr, tbody.firstChild);
      }
      thead.remove();
    } else {
      // Add header: take first row of tbody and convert to thead
      const tbody = table.querySelector('tbody') || table;
      const firstRow = tbody.querySelector('tr');
      if (firstRow) {
        const newThead = document.createElement('thead');
        const headerTr = document.createElement('tr');
        for (const cell of Array.from(firstRow.cells)) {
          const th = document.createElement('th');
          th.innerHTML = cell.innerHTML.trim() === '<br>' ? 'Header' : cell.innerHTML;
          headerTr.appendChild(th);
        }
        newThead.appendChild(headerTr);
        table.insertBefore(newThead, table.firstChild);
        firstRow.remove();
      }
    }

    this._saveHistory();
    this._emitUpdate();
  }

  private _tableSetCellBackground(color: string, targetCell?: HTMLTableCellElement): void {
    const cell = targetCell || this._resolveTableInfo()?.cell;
    if (!cell) return;
    cell.style.backgroundColor = color;
    this._saveHistory();
    this._emitUpdate();
  }

  private _tableSetBorderColor(color: string, targetTable?: HTMLTableElement): void {
    const info = this._resolveTableInfo(targetTable);
    if (!info) return;
    info.table.style.borderColor = color;
    for (const cell of Array.from(info.table.querySelectorAll('td, th'))) {
      (cell as HTMLElement).style.borderColor = color;
    }
    this._saveHistory();
    this._emitUpdate();
  }

  private _tableSetBorder(options: TableBorderOptions, targetTable?: HTMLTableElement): void {
    const info = this._resolveTableInfo(targetTable);
    if (!info) return;
    const table = info.table;
    const size = options.size ?? 'thin';
    const color = options.color || '#bbbbbb';

    table.setAttribute('data-border-size', size);
    table.setAttribute('data-border-color', color);

    if (size === 'none') {
      table.style.setProperty('border', 'none', 'important');
      for (const cell of Array.from(table.querySelectorAll('td, th'))) {
        (cell as HTMLElement).style.setProperty('border', 'none', 'important');
      }
    } else {
      const widthMap: Record<string, string> = {
        thin: '1px',
        medium: '2px',
        thick: '4px',
      };
      const width = widthMap[size] || '1px';
      const borderVal = `${width} solid ${color}`;
      table.style.setProperty('border', borderVal, 'important');
      for (const cell of Array.from(table.querySelectorAll('td, th'))) {
        (cell as HTMLElement).style.setProperty('border', borderVal, 'important');
      }
    }

    this._saveHistory();
    this._emitUpdate();
  }

  private _tableToggleFullWidth(targetTable?: HTMLTableElement): void {
    const info = this._resolveTableInfo(targetTable);
    if (!info) return;
    const table = info.table;
    const isCurrentlyFull = table.classList.contains('editkit-table--fullwidth') || table.style.width === '100%';
    this._tableSetFullWidth(!isCurrentlyFull, table);
  }

  private _tableSetFullWidth(fullWidth: boolean, targetTable?: HTMLTableElement): void {
    const info = this._resolveTableInfo(targetTable);
    if (!info) return;
    const table = info.table;

    if (fullWidth) {
      table.classList.add('editkit-table--fullwidth');
      table.style.width = '100%';
      table.style.maxWidth = '100%';
      table.style.minWidth = '100%';
      table.style.marginLeft = '0';
      table.style.marginRight = '0';
      table.style.tableLayout = 'fixed';

      // Distribute columns evenly across 100% width
      const rows = Array.from(table.rows);
      const firstRow = rows[0];
      if (firstRow && firstRow.cells.length > 0) {
        const totalCols = firstRow.cells.length;
        const colPercent = `${(100 / totalCols).toFixed(2)}%`;
        for (const row of rows) {
          for (let i = 0; i < row.cells.length; i++) {
            const cell = row.cells[i] as HTMLElement;
            cell.style.width = colPercent;
            cell.style.minWidth = '40px';
          }
        }
      }
    } else {
      table.classList.remove('editkit-table--fullwidth');
      table.style.width = 'auto';
      table.style.maxWidth = '100%';
      table.style.minWidth = '360px';
      table.style.tableLayout = 'auto';

      const rows = Array.from(table.rows);
      for (const row of rows) {
        for (let i = 0; i < row.cells.length; i++) {
          const cell = row.cells[i] as HTMLElement;
          cell.style.width = '110px';
          cell.style.minWidth = '110px';
        }
      }
    }

    this._saveHistory();
    this._emitUpdate();
  }

  private _tableSetAlignment(horizontal: TableHorizontalAlign, targetTable?: HTMLTableElement): void {
    const info = this._resolveTableInfo(targetTable);
    if (!info) return;
    const table = info.table;
    table.setAttribute('data-align', horizontal);

    // If table was fullwidth, center/right align needs auto width to be visually apparent
    if (table.classList.contains('editkit-table--fullwidth')) {
      table.classList.remove('editkit-table--fullwidth');
      table.style.width = 'auto';
      table.style.maxWidth = '100%';
      table.style.minWidth = '360px';
      table.style.tableLayout = 'auto';
      const rows = Array.from(table.rows);
      for (const row of rows) {
        for (let i = 0; i < row.cells.length; i++) {
          const cell = row.cells[i] as HTMLElement;
          cell.style.width = '110px';
          cell.style.minWidth = '110px';
        }
      }
    }

    if (horizontal === 'center') {
      table.style.marginLeft = 'auto';
      table.style.marginRight = 'auto';
    } else if (horizontal === 'right') {
      table.style.marginLeft = 'auto';
      table.style.marginRight = '0';
    } else {
      table.style.marginLeft = '0';
      table.style.marginRight = 'auto';
    }
    this._saveHistory();
    this._emitUpdate();
  }

  private _tableSetCellAlignment(horizontal?: TableHorizontalAlign, vertical?: TableVerticalAlign, targetCell?: HTMLTableCellElement, targetTable?: HTMLTableElement): void {
    const resolved = this._resolveTableInfo(targetTable, targetCell);
    if (!resolved) return;

    const targetCells = targetCell ? [targetCell] : (resolved.cell ? [resolved.cell] : Array.from(resolved.table.querySelectorAll('td, th')) as HTMLTableCellElement[]);

    for (const cell of targetCells) {
      if (horizontal) {
        cell.style.textAlign = horizontal;
      }
      if (vertical) {
        cell.style.verticalAlign = vertical;
      }
    }
    this._saveHistory();
    this._emitUpdate();
  }

  private _tableSetOddRowStriping(color?: string | boolean, targetTable?: HTMLTableElement): void {
    const info = this._resolveTableInfo(targetTable);
    if (!info) return;
    const table = info.table;
    if (color === false) {
      table.classList.remove('editkit-table--striped');
      table.style.removeProperty('--editkit-stripe-color');
      table.removeAttribute('data-stripe-color');
      for (const row of Array.from(table.querySelectorAll('tbody tr:nth-child(even) td, tbody tr:nth-child(even) th'))) {
        (row as HTMLElement).style.removeProperty('background-color');
      }
    } else if (typeof color === 'string') {
      table.classList.add('editkit-table--striped');
      table.setAttribute('data-stripe-color', color);
      table.style.setProperty('--editkit-stripe-color', color);
      for (const row of Array.from(table.querySelectorAll('tbody tr:nth-child(even) td, tbody tr:nth-child(even) th'))) {
        (row as HTMLElement).style.backgroundColor = color;
      }
    } else {
      const isStriped = table.classList.toggle('editkit-table--striped');
      if (!isStriped) {
        table.style.removeProperty('--editkit-stripe-color');
        table.removeAttribute('data-stripe-color');
      }
    }
    this._saveHistory();
    this._emitUpdate();
  }

  private _tableInsertParagraphAbove(targetTable?: HTMLTableElement): void {
    const info = this._resolveTableInfo(targetTable);
    if (!info) return;
    const table = info.table;
    const p = document.createElement('p');
    p.innerHTML = '<br>';
    table.parentNode!.insertBefore(p, table);
    this._focusCell(p);
    this._saveHistory();
    this._emitUpdate();
  }

  private _tableInsertParagraphBelow(targetTable?: HTMLTableElement): void {
    const info = this._resolveTableInfo(targetTable);
    if (!info) return;
    const table = info.table;
    const p = document.createElement('p');
    p.innerHTML = '<br>';
    if (table.nextSibling) {
      table.parentNode!.insertBefore(p, table.nextSibling);
    } else {
      table.parentNode!.appendChild(p);
    }
    this._focusCell(p);
    this._saveHistory();
    this._emitUpdate();
  }

  private _tableToggleHeaderColumn(targetTable?: HTMLTableElement): void {
    const info = this._resolveTableInfo(targetTable);
    if (!info) return;
    const table = info.table;

    for (const r of Array.from(table.rows)) {
      if (r.parentElement?.tagName === 'THEAD') continue;
      const cell = r.cells[0];
      if (!cell) continue;

      const newTag = cell.tagName === 'TH' ? 'td' : 'th';
      const newCell = document.createElement(newTag);
      newCell.innerHTML = cell.innerHTML;
      if (cell.style.cssText) newCell.style.cssText = cell.style.cssText;
      r.replaceChild(newCell, cell);
    }

    this._saveHistory();
    this._emitUpdate();
  }

  private _tableSetColumnWidth(colIndex: number, width: number | string, targetTable?: HTMLTableElement): void {
    const info = this._resolveTableInfo(targetTable);
    if (!info) return;
    const table = info.table;
    const widthStr = typeof width === 'number' ? `${width}px` : width;

    for (const r of Array.from(table.rows)) {
      const cell = r.cells[colIndex];
      if (cell) {
        cell.style.width = widthStr;
      }
    }

    this._saveHistory();
    this._emitUpdate();
  }

  private _deleteTable(targetTable?: HTMLTableElement): void {
    const info = this._resolveTableInfo(targetTable);
    if (!info) return;

    const table = info.table;
    const p = document.createElement('p');
    p.innerHTML = '<br>';
    table.parentNode!.insertBefore(p, table);
    table.remove();

    this._focusCell(p);
    this._saveHistory();
    this._emitUpdate();
  }

  private _navigateTableCell(info: TableCellInfo, direction: 'next' | 'prev'): void {
    const { table, rowIndex, colIndex, totalRows, totalCols } = info;
    const allCells: HTMLElement[] = [];

    for (const r of Array.from(table.rows)) {
      for (const c of Array.from(r.cells)) {
        allCells.push(c);
      }
    }

    const currentIdx = allCells.indexOf(info.cell);
    if (direction === 'next') {
      if (currentIdx === allCells.length - 1) {
        // At last cell: append new row automatically!
        this._tableAddRow('below');
      } else {
        this._focusCell(allCells[currentIdx + 1]);
      }
    } else {
      if (currentIdx > 0) {
        this._focusCell(allCells[currentIdx - 1]);
      }
    }
  }

  private _focusCell(el: HTMLElement): void {
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
  }

  // ═══════════════════════════════════════════
  // Private: Media & Links
  // ═══════════════════════════════════════════

  private _insertImage(opts: { src: string; alt?: string; title?: string; width?: string; height?: string }): void {
    this._ensureFocus();
    const img = document.createElement('img');
    img.src = opts.src;
    if (opts.alt) img.alt = opts.alt;
    if (opts.title) img.title = opts.title;
    img.classList.add('editkit-image');

    // Standard initial sizing
    img.style.width = opts.width || '480px';
    img.style.maxWidth = '100%';
    img.style.height = opts.height || 'auto';
    img.style.display = 'block';
    img.style.margin = '1em 0';

    const p = document.createElement('p');
    p.innerHTML = '<br>';

    const block = this._getActiveBlock();
    if (block && block !== this.contentEl && block.parentNode) {
      block.parentNode.insertBefore(img, block.nextSibling);
      block.parentNode.insertBefore(p, img.nextSibling);
    } else {
      this.contentEl.appendChild(img);
      this.contentEl.appendChild(p);
    }

    this._saveHistory();
    this._emitUpdate();
  }

  private _setLink(opts: { url: string; target?: string }): void {
    this._ensureFocus();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    const range = sel.getRangeAt(0);
    if (range.collapsed) {
      const a = document.createElement('a');
      a.href = opts.url;
      a.textContent = opts.url;
      if (opts.target) a.target = opts.target;
      range.insertNode(a);
    } else {
      document.execCommand('createLink', false, opts.url);
      if (opts.target) {
        const parentA = this._findAncestor(sel.anchorNode, 'A');
        if (parentA) parentA.setAttribute('target', opts.target);
      }
    }

    this._saveHistory();
    this._emitUpdate();
  }

  private _unsetLink(): void {
    this._ensureFocus();
    document.execCommand('unlink', false);
    this._saveHistory();
    this._emitUpdate();
  }

  private _insertMath(opts: { latex: string; type: 'block' | 'inline' }): HTMLElement {
    this._ensureFocus();
    const sel = window.getSelection();

    if (opts.type === 'block') {
      const el = document.createElement('div');
      el.classList.add('editkit-math-block');
      el.setAttribute('data-math', opts.latex);
      el.setAttribute('contenteditable', 'false');
      el.innerHTML = this._renderMath(opts.latex);

      const block = this._getActiveBlock() || this.contentEl;
      if (block === this.contentEl) {
        this.contentEl.appendChild(el);
      } else {
        block.parentNode!.insertBefore(el, block.nextSibling);
      }

      if (!el.nextElementSibling || el.nextElementSibling.tagName !== 'P') {
        const p = document.createElement('p');
        p.innerHTML = '<br>';
        el.parentNode!.insertBefore(p, el.nextSibling);
      }

      this._saveHistory();
      this._emitUpdate();
      return el;
    } else {
      const el = document.createElement('span');
      el.classList.add('editkit-math-inline');
      el.setAttribute('data-math', opts.latex);
      el.setAttribute('contenteditable', 'false');
      el.innerHTML = this._renderMath(opts.latex);

      if (sel && sel.rangeCount > 0 && this.contentEl.contains(sel.anchorNode)) {
        const range = sel.getRangeAt(0);
        range.deleteContents();
        range.insertNode(el);
        range.setStartAfter(el);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
      } else {
        this.contentEl.appendChild(el);
      }

      this._saveHistory();
      this._emitUpdate();
      return el;
    }
  }

  private _renderMath(latex: string): string {
    let html = latex;
    html = html.replace(/\\frac\s*\{([^{}]+)\}\s*\{([^{}]+)\}/g, '<span class="editkit-math-frac"><span class="editkit-math-num">$1</span><span class="editkit-math-den">$2</span></span>');
    html = html.replace(/\\sqrt\s*\{([^{}]+)\}/g, '<span class="editkit-math-sqrt"><span class="editkit-math-sqrt-sym">√</span><span class="editkit-math-sqrt-body">$1</span></span>');
    html = html.replace(/\\int/g, '<span class="editkit-math-symbol">∫</span>');
    html = html.replace(/\\sum/g, '<span class="editkit-math-symbol">∑</span>');
    html = html.replace(/\\prod/g, '<span class="editkit-math-symbol">∏</span>');
    html = html.replace(/\\lim/g, '<span class="editkit-math-func">lim</span>');
    html = html.replace(/\\infty/g, '∞');
    html = html.replace(/\\partial/g, '∂');
    html = html.replace(/\\nabla/g, '∇');
    html = html.replace(/\\alpha/g, 'α');
    html = html.replace(/\\beta/g, 'β');
    html = html.replace(/\\gamma/g, 'γ');
    html = html.replace(/\\theta/g, 'θ');
    html = html.replace(/\\pi/g, 'π');
    html = html.replace(/\\pm/g, '±');
    html = html.replace(/\\times/g, '×');
    html = html.replace(/\\div/g, '÷');
    html = html.replace(/\\leq/g, '≤');
    html = html.replace(/\\geq/g, '≥');
    html = html.replace(/\\neq/g, '≠');
    html = html.replace(/\\approx/g, '≈');
    html = html.replace(/\^\{([^{}]+)\}/g, '<sup>$1</sup>');
    html = html.replace(/\^([a-zA-Z0-9])/g, '<sup>$1</sup>');
    html = html.replace(/_\{([^{}]+)\}/g, '<sub>$1</sub>');
    html = html.replace(/_([a-zA-Z0-9])/g, '<sub>$1</sub>');
    return `<span class="editkit-math-rendered">${html}</span>`;
  }

  // ── Callout / Alert Panels ──

  private _getPanelIconSvg(type: PanelType): string {
    switch (type) {
      case 'info':
        return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
      case 'warning':
        return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
      case 'error':
        return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
      case 'success':
        return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="m9 12 2 2 4-4"></path></svg>`;
      case 'note':
      default:
        return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>`;
    }
  }

  private _insertPanel(type: PanelType = 'info', initialContent?: string): HTMLElement {
    this._ensureFocus();
    const sel = window.getSelection();

    const panel = document.createElement('div');
    panel.classList.add('editkit-panel', `editkit-panel--${type}`);
    panel.setAttribute('data-panel-type', type);

    const iconEl = document.createElement('div');
    iconEl.classList.add('editkit-panel-icon');
    iconEl.setAttribute('contenteditable', 'false');
    iconEl.innerHTML = this._getPanelIconSvg(type);

    const bodyEl = document.createElement('div');
    bodyEl.classList.add('editkit-panel-body');

    const placeholders: Record<PanelType, string> = {
      info: 'Enter your info content...',
      warning: 'Enter your warning content...',
      error: 'Enter your error content...',
      success: 'Enter your success content...',
      note: 'Enter your note content...',
    };
    bodyEl.setAttribute('data-placeholder', placeholders[type] || 'Enter panel content...');

    if (initialContent) {
      bodyEl.innerHTML = `<p>${initialContent}</p>`;
    } else if (sel && sel.rangeCount > 0 && !sel.isCollapsed && this.contentEl.contains(sel.anchorNode)) {
      const range = sel.getRangeAt(0);
      const frag = range.extractContents();
      const p = document.createElement('p');
      p.appendChild(frag);
      bodyEl.appendChild(p);
    } else {
      const p = document.createElement('p');
      p.innerHTML = '<br>';
      bodyEl.appendChild(p);
    }

    panel.appendChild(iconEl);
    panel.appendChild(bodyEl);

    const block = this._getActiveBlock();
    if (block && block !== this.contentEl) {
      block.parentNode!.insertBefore(panel, block.nextSibling);
    } else {
      this.contentEl.appendChild(panel);
    }

    // Add trailing paragraph after panel
    const nextP = document.createElement('p');
    nextP.innerHTML = '<br>';
    panel.parentNode!.insertBefore(nextP, panel.nextSibling);

    // Focus inside body
    const firstP = bodyEl.querySelector('p') || bodyEl;
    const range = document.createRange();
    range.selectNodeContents(firstP);
    range.collapse(true);
    sel?.removeAllRanges();
    sel?.addRange(range);

    this._saveHistory();
    this._emitUpdate();
    return panel;
  }

  // ── Custom Dividers ──

  private _insertCustomDivider(options: DividerOptions = {}): HTMLElement {
    this._ensureFocus();
    const color = options.color || '#000000';
    const style = options.style || 'solid';
    const width = options.width || '100%';
    const thickness = options.thickness !== undefined ? options.thickness : 1;

    const dThick = style === 'double' ? Math.max(thickness * 2, 3) : thickness;
    const borderTopStyle = `${dThick}px ${style} ${color}`;

    const hr = document.createElement('hr');
    hr.classList.add('editkit-custom-divider');
    hr.style.border = 'none';
    hr.style.borderTop = borderTopStyle;
    hr.style.width = width;
    hr.style.margin = '24px auto';
    hr.style.display = 'block';

    const p = document.createElement('p');
    p.innerHTML = '<br>';

    const block = this._getActiveBlock();
    if (block && block !== this.contentEl && block.parentNode) {
      block.parentNode.insertBefore(hr, block.nextSibling);
      block.parentNode.insertBefore(p, hr.nextSibling);
    } else {
      this.contentEl.appendChild(hr);
      this.contentEl.appendChild(p);
    }

    const sel = window.getSelection();
    if (sel) {
      const range = document.createRange();
      range.selectNodeContents(p);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    }

    this._saveHistory();
    this._emitUpdate();
    return hr;
  }

  // ═══════════════════════════════════════════
  // Private: History (Undo / Redo)
  // ═══════════════════════════════════════════

  private _saveHistory(): void {
    const sel = window.getSelection();
    let savedSel: SavedSelection | null = null;

    if (sel && sel.rangeCount > 0 && this.contentEl.contains(sel.anchorNode)) {
      savedSel = {
        anchorPath: getNodePath(this.contentEl, sel.anchorNode!),
        anchorOffset: sel.anchorOffset,
        focusPath: getNodePath(this.contentEl, sel.focusNode!),
        focusOffset: sel.focusOffset,
      };
    }

    this._history.push({
      html: this.contentEl.innerHTML,
      selection: savedSel,
      timestamp: Date.now(),
    });
  }

  private _undo(): void {
    const entry = this._history.undo();
    if (!entry) return;
    this.contentEl.innerHTML = entry.html;
    this._restoreSelection(entry.selection);
    this._emitUpdate();
  }

  private _redo(): void {
    const entry = this._history.redo();
    if (!entry) return;
    this.contentEl.innerHTML = entry.html;
    this._restoreSelection(entry.selection);
    this._emitUpdate();
  }

  private _restoreSelection(saved: SavedSelection | null): void {
    if (!saved) return;
    try {
      const anchor = getNodeFromPath(this.contentEl, saved.anchorPath);
      const focus = getNodeFromPath(this.contentEl, saved.focusPath);
      if (!anchor || !focus) return;

      const sel = window.getSelection();
      if (!sel) return;

      const range = document.createRange();
      const anchorOffset = Math.min(saved.anchorOffset, anchor.textContent?.length ?? 0);
      const focusOffset = Math.min(saved.focusOffset, focus.textContent?.length ?? 0);

      range.setStart(anchor, anchorOffset);
      range.setEnd(focus, focusOffset);
      sel.removeAllRanges();
      sel.addRange(range);
    } catch {
      // Ignore restored selection edge case
    }
  }

  // ═══════════════════════════════════════════
  // Private: DOM & Node Helpers
  // ═══════════════════════════════════════════

  private _ensureFocus(): void {
    if (!this.isFocused) this.contentEl.focus();
  }

  private _getActiveBlock(): HTMLElement | null {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;
    return findClosestBlock(sel.anchorNode!, this.contentEl);
  }

  private _isWrappedIn(tagName: string): boolean {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return false;

    let node: Node | null = sel.anchorNode;
    while (node && node !== this.contentEl) {
      if (node.nodeType === Node.ELEMENT_NODE && (node as Element).tagName === tagName) {
        return true;
      }
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        if (tagName === 'STRONG' || tagName === 'B') {
          const fw = window.getComputedStyle(el).fontWeight;
          if (fw === 'bold' || parseInt(fw) >= 700) {
            if (el !== this.contentEl) return true;
          }
        }
        if (tagName === 'EM' || tagName === 'I') {
          if (window.getComputedStyle(el).fontStyle === 'italic') {
            if (el !== this.contentEl) return true;
          }
        }
      }
      node = node.parentNode;
    }
    return false;
  }

  private _isInsideTag(tagName: string): boolean {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return false;
    return !!this._findAncestor(sel.anchorNode, tagName);
  }

  private _findAncestor(node: Node | null, tagName: string): Element | null {
    let current: Node | null = node;
    while (current && current !== this.contentEl) {
      if (current.nodeType === Node.ELEMENT_NODE && (current as Element).tagName === tagName) {
        return current as Element;
      }
      current = current.parentNode;
    }
    return null;
  }

  private _unwrapClosest(tagName: string): void {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    let node: Node | null = sel.anchorNode;
    while (node && node !== this.contentEl) {
      if (node.nodeType === Node.ELEMENT_NODE && (node as Element).tagName === tagName) {
        const parent = node.parentNode!;
        while (node.firstChild) {
          parent.insertBefore(node.firstChild, node);
        }
        parent.removeChild(node);
        return;
      }
      node = node.parentNode;
    }
  }

  private _moveCursorToEnd(): void {
    const range = document.createRange();
    range.selectNodeContents(this.contentEl);
    range.collapse(false);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
  }

  private _moveCursorToStart(): void {
    const range = document.createRange();
    range.selectNodeContents(this.contentEl);
    range.collapse(true);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
  }

  private _selectAll(): void {
    const range = document.createRange();
    range.selectNodeContents(this.contentEl);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
  }

  private _restoreFocusToContent(): void {
    requestAnimationFrame(() => {
      if (!this.isFocused) this.contentEl.focus();
    });
  }

  private _insertHTML(html: string): void {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    const range = sel.getRangeAt(0);
    range.deleteContents();

    const temp = document.createElement('div');
    temp.innerHTML = html;

    const frag = document.createDocumentFragment();
    let lastNode: Node | null = null;
    while (temp.firstChild) {
      lastNode = frag.appendChild(temp.firstChild);
    }
    range.insertNode(frag);

    if (lastNode) {
      const newRange = document.createRange();
      newRange.setStartAfter(lastNode);
      newRange.collapse(true);
      sel.removeAllRanges();
      sel.addRange(newRange);
    }
  }

  private _sanitizeHTML(html: string): string {
    const temp = document.createElement('div');
    temp.innerHTML = html;

    temp.querySelectorAll('script, style, link, meta, iframe, object, embed').forEach(el => el.remove());

    const allElements = temp.querySelectorAll('*');
    allElements.forEach(el => {
      const attrs = Array.from(el.attributes);
      attrs.forEach(attr => {
        if (attr.name.startsWith('on') || attr.name === 'style') {
          if (attr.name === 'style') {
            const style = (el as HTMLElement).style;
            const safeProps = ['color', 'background-color', 'text-align', 'font-weight',
              'font-style', 'text-decoration', 'font-size', 'font-family'];
            const safeStyles: string[] = [];
            for (const prop of safeProps) {
              const val = style.getPropertyValue(prop);
              if (val) safeStyles.push(`${prop}: ${val}`);
            }
            el.setAttribute('style', safeStyles.join('; '));
          } else {
            el.removeAttribute(attr.name);
          }
        }
      });

      if (el.tagName === 'A') {
        const href = el.getAttribute('href') || '';
        if (href.startsWith('javascript:') || href.startsWith('data:')) {
          el.removeAttribute('href');
        }
      }
    });

    return temp.innerHTML;
  }

  private _escapeHTML(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ═══════════════════════════════════════════
  // Private: JSON Serialization
  // ═══════════════════════════════════════════

  private _parseNodesToJSON(container: HTMLElement): NodeJSON[] {
    const nodes: NodeJSON[] = [];
    for (const child of Array.from(container.childNodes)) {
      const node = this._nodeToJSON(child);
      if (node) nodes.push(node);
    }
    return nodes;
  }

  private _nodeToJSON(domNode: Node): NodeJSON | null {
    if (domNode.nodeType === Node.TEXT_NODE) {
      const text = domNode.textContent || '';
      if (!text) return null;
      return { type: 'text', text };
    }

    if (domNode.nodeType !== Node.ELEMENT_NODE) return null;
    const el = domNode as HTMLElement;
    const tag = el.tagName;

    if (TAG_MARK_MAP[tag]) {
      const markType = TAG_MARK_MAP[tag];
      const children = this._parseNodesToJSON(el);
      for (const child of children) {
        if (!child.marks) child.marks = [];
        child.marks.push({ type: markType });
      }
      return children.length === 1 ? children[0] : { type: 'fragment', content: children };
    }

    const json: NodeJSON = { type: 'paragraph' };

    switch (tag) {
      case 'P': json.type = 'paragraph'; break;
      case 'H1': json.type = 'heading'; json.attrs = { level: 1 }; break;
      case 'H2': json.type = 'heading'; json.attrs = { level: 2 }; break;
      case 'H3': json.type = 'heading'; json.attrs = { level: 3 }; break;
      case 'H4': json.type = 'heading'; json.attrs = { level: 4 }; break;
      case 'H5': json.type = 'heading'; json.attrs = { level: 5 }; break;
      case 'H6': json.type = 'heading'; json.attrs = { level: 6 }; break;
      case 'BLOCKQUOTE': json.type = 'blockquote'; break;
      case 'PRE': json.type = 'codeBlock'; break;
      case 'UL': json.type = el.classList.contains('editkit-task-list') ? 'taskList' : 'bulletList'; break;
      case 'OL': json.type = 'orderedList'; break;
      case 'LI': json.type = el.classList.contains('editkit-task-item') ? 'taskItem' : 'listItem'; break;
      case 'TABLE': json.type = 'table'; break;
      case 'TR': json.type = 'tableRow'; break;
      case 'TD': json.type = 'tableCell'; break;
      case 'TH': json.type = 'tableHeader'; break;
      case 'HR': return { type: 'horizontalRule' };
      case 'BR': return null;
      case 'IMG':
        return {
          type: 'image',
          attrs: { src: el.getAttribute('src'), alt: el.getAttribute('alt') || '' }
        };
      default: json.type = 'paragraph';
    }

    if (el.style.textAlign) {
      if (!json.attrs) json.attrs = {};
      json.attrs.textAlign = el.style.textAlign;
    }

    const children = this._parseNodesToJSON(el);
    if (children.length > 0) {
      json.content = children;
    }

    return json;
  }

  // ═══════════════════════════════════════════
  // Private: Emit
  // ═══════════════════════════════════════════

  private _emitUpdate(): void {
    const wasEmpty = this.contentEl.classList.contains('editkit-content--empty');
    if (this.isEmpty) {
      if (!wasEmpty) {
        void this.contentEl.offsetWidth;
        this.contentEl.classList.add('editkit-content--empty');
      }
    } else {
      if (wasEmpty) {
        this.contentEl.classList.remove('editkit-content--empty');
      }
    }

    this.emit('update', { editor: this });
    this.extensionManager.emitUpdate();
    this._config.onUpdate?.(this);
  }
}

// ═══════════════════════════════════════════
// Factory Function
// ═══════════════════════════════════════════

export function createEditor(config: EditKitConfig = {}): EditKitEditor {
  return new EditKitEditor(config);
}
