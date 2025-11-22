import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const { handleCallback } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    const error = params.get('error');
    const discordLinked = params.get('discord_linked');

    if (error) {
      console.error('Auth error:', error);
      setLocation('/login?error=' + error);
      return;
    }

    if (discordLinked === 'true') {
      setLocation('/settings?discord_linked=true');
      return;
    }

    if (accessToken && refreshToken) {
      handleCallback(accessToken, refreshToken);
    } else {
      setLocation('/login');
    }
  }, [handleCallback, setLocation]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <Loader2 className="w-12 h-12 animate-spin text-primary" />
      <p className="text-lg text-muted-foreground">Авторизация...</p>
    </div>
  );
}
