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

  async signInWithGoogle(): Promise<AuthError | null> {
    const { error } = await this.supabase.supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/home?beta=granted`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    });
    return error ?? null;
  }

  async signUp(email: string, password: string, firstName?: string, fullName?: string): Promise<{ error: AuthError | null }> {
    const { error } = await this.supabase.supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: {
          first_name: firstName || '',
          full_name: fullName || ''
        }
      }
    });
    return { error: error ?? null };
  }

  async signOut(): Promise<AuthError | null> {
    const { error } = await this.supabase.supabase.auth.signOut();
    return error ?? null;
  }

  // Update profile name (metadata) and/or email
  async updateProfile({ firstName, fullName, email }: { firstName?: string; fullName?: string; email?: string }): Promise<AuthError | null> {
    const options: any = {};
    if (firstName || fullName) {
      options.data = {
        ...(firstName ? { first_name: firstName } : {}),
        ...(fullName ? { full_name: fullName } : {})
      };
    }
    if (email) options.email = email;
    
    const { error } = await this.supabase.supabase.auth.updateUser(options);
    
    // After update, refresh the session to update the local user signal
    // This ensures the header-banner and other components see the updated name immediately
    if (!error) {
      const { data } = await this.supabase.supabase.auth.getSession();
      this.session.set(data.session);
      this.user.set(data.session?.user ?? null);
    }
    
    return error ?? null;
  }

  // Send password reset email via Supabase
  async sendPasswordReset(email: string): Promise<AuthError | null> {
    const { error } = await this.supabase.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`
    });
    return error ?? null;
  }

  // Best-effort account deletion: requires a Postgres RPC (SECURITY DEFINER) named delete_current_user
  // that calls auth.uid() and deletes the user via auth.admin using service role on the server side.
  // If not configured, show a helpful error.
  async deleteAccount(): Promise<string | null> {
    try {
      const { data } = await this.supabase.supabase.auth.getUser();
      if (!data.user) return 'No authenticated user';

      const { error } = await this.supabase.supabase.rpc('delete_current_user');
      if (error) return error.message;
      return null;
    } catch (e: any) {
      return e?.message || 'Failed to delete account. Server function not configured.';
    }
  }
}


