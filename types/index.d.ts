export * from '@editkit/core';
export * from '@editkit/ui';

import type { EditKitEditor, EditKitConfig } from '@editkit/core';
import type {
  EditKitToolbar,
  BubbleMenu,
  TableFloatingMenu,
  ImageFloatingMenu,
  ToolbarConfig,
  ToolbarFeaturesConfig,
} from '@editkit/ui';

export interface CreateEditKitOptions extends Omit<EditKitConfig, 'element'> {
  element: HTMLElement | string;
  showToolbar?: boolean;
  toolbar?: ToolbarConfig;
  features?: ToolbarFeaturesConfig;
  bubbleMenu?: boolean;
  tableMenu?: boolean;
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

export declare function createEditKit(options: CreateEditKitOptions): EditKitInstance;
