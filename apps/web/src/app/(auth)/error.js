'use client';

import { useEffect } from 'react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { AlertTriangle } from 'lucide-react';

/**
 * Auth-specific error boundary
 * Handles errors during login/authentication flows
 */
export default function AuthError({ error, reset }) {
  useEffect(() => {
    console.error('Auth Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] p-4">
      <Card className="max-w-md w-full text-center">
        <div className="flex flex-col items-center gap-4">
          {/* Error Icon */}
          <div className="w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
          </div>

          {/* Error Message */}
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
              Authentication Error
            </h1>
            <p className="text-[var(--color-text-secondary)]">
              We couldn't complete your authentication request. Please try again.
            </p>
            {process.env.NODE_ENV === 'development' && error.message && (
              <p className="mt-4 text-sm text-yellow-600 dark:text-yellow-400 font-mono bg-yellow-50 dark:bg-yellow-900/10 p-3 rounded">
                {error.message}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 w-full">
            <Button
              variant="secondary"
              onClick={() => window.location.href = '/login'}
              className="flex-1"
            >
              Back to Login
            </Button>
            <Button
              variant="primary"
              onClick={reset}
              className="flex-1"
            >
              Try Again
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

