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
import { Loader2, ArrowLeft, Users, UserPlus, UserMinus, Shield, CheckCircle, XCircle, Mail } from 'lucide-react';
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
            <Button onClick={() => setLocation('/')} data-testid="button-back-to-home">
              <ArrowLeft className="w-4 h-4 mr-2" />
              На главную
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Button variant="ghost" onClick={() => setLocation(`/clans/${id}`)} data-testid="button-back">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад к клану
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={clan.logoUrl} />
              <AvatarFallback className="text-xl">{clan.tag}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">Управление кланом [{clan.tag}]</CardTitle>
              <CardDescription>{clan.name}</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="applications" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="applications" data-testid="tab-applications">
            Заявки ({applications?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="members" data-testid="tab-members">
            Участники ({members?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="invitations" data-testid="tab-invitations">
            Приглашения ({invitations?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="applications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Заявки на вступление
              </CardTitle>
              <CardDescription>
                Рассмотрите заявки игроков, желающих вступить в клан
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!applications || applications.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">Нет заявок</p>
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

        <TabsContent value="members" className="space-y-4">
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

        <TabsContent value="invitations" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <UserPlus className="w-5 h-5" />
                    Приглашения
                  </CardTitle>
                  <CardDescription>
                    Пригласите игроков в свой клан
                  </CardDescription>
                </div>
                <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button data-testid="button-create-invitation">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Пригласить игрока
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Пригласить игрока</DialogTitle>
                      <DialogDescription>
                        Введите ID игрока для отправки приглашения
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="playerId">ID игрока</Label>
                        <Input
                          id="playerId"
                          placeholder="UUID игрока"
                          value={playerIdToInvite}
                          onChange={(e) => setPlayerIdToInvite(e.target.value)}
                          data-testid="input-player-id"
                        />
                      </div>
                      <div>
                        <Label htmlFor="message">Сообщение (опционально)</Label>
                        <Textarea
                          id="message"
                          placeholder="Добро пожаловать в наш клан!"
                          value={inviteMessage}
                          onChange={(e) => setInviteMessage(e.target.value)}
                          data-testid="input-invitation-message"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        onClick={() => sendInviteMutation.mutate()}
                        disabled={!playerIdToInvite || sendInviteMutation.isPending}
                        data-testid="button-send-invitation"
                      >
                        {sendInviteMutation.isPending && (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        )}
                        Отправить приглашение
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {!invitations || invitations.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">Нет активных приглашений</p>
              ) : (
                <div className="space-y-3">
                  {invitations.map((invitation) => (
                    <div 
                      key={invitation.id} 
                      className="flex items-center justify-between p-3 rounded-md bg-card border"
                      data-testid={`invitation-${invitation.id}`}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={invitation.player?.avatarUrl} />
                          <AvatarFallback>
                            {invitation.player?.username?.[0]?.toUpperCase() || 'P'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{invitation.player?.username || 'Unknown'}</p>
                          <p className="text-xs text-muted-foreground">
                            Отправлено {new Date(invitation.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => cancelInvitationMutation.mutate(invitation.id)}
                        disabled={cancelInvitationMutation.isPending}
                        data-testid={`button-cancel-${invitation.id}`}
                      >
                        Отменить
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
