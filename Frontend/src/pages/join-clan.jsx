import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Shield, CheckCircle2, Users, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/contexts/AuthContext';

export default function JoinClanPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedClanId, setSelectedClanId] = useState(null);
  const [message, setMessage] = useState('');
  const maxMessageLength = 500;

  const { data: clans = [], isLoading } = useQuery({
    queryKey: ['/api/clans'],
  });

  const selectedClan = clans.find(c => c.id === selectedClanId);

  const applyMutation = useMutation({
    mutationFn: async () => {
      if (!selectedClanId) {
        throw new Error('Выберите клан');
      }
      return await apiRequest('POST', `/api/clans/${selectedClanId}/apply`, {
        message: message.trim() || null,
      });
    },
    onSuccess: () => {
      toast({
        title: 'Заявка отправлена',
        description: 'Ваша заявка успешно отправлена. Ожидайте решения владельца клана.',
      });
      setSelectedClanId(null);
      setMessage('');
    },
    onError: (error) => {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = () => {
    if (!user) {
      toast({
        title: 'Требуется авторизация',
        description: 'Войдите в систему, чтобы подать заявку',
        variant: 'destructive',
      });
      return;
    }
    applyMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-primary" data-testid="loader-clans" />
      </div>
    );
  }

  const availableClans = clans.filter(clan => {
    return true;
  });

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="flex items-center gap-3 text-4xl font-display font-bold tracking-wider">
          <Shield className="w-10 h-10 text-primary" />
          ВСТУПЛЕНИЕ В КЛАН
        </h1>
        <p className="text-muted-foreground text-lg">
          Найдите соратников и присоединитесь к битве.
        </p>
      </motion.div>

      {/* Clan Selection Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-display font-semibold tracking-wide flex items-center gap-2">
            <Users className="w-5 h-5 text-muted-foreground" />
            ВЫБЕРИТЕ КЛАН ДЛЯ ВСТУПЛЕНИЯ
          </h2>
          <Badge variant="secondary" className="text-sm">
            {availableClans.length} доступно
          </Badge>
        </div>

        {/* Clan Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableClans.map((clan) => (
            <motion.div
              key={clan.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className={`cursor-pointer overflow-hidden relative transition-all duration-300 ${
                  selectedClanId === clan.id
                    ? 'ring-2 ring-primary shadow-lg shadow-primary/20'
                    : 'hover:shadow-md'
                }`}
                onClick={() => setSelectedClanId(clan.id)}
                data-testid={`card-clan-${clan.id}`}
              >
                {/* Banner Background */}
                <div
                  className="h-32 bg-cover bg-center relative"
                  style={{
                    backgroundImage: clan.bannerUrl
                      ? `url(${clan.bannerUrl})`
                      : 'linear-gradient(135deg, hsl(var(--muted)) 0%, hsl(var(--card)) 100%)',
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-card" />
                  
                  {/* Selection Indicator */}
                  {selectedClanId === clan.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-3 right-3"
                    >
                      <CheckCircle2 className="w-8 h-8 text-primary fill-primary/20" data-testid={`icon-selected-${clan.id}`} />
                    </motion.div>
                  )}
                </div>

                <CardContent className="relative -mt-12 pb-4 space-y-3">
                  {/* Clan Logo */}
                  <div className="flex justify-center">
                    <Avatar className="w-20 h-20 border-4 border-card shadow-xl">
                      <AvatarImage src={clan.logoUrl} />
                      <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                        {clan.tag}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  {/* Clan Info */}
                  <div className="text-center space-y-1">
                    <h3 className="font-display font-bold text-lg tracking-wide">
                      [{clan.tag}] {clan.name}
                    </h3>
                    {clan.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {clan.description}
                      </p>
                    )}
                  </div>

                  {/* Member Count */}
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>{clan.memberCount || 0}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {availableClans.length === 0 && (
          <Card className="p-12">
            <div className="text-center space-y-2">
              <Users className="w-16 h-16 mx-auto text-muted-foreground opacity-40" />
              <h3 className="text-lg font-semibold text-muted-foreground">
                Нет доступных кланов
              </h3>
              <p className="text-sm text-muted-foreground">
                В данный момент нет кланов для вступления
              </p>
            </div>
          </Card>
        )}
      </motion.div>

      {/* Requirements and Cover Letter Section */}
      {selectedClan && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Requirements */}
          <Card className="bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border-primary/30">
            <CardHeader>
              <CardTitle className="text-primary font-display tracking-wider">
                ТРЕБОВАНИЯ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedClan.requirements?.microphone && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <p className="text-sm">Наличие микрофона и Discord</p>
                </div>
              )}
              {selectedClan.requirements?.minAge && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <p className="text-sm">Возраст {selectedClan.requirements.minAge}+</p>
                </div>
              )}
              {selectedClan.requirements?.minHours && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <p className="text-sm">
                    {selectedClan.requirements.minHours} Часов без говна дота
                  </p>
                </div>
              )}
              {selectedClan.requirements?.additionalRequirements &&
                selectedClan.requirements.additionalRequirements.map((req, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <p className="text-sm">{req}</p>
                  </div>
                ))}
              {(!selectedClan.requirements ||
                Object.keys(selectedClan.requirements).length === 0) && (
                <p className="text-sm text-muted-foreground">
                  Нет особых требований
                </p>
              )}
            </CardContent>
          </Card>

          {/* Cover Letter */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display tracking-wider">
                СОПРОВОДИТЕЛЬНОЕ ПИСЬМО
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Textarea
                  placeholder="Привет! Я хочу вступить в ZRBRERS потому что..."
                  value={message}
                  onChange={(e) => {
                    if (e.target.value.length <= maxMessageLength) {
                      setMessage(e.target.value);
                    }
                  }}
                  className="min-h-[200px] resize-none"
                  data-testid="textarea-cover-letter"
                />
                <div className="flex justify-end text-xs text-muted-foreground">
                  <span data-testid="text-char-count">
                    {message.length} / {maxMessageLength}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Action Buttons */}
      {selectedClan && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 items-center justify-center"
        >
          {/* Discord Button */}
          {selectedClan.requirements?.discordLink && (
            <Button
              variant="outline"
              size="lg"
              className="bg-[#5865F2] hover:bg-[#4752C4] text-white border-none min-w-[200px]"
              onClick={() => {
                window.open(selectedClan.requirements.discordLink, '_blank');
              }}
              data-testid="button-join-discord"
            >
              <svg
                className="w-5 h-5 mr-2"
                viewBox="0 0 127.14 96.36"
                fill="currentColor"
              >
                <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" />
              </svg>
              Вступить в Discord
            </Button>
          )}

          {/* Submit Button */}
          <Button
            size="lg"
            className="min-w-[200px] font-display tracking-wider text-lg"
            onClick={handleSubmit}
            disabled={applyMutation.isPending || !selectedClanId}
            data-testid="button-submit-application"
          >
            {applyMutation.isPending && (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            )}
            ОТПРАВИТЬ ЗАЯВКУ
          </Button>
        </motion.div>
      )}
    </div>
  );
}
