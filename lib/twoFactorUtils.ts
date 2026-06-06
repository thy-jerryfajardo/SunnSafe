import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

/**
 * Generate a TOTP secret and QR code URL
 * Used for setting up authenticator app (Google Authenticator, Authy, etc.)
 */
export const generateTOTPSecret = async (
  email: string,
  appName: string = 'SunnSafe'
): Promise<{ secret: string; qrCodeUrl: string }> => {
  try {
    const secret = speakeasy.generateSecret({
      name: `${appName} (${email})`,
      issuer: appName,
      length: 32 // Standard length for high entropy
    });

    if (!secret.otpauth_url) {
      throw new Error('Failed to generate TOTP URL');
    }

    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 300,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    return {
      secret: secret.base32!,
      qrCodeUrl
    };
  } catch (error) {
    console.error('Error generating TOTP secret:', error);
    throw new Error('2fa/totp-setup-failed');
  }
};

/**
 * Verify TOTP code from user
 * Allows ±1 time window (±30 seconds)
 */
export const verifyTOTPCode = (secret: string, code: string): boolean => {
  try {
    // Remove any spaces from code
    const cleanCode = code.replace(/\s/g, '');

    // Check if code matches (with ±1 time window for clock skew)
    const isValid = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token: cleanCode,
      window: 1 // Allows ±30 seconds tolerance
    });

    return !!isValid;
  } catch (error) {
    console.error('Error verifying TOTP code:', error);
    return false;
  }
};

/**
 * Generate backup codes for account recovery
 * 10 codes, 8 characters each (alphanumeric uppercase)
 */
export const generateBackupCodes = (): string[] => {
  const codes: string[] = [];
  const chars = 'ABCDEFGHJKMNPQRSTVWXYZ23456789'; // Removed I, L, O, 0, 1 to avoid confusion

  for (let i = 0; i < 10; i++) {
    let code = '';
    for (let j = 0; j < 8; j++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    // Format as XXXX-XXXX for readability
    codes.push(`${code.slice(0, 4)}-${code.slice(4)}`);
  }

  return codes;
};

/**
 * Verify backup code
 * Backup codes are single-use only (should be marked as used in DB)
 */
export const verifyBackupCode = (code: string, backupCodes: string[]): boolean => {
  return backupCodes.some(
    bc => bc.replace(/-/g, '').toUpperCase() === code.replace(/-/g, '').toUpperCase()
  );
};

/**
 * Generate a 6-digit email verification code
 */
export const generateEmailVerificationCode = (): string => {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  return code;
};

/**
 * Format TOTP secret for manual entry
 * Groups into 4-character chunks
 */
export const formatTOTPSecretForManualEntry = (secret: string): string => {
  return secret
    .match(/.{1,4}/g)
    ?.join(' ')
    .toUpperCase() || secret;
};

/**
 * Validate email code (6 digits)
 */
export const isValidEmailCode = (code: string): boolean => {
  return /^\d{6}$/.test(code.trim());
};

/**
 * Validate TOTP code (6 digits)
 */
export const isValidTOTPCode = (code: string): boolean => {
  return /^\d{6}$/.test(code.replace(/\s/g, ''));
};

/**
 * Validate backup code format (XXXX-XXXX)
 */
export const isValidBackupCodeFormat = (code: string): boolean => {
  return /^[A-Z0-9]{4}-[A-Z0-9]{4}$/i.test(code.replace(/\s/g, ''));
};
