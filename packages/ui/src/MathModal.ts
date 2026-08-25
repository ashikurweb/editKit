// ============================================================
// Vellora — LaTeX / Math Equation Modal & Live Renderer
// Extends global reusable Modal component
// ============================================================

import type { VelloraEditor } from '@vellora/core';
import { Modal } from './Modal';
import { icons } from './icons';

export class MathModal extends Modal {
  private currentType: 'block' | 'inline' = 'block';
  private targetEl: HTMLElement | null = null;

  private textareaEl!: HTMLTextAreaElement;
  private previewEl!: HTMLElement;
  private submitBtn!: HTMLButtonElement;
  private deleteBtn!: HTMLButtonElement;

  constructor(editor: VelloraEditor) {
    super(editor, {
      title: 'Insert Math Equation',
      className: 'vellora-math-modal',
      maxWidth: '540px',
    });

    this._buildMathUI();
    this._setupMathListeners();
  }

  private _buildMathUI(): void {
    // Quick formula chips
    const chipsWrap = document.createElement('div');
    chipsWrap.classList.add('vellora-math-chips');

    const presets = [
      { label: 'E = mc²', latex: 'E = mc^2' },
      { label: 'Fraction', latex: '\\frac{a}{b}' },
      { label: 'Square Root', latex: '\\sqrt{x^2 + y^2}' },
      { label: 'Quadratic', latex: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}' },
      { label: 'Sum', latex: '\\sum_{i=1}^n x_i' },
      { label: 'Integral', latex: '\\int_a^b f(x)dx' },
      { label: 'Limit', latex: '\\lim_{x \\to \\infty} f(x)' },
      { label: 'α + β = θ', latex: '\\alpha + \\beta = \\theta' },
    ];

    presets.forEach(p => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.classList.add('vellora-math-chip');
      chip.textContent = p.label;
      chip.addEventListener('click', () => {
        this.textareaEl.value = p.latex;
        this._updatePreview();
      });
      chipsWrap.appendChild(chip);
    });
    this.bodyEl.appendChild(chipsWrap);

    // Textarea input
    const inputGroup = document.createElement('div');
    inputGroup.classList.add('vellora-math-input-group');

    const inputLabel = document.createElement('label');
    inputLabel.classList.add('vellora-math-label');
    inputLabel.textContent = 'TeX / LaTeX Equation:';

    this.textareaEl = document.createElement('textarea');
    this.textareaEl.classList.add('vellora-math-textarea');
    this.textareaEl.placeholder = 'e.g. \\frac{a}{b} + \\sqrt{x}';
    this.textareaEl.rows = 3;
    this.textareaEl.addEventListener('input', () => this._updatePreview());

    inputGroup.appendChild(inputLabel);
    inputGroup.appendChild(this.textareaEl);
    this.bodyEl.appendChild(inputGroup);

    // Live Preview
    const previewGroup = document.createElement('div');
    previewGroup.classList.add('vellora-math-preview-group');

    const previewLabel = document.createElement('div');
    previewLabel.classList.add('vellora-math-label');
    previewLabel.textContent = 'Live Render Preview:';

    this.previewEl = document.createElement('div');
    this.previewEl.classList.add('vellora-math-preview');

    previewGroup.appendChild(previewLabel);
    previewGroup.appendChild(this.previewEl);
    this.bodyEl.appendChild(previewGroup);

    // Actions (Submit / Delete / Cancel)
    const actions = document.createElement('div');
    actions.classList.add('vellora-math-actions');

    this.deleteBtn = document.createElement('button');
    this.deleteBtn.type = 'button';
    this.deleteBtn.classList.add('vellora-math-del-btn');
    this.deleteBtn.innerHTML = `${icons.trash} <span>Delete</span>`;
    this.deleteBtn.style.display = 'none';
    this.deleteBtn.addEventListener('click', () => {
      if (this.targetEl) {
        this.targetEl.remove();
        this.editor.emit('update', { editor: this.editor });
      }
      this.hide();
    });

    const rightActions = document.createElement('div');
    rightActions.classList.add('vellora-math-right-actions');

    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.classList.add('vellora-math-cancel-btn');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.addEventListener('click', () => this.hide());

