import type { EditKitEditor } from '@editkit/core';

export const EDITKIT_TRANSIENT_ATTRIBUTE = 'data-editkit-transient';
export const EDITKIT_RUNTIME_ATTRIBUTES = 'data-editkit-runtime-attrs';

/** Marks editor-only chrome so core serialization omits it. */
export function markTransient(element: HTMLElement): HTMLElement {
  element.setAttribute(EDITKIT_TRANSIENT_ATTRIBUTE, '');
  element.setAttribute('contenteditable', 'false');
  return element;
}

/** Applies live editing attributes that core serialization removes again. */
export function setRuntimeEditable(
  element: HTMLElement,
  editable: boolean,
  spellcheck: boolean = editable,
): void {
  element.setAttribute(EDITKIT_RUNTIME_ATTRIBUTES, '');
  element.setAttribute('contenteditable', String(editable));
  if (editable) element.setAttribute('spellcheck', String(spellcheck));
}

/** Restores behavior-only attributes for persisted blocks without adding UI chrome. */
export function hydrateCommonBlocks(editor: EditKitEditor): void {
  if (!editor.isEditable) return;

  const content = editor.contentEl;
  const nonEditableSelectors = [
    '.editkit-section-heading',
    '.editkit-decorative-divider',
    '.editkit-pull-quote',
    '.editkit-file-card',
    '.editkit-signature-card',
    '.editkit-cta-band-card',
    '.editkit-cta-card-action',
    '.editkit-chart-block',
    '.editkit-math-block',
    '.editkit-math-inline',
    '.editkit-panel-icon',
  ];
  const editableSelectors = [
    '.editkit-sec-badge',
    '.editkit-sec-title',
    '.editkit-dec-div-label',
    '.editkit-pq-quote',
    '.editkit-pq-attribution',
    '.editkit-signature-name',
    '.editkit-signature-date',
    '.editkit-cta-card-info',
    '.editkit-cta-card-action-sub',
  ];

  content.querySelectorAll<HTMLElement>(nonEditableSelectors.join(',')).forEach(element => {
    setRuntimeEditable(element, false);
  });
  content.querySelectorAll<HTMLElement>(editableSelectors.join(',')).forEach(element => {
    setRuntimeEditable(element, true, false);
  });
}
