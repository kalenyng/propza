import { Injectable, signal } from '@angular/core';
import { AuthError, Session, User } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly session = signal<Session | null>(null);
  readonly user = signal<User | null>(null);
  readonly userName = signal<string>('');
  private sessionInitialized = false;
  private sessionInitPromise: Promise<void>;
  private userNameInitialized = false;
  private userNameInitPromise: Promise<void> = Promise.resolve();

  constructor(public supabase: SupabaseService) {
    // Initialize session and store the promise
    this.sessionInitPromise = this.initializeSession();
    
    // Listen for auth state changes
    this.supabase.supabase.auth.onAuthStateChange((_event, session) => {
      this.session.set(session);
      this.user.set(session?.user ?? null);
      
      // Update user name when auth state changes
      if (session?.user) {
        this.initializeUserName(session.user);
      } else {
        this.userName.set('');
        this.userNameInitialized = false;
      }
    });
  }

  private async initializeSession(): Promise<void> {
    const { data } = await this.supabase.supabase.auth.getSession();
    this.session.set(data.session);
    this.user.set(data.session?.user ?? null);
    this.sessionInitialized = true;
    
    // Initialize user name if user is logged in
    if (data.session?.user) {
      this.initializeUserName(data.session.user);
    }
  }

  private async initializeUserName(user: User): Promise<void> {
    if (this.userNameInitialized) {
      return;
    }
    
    this.userNameInitPromise = this.fetchUserName(user);
    await this.userNameInitPromise;
    this.userNameInitialized = true;
  }

  private async fetchUserName(user: User): Promise<void> {
    try {
      // Try to get name from profiles table first
      const { data } = await this.supabase.supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();
      
      if (data?.full_name) {
        const firstName = String(data.full_name).split(' ')[0];
        this.userName.set(firstName);
        return;
      }
    } catch {
      // Fallback to metadata
    }
    
    // Fallback to user metadata
    const metadata = user.user_metadata || {};
    const firstName = String(metadata['first_name'] || 
                     (metadata['full_name'] as string)?.split(' ')[0] ||
                     (metadata['name'] as string)?.split(' ')[0] || 
                     '');
    
    this.userName.set(firstName);
  }

  async waitForSession(): Promise<void> {
    if (!this.sessionInitialized) {
      await this.sessionInitPromise;
    }
  }

  async waitForUserName(): Promise<void> {
    if (!this.userNameInitialized && this.user()) {
      await this.userNameInitPromise;
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
        redirectTo: `${window.location.origin}/dashboard?beta=granted`,
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

  async updateProfile({ firstName, fullName, email }: { firstName?: string; fullName?: string; email?: string }): Promise<AuthError | null> {
    interface UpdateOptions {
      data?: {
        first_name?: string;
        full_name?: string;
      };
      email?: string;
    }

    const options: UpdateOptions = {};
    
    if (firstName || fullName) {
      options.data = {
        ...(firstName ? { first_name: firstName } : {}),
        ...(fullName ? { full_name: fullName } : {})
      };
    }
    
    if (email) {
      options.email = email;
    }
    
    const { error } = await this.supabase.supabase.auth.updateUser(options);
    
    if (!error) {
      const { data } = await this.supabase.supabase.auth.getSession();
      this.session.set(data.session);
      this.user.set(data.session?.user ?? null);
      
      // Update cached user name if profile was updated
      if (data.session?.user && (firstName || fullName)) {
        const updatedFirstName = firstName || fullName?.split(' ')[0] || '';
        this.userName.set(updatedFirstName);
      }
    }
    
    return error ?? null;
  }

  // Send password reset email via Supabase
  async sendPasswordReset(email: string): Promise<AuthError | null> {
    const { error } = await this.supabase.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    return error ?? null;
  }

  async updatePassword(newPassword: string): Promise<AuthError | null> {
    const { error } = await this.supabase.supabase.auth.updateUser({ password: newPassword });
    return error ?? null;
  }

  // Best-effort account deletion: requires a Postgres RPC (SECURITY DEFINER) named delete_current_user
  // that calls auth.uid() and deletes the user via auth.admin using service role on the server side.
  // If not configured, show a helpful error.
  async deleteAccount(): Promise<string | null> {
    try {
      const { data } = await this.supabase.supabase.auth.getUser();
      if (!data.user) {
        return 'No authenticated user';
      }

      const { error } = await this.supabase.supabase.rpc('delete_current_user');
      if (error) {
        return error.message;
      }
      
      return null;
    } catch (error) {
      if (error instanceof Error) {
        return error.message;
      }
      return 'Failed to delete account. Server function not configured.';
    }
  }
}


