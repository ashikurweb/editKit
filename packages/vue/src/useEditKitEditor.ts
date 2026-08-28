import { shallowRef, onMounted, onBeforeUnmount, type ShallowRef, type Ref } from 'vue';
import { EditKitEditor, type EditKitConfig } from '@editkit/core';
import {
  createToolbar,
  BubbleMenu,
  TableFloatingMenu,
  ImageFloatingMenu,
  type ToolbarConfig,
  type ToolbarFeaturesConfig,
} from '@editkit/ui';

export interface UseEditKitEditorOptions extends Omit<EditKitConfig, 'element'> {
  showToolbar?: boolean;
  toolbar?: ToolbarConfig;
  features?: ToolbarFeaturesConfig;
  bubbleMenu?: boolean;
  tableMenu?: boolean;
  imageMenu?: boolean;
  modelValue?: string;
  defaultValue?: string;
}

export interface UseEditKitEditorReturn {
  editor: ShallowRef<EditKitEditor | null>;
}

export function useEditKitEditor(
  containerRef: Ref<HTMLElement | null | undefined>,
  options: UseEditKitEditorOptions = {}
): UseEditKitEditorReturn {
  const editor = shallowRef<EditKitEditor | null>(null);
  const uiComponents: Array<{ destroy(): void }> = [];

  onMounted(() => {
    if (!containerRef.value) return;

    const initialContent =
      options.modelValue !== undefined
        ? options.modelValue
        : options.defaultValue !== undefined
        ? options.defaultValue
        : options.content;

    const instance = new EditKitEditor({
      ...options,
      content: initialContent,
      onUpdate: (ed) => {
        options.onUpdate?.(ed);
      },
    });

    const isToolbarEnabled = options.showToolbar !== false;
    if (isToolbarEnabled) {
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

    instance.mount(containerRef.value);
    editor.value = instance;
  });

  onBeforeUnmount(() => {
    for (const component of uiComponents.reverse()) {
      component.destroy();
    }
    uiComponents.length = 0;
    if (editor.value) {
      editor.value.destroy();
      editor.value = null;
    }
  });

  return {
    editor,
  };
}
