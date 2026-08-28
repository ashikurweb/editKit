const TRANSITIONING_CLASS = 'editkit-dropdown-wrap--transitioning';

const DROPDOWN_SURFACE_CLASSES = new Set([
  'editkit-tb-dropdown-menu',
  'editkit-emoji-picker',
  'editkit-symbol-picker',
  'editkit-color-picker',
  'editkit-bubble-dropdown-menu',
]);

interface TransitionState {
  cancel: () => void;
}

const transitionStates = new WeakMap<HTMLElement, TransitionState>();

function findSurface(wrap: HTMLElement): HTMLElement | null {
  for (const child of Array.from(wrap.children)) {
    if (
      child instanceof HTMLElement
      && Array.from(DROPDOWN_SURFACE_CLASSES).some(className => child.classList.contains(className))
    ) {
      return child;
    }
  }

  return null;
}

function findTrigger(wrap: HTMLElement): HTMLButtonElement | null {
  for (const child of Array.from(wrap.children)) {
    if (child instanceof HTMLButtonElement) return child;
  }

  return null;
}

function toMilliseconds(value: string): number {
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed)) return 0;
  return value.trim().endsWith('ms') ? parsed : parsed * 1000;
}

function getTransitionDuration(element: HTMLElement): number {
  const style = window.getComputedStyle(element);
  const durations = style.transitionDuration.split(',').map(toMilliseconds);
  const delays = style.transitionDelay.split(',').map(toMilliseconds);
  const count = Math.max(durations.length, delays.length);
  let longest = 0;

  for (let index = 0; index < count; index += 1) {
    const duration = durations[index % durations.length] ?? 0;
    const delay = delays[index % delays.length] ?? 0;
    longest = Math.max(longest, duration + delay);
  }

  return longest;
}

function cancelPendingTransition(wrap: HTMLElement): void {
  transitionStates.get(wrap)?.cancel();
  transitionStates.delete(wrap);
}

function afterTransition(wrap: HTMLElement, surface: HTMLElement, callback: () => void): void {
  const duration = getTransitionDuration(surface);
  if (duration <= 0) {
    callback();
    return;
  }

  let settled = false;
  const finish = () => {
    if (settled) return;
    settled = true;
    surface.removeEventListener('transitionend', onTransitionEnd);
    window.clearTimeout(timeoutId);
    transitionStates.delete(wrap);
    callback();
  };
  const onTransitionEnd = (event: TransitionEvent) => {
    if (event.target === surface) finish();
  };
  const timeoutId = window.setTimeout(finish, duration + 50);

  surface.addEventListener('transitionend', onTransitionEnd);
  transitionStates.set(wrap, {
    cancel: () => {
      settled = true;
      surface.removeEventListener('transitionend', onTransitionEnd);
      window.clearTimeout(timeoutId);
    },
  });
}

function syncAccessibility(wrap: HTMLElement, open: boolean): void {
  const trigger = findTrigger(wrap);
  const surface = findSurface(wrap);

  trigger?.setAttribute('aria-expanded', String(open));
  surface?.setAttribute('aria-hidden', String(!open));
}

/**
 * Opens an initially display:none dropdown in two rendered states so its
 * opacity/transform transition can run without letting it affect page overflow.
 */
export function openDropdown(wrap: HTMLElement, openClass: string): void {
  cancelPendingTransition(wrap);

  const surface = findSurface(wrap);
  wrap.classList.add(TRANSITIONING_CLASS);
  syncAccessibility(wrap, true);

  if (surface) {
    // Commit the closed, displayable state before applying the open state.
    void surface.offsetWidth;
  }

  wrap.classList.add(openClass);

  if (!surface) {
    wrap.classList.remove(TRANSITIONING_CLASS);
    return;
  }

  afterTransition(wrap, surface, () => {
    if (wrap.classList.contains(openClass)) {
      wrap.classList.remove(TRANSITIONING_CLASS);
    }
  });
}

/** Keeps a closing dropdown rendered until its transition finishes, then hides it. */
export function closeDropdown(wrap: HTMLElement, openClass: string): void {
  cancelPendingTransition(wrap);

  const surface = findSurface(wrap);
  wrap.classList.add(TRANSITIONING_CLASS);
  wrap.classList.remove(openClass);
  syncAccessibility(wrap, false);

  if (!surface) {
    wrap.classList.remove(TRANSITIONING_CLASS);
    return;
  }

  afterTransition(wrap, surface, () => {
    if (!wrap.classList.contains(openClass)) {
      wrap.classList.remove(TRANSITIONING_CLASS);
    }
  });
}
