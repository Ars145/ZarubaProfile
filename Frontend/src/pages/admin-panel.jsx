import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Redirect } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Shield, Users, Crown, Edit, Trash2 } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useQuery } from '@tanstack/react-query';

export default function AdminPanel() {
  const { isAdmin, loading, user } = useAuth();
  const { toast } = useToast();
  
  // Состояние для формы создания клана
  const [clanForm, setClanForm] = useState({
    name: '',
    tag: '',
    description: '',
    theme: 'orange',
    ownerSteamId: ''
  });
  
  // Состояние для формы назначения owner
  const [ownerForm, setOwnerForm] = useState({
    clanId: '',
    steamId: ''
  });
  
  // Состояние для редактирования клана
  const [editingClan, setEditingClan] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    tag: '',
    description: '',
    theme: 'orange',
    bannerUrl: '',
    logoUrl: '',
    level: 0,
    winrate: 0,
    requirements: {}
  });
  
  // Загрузка списка кланов с детальной информацией для админов
  const { data: clans = [] } = useQuery({
    queryKey: ['/api/admin/clans'],
    enabled: !loading && isAdmin
  });
  
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
        ownerSteamId: clanForm.ownerSteamId || undefined
      };
      
      const clan = await apiRequest('POST', '/api/clans', payload);
      
      toast({
        title: 'Клан создан',
        description: `Клан "${clan.name}" успешно создан`
      });
      
      // Очистить форму
      setClanForm({
        name: '',
        tag: '',
        description: '',
        theme: 'orange',
        ownerSteamId: ''
      });
      
      // Обновить список кланов
      queryClient.invalidateQueries({ queryKey: ['/api/admin/clans'] });
      queryClient.invalidateQueries({ queryKey: ['/api/clans'] });
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
    
    if (!ownerForm.clanId || !ownerForm.steamId) {
      toast({
        title: 'Ошибка',
        description: 'Выберите клан и укажите Steam ID игрока',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      const result = await apiRequest('POST', `/api/admin/clans/${ownerForm.clanId}/assign-owner`, {
        steamId: ownerForm.steamId
      });
      
      toast({
        title: 'Владелец назначен',
        description: result.message || 'Владелец успешно назначен'
      });
      
      // Очистить форму
      setOwnerForm({
        clanId: '',
        steamId: ''
      });
      
      // Обновить данные
      queryClient.invalidateQueries({ queryKey: ['/api/admin/clans'] });
      queryClient.invalidateQueries({ queryKey: ['/api/clans'] });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось назначить владельца',
        variant: 'destructive'
      });
    }
  };
  
  const openEditDialog = (clan) => {
    setEditingClan(clan);
    setEditForm({
      name: clan.name || '',
      tag: clan.tag || '',
      description: clan.description || '',
      theme: clan.theme || 'orange',
      bannerUrl: clan.bannerUrl || '',
      logoUrl: clan.logoUrl || '',
      level: clan.level || 0,
      winrate: clan.winrate || 0,
      requirements: clan.requirements || {}
    });
  };
  
  const handleEditClan = async (e) => {
    e.preventDefault();
    
    if (!editingClan) return;
    
    try {
      const payload = {
        name: editForm.name,
        tag: editForm.tag,
        description: editForm.description,
        theme: editForm.theme,
        bannerUrl: editForm.bannerUrl,
        logoUrl: editForm.logoUrl,
        level: parseInt(editForm.level),
        winrate: parseFloat(editForm.winrate),
        requirements: editForm.requirements
      };
      
      const updatedClan = await apiRequest('PUT', `/api/admin/clans/${editingClan.id}`, payload);
      
      toast({
        title: 'Клан обновлен',
        description: `Клан "${updatedClan.name}" успешно обновлен`
      });
      
      // Закрыть диалог
      setEditingClan(null);
      
      // Обновить список кланов
      queryClient.invalidateQueries({ queryKey: ['/api/admin/clans'] });
      queryClient.invalidateQueries({ queryKey: ['/api/clans'] });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось обновить клан',
        variant: 'destructive'
      });
    }
  };
  
  const handleDeleteClan = async (clanId, clanName) => {
    if (!confirm(`Вы уверены что хотите удалить клан "${clanName}"? Это действие необратимо.`)) {
      return;
    }
    
    try {
      await apiRequest('DELETE', `/api/admin/clans/${clanId}`);
      
      toast({
        title: 'Клан удален',
        description: `Клан "${clanName}" успешно удален`
      });
      
      // Обновить список кланов
      queryClient.invalidateQueries({ queryKey: ['/api/admin/clans'] });
      queryClient.invalidateQueries({ queryKey: ['/api/clans'] });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось удалить клан',
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
                  <Label htmlFor="clan-owner-steamid">Steam ID Владельца (опционально)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="clan-owner-steamid"
                      data-testid="input-clan-owner-steamid"
                      value={clanForm.ownerSteamId}
                      onChange={(e) => setClanForm({ ...clanForm, ownerSteamId: e.target.value })}
                      placeholder="76561198XXXXXXXXX"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      data-testid="button-set-self-owner"
                      onClick={() => setClanForm({ ...clanForm, ownerSteamId: user?.steamId || '' })}
                    >
                      Я
                    </Button>
                  </div>
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
                <Label htmlFor="assign-steamid">Steam ID Игрока *</Label>
                <div className="flex gap-2">
                  <Input
                    id="assign-steamid"
                    data-testid="input-assign-steamid"
                    value={ownerForm.steamId}
                    onChange={(e) => setOwnerForm({ ...ownerForm, steamId: e.target.value })}
                    placeholder="76561198XXXXXXXXX"
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    data-testid="button-set-self-player"
                    onClick={() => setOwnerForm({ ...ownerForm, steamId: user?.steamId || '' })}
                  >
                    Я
                  </Button>
                </div>
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
                    className="flex items-center justify-between p-3 rounded-md border gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">
                        [{clan.tag}] {clan.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        ID: {clan.id} | Участников: {clan.memberCount || 0}
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        size="icon"
                        variant="outline"
                        data-testid={`button-edit-clan-${clan.id}`}
                        onClick={() => openEditDialog(clan)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        data-testid={`button-delete-clan-${clan.id}`}
                        onClick={() => handleDeleteClan(clan.id, clan.name)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Edit Clan Dialog */}
      <Dialog open={!!editingClan} onOpenChange={(open) => !open && setEditingClan(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Редактировать Клан</DialogTitle>
            <DialogDescription>
              Измените параметры клана {editingClan?.name}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleEditClan} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Название *</Label>
                <Input
                  id="edit-name"
                  data-testid="input-edit-name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-tag">Тег *</Label>
                <Input
                  id="edit-tag"
                  data-testid="input-edit-tag"
                  value={editForm.tag}
                  onChange={(e) => setEditForm({ ...editForm, tag: e.target.value.toUpperCase() })}
                  maxLength={10}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-description">Описание</Label>
              <Textarea
                id="edit-description"
                data-testid="textarea-edit-description"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-theme">Тема</Label>
                <Select
                  value={editForm.theme}
                  onValueChange={(value) => setEditForm({ ...editForm, theme: value })}
                >
                  <SelectTrigger id="edit-theme" data-testid="select-edit-theme">
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
                <Label htmlFor="edit-level">Уровень</Label>
                <Input
                  id="edit-level"
                  data-testid="input-edit-level"
                  type="number"
                  value={editForm.level}
                  onChange={(e) => setEditForm({ ...editForm, level: e.target.value })}
                  min="0"
                  max="100"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-winrate">Процент побед</Label>
              <Input
                id="edit-winrate"
                data-testid="input-edit-winrate"
                type="number"
                step="0.1"
                value={editForm.winrate}
                onChange={(e) => setEditForm({ ...editForm, winrate: e.target.value })}
                min="0"
                max="100"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-banner">URL Баннера</Label>
                <Input
                  id="edit-banner"
                  data-testid="input-edit-banner"
                  value={editForm.bannerUrl}
                  onChange={(e) => setEditForm({ ...editForm, bannerUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-logo">URL Логотипа</Label>
                <Input
                  id="edit-logo"
                  data-testid="input-edit-logo"
                  value={editForm.logoUrl}
                  onChange={(e) => setEditForm({ ...editForm, logoUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>
            
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                data-testid="button-cancel-edit"
                onClick={() => setEditingClan(null)}
              >
                Отмена
              </Button>
              <Button type="submit" data-testid="button-save-edit">
                Сохранить
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
