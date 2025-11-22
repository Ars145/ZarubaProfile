import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Gamepad2, Shield, Users, Trophy } from 'lucide-react';
import zarubaLogo from '@assets/zaruba_logo_1763633752495.png';

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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background via-background to-primary/10 p-4 relative overflow-hidden">
      {/* Animated Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 right-1/3 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }} />
      </div>

      <Card className="w-full max-w-md relative z-10 border-border/50 shadow-2xl backdrop-blur-sm">
        <CardHeader className="space-y-6 text-center pb-8 pt-12">
          {/* Logo with Enhanced Vignette */}
          <div className="mx-auto relative">
            <div className="absolute inset-0 bg-primary/30 blur-3xl rounded-full scale-150" />
            <div className="absolute inset-0 bg-gradient-radial from-primary/20 via-transparent to-transparent blur-xl" />
            <img 
              src={zarubaLogo} 
              alt="ZARUBA" 
              className="w-44 h-44 object-contain mx-auto relative z-10 drop-shadow-2xl"
            />
          </div>
          
          <div className="space-y-2">
            <CardDescription className="text-lg text-muted-foreground font-medium">
              Добро пожаловать в личный кабинет игрока
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Steam Login Button */}
          <div className="space-y-4">
            <Button
              data-testid="button-steam-login"
              onClick={loginWithSteam}
              className="steam-button w-full h-14 text-base gap-3 font-semibold"
              size="lg"
            >
              <Gamepad2 className="w-5 h-5" />
              Войти через Steam
            </Button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/50"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-3 text-muted-foreground font-medium">
                  Безопасная авторизация
                </span>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <span className="text-xs uppercase tracking-wider text-muted-foreground/70 font-semibold">
                После авторизации
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/5 border border-primary/10 hover:border-primary/20 transition-colors">
                <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold">Профиль игрока</p>
                  <p className="text-xs text-muted-foreground">Статистика и прогресс</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 rounded-lg bg-accent/5 border border-accent/10 hover:border-accent/20 transition-colors">
                <Users className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold">Система кланов</p>
                  <p className="text-xs text-muted-foreground">Создание и участие</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/5 border border-primary/10 hover:border-primary/20 transition-colors sm:col-span-2">
                <Trophy className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold">Рейтинговая система</p>
                  <p className="text-xs text-muted-foreground">Отслеживание рангов и позиций</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Security Notice */}
          <div className="pt-4 border-t border-border/50">
            <p className="text-xs text-center text-muted-foreground leading-relaxed">
              Нажимая "Войти через Steam", вы будете перенаправлены на официальную страницу авторизации Steam. 
              <span className="block mt-1 text-primary/80">Мы не храним ваш пароль Steam.</span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="fixed bottom-4 left-0 right-0 text-center z-10">
        <p className="text-xs text-muted-foreground/60">
          ZARUBA Gaming Community • Squad Server
        </p>
      </div>
    </div>
  );
}
