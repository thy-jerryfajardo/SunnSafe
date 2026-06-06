import React, { useState, useEffect } from 'react';
import { Lock, Loader2, RotateCcw, ArrowLeft } from 'lucide-react';
import { isValidEmailCode, isValidTOTPCode } from '../lib/twoFactorUtils';

interface TwoFactorVerifyProps {
  method: 'email' | 'totp';
  email: string;
  onVerifySuccess: (code: string) => Promise<void>;
  onCancel: () => void;
  onResendCode?: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  serverError?: string;
}

const TwoFactorVerify: React.FC<TwoFactorVerifyProps> = ({
  method,
  email,
  onVerifySuccess,
  onCancel,
  onResendCode,
  isLoading,
  error,
  serverError
}) => {
  const [code, setCode] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(error || serverError || null);
  const [isResending, setIsResending] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [nextRetryTime, setNextRetryTime] = useState<number | null>(null);

  // Validate code format as user types
  const isCodeValid = method === 'email' ? isValidEmailCode(code) : isValidTOTPCode(code);

  // Format code input based on method
  const handleCodeChange = (value: string) => {
    const numOnly = value.replace(/\D/g, '');
    if (numOnly.length <= 6) {
      setCode(numOnly);
      setSubmitError(null); // Clear error when user starts typing
    }
  };

  // Handle verification
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLocked) {
      setSubmitError(`Too many attempts. Please try again in ${nextRetryTime} minutes.`);
      return;
    }

    if (!isCodeValid) {
      setSubmitError(
        method === 'email'
          ? 'Please enter a valid 6-digit code'
          : 'Please enter a valid 6-digit code from your authenticator'
      );
      return;
    }

    try {
      await onVerifySuccess(code);
    } catch (err: any) {
      const errorMsg = err.message || 'Verification failed. Please try again.';
      setSubmitError(errorMsg);
      setAttemptCount(prev => prev + 1);

      // Lock after 5 attempts
      if (attemptCount >= 4) {
        setIsLocked(true);
        setNextRetryTime(15);

        // 15-minute lockout countdown
        const interval = setInterval(() => {
          setNextRetryTime(prev => {
            if (prev === null || prev <= 1) {
              clearInterval(interval);
              setIsLocked(false);
              setNextRetryTime(null);
              setAttemptCount(0);
              return null;
            }
            return prev - 1;
          });
        }, 60000);
      }
    }
  };

  // Handle resend code (email only)
  const handleResendCode = async () => {
    if (!onResendCode || isResending) return;

    setIsResending(true);
    try {
      await onResendCode();
      setCode('');
      setSubmitError(null);
      setAttemptCount(0);
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to resend code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  // Update error when it changes from props
  useEffect(() => {
    if (error || serverError) {
      setSubmitError(error || serverError);
    }
  }, [error, serverError]);

  // Mask email for privacy
  const maskedEmail = email.replace(/(.{2})(.*)(@.*)/, '$1***$3');

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleVerify} className="space-y-4">
        {/* Back Button */}
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to sign in
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
              <Lock className="w-6 h-6 text-red-900" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-slate-900">Verify Your Identity</h2>
          <p className="text-sm text-slate-600 mt-2">
            {method === 'email'
              ? `We've sent a code to ${maskedEmail}`
              : 'Enter the code from your authenticator app'}
          </p>
        </div>

        {/* Code Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            {method === 'email' ? '6-Digit Code' : 'Authenticator Code'}
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={code}
            onChange={e => handleCodeChange(e.target.value)}
            placeholder="000000"
            disabled={isLocked || isLoading}
            maxLength={6}
            className="w-full px-4 py-2.5 text-center text-2xl tracking-widest font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-transparent disabled:bg-slate-50 disabled:cursor-not-allowed transition-all"
            autoFocus
          />
          <p className="text-xs text-slate-500 text-center">
            {method === 'email' ? 'Code expires in 10 minutes' : 'Valid for 30 seconds'}
          </p>
        </div>

        {/* Error Message */}
        {submitError && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-100">
            <div className="flex gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0 mt-1" />
              <p className="text-sm text-red-600 font-medium">{submitError}</p>
            </div>
          </div>
        )}

        {/* Verify Button */}
        <button
          type="submit"
          disabled={!isCodeValid || isLoading || isLocked}
          className="w-full py-2.5 px-4 bg-red-900 text-white font-semibold rounded-lg hover:bg-red-800 active:bg-red-950 transition-all disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Verifying...
            </>
          ) : (
            'Verify'
          )}
        </button>

        {/* Resend Code Link (Email only) */}
        {method === 'email' && (
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={handleResendCode}
              disabled={isResending || isLocked}
              className="text-sm text-red-900 hover:text-red-800 font-medium flex items-center justify-center gap-1 mx-auto transition-colors disabled:text-slate-400 disabled:cursor-not-allowed"
            >
              {isResending ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <RotateCcw className="w-3 h-3" />
                  Didn't receive the code?
                </>
              )}
            </button>
          </div>
        )}

        {/* Attempt Count Info */}
        {attemptCount > 0 && attemptCount <= 3 && (
          <p className="text-xs text-slate-500 text-center">
            Attempt {attemptCount} of 5 • {5 - attemptCount} remaining
          </p>
        )}
      </form>
    </div>
  );
};

export default TwoFactorVerify;
