export * from '@editkit/core';
export * from '@editkit/ui';

import { EditKitEditor, type EditKitConfig } from '@editkit/core';
import {
  createToolbar,
  BubbleMenu,
  TableFloatingMenu,
  ImageFloatingMenu,
  type EditKitToolbar,
  type ToolbarConfig,
  type ToolbarFeaturesConfig,
} from '@editkit/ui';

export interface CreateEditKitOptions extends Omit<EditKitConfig, 'element'> {
  /** Element (or selector) that receives the complete editor UI. */
  element: HTMLElement | string;
  /** Show the standard EditKit toolbar. Defaults to true. */
  showToolbar?: boolean;
  /** Customize the standard toolbar without replacing its UI. */
  toolbar?: ToolbarConfig;
  /** Shortcut for `toolbar.features`. */
  features?: ToolbarFeaturesConfig;
  /** Enable the selection bubble menu. Defaults to true. */
  bubbleMenu?: boolean;
  /** Enable contextual table controls. Defaults to true. */
  tableMenu?: boolean;
  /** Enable contextual image controls. Defaults to true. */
  imageMenu?: boolean;
}

export interface EditKitInstance {
  editor: EditKitEditor;
  toolbar: EditKitToolbar | null;
  bubbleMenu: BubbleMenu | null;
  tableMenu: TableFloatingMenu | null;
  imageMenu: ImageFloatingMenu | null;
  destroy(): void;
}

/**
 * Mount the complete default EditKit UI with one call.
 * Individual UI parts and all core APIs remain available for custom layouts.
 */
export function createEditKit(options: CreateEditKitOptions): EditKitInstance {
  const {
    element,
    showToolbar = true,
    toolbar: toolbarConfig,
    features,
    bubbleMenu: showBubbleMenu = true,
    tableMenu: showTableMenu = true,
    imageMenu: showImageMenu = true,
    ...editorConfig
  } = options;

  const container = typeof element === 'string'
    ? document.querySelector<HTMLElement>(element)
    : element;
  if (!container) {
    throw new Error(`[EditKit] Mount element not found: ${String(element)}`);
  }

  const editor = new EditKitEditor(editorConfig);
  const toolbar = showToolbar
    ? createToolbar(editor, {
        ...toolbarConfig,
        features: toolbarConfig?.features ?? features,
      })
    : null;
  if (toolbar && !toolbarConfig?.container) {
    editor.root.insertBefore(toolbar.element, editor.contentEl);
  }

  const bubbleMenu = showBubbleMenu ? new BubbleMenu(editor) : null;
  bubbleMenu?.mount(editor.root);
  const tableMenu = showTableMenu ? new TableFloatingMenu(editor) : null;
  tableMenu?.mount(editor.root);
  const imageMenu = showImageMenu ? new ImageFloatingMenu(editor) : null;
  imageMenu?.mount(editor.root);

  editor.mount(container);

  let destroyed = false;
  return {
    editor,
    toolbar,
    bubbleMenu,
    tableMenu,
    imageMenu,
    destroy() {
      if (destroyed) return;
      destroyed = true;
      imageMenu?.destroy();
      tableMenu?.destroy();
      bubbleMenu?.destroy();
      toolbar?.destroy();
      editor.destroy();
    },
  };
}
