import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Redirect } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Shield, Users, Crown } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useQuery } from '@tanstack/react-query';

export default function AdminPanel() {
  const { isAdmin, loading } = useAuth();
  const { toast } = useToast();
  
  // Состояние для формы создания клана
  const [clanForm, setClanForm] = useState({
    name: '',
    tag: '',
    description: '',
    theme: 'orange',
    ownerId: ''
  });
  
  // Состояние для формы назначения owner
  const [ownerForm, setOwnerForm] = useState({
    clanId: '',
    playerId: ''
  });
  
  // Загрузка списка кланов
  const { data: clansData } = useQuery({
    queryKey: ['/api/clans'],
    enabled: !loading && isAdmin
  });
  
  const clans = clansData?.clans || [];
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Загрузка...</div>
      </div>
    );
  }
  
  if (!isAdmin) {
    return <Redirect to="/" />;
  }
  
  const handleCreateClan = async (e) => {
    e.preventDefault();
    
    try {
      const payload = {
        name: clanForm.name,
        tag: clanForm.tag,
        description: clanForm.description || undefined,
        theme: clanForm.theme,
        ownerId: clanForm.ownerId || undefined
      };
      
      const res = await apiRequest('POST', '/api/clans', payload);
      const response = await res.json();
      
      if (response.success) {
        toast({
          title: 'Клан создан',
          description: `Клан "${response.clan.name}" успешно создан`
        });
        
        // Очистить форму
        setClanForm({
          name: '',
          tag: '',
          description: '',
          theme: 'orange',
          ownerId: ''
        });
        
        // Обновить список кланов
        queryClient.invalidateQueries({ queryKey: ['/api/clans'] });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось создать клан',
        variant: 'destructive'
      });
    }
  };
  
  const handleAssignOwner = async (e) => {
    e.preventDefault();
    
    if (!ownerForm.clanId || !ownerForm.playerId) {
      toast({
        title: 'Ошибка',
        description: 'Выберите клан и укажите ID игрока',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      const res = await apiRequest('POST', `/api/admin/clans/${ownerForm.clanId}/assign-owner`, {
        playerId: ownerForm.playerId
      });
      const response = await res.json();
      
      if (response.success) {
        toast({
          title: 'Владелец назначен',
          description: response.message
        });
        
        // Очистить форму
        setOwnerForm({
          clanId: '',
          playerId: ''
        });
        
        // Обновить данные
        queryClient.invalidateQueries({ queryKey: ['/api/clans'] });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось назначить владельца',
        variant: 'destructive'
      });
    }
  };
  
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold">Панель Администратора</h1>
      </div>
      
      <div className="grid gap-6">
        {/* Создание клана */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <CardTitle>Создать Клан</CardTitle>
            </div>
            <CardDescription>
              Создайте новый клан с возможностью сразу назначить владельца
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateClan} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clan-name">Название *</Label>
                  <Input
                    id="clan-name"
                    data-testid="input-clan-name"
                    value={clanForm.name}
                    onChange={(e) => setClanForm({ ...clanForm, name: e.target.value })}
                    placeholder="Название клана"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="clan-tag">Тег *</Label>
                  <Input
                    id="clan-tag"
                    data-testid="input-clan-tag"
                    value={clanForm.tag}
                    onChange={(e) => setClanForm({ ...clanForm, tag: e.target.value.toUpperCase() })}
                    placeholder="TAG"
                    maxLength={10}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="clan-description">Описание</Label>
                <Textarea
                  id="clan-description"
                  data-testid="textarea-clan-description"
                  value={clanForm.description}
                  onChange={(e) => setClanForm({ ...clanForm, description: e.target.value })}
                  placeholder="Описание клана..."
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clan-theme">Цветовая тема</Label>
                  <Select
                    value={clanForm.theme}
                    onValueChange={(value) => setClanForm({ ...clanForm, theme: value })}
                  >
                    <SelectTrigger id="clan-theme" data-testid="select-clan-theme">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="orange">Оранжевая</SelectItem>
                      <SelectItem value="blue">Синяя</SelectItem>
                      <SelectItem value="yellow">Желтая</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="clan-owner-id">ID Владельца (опционально)</Label>
                  <Input
                    id="clan-owner-id"
                    data-testid="input-clan-owner-id"
                    value={clanForm.ownerId}
                    onChange={(e) => setClanForm({ ...clanForm, ownerId: e.target.value })}
                    placeholder="UUID игрока"
                  />
                </div>
              </div>
              
              <Button type="submit" data-testid="button-create-clan" className="w-full">
                Создать Клан
              </Button>
            </form>
          </CardContent>
        </Card>
        
        {/* Назначение владельца */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5" />
              <CardTitle>Назначить Владельца Клана</CardTitle>
            </div>
            <CardDescription>
              Назначьте владельца для существующего клана
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAssignOwner} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="assign-clan">Клан *</Label>
                <Select
                  value={ownerForm.clanId}
                  onValueChange={(value) => setOwnerForm({ ...ownerForm, clanId: value })}
                >
                  <SelectTrigger id="assign-clan" data-testid="select-assign-clan">
                    <SelectValue placeholder="Выберите клан" />
                  </SelectTrigger>
                  <SelectContent>
                    {clans.map((clan) => (
                      <SelectItem key={clan.id} value={clan.id}>
                        [{clan.tag}] {clan.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="assign-player-id">ID Игрока *</Label>
                <Input
                  id="assign-player-id"
                  data-testid="input-assign-player-id"
                  value={ownerForm.playerId}
                  onChange={(e) => setOwnerForm({ ...ownerForm, playerId: e.target.value })}
                  placeholder="UUID игрока"
                  required
                />
              </div>
              
              <Button type="submit" data-testid="button-assign-owner" className="w-full">
                Назначить Владельца
              </Button>
            </form>
          </CardContent>
        </Card>
        
        {/* Список кланов */}
        <Card>
          <CardHeader>
            <CardTitle>Существующие Кланы</CardTitle>
            <CardDescription>
              Список всех кланов в системе
            </CardDescription>
          </CardHeader>
          <CardContent>
            {clans.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Кланов пока нет
              </div>
            ) : (
              <div className="space-y-2">
                {clans.map((clan) => (
                  <div
                    key={clan.id}
                    data-testid={`card-clan-${clan.id}`}
                    className="flex items-center justify-between p-3 rounded-md border"
                  >
                    <div>
                      <div className="font-semibold">
                        [{clan.tag}] {clan.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        ID: {clan.id}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Участников: {clan.memberCount || 0}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
