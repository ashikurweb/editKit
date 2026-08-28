// ============================================================
// EditKit — Insert Equation Modal (LaTeX & MathML)
// Exact Match for User Screenshot with Mode Switcher & Quick Bar
// ============================================================

import type { EditKitEditor } from '@editkit/core';
import { Modal } from './Modal';
import { icons } from './icons';

export class MathModal extends Modal {
  private currentMode: 'latex' | 'mathml' = 'latex';
  private currentType: 'block' | 'inline' = 'block';
  private targetEl: HTMLElement | null = null;

  // UI Elements
  private modeToggleWrap!: HTMLElement;
  private latexBtn!: HTMLButtonElement;
  private mathmlBtn!: HTMLButtonElement;
  private clearBtn!: HTMLButtonElement;
  private quickGridWrap!: HTMLElement;
  private inputLabelEl!: HTMLElement;
  private textareaEl!: HTMLTextAreaElement;
  private previewEl!: HTMLElement;
  private cancelBtn!: HTMLButtonElement;
  private submitBtn!: HTMLButtonElement;

  constructor(editor: EditKitEditor) {
    super(editor, {
      title: '',
      className: 'editkit-table-modal editkit-equation-modal',
      maxWidth: '460px',
    });

    // Hide default header to use custom header bar
    if (this.headerEl) {
      this.headerEl.style.display = 'none';
    }

    this._buildEquationUI();
    this._setupListeners();
  }

