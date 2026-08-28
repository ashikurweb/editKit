import { EditKitEditor, type EditKitConfig } from '@editkit/core';
import {
  createToolbar,
  BubbleMenu,
  TableFloatingMenu,
  ImageFloatingMenu,
  type ToolbarConfig,
  type ToolbarFeaturesConfig,
} from '@editkit/ui';

export interface SvelteEditKitOptions extends Omit<EditKitConfig, 'element'> {
  showToolbar?: boolean;
  toolbar?: ToolbarConfig;
  features?: ToolbarFeaturesConfig;
  bubbleMenu?: boolean;
  tableMenu?: boolean;
  imageMenu?: boolean;
  onChange?: (html: string) => void;
}

/**
 * Svelte Action: use:editkit={options}
 * Works seamlessly in Svelte 3, 4, and 5
 */
export function editkit(node: HTMLElement, options: SvelteEditKitOptions = {}) {
  const instance = new EditKitEditor({
    ...options,
    onUpdate: (ed) => {
      options.onUpdate?.(ed);
      options.onChange?.(ed.getHTML());
    },
  });

  const uiComponents: Array<{ destroy(): void }> = [];

  if (options.showToolbar !== false) {
    const tbConfig: ToolbarConfig = {
      ...options.toolbar,
      features: options.toolbar?.features ?? options.features,
    };
    const toolbar = createToolbar(instance, tbConfig);
    if (!tbConfig.container) {
      instance.root.insertBefore(toolbar.element, instance.contentEl);
    }
    uiComponents.push(toolbar);
  }

  if (options.bubbleMenu !== false) {
    const bubble = new BubbleMenu(instance);
    bubble.mount(instance.root);
    uiComponents.push(bubble);
  }

  if (options.tableMenu !== false) {
    const table = new TableFloatingMenu(instance);
    table.mount(instance.root);
    uiComponents.push(table);
  }

  if (options.imageMenu !== false) {
    const img = new ImageFloatingMenu(instance);
    img.mount(instance.root);
    uiComponents.push(img);
  }

  instance.mount(node);

  return {
    update(newOptions: SvelteEditKitOptions) {
      if (newOptions.theme && newOptions.theme !== options.theme) {
        instance.setTheme(newOptions.theme);
      }
      if (newOptions.editable !== undefined && newOptions.editable !== options.editable) {
        instance.setEditable(newOptions.editable);
      }
      if (newOptions.content !== undefined && newOptions.content !== instance.getHTML()) {
        instance.setContent(newOptions.content, false);
      }
      options = newOptions;
    },
    destroy() {
      for (const component of uiComponents.reverse()) {
        component.destroy();
      }
      instance.destroy();
    },
    getEditor: () => instance,
  };
}
