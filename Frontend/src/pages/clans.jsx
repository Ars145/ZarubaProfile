import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Users, Shield } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function ClansPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: response, isLoading, error } = useQuery({
    queryKey: ['/api/clans'],
    staleTime: 2 * 60 * 1000,
  });

  const clans = response?.clans || response;
  const filteredClans = clans?.filter(clan => 
    clan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    clan.tag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-primary" data-testid="loader-clans" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Ошибка загрузки</CardTitle>
            <CardDescription>Не удалось загрузить список кланов</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold" data-testid="title-clans">Кланы</h1>
          <p className="text-muted-foreground">Найдите клан или создайте свой</p>
        </div>
        <Link href="/clans/create">
          <Button data-testid="button-create-clan">
            <Shield className="w-4 h-4 mr-2" />
            Создать клан
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Поиск по названию или тегу..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-clans"
            />
          </div>
        </CardHeader>
        <CardContent>
          {!filteredClans || filteredClans.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg text-muted-foreground">
                {searchQuery ? 'Кланы не найдены' : 'Пока нет кланов'}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredClans.map((clan) => (
                <Link key={clan.id} href={`/clans/${clan.id}`}>
                  <Card className="hover-elevate" data-testid={`card-clan-${clan.id}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={clan.logoUrl} />
                          <AvatarFallback>{clan.tag}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg truncate">
                            [{clan.tag}] {clan.name}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Users className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {clan.memberCount || 0} {clan.memberCount === 1 ? 'участник' : 'участников'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {clan.description || 'Без описания'}
                      </p>
                      <div className="mt-3 flex gap-2">
                        <Badge variant={clan.isRecruiting ? 'default' : 'secondary'} className="text-xs">
                          {clan.isRecruiting ? 'Набор открыт' : 'Набор закрыт'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
