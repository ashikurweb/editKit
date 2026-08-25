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
      const tbConfig: ToolbarConfig = options.toolbar || {
        features: options.features,
      };
      if (options.features && !tbConfig.features) {
        tbConfig.features = options.features;
      }
      const toolbar = createToolbar(instance, tbConfig);
      instance.root.insertBefore(toolbar.element, instance.contentEl);
    }

    if (options.bubbleMenu !== false) {
      const bubble = new BubbleMenu(instance);
      bubble.mount(instance.root);
    }

    if (options.tableMenu !== false) {
      const table = new TableFloatingMenu(instance);
      table.mount(instance.root);
    }

    if (options.imageMenu !== false) {
      const img = new ImageFloatingMenu(instance);
      img.mount(instance.root);
    }

    instance.mount(containerRef.value);
    editor.value = instance;
  });

  onBeforeUnmount(() => {
    if (editor.value) {
      editor.value.destroy();
      editor.value = null;
    }
  });

  return {
    editor,
  };
}
