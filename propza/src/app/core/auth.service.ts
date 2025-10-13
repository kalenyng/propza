import { Injectable, signal } from '@angular/core';
import { AuthError, Session, User } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly session = signal<Session | null>(null);
  readonly user = signal<User | null>(null);
  private sessionInitialized = false;
  private sessionInitPromise: Promise<void>;

  constructor(public supabase: SupabaseService) {
    // Initialize session and store the promise
    this.sessionInitPromise = this.initializeSession();
    
    // Listen for auth state changes
    this.supabase.supabase.auth.onAuthStateChange((_event, session) => {
      this.session.set(session);
      this.user.set(session?.user ?? null);
    });
  }

  private async initializeSession(): Promise<void> {
    const { data } = await this.supabase.supabase.auth.getSession();
    this.session.set(data.session);
    this.user.set(data.session?.user ?? null);
    this.sessionInitialized = true;
  }

  async waitForSession(): Promise<void> {
    if (!this.sessionInitialized) {
      await this.sessionInitPromise;
    }
  }

  async signInWithPassword(email: string, password: string): Promise<AuthError | null> {
    const { error } = await this.supabase.supabase.auth.signInWithPassword({ email, password });
    return error ?? null;
  }

  async signOut(): Promise<AuthError | null> {
    const { error } = await this.supabase.supabase.auth.signOut();
    return error ?? null;
  }
}


