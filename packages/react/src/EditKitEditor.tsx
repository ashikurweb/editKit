import ReactRuntime from 'react';
import type * as React from 'react';
import type { EditKitEditor as EditKitEditorType } from '@editkit/core';
import { useEditKitEditor, type UseEditKitEditorOptions } from './useEditKitEditor';

export interface EditKitEditorProps extends UseEditKitEditorOptions {
  className?: string;
  style?: React.CSSProperties;
  onChange?: (html: string) => void;
}

export const EditKitEditor: React.ForwardRefExoticComponent<
  EditKitEditorProps & React.RefAttributes<EditKitEditorType>
> = ReactRuntime.forwardRef<EditKitEditorType, EditKitEditorProps>(
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

    ReactRuntime.useImperativeHandle(
      ref,
      () => editor as EditKitEditorType,
      [editor]
    );

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
