/**
 * Registers device for push notifications when user is authenticated.
 * Mount inside AuthProvider.
 */

import { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import * as authStorage from '../lib/authStorage';
import { registerForPushNotifications } from '../hooks/usePushNotifications';

export function PushNotificationRegistrar() {
  const { isAuthenticated } = useAuth();
  const hasRegisteredRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated) {
      hasRegisteredRef.current = false;
      return;
    }

    const run = async () => {
      if (hasRegisteredRef.current) return;
      const tokens = await authStorage.getTokens();
      if (!tokens?.accessToken) return;
      hasRegisteredRef.current = true;
      await registerForPushNotifications(tokens.accessToken);
    };

    run();
  }, [isAuthenticated]);

  return null;
}
