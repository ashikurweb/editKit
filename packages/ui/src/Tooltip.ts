// ============================================================
// EditKit — Custom Global Floating Tooltip System
// Pixel-perfect glassmorphic tooltips with shortcut badges
// Spring bubble animation, theme-aware (dark & light)
// ============================================================

export class TooltipManager {
  private static instance: TooltipManager | null = null;
  private tooltipEl!: HTMLElement;
  private textEl!: HTMLElement;
  private shortcutEl!: HTMLElement;
  private activeTarget: HTMLElement | null = null;
  private showTimeout: number | null = null;
  private hideTimeout: number | null = null;

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
    this.tooltipEl.classList.add('editkit-tooltip');
    this.tooltipEl.setAttribute('role', 'tooltip');
    this.tooltipEl.setAttribute('aria-hidden', 'true');

    this.textEl = document.createElement('span');
    this.textEl.classList.add('editkit-tooltip-text');

    this.shortcutEl = document.createElement('kbd');
    this.shortcutEl.classList.add('editkit-tooltip-shortcut');

    this.tooltipEl.appendChild(this.textEl);
    this.tooltipEl.appendChild(this.shortcutEl);

    document.body.appendChild(this.tooltipEl);
  }

  private _bindEvents(): void {
    // Use mouseenter/mouseleave via delegation on capture phase
    document.addEventListener('mouseover', (e) => {
      const target = (e.target as HTMLElement | null)?.closest<HTMLElement>('[data-editkit-tooltip]');
      if (target) {
        this._cancelHide();
        this._scheduleShow(target);
      }
    }, true);

    document.addEventListener('mouseout', (e) => {
      const target = (e.target as HTMLElement | null)?.closest<HTMLElement>('[data-editkit-tooltip]');
      if (target && this.activeTarget === target) {
        const related = e.relatedTarget as HTMLElement | null;
        // Only hide if we truly left the tooltip target
        if (!target.contains(related)) {
          this._scheduleHide();
        }
      }
    }, true);

    document.addEventListener('mousedown', () => {
      this._hide();
    }, true);

    window.addEventListener('scroll', () => {
      if (this.activeTarget) this._hide();
    }, true);

    window.addEventListener('resize', () => {
      if (this.activeTarget) this._hide();
    });
  }

  private _scheduleShow(target: HTMLElement): void {
    if (this.activeTarget === target) return;
    this._clearShowTimer();

    this.showTimeout = window.setTimeout(() => {
      this._show(target);
    }, 350);
  }

  private _scheduleHide(): void {
    this._clearShowTimer();
    this.hideTimeout = window.setTimeout(() => {
      this._hide();
    }, 80);
  }

  private _cancelHide(): void {
    if (this.hideTimeout !== null) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
  }

  private _show(target: HTMLElement): void {
    const text = target.getAttribute('data-editkit-tooltip');
    if (!text) return;

    // Don't show tooltip if target is inside an open dropdown
    const inOpenDropdown = target.closest('.editkit-tb-dropdown-wrap--open');
    if (inOpenDropdown && !target.classList.contains('editkit-tb-btn')) return;

    this.activeTarget = target;
    this.textEl.textContent = text;

    // Sync theme
    const themeHost = target.closest('[data-editkit-theme]') || document.querySelector('[data-editkit-theme]') || document.documentElement;
    const theme = themeHost.getAttribute('data-editkit-theme') || 'dark';
    this.tooltipEl.setAttribute('data-editkit-theme', theme);

    // Shortcut badge
    const shortcut = target.getAttribute('data-tooltip-shortcut');
    if (shortcut) {
      this.shortcutEl.textContent = shortcut;
      this.shortcutEl.style.display = 'inline-block';
    } else {
      this.shortcutEl.style.display = 'none';
    }

    // Position BEFORE making visible (measure at full size but invisible)
    this.tooltipEl.style.opacity = '0';
    this.tooltipEl.style.visibility = 'visible';
    this.tooltipEl.style.pointerEvents = 'none';
    this.tooltipEl.style.display = 'inline-flex';

    // Force reflow to get accurate dimensions
    void this.tooltipEl.offsetHeight;

    this._position(target);

    // Now reveal with animation
    this.tooltipEl.style.removeProperty('opacity');
    this.tooltipEl.style.removeProperty('visibility');
    this.tooltipEl.style.removeProperty('display');
    this.tooltipEl.classList.add('editkit-tooltip--visible');
  }

  private _position(target: HTMLElement): void {
    const targetRect = target.getBoundingClientRect();
    const tooltipW = this.tooltipEl.offsetWidth;
    const tooltipH = this.tooltipEl.offsetHeight;

    let top = targetRect.bottom + 7;
    let left = targetRect.left + (targetRect.width / 2) - (tooltipW / 2);

    // If overflows bottom of viewport, position above target
    if (top + tooltipH > window.innerHeight - 8) {
      top = targetRect.top - tooltipH - 7;
    }

    // Keep within horizontal bounds
    if (left < 8) {
      left = 8;
    } else if (left + tooltipW > window.innerWidth - 8) {
      left = window.innerWidth - tooltipW - 8;
    }

    this.tooltipEl.style.top = `${top}px`;
    this.tooltipEl.style.left = `${left}px`;
  }

  private _hide(): void {
    this._clearShowTimer();
    this._cancelHide();
    this.activeTarget = null;
    this.tooltipEl.classList.remove('editkit-tooltip--visible');
  }

  private _clearShowTimer(): void {
    if (this.showTimeout !== null) {
      clearTimeout(this.showTimeout);
      this.showTimeout = null;
    }
  }
}
