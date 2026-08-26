// ============================================================
// EditKit — Comprehensive Core Type Definitions
// ============================================================

import type { Extension, CustomToolbarItem } from './Extension';

/** Callout / Alert Panel Types */
export type PanelType = 'info' | 'warning' | 'error' | 'success' | 'note';

/** Custom Divider / Horizontal Rule Options */
export interface DividerOptions {
  color?: string;
  style?: 'solid' | 'dashed' | 'dotted' | 'double' | string;
  width?: string;
  thickness?: number;
}

/** Table Insertion and Styling Options */
export type TableBorderSize = 'none' | 'thin' | 'medium' | 'thick';

export interface TableBorderOptions {
  size?: TableBorderSize;
  color?: string;
}

export type TableHorizontalAlign = 'left' | 'center' | 'right';
export type TableVerticalAlign = 'top' | 'middle' | 'bottom';

export interface TableOptions {
  rows?: number;
  cols?: number;
  withHeaderRow?: boolean;
  withHeaderCol?: boolean;
  striped?: boolean;
  borderColor?: string;
  headerBackground?: string;
  fullWidth?: boolean;
}

export interface TableCellInfo {
  cell: HTMLTableCellElement;
  row: HTMLTableRowElement;
  table: HTMLTableElement;
  rowIndex: number;
  colIndex: number;
  totalRows: number;
  totalCols: number;
  isHeader: boolean;
}

/** Configuration for creating an editor instance */
export interface EditKitConfig {
  /** Container element or selector to mount the editor into */
  element?: HTMLElement | string;
  /** Initial HTML content */
  content?: string;
  /** Whether the editor is editable (default: true) */
  editable?: boolean;
  /** Theme: 'light' | 'dark' | 'system' */
  theme?: 'light' | 'dark' | 'system';
  /** Placeholder text when editor is empty */
  placeholder?: string;
  /** Auto-focus on mount */
  autofocus?: boolean;
  /** Default Font Family (e.g. 'DM Sans', 'Inter') */
  defaultFontFamily?: string;
  /** Default Font Size in px (e.g. 14, 16) */
  defaultFontSize?: number;
  /** Maximum history stack size (default: 100) */
  historyDepth?: number;
  /** Custom extensions / plugins */
  extensions?: Extension[];
  /** Custom toolbar items registered by caller */
  customToolbarItems?: CustomToolbarItem[];
  /** Callback on content change */
  onUpdate?: (editor: any) => void;
  /** Callback on editor creation */
  onCreate?: (editor: any) => void;
  /** Callback on selection change */
  onSelectionUpdate?: (editor: any) => void;
  /** Callback on focus */
  onFocus?: (editor: any) => void;
  /** Callback on blur */
  onBlur?: (editor: any) => void;
}

/** JSON representation of an editor document */
export interface EditorJSON {
  type: 'doc';
  content: NodeJSON[];
  version: number;
}

/** JSON representation of a node */
export interface NodeJSON {
  type: string;
  attrs?: Record<string, any>;
  content?: NodeJSON[];
  marks?: MarkJSON[];
  text?: string;
}

/** JSON representation of a mark (inline formatting) */
export interface MarkJSON {
  type: string;
  attrs?: Record<string, any>;
}

/** Saved selection state for history */
export interface SavedSelection {
  anchorPath: number[];
  anchorOffset: number;
  focusPath: number[];
  focusOffset: number;
}

/** History entry — snapshot of editor state */
export interface HistoryEntry {
  html: string;
  selection: SavedSelection | null;
  timestamp: number;
}

/** Text alignment options */
export type TextAlign = 'left' | 'center' | 'right' | 'justify';

/** Heading levels (1-6) */
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

/** Bullet style variants */
export type BulletListStyle = 'default' | 'circle' | 'square';

/** Numbered list style variants */
export type NumberedListStyle = 'decimal' | 'lower-alpha' | 'lower-roman';

/** Editor event types */
export interface EditKitEvents {
  create: { editor: any };
  update: { editor: any };
  selectionUpdate: { editor: any };
  focus: { editor: any; event: FocusEvent };
  blur: { editor: any; event: FocusEvent };
  destroy: { editor: any };
  tableSelect: { cellInfo: TableCellInfo | null };
  openLinkPopover: { editor: any };
}
