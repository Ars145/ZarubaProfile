import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Gamepad2 } from 'lucide-react';

export default function Login() {
  const { loginWithSteam, isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isAuthenticated && !loading) {
      setLocation('/');
    }
  }, [isAuthenticated, loading, setLocation]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background via-background to-accent/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto w-16 h-16 rounded-md bg-primary/10 flex items-center justify-center">
            <svg className="w-10 h-10 text-primary" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
            </svg>
          </div>
          <CardTitle className="text-3xl font-bold">ZARUBA</CardTitle>
          <CardDescription className="text-base">
            Добро пожаловать в игровое сообщество Squad
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Button
              data-testid="button-steam-login"
              onClick={loginWithSteam}
              className="w-full h-12 text-base gap-3"
              size="lg"
            >
              <Gamepad2 className="w-5 h-5" />
              Войти через Steam
            </Button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Безопасная авторизация
                </span>
              </div>
            </div>
            
            <div className="space-y-2 text-sm text-muted-foreground text-center">
              <p>После авторизации вы получите доступ к:</p>
              <ul className="space-y-1">
                <li>• Профилю игрока со статистикой</li>
                <li>• Созданию и вступлению в кланы</li>
                <li>• Системе рангов и достижений</li>
              </ul>
            </div>
          </div>
          
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-center text-muted-foreground">
              Нажимая "Войти через Steam", вы будете перенаправлены на страницу авторизации Steam.
              Мы не храним ваш пароль Steam.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
