import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ScrollRestoreService {
  private scrollHost: HTMLElement | null = null;
  private readonly positions = new Map<string, number>();
  private readonly pendingRestores = new Set<string>();

  registerHost(el: HTMLElement): void {
    this.scrollHost = el;
  }

  private useWindowScroll(): boolean {
    return typeof window === 'undefined' || window.innerWidth < 1024;
  }

  readY(): number {
    if (!this.useWindowScroll() && this.scrollHost) {
      return this.scrollHost.scrollTop;
    }
    if (typeof window !== 'undefined') {
      return (
        window.scrollY ||
        (document.scrollingElement as HTMLElement | null)?.scrollTop ||
        document.documentElement.scrollTop ||
        0
      );
    }
    return 0;
  }

  writeY(y: number): void {
    if (!this.useWindowScroll() && this.scrollHost) {
      this.scrollHost.scrollTop = y;
      return;
    }
    if (typeof window !== 'undefined') {
      window.scrollTo(0, y);
      document.documentElement.scrollTop = y;
      document.body.scrollTop = y;
    }
  }

  getScrollMax(): number {
    if (!this.useWindowScroll() && this.scrollHost) {
      return Math.max(0, this.scrollHost.scrollHeight - this.scrollHost.clientHeight);
    }
    if (typeof document !== 'undefined') {
      return Math.max(
        0,
        Math.max(document.documentElement.scrollHeight, document.body?.scrollHeight ?? 0) -
          window.innerHeight
      );
    }
    return 0;
  }

  saveForPath(path: string): void {
    this.positions.set(path, this.readY());
  }

  popForPath(path: string): number | null {
    const y = this.positions.get(path) ?? null;
    this.positions.delete(path);
    return y;
  }

  flagRestoreFor(path: string): void {
    this.pendingRestores.add(path);
  }

  consumeRestoreFlag(path: string): boolean {
    const had = this.pendingRestores.has(path);
    this.pendingRestores.delete(path);
    return had;
  }
}