  private _buildEquationUI(): void {
    this.bodyEl.innerHTML = '';

    // ── 1. Custom Top Bar: Mode Switcher (Left) & Trash Clear (Right) ──
    const topBar = document.createElement('div');
    topBar.className = 'editkit-eq-topbar';

    this.modeToggleWrap = document.createElement('div');
    this.modeToggleWrap.className = 'editkit-eq-mode-toggle';

    this.latexBtn = document.createElement('button');
    this.latexBtn.type = 'button';
    this.latexBtn.className = 'editkit-eq-mode-btn editkit-eq-mode-btn--active';
    this.latexBtn.textContent = 'LATEX';
    this.latexBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this._setMode('latex');
    });

    this.mathmlBtn = document.createElement('button');
    this.mathmlBtn.type = 'button';
    this.mathmlBtn.className = 'editkit-eq-mode-btn';
    this.mathmlBtn.textContent = 'MATHML';
    this.mathmlBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this._setMode('mathml');
    });

    this.modeToggleWrap.appendChild(this.latexBtn);
    this.modeToggleWrap.appendChild(this.mathmlBtn);

    this.clearBtn = document.createElement('button');
    this.clearBtn.type = 'button';
    this.clearBtn.className = 'editkit-eq-trash-btn';
    this.clearBtn.title = 'Clear input';
    this.clearBtn.setAttribute('aria-label', 'Clear input');
    this.clearBtn.innerHTML = icons.trash || `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>`;

    this.clearBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.textareaEl.value = '';
      this._updatePreview();
      this.textareaEl.focus();
    });

    topBar.appendChild(this.modeToggleWrap);
    topBar.appendChild(this.clearBtn);
    this.bodyEl.appendChild(topBar);

    // ── 2. Quick Symbol / Formula Grid (LaTeX Mode) ──
    this.quickGridWrap = document.createElement('div');
    this.quickGridWrap.className = 'editkit-eq-quick-grid';

    const symbolsRow1 = [
      { label: '½', insert: '\\frac{a}{b}' },
      { label: '√', insert: '\\sqrt{x}' },
      { label: 'x²', insert: 'x^2' },
      { label: 'xₙ', insert: 'x_n' },
      { label: 'Σ', insert: '\\sum' },
      { label: '∫', insert: '\\int' },
      { label: '∞', insert: '\\infty' },
      { label: 'π', insert: '\\pi' },
    ];

    const symbolsRow2 = [
      { label: 'θ', insert: '\\theta' },
      { label: 'α', insert: '\\alpha' },
      { label: '±', insert: '\\pm' },
      { label: '×', insert: '\\times' },
      { label: '≤', insert: '\\le' },
      { label: '≥', insert: '\\ge' },
      { label: '≈', insert: '\\approx' },
    ];

    const row1El = document.createElement('div');
    row1El.className = 'editkit-eq-symbols-row';
    symbolsRow1.forEach(sym => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'editkit-eq-sym-btn';
      btn.textContent = sym.label;
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this._insertSnippet(sym.insert);
      });
      row1El.appendChild(btn);
    });

    const row2El = document.createElement('div');
    row2El.className = 'editkit-eq-symbols-row';
    symbolsRow2.forEach(sym => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'editkit-eq-sym-btn';
      btn.textContent = sym.label;
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this._insertSnippet(sym.insert);
      });
      row2El.appendChild(btn);
    });

    this.quickGridWrap.appendChild(row1El);
    this.quickGridWrap.appendChild(row2El);
    this.bodyEl.appendChild(this.quickGridWrap);

    // ── 3. Input Section (LATEX / MATHML) ──
    const inputSection = document.createElement('div');
    inputSection.className = 'editkit-eq-input-section';

    this.inputLabelEl = document.createElement('div');
    this.inputLabelEl.className = 'editkit-eq-label';
    this.inputLabelEl.textContent = 'LATEX';

    this.textareaEl = document.createElement('textarea');
    this.textareaEl.className = 'editkit-eq-textarea';
    this.textareaEl.placeholder = 'e.g. x^2 + y^2 = r^2';
    this.textareaEl.rows = 3;

    this.textareaEl.addEventListener('input', () => this._updatePreview());
    this.textareaEl.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        this._applyEquation();
      }
    });

    inputSection.appendChild(this.inputLabelEl);
    inputSection.appendChild(this.textareaEl);
    this.bodyEl.appendChild(inputSection);

    // ── 4. Live Preview Section ──
    const previewSection = document.createElement('div');
    previewSection.className = 'editkit-eq-preview-section';

    const previewLabel = document.createElement('div');
    previewLabel.className = 'editkit-eq-label';
    previewLabel.textContent = 'PREVIEW';

    this.previewEl = document.createElement('div');
    this.previewEl.className = 'editkit-eq-preview-box';
    this.previewEl.innerHTML = '<span class="editkit-eq-placeholder">Your equation will render here</span>';

    previewSection.appendChild(previewLabel);
    previewSection.appendChild(this.previewEl);
    this.bodyEl.appendChild(previewSection);

    // ── 5. Action Footer ──
    const footer = document.createElement('div');
    footer.className = 'editkit-eq-footer';

    const shortcutHint = document.createElement('div');
    shortcutHint.className = 'editkit-eq-shortcut-hint';
    shortcutHint.innerHTML = `<span class="editkit-eq-kbd">⌘/Ctrl + ↵</span> <span class="editkit-eq-kbd-label">to save</span>`;

    const rightBtns = document.createElement('div');
    rightBtns.className = 'editkit-eq-right-btns';

    this.cancelBtn = document.createElement('button');
    this.cancelBtn.type = 'button';
    this.cancelBtn.className = 'editkit-eq-cancel-btn';
    this.cancelBtn.textContent = 'Cancel';
    this.cancelBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.hide();
    });

    this.submitBtn = document.createElement('button');
    this.submitBtn.type = 'button';
    this.submitBtn.className = 'editkit-eq-save-btn';
    this.submitBtn.textContent = 'Save equation';
    this.submitBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this._applyEquation();
    });

    rightBtns.appendChild(this.cancelBtn);
    rightBtns.appendChild(this.submitBtn);

    footer.appendChild(shortcutHint);
    footer.appendChild(rightBtns);
    this.bodyEl.appendChild(footer);
  }

  private _setMode(mode: 'latex' | 'mathml'): void {
    this.currentMode = mode;
    if (mode === 'latex') {
      this.latexBtn.classList.add('editkit-eq-mode-btn--active');
      this.mathmlBtn.classList.remove('editkit-eq-mode-btn--active');
      this.quickGridWrap.style.display = 'flex';
      this.inputLabelEl.textContent = 'LATEX';
      this.textareaEl.placeholder = 'e.g. x^2 + y^2 = r^2';
    } else {
      this.mathmlBtn.classList.add('editkit-eq-mode-btn--active');
      this.latexBtn.classList.remove('editkit-eq-mode-btn--active');
      this.quickGridWrap.style.display = 'none';
      this.inputLabelEl.textContent = 'MATHML';
      this.textareaEl.placeholder = 'e.g. <msup><mi>x</mi><mn>2</mn></msup>';
    }
    this._updatePreview();
  }

  private _insertSnippet(snippet: string): void {
    const el = this.textareaEl;
    const start = el.selectionStart || 0;
    const end = el.selectionEnd || 0;
    const text = el.value;

    el.value = text.substring(0, start) + snippet + text.substring(end);
    el.selectionStart = el.selectionEnd = start + snippet.length;
    el.focus();
    this._updatePreview();
  }

  private _setupListeners(): void {
    this.editor.contentEl.addEventListener('click', (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const mathEl = target.closest('.editkit-math-block, .editkit-math-inline') as HTMLElement | null;
      if (mathEl && this.editor.contentEl.contains(mathEl)) {
        e.preventDefault();
        e.stopPropagation();
        this.edit(mathEl);
      }
    });
  }

  showMath(type: 'block' | 'inline' = 'block'): void {
    this.currentType = type;
    this.targetEl = null;
    this.submitBtn.textContent = 'Save equation';
    this._setMode('latex');

    if (!this.textareaEl.value.trim()) {
      this.textareaEl.value = '';
    }

    this._updatePreview();
    super.show();

    setTimeout(() => {
      this.textareaEl.focus();
    }, 50);
  }

  show(type: 'block' | 'inline' = 'block'): void {
    this.showMath(type);
  }

  edit(el: HTMLElement): void {
    this.targetEl = el;
    this.currentType = el.classList.contains('editkit-math-block') ? 'block' : 'inline';
    this.submitBtn.textContent = 'Save equation';

    const storedFormat = el.getAttribute('data-math-format') as 'latex' | 'mathml' || 'latex';
    this._setMode(storedFormat);

    const mathRaw = el.getAttribute('data-math') || el.textContent || '';
    this.textareaEl.value = mathRaw;
    this._updatePreview();
    super.show();

    setTimeout(() => {
      this.textareaEl.focus();
      this.textareaEl.select();
    }, 50);
  }

  private _updatePreview(): void {
    const raw = this.textareaEl.value.trim();
    if (!raw) {
      this.previewEl.innerHTML = '<span class="editkit-eq-placeholder">Your equation will render here</span>';
      return;
    }

    if (this.currentMode === 'mathml') {
      let mathmlHtml = raw;
      if (!mathmlHtml.includes('<math')) {
        mathmlHtml = `<math xmlns="http://www.w3.org/1998/Math/MathML" display="block">${mathmlHtml}</math>`;
      }
      this.previewEl.innerHTML = sanitizeMathML(mathmlHtml);
    } else {
      this.previewEl.innerHTML = formatMathFormula(raw);
    }
  }

  private _applyEquation(): void {
    const raw = this.textareaEl.value.trim();
    if (!raw) {
      this.hide();
      return;
    }

    const rendered = this.currentMode === 'mathml'
      ? sanitizeMathML(raw.includes('<math') ? raw : `<math xmlns="http://www.w3.org/1998/Math/MathML" display="block">${raw}</math>`)
      : formatMathFormula(raw);

    if (this.targetEl && this.targetEl.isConnected) {
      this.targetEl.setAttribute('data-math', raw);
      this.targetEl.setAttribute('data-math-format', this.currentMode);
      this.targetEl.innerHTML = rendered;
      this.editor.emit('update', { editor: this.editor });
    } else {
      this.editor.commands.insertMath({
        latex: raw,
        type: this.currentType,
      });

      // Update data attribute for format
      const inserted = this.editor.contentEl.querySelector(`[data-math="${CSS.escape(raw)}"]`);
      if (inserted) {
        inserted.setAttribute('data-math-format', this.currentMode);
        inserted.innerHTML = rendered;
      }
    }

    this.hide();
  }
}

