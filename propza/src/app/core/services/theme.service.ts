import { Injectable, effect, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';

export type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storageKey = 'propza_theme';
  readonly theme = signal<Theme>('light');
  private lastSyncedUserId: string | null = null;

  constructor(private supabase: SupabaseService, private auth: AuthService) {
    // React to authentication changes to sync theme with Supabase
    effect(() => {
      const user = this.auth.user();
      const userId = user?.id ?? null;
      if (userId && this.lastSyncedUserId !== userId) {
        this.lastSyncedUserId = userId;
        this.syncWithSupabaseOnLogin(userId);
      }
      if (!userId) {
        this.lastSyncedUserId = null;
      }
    });
  }

  async loadTheme(): Promise<void> {
    try {
      await this.auth.waitForSession();
    } catch {}

    const local = this.readFromLocalStorage();
    if (local) {
      this.applyTheme(local);
    } else {
      this.applyTheme('light');
    }

    const user = this.auth.user();
    if (user) {
      try {
        const { data, error } = await this.supabase.supabase
          .from('profiles')
          .select('theme')
          .eq('id', user.id)
          .single();
        if (!error) {
          const profileTheme = (data?.theme === 'dark'
            ? 'dark'
            : data?.theme === 'light'
            ? 'light'
            : null) as Theme | null;
          if (profileTheme) {
            if (profileTheme !== this.theme()) {
              this.applyTheme(profileTheme);
              this.saveToLocalStorage(profileTheme);
            }
          } else {
            await this.saveThemeToSupabase(this.theme(), user.id);
          }
        }
      } catch {}
    }
  }

  async setTheme(next: Theme): Promise<void> {
    if (next !== 'light' && next !== 'dark') return;
    this.applyTheme(next);
    this.saveToLocalStorage(next);

    const user = this.auth.user();
    if (user) {
      await this.saveThemeToSupabase(next, user.id);
    }
  }

  private applyTheme(theme: Theme): void {
    this.theme.set(theme);
    if (typeof document !== 'undefined') {
      document.body.classList.toggle('dark-theme', theme === 'dark');
    }
  }

  private readFromLocalStorage(): Theme | null {
    if (typeof localStorage === 'undefined') return null;
    const stored = localStorage.getItem(this.storageKey);
    return stored === 'dark' || stored === 'light' ? (stored as Theme) : null;
  }

  private saveToLocalStorage(theme: Theme): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(this.storageKey, theme);
  }

  private async saveThemeToSupabase(theme: Theme, userId: string): Promise<void> {
    try {
      await this.supabase.supabase.from('profiles').update({ theme }).eq('id', userId);
    } catch {}
  }

  private async syncWithSupabaseOnLogin(userId: string): Promise<void> {
    try {
      const { data, error } = await this.supabase.supabase
        .from('profiles')
        .select('theme')
        .eq('id', userId)
        .single();
      if (!error) {
        const profileTheme = (data?.theme === 'dark'
          ? 'dark'
          : data?.theme === 'light'
          ? 'light'
          : null) as Theme | null;
        if (profileTheme) {
          if (profileTheme !== this.theme()) {
            this.applyTheme(profileTheme);
            this.saveToLocalStorage(profileTheme);
          }
          return;
        }
      }
      await this.saveThemeToSupabase(this.theme(), userId);
    } catch {}
  }
}


