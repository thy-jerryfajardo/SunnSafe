
export const getFirebaseErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'User already exists. Please sign in';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/user-disabled':
      return 'This account has been disabled.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Email or password is incorrect';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    case 'auth/popup-closed-by-user':
      return 'Sign in was canceled.';
    case 'auth/popup-blocked':
      return 'Pop-up was blocked by your browser.';
    case 'auth/cancelled-popup-request':
      return 'Only one pop-up request allowed at one time.';
    case 'auth/requires-recent-login':
      return 'Please sign in again before performing this action.';
    // 2FA Error Codes
    case '2fa/invalid-code':
      return 'Invalid code. Please try again.';
    case '2fa/code-expired':
      return 'Code expired. Request a new one.';
    case '2fa/too-many-attempts':
      return 'Too many failed attempts. Try again in 15 minutes.';
    case '2fa/method-not-enabled':
      return '2FA is not enabled on this account.';
    case '2fa/totp-setup-failed':
      return 'Failed to set up authenticator. Please try again.';
    case '2fa/invalid-totp-secret':
      return 'Invalid authenticator secret.';
    case '2fa/backup-code-not-found':
      return 'Invalid backup code.';
    case '2fa/backup-code-already-used':
      return 'This backup code has already been used.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
};
