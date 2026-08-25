// ============================================================
// @editkit/core — Public API
// ============================================================

export { EditKitEditor, createEditor } from './Editor';
export { EventEmitter } from './events';
export { Extension, ExtensionManager } from './Extension';
export type {
  ExtensionOptions,
  ExtensionCommandMap,
  KeyboardShortcutMap,
  CustomToolbarItem,
} from './Extension';
export type {
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
  BulletListStyle,
  NumberedListStyle,
} from './types';
