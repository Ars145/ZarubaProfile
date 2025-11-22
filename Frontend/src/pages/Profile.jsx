import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Gamepad2, User, Link as LinkIcon, CheckCircle2, XCircle } from 'lucide-react';
import { SiDiscord, SiSteam } from 'react-icons/si';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

export default function Profile() {
  const { user, linkDiscord } = useAuth();
  const { toast } = useToast();
  const [isLinking, setIsLinking] = useState(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    
    if (params.get('discord_linked') === 'true') {
      toast({
        title: 'Успешно!',
        description: 'Discord аккаунт успешно привязан',
      });
      window.history.replaceState({}, '', '/profile');
      setTimeout(() => window.location.reload(), 1000);
    } else if (params.get('error')) {
      const error = params.get('error');
      toast({
        title: 'Ошибка',
        description: `Не удалось привязать Discord: ${error}`,
        variant: 'destructive',
      });
      window.history.replaceState({}, '', '/profile');
    }
  }, [toast]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Профиль недоступен</CardTitle>
            <CardDescription>Вы не авторизованы</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const handleDiscordLink = async () => {
    setIsLinking(true);
    try {
      await linkDiscord();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось привязать Discord аккаунт',
        variant: 'destructive',
      });
    } finally {
      setIsLinking(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-6">
          <Avatar className="w-24 h-24 border-4 border-primary/20">
            <AvatarImage src={user.avatarUrl} alt={user.username} />
            <AvatarFallback className="text-2xl">
              <User className="w-12 h-12" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-3xl mb-2" data-testid="text-username">{user.username}</CardTitle>
            <CardDescription className="flex items-center gap-2 text-base" data-testid="text-steam-id">
              <SiSteam className="w-4 h-4" />
              Steam ID: {user.steamId}
            </CardDescription>
          </div>
        </CardHeader>
      </Card>

      {/* Accounts Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="w-5 h-5" />
            Связанные аккаунты
          </CardTitle>
          <CardDescription>
            Управление привязанными сервисами
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Steam Account */}
          <div className="flex items-center justify-between p-4 rounded-md bg-primary/5 border border-primary/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
                <SiSteam className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Steam</p>
                <p className="text-sm text-muted-foreground">{user.username}</p>
              </div>
            </div>
            <Badge variant="outline" className="gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Подключено
            </Badge>
          </div>

          <Separator />

          {/* Discord Account */}
          <div className="flex items-center justify-between p-4 rounded-md bg-accent/5 border border-accent/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-accent/10 flex items-center justify-center">
                <SiDiscord className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="font-medium">Discord</p>
                {user.discordId ? (
                  <p className="text-sm text-muted-foreground" data-testid="text-discord-username">
                    {user.discordUsername || user.discordId}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground" data-testid="text-discord-status">Не подключено</p>
                )}
              </div>
            </div>
            {user.discordId ? (
              <Badge variant="outline" className="gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Подключено
              </Badge>
            ) : (
              <Button
                data-testid="button-link-discord"
                onClick={handleDiscordLink}
                disabled={isLinking}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                {isLinking ? (
                  <>Подключение...</>
                ) : (
                  <>
                    <LinkIcon className="w-4 h-4" />
                    Привязать
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Profile Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gamepad2 className="w-5 h-5" />
            Информация профиля
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center py-2">
            <span className="text-muted-foreground">Дата регистрации</span>
            <span className="font-medium">
              {user.createdAt ? new Date(user.createdAt).toLocaleDateString('ru-RU') : 'Н/Д'}
            </span>
          </div>
          <Separator />
          <div className="flex justify-between items-center py-2">
            <span className="text-muted-foreground">Последний вход</span>
            <span className="font-medium">
              {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('ru-RU') : 'Н/Д'}
            </span>
          </div>
          {user.currentClanId && (
            <>
              <Separator />
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground">Текущий клан</span>
                <Badge>Участник клана</Badge>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
