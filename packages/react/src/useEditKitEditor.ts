import ReactRuntime from 'react';
import type * as React from 'react';
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

export interface UseEditKitEditorReturn {
  editor: EditKitEditor | null;
  containerRef: React.MutableRefObject<HTMLDivElement | null>;
}

export function useEditKitEditor(
  options: UseEditKitEditorOptions = {}
): UseEditKitEditorReturn {
  const { useEffect, useRef, useState } = ReactRuntime;
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

    const uiComponents: Array<{ destroy(): void }> = [];
    const isToolbarEnabled = optionsRef.current.showToolbar !== false;
    if (isToolbarEnabled) {
      const tbConfig: ToolbarConfig = {
        ...optionsRef.current.toolbar,
        features:
          optionsRef.current.toolbar?.features ?? optionsRef.current.features,
      };
      const toolbar = createToolbar(instance, tbConfig);
      if (!tbConfig.container) {
        instance.root.insertBefore(toolbar.element, instance.contentEl);
      }
      uiComponents.push(toolbar);
    }

    if (optionsRef.current.bubbleMenu !== false) {
      const bubble = new BubbleMenu(instance);
      bubble.mount(instance.root);
      uiComponents.push(bubble);
    }

    if (optionsRef.current.tableMenu !== false) {
      const table = new TableFloatingMenu(instance);
      table.mount(instance.root);
      uiComponents.push(table);
    }

    if (optionsRef.current.imageMenu !== false) {
      const img = new ImageFloatingMenu(instance);
      img.mount(instance.root);
      uiComponents.push(img);
    }

    instance.mount(containerRef.current);
    setEditor(instance);

    return () => {
      for (const component of uiComponents.reverse()) {
        component.destroy();
      }
      instance.destroy();
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
