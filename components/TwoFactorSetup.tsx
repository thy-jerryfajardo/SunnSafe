import React, { useState } from 'react';
import { X, Loader2, Copy, Check, AlertCircle, Smartphone, Mail } from 'lucide-react';
import {
  generateTOTPSecret,
  verifyTOTPCode,
  generateBackupCodes,
  formatTOTPSecretForManualEntry,
  isValidTOTPCode
} from '../lib/twoFactorUtils';
import { getFirebaseErrorMessage } from '../lib/firebaseUtils';

interface TwoFactorSetupProps {
  isOpen: boolean;
  email: string;
  currentMethod?: 'email' | 'totp' | null;
  onSetupComplete: (method: 'email' | 'totp', secret?: string, backupCodes?: string[]) => Promise<void>;
  onCancel: () => void;
}

type SetupStep = 'method-selection' | 'totp-setup' | 'totp-verify' | 'backup-codes' | 'success';

const TwoFactorSetup: React.FC<TwoFactorSetupProps> = ({
  isOpen,
  email,
  currentMethod,
  onSetupComplete,
  onCancel
}) => {
  const [step, setStep] = useState<SetupStep>('method-selection');
  const [selectedMethod, setSelectedMethod] = useState<'email' | 'totp' | null>(null);
  const [totpSecret, setTotpSecret] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [totpCode, setTotpCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [showSecret, setShowSecret] = useState(false);

  // Reset state when modal opens/closes
  const handleReset = () => {
    setStep('method-selection');
    setSelectedMethod(null);
    setTotpSecret(null);
    setQrCodeUrl(null);
    setTotpCode('');
    setBackupCodes([]);
    setError(null);
    setShowSecret(false);
    onCancel();
  };

  // Setup Email 2FA
  const handleSetupEmail = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await onSetupComplete('email');
      setStep('success');
    } catch (err: any) {
      const errorMsg = typeof err === 'string'
        ? getFirebaseErrorMessage(err)
        : err.message || 'Failed to enable 2FA';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate TOTP Secret
  const handleGenerateTOTP = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { secret, qrCodeUrl } = await generateTOTPSecret(email);
      setTotpSecret(secret);
      setQrCodeUrl(qrCodeUrl);
      setBackupCodes(generateBackupCodes());
      setStep('totp-verify');
    } catch (err: any) {
      const errorMsg = typeof err === 'string'
        ? getFirebaseErrorMessage(err)
        : err.message || 'Failed to generate authenticator setup';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Verify TOTP Code
  const handleVerifyTOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isValidTOTPCode(totpCode)) {
      setError('Please enter a valid 6-digit code from your authenticator');
      return;
    }

    if (!totpSecret) {
      setError('TOTP secret not found');
      return;
    }

    if (!verifyTOTPCode(totpSecret, totpCode)) {
      setError('Invalid code. Please check your authenticator and try again.');
      return;
    }

    setIsLoading(true);
    try {
      await onSetupComplete('totp', totpSecret, backupCodes);
      setStep('backup-codes');
    } catch (err: any) {
      const errorMsg = typeof err === 'string'
        ? getFirebaseErrorMessage(err)
        : err.message || 'Failed to enable 2FA';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Copy backup code
  const handleCopyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Download backup codes as text file
  const handleDownloadBackupCodes = () => {
    const content = `SunnSafe Backup Codes\nGenerated: ${new Date().toISOString()}\n\n${backupCodes.join('\n')}\n\nIf you lose access to your authenticator app, you can use one of these codes to regain access to your account.\nEach code can only be used once.`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sunnsafe-backup-codes.txt';
    a.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            {currentMethod ? 'Change 2FA Method' : 'Enable Two-Factor Authentication'}
          </h2>
          <button
            onClick={handleReset}
            className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Method Selection */}
          {step === 'method-selection' && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                Choose how you'd like to verify your identity when signing in.
              </p>

              {/* Email Option */}
              <button
                onClick={() => {
                  setSelectedMethod('email');
                  setStep('method-selection');
                }}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  selectedMethod === 'email'
                    ? 'border-red-900 bg-red-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Email Code</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      Receive a 6-digit code via email. Fastest to set up.
                    </p>
                    {currentMethod === 'email' && (
                      <p className="text-xs text-green-600 font-medium mt-2">✓ Currently enabled</p>
                    )}
                  </div>
                </div>
              </button>

              {/* TOTP Option */}
              <button
                onClick={() => {
                  setSelectedMethod('totp');
                  setStep('method-selection');
                }}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  selectedMethod === 'totp'
                    ? 'border-red-900 bg-red-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Smartphone className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Authenticator App</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      Use Google Authenticator or Authy. More secure.
                    </p>
                    {currentMethod === 'totp' && (
                      <p className="text-xs text-green-600 font-medium mt-2">✓ Currently enabled</p>
                    )}
                  </div>
                </div>
              </button>

              {/* Error */}
              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-100">
                  <div className="flex gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleReset}
                  className="flex-1 py-2.5 px-4 border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                {selectedMethod === 'email' && (
                  <button
                    onClick={handleSetupEmail}
                    disabled={isLoading}
                    className="flex-1 py-2.5 px-4 bg-red-900 text-white font-semibold rounded-lg hover:bg-red-800 disabled:bg-slate-300 transition-all flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Setting up...
                      </>
                    ) : (
                      'Continue'
                    )}
                  </button>
                )}
                {selectedMethod === 'totp' && (
                  <button
                    onClick={handleGenerateTOTP}
                    disabled={isLoading}
                    className="flex-1 py-2.5 px-4 bg-red-900 text-white font-semibold rounded-lg hover:bg-red-800 disabled:bg-slate-300 transition-all flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      'Continue'
                    )}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TOTP Verification */}
          {step === 'totp-verify' && qrCodeUrl && totpSecret && (
            <form onSubmit={handleVerifyTOTP} className="space-y-4">
              <p className="text-sm text-slate-600">
                Scan this QR code with your authenticator app (Google Authenticator, Authy, Microsoft Authenticator, etc.).
              </p>

              {/* QR Code */}
              <div className="flex justify-center p-4 bg-slate-50 rounded-lg">
                <img
                  src={qrCodeUrl}
                  alt="TOTP QR Code"
                  className="w-48 h-48 rounded-lg"
                />
              </div>

              {/* Manual Entry */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="text-sm text-red-900 hover:text-red-800 font-medium"
                >
                  {showSecret ? 'Hide' : 'Can\'t scan?'} Enter manually
                </button>
                {showSecret && (
                  <div className="p-3 bg-slate-50 rounded-lg space-y-2">
                    <p className="text-xs text-slate-600">Enter this code in your authenticator:</p>
                    <div className="flex items-center justify-between gap-2">
                      <code className="text-sm font-mono font-bold text-slate-900 flex-1 break-all">
                        {formatTOTPSecretForManualEntry(totpSecret)}
                      </code>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(totpSecret);
                          setCopiedIndex(-1);
                          setTimeout(() => setCopiedIndex(null), 2000);
                        }}
                        className="p-2 hover:bg-slate-200 rounded transition-colors flex-shrink-0"
                      >
                        {copiedIndex === -1 ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-slate-600" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Code Entry */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Verify with your authenticator code
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={totpCode}
                  onChange={e => {
                    const numOnly = e.target.value.replace(/\D/g, '');
                    if (numOnly.length <= 6) setTotpCode(numOnly);
                  }}
                  placeholder="000000"
                  maxLength="6"
                  className="w-full px-4 py-2.5 text-center text-2xl tracking-widest font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900"
                  autoFocus
                />
              </div>

              {/* Error */}
              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-100">
                  <div className="flex gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setTotpCode('');
                    setError(null);
                    setStep('method-selection');
                  }}
                  className="flex-1 py-2.5 px-4 border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-all"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading || totpCode.length !== 6}
                  className="flex-1 py-2.5 px-4 bg-red-900 text-white font-semibold rounded-lg hover:bg-red-800 disabled:bg-slate-300 transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Confirm'
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Backup Codes */}
          {step === 'backup-codes' && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <div className="text-sm text-amber-800">
                    <p className="font-semibold">Save these backup codes in a safe place</p>
                    <p className="mt-1">
                      If you lose access to your authenticator app, you can use these codes to regain access.
                      Each code can only be used once.
                    </p>
                  </div>
                </div>
              </div>

              {/* Backup Codes Grid */}
              <div className="grid grid-cols-2 gap-2">
                {backupCodes.map((code, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleCopyCode(code, index)}
                    className="p-3 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 text-left transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <code className="font-mono text-sm font-semibold text-slate-900">
                        {code}
                      </code>
                      {copiedIndex === index ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Download Button */}
              <button
                type="button"
                onClick={handleDownloadBackupCodes}
                className="w-full py-2.5 px-4 border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-all"
              >
                Download Codes
              </button>

              {/* Confirmation */}
              <label className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <input
                  type="checkbox"
                  required
                  className="w-4 h-4 mt-0.5 accent-red-900 rounded"
                />
                <span className="text-sm text-slate-700">
                  I have saved my backup codes in a safe place
                </span>
              </label>

              {/* Complete Button */}
              <button
                onClick={handleReset}
                className="w-full py-2.5 px-4 bg-red-900 text-white font-semibold rounded-lg hover:bg-red-800 transition-all"
              >
                Done
              </button>
            </div>
          )}

          {/* Success */}
          {step === 'success' && (
            <div className="space-y-4 text-center">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-slate-900">2FA Enabled!</h3>
              <p className="text-sm text-slate-600">
                Your account is now more secure. You'll be asked for a verification code when you sign in.
              </p>
              <button
                onClick={handleReset}
                className="w-full py-2.5 px-4 bg-red-900 text-white font-semibold rounded-lg hover:bg-red-800 transition-all"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TwoFactorSetup;
