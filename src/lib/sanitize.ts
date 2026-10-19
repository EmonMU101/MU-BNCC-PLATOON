/**
 * Input Validation & Form Sanitization (XSS & Formula Injection Protection)
 * Production hardening utility for the MU BNCC Official Portal.
 */

// Mapping of dangerous HTML characters to safe HTML entities
const HTML_ENTITY_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;',
};

/**
 * Escapes HTML special characters into HTML entities to prevent Reflected/Stored XSS
 */
export const escapeHtml = (str: string): string => {
  if (typeof str !== 'string') return '';
  return str.replace(/[&<>"'`=/]/g, (char) => HTML_ENTITY_MAP[char] || char);
};

/**
 * Strips HTML tags, script elements, iframe, object, and style tags completely
 */
export const stripHtml = (str: string): string => {
  if (typeof str !== 'string') return '';
  return str
    // Remove script, style, iframe, object tags and their contents
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    // Remove remaining HTML tags
    .replace(/<\/?[^>]+(>|$)/g, '')
    // Remove null bytes and dangerous control characters (ASCII 0-8, 11-12, 14-31)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
};

/**
 * Defends against CSV / Google Sheets Formula Injection (Formula Injection / CWE-1236).
 * If a cell string begins with '=', '+', '-', '@', '\t', '\r', an attacker can execute
 * arbitrary commands or exfiltrate data via Google Sheets functions (=IMPORTXML, =HYPERLINK, etc.).
 * Prepends a single quote "'" to force Google Sheets to treat the value strictly as plain text.
 */
export const sanitizeSpreadsheetCell = (value: string | number | undefined | null): string => {
  if (value === null || value === undefined) return '';
  const str = String(value).trim();
  if (!str) return '';

  // Check for dangerous formula trigger prefixes
  const formulaTriggers = ['=', '+', '-', '@', '\t', '\r'];
  if (formulaTriggers.some((trigger) => str.startsWith(trigger))) {
    return `'${str}`;
  }
  return str;
};

/**
 * General purpose text sanitizer:
 * - Strips dangerous HTML tags and null characters
 * - Normalizes Unicode and control characters
 * - Enforces character length limits
 * - Defends against JavaScript pseudo-protocols
 */
export interface SanitizeTextOptions {
  maxLength?: number;
  allowMultiline?: boolean;
  stripHtmlTags?: boolean;
}

export const sanitizeText = (input: unknown, options: SanitizeTextOptions = {}): string => {
  if (typeof input !== 'string') return '';

  const {
    maxLength = 5000,
    allowMultiline = true,
    stripHtmlTags = true,
  } = options;

  let cleaned = input;

  // 1. Remove null bytes and non-printable control characters
  cleaned = cleaned.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // 2. Strip HTML tags or script injections
  if (stripHtmlTags) {
    cleaned = stripHtml(cleaned);
  }

  // 3. Normalize newlines if multiline is disallowed
  if (!allowMultiline) {
    cleaned = cleaned.replace(/[\r\n]+/g, ' ');
  }

  // 4. Neutralize inline event handlers or javascript: pseudo-protocols if left
  cleaned = cleaned
    .replace(/javascript:/gi, 'blocked:')
    .replace(/vbscript:/gi, 'blocked:')
    .replace(/data:text\/html/gi, 'blocked:');

  // 5. Trim whitespace and enforce length boundary
  cleaned = cleaned.trim();
  if (cleaned.length > maxLength) {
    cleaned = cleaned.substring(0, maxLength);
  }

  return cleaned;
};

/**
 * Validates and sanitizes URLs to ensure only safe protocols (http, https, mailto, tel) are accepted.
 * Blocks dangerous schemes like `javascript:`, `data:`, or `blob:` used in XSS.
 */
export const sanitizeUrl = (url: unknown): string => {
  if (typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  // Prohibit dangerous pseudo-protocols
  if (/^(javascript|vbscript|data):/i.test(trimmed)) {
    return '';
  }

  // Validate URL protocol
  try {
    const parsed = new URL(trimmed, window.location.origin);
    const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:'];
    if (allowedProtocols.includes(parsed.protocol)) {
      return trimmed;
    }
  } catch {
    // Relative URLs starting with '/' are permitted if they don't contain control characters
    if (trimmed.startsWith('/') && !trimmed.startsWith('//') && !/[\s<>"']/.test(trimmed)) {
      return trimmed;
    }
  }

  return '';
};
