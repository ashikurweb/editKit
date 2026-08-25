// ============================================================
// Vellora — Typed Event Emitter
// ============================================================

export type EventHandler<T = any> = (data: T) => void;
export type Unsubscribe = () => void;

export class EventEmitter<Events extends Record<string, any> = Record<string, any>> {
  private _listeners: Map<keyof Events, Set<EventHandler>> = new Map();

  /** Subscribe to an event. Returns an unsubscribe function. */
  on<E extends keyof Events>(event: E, handler: EventHandler<Events[E]>): Unsubscribe {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, new Set());
    }
    this._listeners.get(event)!.add(handler);
    return () => this.off(event, handler);
  }

  /** Unsubscribe from an event */
  off<E extends keyof Events>(event: E, handler: EventHandler<Events[E]>): void {
    this._listeners.get(event)?.delete(handler);
  }

  /** Emit an event with data */
  emit<E extends keyof Events>(event: E, data: Events[E]): void {
    this._listeners.get(event)?.forEach((handler) => {
      try {
        handler(data);
      } catch (err) {
        console.error(`[Vellora] Error in "${String(event)}" handler:`, err);
      }
    });
  }

  /** Remove all listeners */
  removeAllListeners(): void {
    this._listeners.clear();
  }
}
