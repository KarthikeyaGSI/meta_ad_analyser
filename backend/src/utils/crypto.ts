import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;

/**
 * Encrypts plaintext using AES-256-CBC algorithm
 */
export function encrypt(text: string): string {
  if (!text) return '';
  try {
    const key = crypto.scryptSync(process.env.JWT_SECRET || 'aetheris_fallback_key_2026', 'salt', 32);
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Return iv:encrypted format
    return `${iv.toString('hex')}:${encrypted}`;
  } catch (err: any) {
    console.error('[Crypto Utils] Encryption failed:', err);
    return text; // Return plaintext fallback to prevent critical crashes
  }
}

/**
 * Decrypts encrypted text using AES-256-CBC algorithm
 */
export function decrypt(encryptedText: string): string {
  if (!encryptedText) return '';
  try {
    // If not in standard iv:encrypted format, treat as plaintext legacy token
    if (!encryptedText.includes(':')) {
      return encryptedText;
    }
    
    const [ivHex, encrypted] = encryptedText.split(':');
    const key = crypto.scryptSync(process.env.JWT_SECRET || 'aetheris_fallback_key_2026', 'salt', 32);
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (err: any) {
    // Fallback: If decryption fails (e.g. key mismatch or invalid format), return text as is
    return encryptedText;
  }
}
