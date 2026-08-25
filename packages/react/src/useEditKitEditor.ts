import { useEffect, useRef, useState } from 'react';
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
  value?: string;
  defaultValue?: string;
}

export function useEditKitEditor(options: UseEditKitEditorOptions = {}) {
  const [editor, setEditor] = useState<EditKitEditor | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    if (!containerRef.current) return;

    const initialContent =
      optionsRef.current.value !== undefined
        ? optionsRef.current.value
        : optionsRef.current.defaultValue !== undefined
        ? optionsRef.current.defaultValue
        : optionsRef.current.content;

    const instance = new EditKitEditor({
      ...optionsRef.current,
      content: initialContent,
      onUpdate: (ed) => {
        optionsRef.current.onUpdate?.(ed);
      },
    });

    const isToolbarEnabled = optionsRef.current.showToolbar !== false;
    if (isToolbarEnabled) {
      const tbConfig: ToolbarConfig = optionsRef.current.toolbar || {
        features: optionsRef.current.features,
      };
      if (optionsRef.current.features && !tbConfig.features) {
        tbConfig.features = optionsRef.current.features;
      }
      const toolbar = createToolbar(instance, tbConfig);
      instance.root.insertBefore(toolbar.element, instance.contentEl);
    }

    if (optionsRef.current.bubbleMenu !== false) {
      const bubble = new BubbleMenu(instance);
      bubble.mount(instance.root);
    }

    if (optionsRef.current.tableMenu !== false) {
      const table = new TableFloatingMenu(instance);
      table.mount(instance.root);
    }

    if (optionsRef.current.imageMenu !== false) {
      const img = new ImageFloatingMenu(instance);
      img.mount(instance.root);
    }

    instance.mount(containerRef.current);
    setEditor(instance);

    return () => {
      instance.destroy();
      setEditor(null);
    };
  }, []);

  // Sync theme
  useEffect(() => {
    if (editor && options.theme) {
      editor.setTheme(options.theme);
    }
  }, [editor, options.theme]);

  // Sync editable
  useEffect(() => {
    if (editor && options.editable !== undefined) {
      editor.setEditable(options.editable);
    }
  }, [editor, options.editable]);

  // Sync controlled value
  useEffect(() => {
    if (editor && options.value !== undefined) {
      const currentHTML = editor.getHTML();
      if (options.value !== currentHTML) {
        editor.setContent(options.value, false);
      }
    }
  }, [editor, options.value]);

  return {
    editor,
    containerRef,
  };
}
