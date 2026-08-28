// ============================================================
// EditKit — FAQ Block Manager & Interactive Component System
// Exact match for user screenshots (Cards, Amber Strip, + Add Question, ✕ & 🗑)
// ============================================================

import type { EditKitEditor } from '@editkit/core';
import { markTransient, setRuntimeEditable } from './ContentHydration';

export class FAQBlockManager {
  private editor: EditKitEditor;
  private activeBlock: HTMLElement | null = null;
  private _unsubscribers: (() => void)[] = [];
  private _isDestroyed: boolean = false;

  constructor(editor: EditKitEditor) {
    this.editor = editor;
    this._setupListeners();
  }

  selectBlock(block: HTMLElement): void {
    if (this.activeBlock && this.activeBlock !== block) {
      this.activeBlock.classList.remove('editkit-faq-block--focused');
    }
    this.activeBlock = block;
    this.activeBlock.classList.add('editkit-faq-block--focused');
  }

  deselect(): void {
    if (this.activeBlock) {
      this.activeBlock.classList.remove('editkit-faq-block--focused');
      this.activeBlock = null;
    }
  }

  createFAQBlockElement(): HTMLElement {
    const block = document.createElement('div');
    block.classList.add('editkit-faq-block');
    setRuntimeEditable(block, false);

    const itemsContainer = document.createElement('div');
    itemsContainer.classList.add('editkit-faq-items');

    // Default item 1
    itemsContainer.appendChild(this.createFAQItem('How long to integrate?', 'About ten minutes with the snippet from your dashboard.'));

    // Default item 2
    itemsContainer.appendChild(this.createFAQItem('Does it work in Next.js?', 'Yes — server-rendered with the App Router.'));

    // + Add Question Button
    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.classList.add('editkit-faq-add-btn');
    addBtn.textContent = '+ Add Question';
    markTransient(addBtn);

    // Delete block button (top-right red icon)
    const deleteBlockBtn = document.createElement('button');
    deleteBlockBtn.type = 'button';
    deleteBlockBtn.classList.add('editkit-faq-block-delete');
    deleteBlockBtn.setAttribute('title', 'Delete FAQ Block');
    deleteBlockBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`;
    markTransient(deleteBlockBtn);

    block.appendChild(itemsContainer);
    block.appendChild(addBtn);
    block.appendChild(deleteBlockBtn);

    return block;
  }

  createFAQItem(questionText: string = 'Question?', answerText: string = 'Answer goes here...'): HTMLElement {
    const item = document.createElement('div');
    item.classList.add('editkit-faq-item');

    const accent = document.createElement('div');
    accent.classList.add('editkit-faq-accent');

    const content = document.createElement('div');
    content.classList.add('editkit-faq-content');

    const question = document.createElement('div');
    question.classList.add('editkit-faq-question');
    setRuntimeEditable(question, true, false);
    question.textContent = questionText;

    const answer = document.createElement('div');
    answer.classList.add('editkit-faq-answer');
    setRuntimeEditable(answer, true, false);
    answer.textContent = answerText;

    content.appendChild(question);
    content.appendChild(answer);

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.classList.add('editkit-faq-item-delete');
    deleteBtn.setAttribute('title', 'Delete question');
    deleteBtn.textContent = '✕';
    markTransient(deleteBtn);

    item.appendChild(accent);
    item.appendChild(content);
    item.appendChild(deleteBtn);

    return item;
  }

  /** Rebuild editor-only controls stripped from persisted/public HTML. */
  hydrateBlocks(): void {
    if (!this.editor.isEditable) return;

    this.editor.contentEl.querySelectorAll<HTMLElement>('.editkit-faq-block').forEach(block => {
      setRuntimeEditable(block, false);
      block.querySelectorAll<HTMLElement>('.editkit-faq-question, .editkit-faq-answer').forEach(element => {
        setRuntimeEditable(element, true, false);
      });

      block.querySelectorAll<HTMLElement>('.editkit-faq-item').forEach(item => {
        if (!item.querySelector('.editkit-faq-accent')) {
          const accent = document.createElement('div');
          accent.classList.add('editkit-faq-accent');
          item.prepend(accent);
        }
        let deleteButton = item.querySelector<HTMLButtonElement>('.editkit-faq-item-delete');
        if (!deleteButton) {
          deleteButton = document.createElement('button');
          deleteButton.type = 'button';
          deleteButton.classList.add('editkit-faq-item-delete');
          deleteButton.setAttribute('title', 'Delete question');
          deleteButton.textContent = '✕';
          item.appendChild(deleteButton);
        }
        markTransient(deleteButton);
      });

      let addButton = block.querySelector<HTMLButtonElement>('.editkit-faq-add-btn');
      if (!addButton) {
        addButton = document.createElement('button');
        addButton.type = 'button';
        addButton.classList.add('editkit-faq-add-btn');
        addButton.textContent = '+ Add Question';
        block.appendChild(addButton);
      }
      markTransient(addButton);

      let deleteBlockButton = block.querySelector<HTMLButtonElement>('.editkit-faq-block-delete');
      if (!deleteBlockButton) {
        deleteBlockButton = document.createElement('button');
        deleteBlockButton.type = 'button';
        deleteBlockButton.classList.add('editkit-faq-block-delete');
        deleteBlockButton.setAttribute('title', 'Delete FAQ Block');
        deleteBlockButton.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`;
        block.appendChild(deleteBlockButton);
      }
      markTransient(deleteBlockButton);
    });
  }

  private _setupListeners(): void {
    const onContentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // 1. Delete Block Button
      const delBlockBtn = target.closest('.editkit-faq-block-delete') as HTMLElement;
      if (delBlockBtn) {
        e.preventDefault();
        e.stopPropagation();
        const block = delBlockBtn.closest('.editkit-faq-block') as HTMLElement;
        if (block) {
          if (this.activeBlock === block) this.deselect();
          block.remove();
          this.editor.emit('update', { editor: this.editor });
        }
        return;
      }

      // 2. Delete Single FAQ Item
      const delItemBtn = target.closest('.editkit-faq-item-delete') as HTMLElement;
      if (delItemBtn) {
        e.preventDefault();
        e.stopPropagation();
        const item = delItemBtn.closest('.editkit-faq-item') as HTMLElement;
        const block = delItemBtn.closest('.editkit-faq-block') as HTMLElement;
        if (item) {
          item.remove();
          this.editor.emit('update', { editor: this.editor });
        }
        return;
      }

      // 3. Add Question Button
      const addBtn = target.closest('.editkit-faq-add-btn') as HTMLElement;
      if (addBtn) {
        e.preventDefault();
        e.stopPropagation();
        const block = addBtn.closest('.editkit-faq-block') as HTMLElement;
        const itemsContainer = block?.querySelector('.editkit-faq-items');
        if (itemsContainer) {
          const newItem = this.createFAQItem('New Question?', 'Write your answer here...');
          itemsContainer.appendChild(newItem);
          this.editor.emit('update', { editor: this.editor });

          const qEl = newItem.querySelector('.editkit-faq-question') as HTMLElement;
          if (qEl) {
            setTimeout(() => {
              const r = document.createRange();
              r.selectNodeContents(qEl);
              r.collapse(false);
              const s = window.getSelection();
              s?.removeAllRanges();
              s?.addRange(r);
            }, 20);
          }
        }
        return;
      }

      // 4. Focus FAQ Block Selection
      const faqBlock = target.closest('.editkit-faq-block') as HTMLElement;
      if (faqBlock && this.editor.contentEl.contains(faqBlock)) {
        this.selectBlock(faqBlock);
      } else {
        this.deselect();
      }
    };

    const onKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this.deselect();
      }
    };

    document.addEventListener('mousedown', onContentClick);
    document.addEventListener('keydown', onKeydown);

    this._unsubscribers.push(
      () => document.removeEventListener('mousedown', onContentClick),
      () => document.removeEventListener('keydown', onKeydown),
    );
  }

  destroy(): void {
    if (this._isDestroyed) return;
    this._isDestroyed = true;
    this._unsubscribers.forEach(u => u());
    this._unsubscribers = [];
  }
}
