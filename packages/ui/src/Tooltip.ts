// ============================================================
// Vellora — Custom Global Floating Tooltip System
// Pixel-perfect dark glassmorphic tooltips with shortcut badges
// ============================================================

export class TooltipManager {
  private static instance: TooltipManager | null = null;
  private tooltipEl!: HTMLElement;
  private textEl!: HTMLElement;
  private shortcutEl!: HTMLElement;
  private activeTarget: HTMLElement | null = null;
  private showTimeout: number | null = null;

  private constructor() {
    this._createDOM();
    this._bindEvents();
  }

  public static init(): TooltipManager {
    if (!TooltipManager.instance) {
      TooltipManager.instance = new TooltipManager();
    }
    return TooltipManager.instance;
  }

  private _createDOM(): void {
    this.tooltipEl = document.createElement('div');
    this.tooltipEl.classList.add('vellora-tooltip');
    this.tooltipEl.setAttribute('role', 'tooltip');
    this.tooltipEl.setAttribute('aria-hidden', 'true');

    this.textEl = document.createElement('span');
    this.textEl.classList.add('vellora-tooltip-text');

    this.shortcutEl = document.createElement('kbd');
    this.shortcutEl.classList.add('vellora-tooltip-shortcut');

    this.tooltipEl.appendChild(this.textEl);
    this.tooltipEl.appendChild(this.shortcutEl);

    document.body.appendChild(this.tooltipEl);
  }

  private _bindEvents(): void {
    document.addEventListener('mouseover', (e) => {
      const target = (e.target as HTMLElement | null)?.closest<HTMLElement>('[data-vellora-tooltip], [data-tooltip]');
      if (target) {
        this._scheduleShow(target);
      }
    }, true);

    document.addEventListener('mouseout', (e) => {
      const related = (e.relatedTarget as HTMLElement | null);
      if (this.activeTarget && !this.activeTarget.contains(related)) {
        this._hide();
      }
    }, true);

    document.addEventListener('mousedown', () => {
      this._hide(true);
    }, true);

    window.addEventListener('scroll', () => {
      if (this.activeTarget) this._hide(true);
    }, true);
  }

  private _scheduleShow(target: HTMLElement): void {
    if (this.activeTarget === target) return;
    this._clearTimers();

    this.showTimeout = window.setTimeout(() => {
      this._show(target);
    }, 120);
  }

  private _show(target: HTMLElement): void {
    const text = target.getAttribute('data-vellora-tooltip') || target.getAttribute('data-tooltip');
    if (!text) return;

    this.activeTarget = target;
    this.textEl.textContent = text;

    const themeHost = target.closest('[data-vellora-theme]') || document.querySelector('[data-vellora-theme]') || document.documentElement;
    const theme = themeHost.getAttribute('data-vellora-theme') || (themeHost.classList.contains('light') ? 'light' : 'dark');
    this.tooltipEl.setAttribute('data-vellora-theme', theme);

    const shortcut = target.getAttribute('data-tooltip-shortcut');
    if (shortcut) {
      this.shortcutEl.textContent = shortcut;
      this.shortcutEl.style.display = 'inline-block';
    } else {
      this.shortcutEl.style.display = 'none';
    }

    this.tooltipEl.classList.add('vellora-tooltip--visible');

    this._position(target);
  }

  private _position(target: HTMLElement): void {
    const targetRect = target.getBoundingClientRect();
    const tooltipRect = this.tooltipEl.getBoundingClientRect();

    let top = targetRect.bottom + 6;
    let left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);

    // If overflows bottom of viewport, position above target
    if (top + tooltipRect.height > window.innerHeight - 8) {
      top = targetRect.top - tooltipRect.height - 6;
    }

    // Keep within horizontal bounds
    if (left < 8) {
      left = 8;
    } else if (left + tooltipRect.width > window.innerWidth - 8) {
      left = window.innerWidth - tooltipRect.width - 8;
    }

    this.tooltipEl.style.top = `${top}px`;
    this.tooltipEl.style.left = `${left}px`;
  }

  private _hide(immediate: boolean = false): void {
    this._clearTimers();
    this.activeTarget = null;
    if (immediate) {
      this.tooltipEl.classList.remove('vellora-tooltip--visible');
    } else {
      this.tooltipEl.classList.remove('vellora-tooltip--visible');
    }
  }

  private _clearTimers(): void {
    if (this.showTimeout !== null) {
      clearTimeout(this.showTimeout);
      this.showTimeout = null;
    }
  }
}
