import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Gamepad2, Shield, Users, Trophy } from 'lucide-react';
import zarubaLogo from '@assets/zaruba_logo_1763633752495.png';
import FloatingLines from '@/components/FloatingLines';

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

  // Check WebGL support
  const hasWebGL = (() => {
    try {
      const canvas = document.createElement('canvas');
      return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
    } catch (e) {
      return false;
    }
  })();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background via-background to-primary/10 p-4 relative overflow-hidden">
      {/* Floating Lines Background - only if WebGL is supported */}
      {hasWebGL && (
        <div className="fixed inset-0 z-0 opacity-70" style={{ pointerEvents: 'auto' }}>
          <FloatingLines 
            enabledWaves={['top', 'middle', 'bottom']}
            lineCount={14}
            lineDistance={70}
            bendRadius={15}
            bendStrength={11.5}
            interactive={true}
            parallax={true}
            linesGradient={['#ff6b00', '#ff8c00', '#45b7d1']}
            mixBlendMode="normal"
          />
        </div>
      )}

      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Grid Background */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.02]" 
           style={{ 
             backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
             backgroundSize: '60px 60px'
           }} 
      />

      <Card className="w-full max-w-md relative z-10 border-border/50 shadow-2xl bg-transparent border-0">
        <CardHeader className="space-y-4 text-center pb-6">
          {/* Logo */}
          <div className="mx-auto relative">
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
            <img 
              src={zarubaLogo} 
              alt="ZARUBA" 
              className="w-32 h-32 object-contain mx-auto relative z-10 drop-shadow-lg"
            />
          </div>
          
          <div className="space-y-2">
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
              ZARUBA
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground">
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
              className="w-full h-14 text-base gap-3 shadow-lg hover:shadow-xl transition-all"
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
            <p className="text-sm font-medium text-center text-foreground">
              После авторизации вы получите доступ к:
            </p>
            
            <div className="grid gap-3">
              <div className="flex items-start gap-3 p-3 rounded-md bg-primary/5 border border-primary/10">
                <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Профилю игрока</p>
                  <p className="text-xs text-muted-foreground">Статистика, достижения и прогресс</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 rounded-md bg-accent/5 border border-accent/10">
                <Users className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Системе кланов</p>
                  <p className="text-xs text-muted-foreground">Создание и вступление в кланы</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 rounded-md bg-primary/5 border border-primary/10">
                <Trophy className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Рейтинговой системе</p>
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