/** Formats TeX / LaTeX formula into rich mathematical HTML */
export function formatMathFormula(latex: string): string {
  let html = latex
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  // 1. Fractions: \frac{a}{b}
  html = html.replace(/\\frac\s*\{([^{}]+)\}\s*\{([^{}]+)\}/g, (_m, num, den) => {
    return `<span class="editkit-math-frac"><span class="editkit-math-num">${num}</span><span class="editkit-math-den">${den}</span></span>`;
  });

  // 2. Square roots: \sqrt{x}
  html = html.replace(/\\sqrt\s*\{([^{}]+)\}/g, (_m, body) => {
    return `<span class="editkit-math-sqrt"><span class="editkit-math-sqrt-sym">√</span><span class="editkit-math-sqrt-body">${body}</span></span>`;
  });

  // 3. Integrals & Sums: \int, \sum, \prod, \lim
  html = html.replace(/\\int/g, '<span class="editkit-math-symbol">∫</span>');
  html = html.replace(/\\sum/g, '<span class="editkit-math-symbol">∑</span>');
  html = html.replace(/\\prod/g, '<span class="editkit-math-symbol">∏</span>');
  html = html.replace(/\\lim/g, '<span class="editkit-math-func">lim</span>');
  html = html.replace(/\\infty/g, '∞');
  html = html.replace(/\\partial/g, '∂');
  html = html.replace(/\\nabla/g, '∇');

  // 4. Greek Letters
  html = html.replace(/\\alpha/g, 'α');
  html = html.replace(/\\beta/g, 'β');
  html = html.replace(/\\gamma/g, 'γ');
  html = html.replace(/\\delta/g, 'δ');
  html = html.replace(/\\epsilon/g, 'ε');
  html = html.replace(/\\theta/g, 'θ');
  html = html.replace(/\\lambda/g, 'λ');
  html = html.replace(/\\mu/g, 'μ');
  html = html.replace(/\\pi/g, 'π');
  html = html.replace(/\\sigma/g, 'σ');
  html = html.replace(/\\omega/g, 'ω');
  html = html.replace(/\\Delta/g, 'Δ');
  html = html.replace(/\\Sigma/g, 'Σ');
  html = html.replace(/\\Omega/g, 'Ω');

  // 5. Operators & Relational
  html = html.replace(/\\pm/g, '±');
  html = html.replace(/\\times/g, '×');
  html = html.replace(/\\div/g, '÷');
  html = html.replace(/\\cdot/g, '·');
  html = html.replace(/\\leq|\\le/g, '≤');
  html = html.replace(/\\geq|\\ge/g, '≥');
  html = html.replace(/\\neq|\\ne/g, '≠');
  html = html.replace(/\\approx/g, '≈');
  html = html.replace(/\\to/g, '→');
  html = html.replace(/\\in/g, '∈');
  html = html.replace(/\\forall/g, '∀');
  html = html.replace(/\\exists/g, '∃');

  // 6. Exponents and subscripts: ^{expr} or ^x, _{expr} or _x
  html = html.replace(/\^\{([^{}]+)\}/g, '<sup>$1</sup>');
  html = html.replace(/\^([a-zA-Z0-9])/g, '<sup>$1</sup>');
  html = html.replace(/_\{([^{}]+)\}/g, '<sub>$1</sub>');
  html = html.replace(/_([a-zA-Z0-9])/g, '<sub>$1</sub>');

  // 7. Math functions: \sin, \cos, \tan, \log, \ln, \exp
  html = html.replace(/\\(sin|cos|tan|log|ln|exp)/g, '<span class="editkit-math-func">$1</span>');

  return `<span class="editkit-math-rendered">${html}</span>`;
}

function sanitizeMathML(input: string): string {
  const container = document.createElement('div');
  container.innerHTML = input;

  const allowedTags = new Set([
    'math', 'mrow', 'mi', 'mn', 'mo', 'mtext', 'mspace', 'ms',
    'mfrac', 'msqrt', 'mroot', 'msub', 'msup', 'msubsup',
    'munder', 'mover', 'munderover', 'mtable', 'mtr', 'mtd',
    'mfenced', 'menclose', 'semantics', 'annotation',
  ]);
  const allowedAttributes = new Set([
    'xmlns', 'display', 'mathvariant', 'mathsize', 'mathcolor',
    'mathbackground', 'displaystyle', 'scriptlevel', 'columnalign',
    'rowalign', 'linethickness', 'notation', 'open', 'close', 'separators',
  ]);

  for (const element of Array.from(container.querySelectorAll('*'))) {
    if (!allowedTags.has(element.localName.toLowerCase())) {
      element.replaceWith(document.createTextNode(element.textContent || ''));
      continue;
    }
    for (const attribute of Array.from(element.attributes)) {
      if (!allowedAttributes.has(attribute.name.toLowerCase())) {
        element.removeAttribute(attribute.name);
      }
    }
  }

  return container.innerHTML;
}