    this.submitBtn = document.createElement('button');
    this.submitBtn.type = 'button';
    this.submitBtn.classList.add('vellora-math-submit-btn');
    this.submitBtn.textContent = 'Insert Equation';
    this.submitBtn.addEventListener('click', () => this._applyEquation());

    rightActions.appendChild(cancelBtn);
    rightActions.appendChild(this.submitBtn);

    actions.appendChild(this.deleteBtn);
    actions.appendChild(rightActions);
    this.bodyEl.appendChild(actions);
  }

  private _setupMathListeners(): void {
    // Click on math equations in editor to edit
    this.editor.contentEl.addEventListener('click', (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const mathEl = target.closest('.vellora-math-block, .vellora-math-inline') as HTMLElement | null;
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
    this.setTitle(type === 'block' ? 'Insert Block Equation' : 'Insert Inline Equation');
    this.submitBtn.textContent = 'Insert Equation';
    this.deleteBtn.style.display = 'none';

    if (!this.textareaEl.value.trim()) {
      this.textareaEl.value = type === 'block' ? 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}' : 'E = mc^2';
    }

    this._updatePreview();
    super.show();

    setTimeout(() => {
      this.textareaEl.focus();
      this.textareaEl.select();
    }, 50);
  }

  // Alias for backward compatibility
  show(type: 'block' | 'inline' = 'block'): void {
    this.showMath(type);
  }

  edit(el: HTMLElement): void {
    this.targetEl = el;
    this.currentType = el.classList.contains('vellora-math-block') ? 'block' : 'inline';
    this.setTitle(this.currentType === 'block' ? 'Edit Block Equation' : 'Edit Inline Equation');
    this.submitBtn.textContent = 'Update Equation';
    this.deleteBtn.style.display = 'inline-flex';

    this.textareaEl.value = el.getAttribute('data-math') || '';
    this._updatePreview();
    super.show();

    setTimeout(() => {
      this.textareaEl.focus();
      this.textareaEl.select();
    }, 50);
  }

  private _updatePreview(): void {
    const raw = this.textareaEl.value.trim() || 'E = mc^2';
    this.previewEl.innerHTML = formatMathFormula(raw);
  }

  private _applyEquation(): void {
    const raw = this.textareaEl.value.trim() || 'E = mc^2';

    if (this.targetEl && this.targetEl.isConnected) {
      this.targetEl.setAttribute('data-math', raw);
      this.targetEl.innerHTML = formatMathFormula(raw);
      this.editor.emit('update', { editor: this.editor });
    } else {
      this.editor.commands.insertMath({ latex: raw, type: this.currentType });
    }

    this.hide();
  }
}

/** Formats TeX / LaTeX formula into rich mathematical HTML */
export function formatMathFormula(latex: string): string {
  let html = latex;

  // 1. Fractions: \frac{a}{b}
  html = html.replace(/\\frac\s*\{([^{}]+)\}\s*\{([^{}]+)\}/g, (_m, num, den) => {
    return `<span class="vellora-math-frac"><span class="vellora-math-num">${num}</span><span class="vellora-math-den">${den}</span></span>`;
  });

  // 2. Square roots: \sqrt{x}
  html = html.replace(/\\sqrt\s*\{([^{}]+)\}/g, (_m, body) => {
    return `<span class="vellora-math-sqrt"><span class="vellora-math-sqrt-sym">√</span><span class="vellora-math-sqrt-body">${body}</span></span>`;
  });

  // 3. Integrals & Sums: \int, \sum, \prod, \lim
  html = html.replace(/\\int/g, '<span class="vellora-math-symbol">∫</span>');
  html = html.replace(/\\sum/g, '<span class="vellora-math-symbol">∑</span>');
  html = html.replace(/\\prod/g, '<span class="vellora-math-symbol">∏</span>');
  html = html.replace(/\\lim/g, '<span class="vellora-math-func">lim</span>');
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
  html = html.replace(/\\leq/g, '≤');
  html = html.replace(/\\geq/g, '≥');
  html = html.replace(/\\neq/g, '≠');
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
  html = html.replace(/\\(sin|cos|tan|log|ln|exp)/g, '<span class="vellora-math-func">$1</span>');

  return `<span class="vellora-math-rendered">${html}</span>`;
}
