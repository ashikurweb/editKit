// ============================================================
// Vellora — Plugin & Extension Architecture
// Framework-Agnostic & Fully Extensible
// ============================================================

import type { VelloraEditor } from '../Editor';

export interface ExtensionOptions {
  [key: string]: any;
}

export interface ExtensionCommandMap {
  [commandName: string]: (...args: any[]) => any;
}

export interface KeyboardShortcutMap {
  [keyCombo: string]: (editor: VelloraEditor, event: KeyboardEvent) => boolean | void;
}

export interface CustomToolbarItem {
  id: string;
  label: string;
  icon?: string;
  group?: 'history' | 'block' | 'font' | 'inline' | 'list' | 'insert' | 'custom' | 'right';
  tooltip?: string;
  onClick?: (editor: VelloraEditor) => void;
  isActive?: (editor: VelloraEditor) => boolean;
  isDisabled?: (editor: VelloraEditor) => boolean;
  dropdown?: Array<{
    id: string;
    label: string;
    icon?: string;
    onClick?: (editor: VelloraEditor) => void;
    isActive?: (editor: VelloraEditor) => boolean;
  }>;
}

export abstract class Extension<Options extends ExtensionOptions = ExtensionOptions> {
  readonly options: Options;
  editor!: VelloraEditor;

  constructor(options: Partial<Options> = {} as Partial<Options>) {
    this.options = { ...this.defaultOptions(), ...options } as Options;
  }

  abstract get name(): string;

  defaultOptions(): Options {
    return {} as Options;
  }

  /** Called when the extension is bound to an editor */
  onInit(_editor: VelloraEditor): void {}

  /** Called when the editor content or state changes */
  onUpdate(_editor: VelloraEditor): void {}

  /** Called when the selection changes */
  onSelectionChange(_editor: VelloraEditor): void {}

  /** Called when editor is destroyed */
  onDestroy(_editor: VelloraEditor): void {}

  /** Define custom commands this extension provides to `editor.commands` */
  defineCommands?(_editor: VelloraEditor): ExtensionCommandMap;

  /** Define custom keyboard shortcuts */
  defineKeyboardShortcuts?(): KeyboardShortcutMap;

  /** Register custom toolbar items */
  defineToolbarItems?(): CustomToolbarItem[];
}

export class ExtensionManager {
  private extensions: Map<string, Extension> = new Map();
  private editor: VelloraEditor;

  constructor(editor: VelloraEditor, initialExtensions: Extension[] = []) {
    this.editor = editor;
    initialExtensions.forEach(ext => this.register(ext));
  }

  register(extension: Extension): void {
    if (this.extensions.has(extension.name)) {
      console.warn(`[Vellora] Extension "${extension.name}" already registered. Replacing.`);
      this.unregister(extension.name);
    }

    extension.editor = this.editor;
    this.extensions.set(extension.name, extension);

    try {
      extension.onInit(this.editor);
    } catch (err) {
      console.error(`[Vellora] Error initializing extension "${extension.name}":`, err);
    }

    // Register custom commands if any
    if (extension.defineCommands) {
      const cmds = extension.defineCommands(this.editor);
      for (const [name, fn] of Object.entries(cmds)) {
        (this.editor.commands as any)[name] = fn;
      }
    }
  }

  unregister(extensionName: string): void {
    const ext = this.extensions.get(extensionName);
    if (ext) {
      try {
        ext.onDestroy(this.editor);
      } catch (err) {
        console.error(`[Vellora] Error destroying extension "${extensionName}":`, err);
      }
      this.extensions.delete(extensionName);
    }
  }

  get<T extends Extension = Extension>(name: string): T | undefined {
    return this.extensions.get(name) as T | undefined;
  }

  getAll(): Extension[] {
    return Array.from(this.extensions.values());
  }

  emitUpdate(): void {
    for (const ext of this.extensions.values()) {
      ext.onUpdate(this.editor);
    }
  }

  emitSelectionChange(): void {
    for (const ext of this.extensions.values()) {
      ext.onSelectionChange(this.editor);
    }
  }

  emitDestroy(): void {
    for (const ext of this.extensions.values()) {
      ext.onDestroy(this.editor);
    }
    this.extensions.clear();
  }

  getAllKeyboardShortcuts(): KeyboardShortcutMap {
    const map: KeyboardShortcutMap = {};
    for (const ext of this.extensions.values()) {
      if (ext.defineKeyboardShortcuts) {
        const shortcuts = ext.defineKeyboardShortcuts();
        Object.assign(map, shortcuts);
      }
    }
    return map;
  }

  getAllToolbarItems(): CustomToolbarItem[] {
    const items: CustomToolbarItem[] = [];
    for (const ext of this.extensions.values()) {
      if (ext.defineToolbarItems) {
        items.push(...ext.defineToolbarItems());
      }
    }
    return items;
  }
}
