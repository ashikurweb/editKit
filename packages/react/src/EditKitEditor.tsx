import React, { forwardRef, useImperativeHandle } from 'react';
import type { EditKitEditor as EditKitEditorType } from '@editkit/core';
import { useEditKitEditor, type UseEditKitEditorOptions } from './useEditKitEditor';

export interface EditKitEditorProps extends UseEditKitEditorOptions {
  className?: string;
  style?: React.CSSProperties;
  onChange?: (html: string) => void;
}

export const EditKitEditor = forwardRef<EditKitEditorType, EditKitEditorProps>(
  (
    {
      className = '',
      style,
      onChange,
      onUpdate,
      ...options
    },
    ref
  ) => {
    const { editor, containerRef } = useEditKitEditor({
      ...options,
      onUpdate: (ed) => {
        onUpdate?.(ed);
        onChange?.(ed.getHTML());
      },
    });

    useImperativeHandle(ref, () => editor as EditKitEditorType, [editor]);

    return (
      <div
        ref={containerRef}
        className={`editkit-react-root ${className}`.trim()}
        style={style}
      />
    );
  }
);

EditKitEditor.displayName = 'EditKitEditor';
