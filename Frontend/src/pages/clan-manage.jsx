import { useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, ArrowLeft, Users, Users2, UserPlus, UserMinus, Shield, CheckCircle, XCircle, Mail, Settings } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';

export default function ClanManagePage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [playerIdToInvite, setPlayerIdToInvite] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');

  const { data: clan, isLoading: clanLoading } = useQuery({
    queryKey: ['/api/clans', id],
    enabled: !!id,
  });

  const { data: members = [] } = useQuery({
    queryKey: ['/api/clans', id, 'members'],
    enabled: !!id,
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['/api/clans', id, 'applications'],
    enabled: !!id,
  });

  const { data: invitations = [] } = useQuery({
    queryKey: ['/api/clans', id, 'invitations'],
    enabled: !!id,
  });

  const approveApplicationMutation = useMutation({
    mutationFn: async (applicationId) => {
      return await apiRequest('POST', `/api/clans/${id}/applications/${applicationId}/approve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clans', id, 'applications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/clans', id, 'members'] });
      toast({
        title: 'Заявка одобрена',
        description: 'Игрок теперь состоит в клане'
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

  const rejectApplicationMutation = useMutation({
    mutationFn: async (applicationId) => {
      return await apiRequest('POST', `/api/clans/${id}/applications/${applicationId}/reject`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clans', id, 'applications'] });
      toast({
        title: 'Заявка отклонена'
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

  const kickMemberMutation = useMutation({
    mutationFn: async (memberId) => {
      return await apiRequest('DELETE', `/api/clans/${id}/members/${memberId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clans', id, 'members'] });
      toast({
        title: 'Игрок исключен из клана'
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

  const sendInviteMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', `/api/clans/${id}/invite`, {
        playerId: playerIdToInvite,
        message: inviteMessage
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clans', id, 'invitations'] });
      setInviteDialogOpen(false);
      setPlayerIdToInvite('');
      setInviteMessage('');
      toast({
        title: 'Приглашение отправлено'
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

  const cancelInvitationMutation = useMutation({
    mutationFn: async (invitationId) => {
      return await apiRequest('POST', `/api/invitations/${invitationId}/cancel`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clans', id, 'invitations'] });
      toast({
        title: 'Приглашение отменено'
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

  if (clanLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-primary" data-testid="loader-manage" />
      </div>
    );
  }

  if (!clan) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Клан не найден</CardTitle>
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

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-4">
          <h1 className="flex items-center gap-3 text-4xl font-display font-bold tracking-wider">
            <Shield className="w-10 h-10 text-primary" />
            МОЙ ОТРЯД
          </h1>
          <Badge variant="outline" className="border-primary/50 text-primary px-4 py-1 text-sm">
            Владелец Клана
          </Badge>
        </div>
        <p className="text-muted-foreground text-lg">
          Управление вашим отрядом и личным составом.
        </p>
      </div>

      <Tabs defaultValue="applications" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 h-auto">
          <TabsTrigger 
            value="squad" 
            data-testid="tab-squad"
            className="font-display tracking-wider py-3"
          >
            ОТРЯД
          </TabsTrigger>
          <TabsTrigger 
            value="applications" 
            data-testid="tab-applications"
            className="font-display tracking-wider py-3"
          >
            ЗАЯВКИ
          </TabsTrigger>
          <TabsTrigger 
            value="settings" 
            data-testid="tab-settings"
            className="font-display tracking-wider py-3"
          >
            НАСТРОЙКИ
          </TabsTrigger>
        </TabsList>

        <TabsContent value="squad" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Участники клана
              </CardTitle>
              <CardDescription>
                Управляйте участниками вашего клана
              </CardDescription>
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
                      <div className="flex items-center gap-2">
                        {member.role === 'owner' ? (
                          <Badge variant="default">
                            <Shield className="w-3 h-3 mr-1" />
                            Владелец
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => kickMemberMutation.mutate(member.id)}
                            disabled={kickMemberMutation.isPending}
                            data-testid={`button-kick-${member.id}`}
                          >
                            <UserMinus className="w-4 h-4 mr-2" />
                            Исключить
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <CardTitle className="flex items-center gap-2 font-display tracking-wider">
                  <Users2 className="w-5 h-5" />
                  ЗАЯВКИ НА ВСТУПЛЕНИЕ
                </CardTitle>
                <Badge variant="secondary" className="text-sm">
                  ВСЕГО: {applications?.length || 0}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {!applications || applications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 space-y-4">
                  <div className="rounded-full bg-muted/40 p-6">
                    <Users2 className="w-16 h-16 text-muted-foreground opacity-40" data-testid="icon-empty-applications" />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-display font-bold tracking-wider">
                      НЕТ НОВЫХ ЗАЯВОК
                    </h3>
                    <p className="text-muted-foreground">
                      В данный момент никто не подавал заявку в ваш отряд.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {applications.map((app) => (
                    <div 
                      key={app.id} 
                      className="p-4 rounded-md bg-card border"
                      data-testid={`application-${app.id}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1">
                          <Avatar>
                            <AvatarImage src={app.player?.avatarUrl} />
                            <AvatarFallback>
                              {app.player?.username?.[0]?.toUpperCase() || 'P'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium">{app.player?.username || 'Unknown'}</p>
                            {app.message && (
                              <p className="text-sm text-muted-foreground mt-1">{app.message}</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(app.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => approveApplicationMutation.mutate(app.id)}
                            disabled={approveApplicationMutation.isPending}
                            data-testid={`button-approve-${app.id}`}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Принять
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => rejectApplicationMutation.mutate(app.id)}
                            disabled={rejectApplicationMutation.isPending}
                            data-testid={`button-reject-${app.id}`}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Отклонить
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display tracking-wider">
                <Settings className="w-5 h-5" />
                НАСТРОЙКИ КЛАНА
              </CardTitle>
              <CardDescription>
                Настройте параметры вашего клана
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-16 text-muted-foreground">
                <Settings className="w-16 h-16 mx-auto mb-4 opacity-40" />
                <p>Настройки клана в разработке</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
