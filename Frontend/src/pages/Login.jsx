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

      <Card className="w-full max-w-lg relative z-10 border-border/50 shadow-2xl backdrop-blur-sm bg-card/95">
        <CardHeader className="space-y-8 text-center pb-10 pt-16">
          {/* Logo with Enhanced Vignette */}
          <div className="mx-auto relative">
            <div className="absolute inset-0 bg-primary/40 blur-[80px] rounded-full scale-150 animate-pulse" style={{ animationDuration: '3s' }} />
            <div className="absolute inset-0 bg-gradient-radial from-primary/30 via-primary/10 to-transparent blur-2xl" />
            <img 
              src={zarubaLogo} 
              alt="ZARUBA" 
              className="w-52 h-52 object-contain mx-auto relative z-10 drop-shadow-2xl"
            />
          </div>
          
          <div className="space-y-3">
            <CardDescription className="text-xl text-foreground/90 font-semibold">
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
              className="steam-button w-full h-16 text-lg gap-4 font-bold tracking-wide"
              size="lg"
            >
              <Gamepad2 className="w-6 h-6" />
              Войти через Steam
            </Button>
          </div>

          {/* Features */}
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4">
              <div className="group flex items-start gap-4 p-5 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 hover:border-primary/40 hover:bg-primary/15 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20">
                <div className="p-2.5 rounded-lg bg-primary/20 group-hover:bg-primary/30 transition-colors">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div className="space-y-1 flex-1">
                  <p className="text-base font-bold text-foreground">Профиль игрока</p>
                  <p className="text-sm text-muted-foreground">Детальная статистика, достижения и прогресс</p>
                </div>
              </div>
              
              <div className="group flex items-start gap-4 p-5 rounded-xl bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20 hover:border-accent/40 hover:bg-accent/15 transition-all duration-300 hover:shadow-lg hover:shadow-accent/20">
                <div className="p-2.5 rounded-lg bg-accent/20 group-hover:bg-accent/30 transition-colors">
                  <Users className="w-6 h-6 text-accent" />
                </div>
                <div className="space-y-1 flex-1">
                  <p className="text-base font-bold text-foreground">Система кланов</p>
                  <p className="text-sm text-muted-foreground">Создавайте кланы и приглашайте друзей</p>
                </div>
              </div>
              
              <div className="group flex items-start gap-4 p-5 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 hover:border-primary/40 hover:bg-primary/15 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20">
                <div className="p-2.5 rounded-lg bg-primary/20 group-hover:bg-primary/30 transition-colors">
                  <Trophy className="w-6 h-6 text-primary" />
                </div>
                <div className="space-y-1 flex-1">
                  <p className="text-base font-bold text-foreground">Рейтинговая система</p>
                  <p className="text-sm text-muted-foreground">Отслеживайте свои ранги и позиции</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Security Notice */}
          <div className="pt-6 border-t border-border/30">
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground/80">
              <Shield className="w-3.5 h-3.5" />
              <span>Безопасная авторизация через Steam OpenID</span>
            </div>
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
