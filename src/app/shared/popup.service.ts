import { Injectable, signal } from '@angular/core';

export type PopupType = 'success' | 'error' | 'info';

@Injectable({ providedIn: 'root' })
export class PopupService {
  visible = signal(false);
  message = signal('');
  type = signal<PopupType>('info');

  private hideTimer: any;

  show(message: string, opts?: { type?: PopupType; durationMs?: number }) {
    // Clear previous timer if any
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }

    this.message.set(message);
    this.type.set(opts?.type ?? 'info');
    this.visible.set(true);

    const duration = opts?.durationMs ?? 2500;
    if (duration > 0) {
      this.hideTimer = setTimeout(() => this.hide(), duration);
    }
  }

  hide() {
    this.visible.set(false);
  }
}
