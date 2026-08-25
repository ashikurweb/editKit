// ============================================================
// @vellora/core — Public API
// ============================================================

export { VelloraEditor, createEditor } from './Editor';
export { EventEmitter } from './events';
export { Extension, ExtensionManager } from './Extension';
export type {
  ExtensionOptions,
  ExtensionCommandMap,
  KeyboardShortcutMap,
  CustomToolbarItem,
} from './Extension';
export type {
  VelloraConfig,
  VelloraEvents,
  EditorJSON,
  NodeJSON,
  MarkJSON,
  SavedSelection,
  HistoryEntry,
  TextAlign,
  HeadingLevel,
  TableOptions,
  TableCellInfo,
  BulletListStyle,
  NumberedListStyle,
} from './types';
