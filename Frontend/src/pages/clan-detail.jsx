import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, Users, UserPlus, Settings } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';

export default function ClanDetailPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: clan, isLoading, error } = useQuery({
    queryKey: ['/api/clans', id],
    enabled: !!id,
  });

  const { data: members = [] } = useQuery({
    queryKey: ['/api/clans', id, 'members'],
    enabled: !!id,
  });

  const joinMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', `/api/clans/${id}/join`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clans', id] });
      queryClient.invalidateQueries({ queryKey: ['/api/clans', id, 'members'] });
      toast({
        title: 'Успешно',
        description: 'Вы вступили в клан'
      });
    },
    onError: (error) => {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const applyMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', `/api/clans/${id}/apply`, { 
        message: 'Хочу вступить в ваш клан!' 
      });
    },
    onSuccess: () => {
      toast({
        title: 'Успешно',
        description: 'Заявка отправлена'
      });
    },
    onError: (error) => {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !clan) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Клан не найден</CardTitle>
            <CardDescription>Этот клан не существует или был удален</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation('/clans')} data-testid="button-back-to-clans">
              <ArrowLeft className="w-4 h-4 mr-2" />
              К списку кланов
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isOwner = user && clan.ownerId === user.id;
  const isMember = user && user.currentClanId === clan.id;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Button variant="ghost" onClick={() => setLocation('/clans')} data-testid="button-back">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Назад
      </Button>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={clan.logoUrl} />
                    <AvatarFallback className="text-2xl">{clan.tag}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-2xl">
                      [{clan.tag}] {clan.name}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={clan.isRecruiting ? 'default' : 'secondary'}>
                        {clan.isRecruiting ? 'Набор открыт' : 'Набор закрыт'}
                      </Badge>
                      {isMember && (
                        <Badge variant="outline">Вы состоите в клане</Badge>
                      )}
                    </div>
                  </div>
                </div>
                {isOwner && (
                  <Button onClick={() => setLocation(`/clans/${id}/manage`)} data-testid="button-manage-clan">
                    <Settings className="w-4 h-4 mr-2" />
                    Управление
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Описание</h3>
                <p className="text-muted-foreground">
                  {clan.description || 'Нет описания'}
                </p>
              </div>
              
              {!isMember && !user?.currentClanId && (
                <div className="flex gap-2">
                  {clan.isRecruiting ? (
                    <Button 
                      onClick={() => joinMutation.mutate()} 
                      disabled={joinMutation.isPending}
                      data-testid="button-join-clan"
                    >
                      {joinMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <UserPlus className="w-4 h-4 mr-2" />
                      )}
                      Вступить в клан
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => applyMutation.mutate()} 
                      disabled={applyMutation.isPending}
                      data-testid="button-apply-clan"
                    >
                      {applyMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <UserPlus className="w-4 h-4 mr-2" />
                      )}
                      Подать заявку
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Участники ({members?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!members || members.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">Нет участников</p>
              ) : (
                <div className="space-y-3">
                  {members.map((member) => (
                    <div 
                      key={member.id} 
                      className="flex items-center justify-between p-3 rounded-md bg-card border"
                      data-testid={`member-${member.id}`}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={member.player?.avatarUrl} />
                          <AvatarFallback>
                            {member.player?.username?.[0]?.toUpperCase() || 'P'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.player?.username || 'Unknown'}</p>
                          <p className="text-sm text-muted-foreground">
                            {member.role === 'owner' ? 'Владелец' : 'Участник'}
                          </p>
                        </div>
                      </div>
                      {member.role === 'owner' && (
                        <Badge>Владелец</Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Статистика</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Участников</span>
                <span className="font-semibold">{members?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Создан</span>
                <span className="text-sm">{new Date(clan.createdAt).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>

          {clan.requirements && Object.keys(clan.requirements).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Требования</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {clan.requirements.microphone && (
                  <div className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span className="text-sm">Наличие микрофона и Discord</span>
                  </div>
                )}
                {clan.requirements.age && (
                  <div className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span className="text-sm">Возраст {clan.requirements.age}+</span>
                  </div>
                )}
                {clan.requirements.experience && (
                  <div className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span className="text-sm">{clan.requirements.experience}</span>
                  </div>
                )}
                {clan.requirements.custom && clan.requirements.custom.map((req, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span className="text-sm">{req}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
