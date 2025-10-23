import { Injectable } from '@angular/core';
import { DomSanitizer, SafeHtml, SafeUrl, SafeResourceUrl } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class SanitizationService {
  constructor(private sanitizer: DomSanitizer) {}

  /**
   * Sanitizes HTML content to prevent XSS attacks
   * @param html - HTML string to sanitize
   * @returns SafeHtml object
   */
  sanitizeHtml(html: string): SafeHtml {
    return this.sanitizer.sanitize(1, html) || '';
  }

  /**
   * Sanitizes URL to prevent malicious redirects
   * @param url - URL string to sanitize
   * @returns SafeUrl object
   */
  sanitizeUrl(url: string): SafeUrl {
    return this.sanitizer.sanitize(2, url) || '';
  }

  /**
   * Sanitizes resource URL (for images, scripts, etc.)
   * @param url - Resource URL to sanitize
   * @returns SafeResourceUrl object
   */
  sanitizeResourceUrl(url: string): SafeResourceUrl {
    return this.sanitizer.sanitize(4, url) || '';
  }

  /**
   * Sanitizes plain text by trimming and normalizing
   * @param text - Text to sanitize
   * @returns Sanitized text string
   */
  sanitizeText(text: string): string {
    if (!text) return '';
    
    return text
      .trim()
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .substring(0, 1000); // Limit length to prevent DoS
  }

  /**
   * Sanitizes file name to prevent directory traversal
   * @param fileName - File name to sanitize
   * @returns Sanitized file name
   */
  sanitizeFileName(fileName: string): string {
    if (!fileName) return '';
    
    return fileName
      .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace special chars with underscore
      .replace(/\.{2,}/g, '.') // Replace multiple dots with single dot
      .replace(/^\.+|\.+$/g, '') // Remove leading/trailing dots
      .substring(0, 255); // Limit length
  }

  /**
   * Sanitizes email address
   * @param email - Email to sanitize
   * @returns Sanitized email
   */
  sanitizeEmail(email: string): string {
    if (!email) return '';
    
    return email
      .trim()
      .toLowerCase()
      .replace(/[^a-zA-Z0-9@._-]/g, '') // Remove invalid chars
      .substring(0, 254); // RFC 5321 limit
  }

  /**
   * Sanitizes phone number
   * @param phone - Phone number to sanitize
   * @returns Sanitized phone number
   */
  sanitizePhone(phone: string): string {
    if (!phone) return '';
    
    return phone
      .trim()
      .replace(/[^0-9+\-().\s]/g, '') // Keep only valid phone chars
      .replace(/\s+/g, ' ') // Normalize spaces
      .substring(0, 20); // Reasonable phone length limit
  }

  /**
   * Sanitizes address
   * @param address - Address to sanitize
   * @returns Sanitized address
   */
  sanitizeAddress(address: string): string {
    if (!address) return '';
    
    return address
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML
      .replace(/\s+/g, ' ') // Normalize spaces
      .substring(0, 500); // Reasonable address length
  }

  /**
   * Sanitizes notes/description text
   * @param notes - Notes to sanitize
   * @returns Sanitized notes
   */
  sanitizeNotes(notes: string): string {
    if (!notes) return '';
    
    return notes
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML
      .replace(/\s+/g, ' ') // Normalize spaces
      .substring(0, 2000); // Reasonable notes length
  }

  /**
   * Validates and sanitizes numeric input
   * @param value - Value to validate
   * @param min - Minimum allowed value
   * @param max - Maximum allowed value
   * @returns Sanitized number or null if invalid
   */
  sanitizeNumber(value: any, min: number = 0, max: number = 999999): number | null {
    if (value === null || value === undefined || value === '') return null;
    
    const num = Number(value);
    if (isNaN(num)) return null;
    
    return Math.max(min, Math.min(max, num));
  }
}
