// In a real implementation, we would use DOMPurify here.
// For now, we provide a basic HTML escaping function to prevent basic XSS.

export function sanitizeHtml(input: string): string {
  if (!input) return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function sanitizeObject(obj: unknown): unknown {
  if (typeof obj === 'string') return sanitizeHtml(obj);
  if (Array.isArray(obj)) return obj.map(sanitizeObject);
  if (typeof obj === 'object' && obj !== null) {
    const sanitized: Record<string, unknown> = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        sanitized[key] = sanitizeObject((obj as Record<string, unknown>)[key]);
      }
    }
    return sanitized;
  }
  return obj;
}
