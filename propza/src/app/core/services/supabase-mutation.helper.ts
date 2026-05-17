import { Injectable } from '@angular/core';
import { PostgrestError } from '@supabase/supabase-js';
import { LoggerService } from './logger.service';
import { SupabaseService } from './supabase.service';

/**
 * Shared helpers for authenticated Supabase mutations. Centralises the
 * `getUser → requireId`, `if (error) throw` and `await refresh()` pattern
 * that was repeated across PropertyService and TenantService.
 */
@Injectable({ providedIn: 'root' })
export class SupabaseMutationHelper {
  constructor(
    private supabase: SupabaseService,
    private logger: LoggerService
  ) {}

  async requireUserId(): Promise<string> {
    const { data } = await this.supabase.supabase.auth.getUser();
    const id = data.user?.id;
    if (!id) throw new Error('User not authenticated');
    return id;
  }

  async getUserIdOrNull(): Promise<string | null> {
    const { data } = await this.supabase.supabase.auth.getUser();
    return data.user?.id ?? null;
  }

  /**
   * Throws (and logs) if `error` is non-null. The `context` string is
   * included in the log message so stack traces are easy to trace.
   */
  checkError(error: PostgrestError | null, context: string): void {
    if (!error) return;
    this.logger.error(`${context}:`, error);
    throw error;
  }

  /**
   * Wraps a single Supabase mutation in shared try/catch logic:
   * 1. Runs `op` (expected to return `{ error }`).
   * 2. Throws if Postgrest returns an error.
   * 3. Calls optional `refresh` callback on success.
   *
   * Re-throws any error so callers can handle it (e.g. show a toast).
   */
  async runMutation(
    context: string,
    op: () => PromiseLike<{ error: PostgrestError | null }>,
    refresh?: () => Promise<void>
  ): Promise<void> {
    try {
      const { error } = await op();
      this.checkError(error, context);
      if (refresh) await refresh();
    } catch (err) {
      this.logger.error(context, err);
      throw err;
    }
  }

  /**
   * Wraps a Postgrest error in a plain `Error` preserving the original
   * `code`, `details`, and `hint` fields. Useful when callers need to
   * inspect Supabase-specific metadata after a throw.
   */
  mapPostgrestError(error: PostgrestError, fallbackMessage = 'Database operation failed'): Error {
    const message = error.message || error.details || error.hint || fallbackMessage;
    const enriched = new Error(message);
    (enriched as any)['code'] = error.code;
    (enriched as any)['details'] = error.details;
    (enriched as any)['hint'] = error.hint;
    return enriched;
  }
}
