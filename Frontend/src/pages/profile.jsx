import { Link } from "wouter";
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring, useAnimation } from "framer-motion";
import { Trophy, Target, Clock, Shield, Swords, Users, ChevronRight, CheckCircle2, AlertCircle, Crosshair, Skull, X, Crown, Star, User, Trash2, Plus, Settings, LogOut, Search, Zap, Medal, ChevronDown, UserPlus, UserMinus, MessageSquare, Edit, Camera, Play, Plane, Car, ThumbsUp, ThumbsDown, Percent, Swords as Gun, Check, XCircle, ArrowUpDown, ListFilter, Image as ImageIcon, Link as LinkIcon, Radar, Activity, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import discordLogo from "@assets/image_1763634265865.png";
import profileBg from "@assets/generated_images/dark_tactical_abstract_gaming_background.png";
import { useState, useRef, useEffect, useMemo } from "react";

// Squad Stats Components
import { useSquadStats } from "@/hooks/useSquadStats";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";

// --- Animation Components ---

const GlitchText = ({ text, className }) => {
  return (
    <div className={`relative inline-block group ${className}`}>
      <span className="relative z-10">{text}</span>
      <span className="absolute top-0 left-0 -ml-0.5 translate-x-[2px] text-red-500 opacity-0 group-hover:opacity-70 animate-pulse z-0 mix-blend-screen" style={{ clipPath: 'inset(40% 0 61% 0)' }}>{text}</span>
      <span className="absolute top-0 left-0 ml-0.5 -translate-x-[2px] text-blue-500 opacity-0 group-hover:opacity-70 animate-pulse z-0 mix-blend-screen" style={{ clipPath: 'inset(10% 0 50% 0)' }}>{text}</span>
    </div>
  );
};

const MagneticButton = ({ children, className, onClick, variant = "default", size = "default" }) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 15, stiffness: 150, mass: 0.1 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    x.set((clientX - centerX) * 0.3); // Reduced strength
    y.set((clientY - centerY) * 0.3);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ x: springX, y: springY }}
        className="inline-block"
    >
        <Button className={className} onClick={onClick} variant={variant} size={size}>
            {children}
        </Button>
    </motion.div>
  );
};

const TiltCard = ({ children, className }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 500, damping: 100 });
  const mouseY = useSpring(y, { stiffness: 500, damping: 100 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["10deg", "-10deg"]); // Reduced rotation for subtlety
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className={className}
    >
      <div style={{ transform: "translateZ(30px)" }} className="h-full">
        {children}
      </div>
    </motion.div>
  );
};

const AnimatedCounter = ({ value }) => {
    // Simple counter placeholder - full animated counter would need useEffect/raf
    return <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>{value}</motion.span>;
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
          type: "spring",
          stiffness: 100,
          damping: 15
      }
  }
};

const parseGameDuration = (durationStr) => {
  if (!durationStr) return 0;
  let totalHours = 0;
  const daysMatch = durationStr.match(/(\d+)д/);
  const hoursMatch = durationStr.match(/(\d+)ч/);
  
  if (daysMatch) totalHours += parseInt(daysMatch[1]) * 24;
  if (hoursMatch) totalHours += parseInt(hoursMatch[1]);
  
  return totalHours;
};

const DiscordCard = () => {
  const { user, linkDiscord, unlinkDiscord } = useAuth();
  const [isLinking, setIsLinking] = useState(false);
  const { toast } = useToast();
  
  const isLinked = user?.discordId && user?.discordUsername;
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    
    if (params.get('discord_linked') === 'true') {
      toast({
        title: "Discord аккаунт привязан!",
        description: "Ваш Discord аккаунт успешно привязан к профилю",
      });
      window.history.replaceState({}, '', '/profile');
    }
    
    const error = params.get('error');
    if (error) {
      let errorMessage = "Произошла ошибка при привязке Discord";
      
      if (error === 'discord_token_failed') {
        errorMessage = "Не удалось получить токен Discord";
      } else if (error === 'discord_user_failed') {
        errorMessage = "Не удалось получить данные пользователя Discord";
      } else if (error === 'discord_request_failed') {
        errorMessage = "Ошибка при запросе к Discord API";
      }
      
      toast({
        title: "Ошибка привязки",
        description: errorMessage,
        variant: "destructive"
      });
      window.history.replaceState({}, '', '/profile');
    }
  }, [toast]);
  
  const handleLinkDiscord = async () => {
    setIsLinking(true);
    try {
      await linkDiscord();
    } catch (error) {
      console.error('Failed to link Discord:', error);
    } finally {
      setIsLinking(false);
    }
  };
  
  const handleUnlinkDiscord = async () => {
    if (confirm('Вы уверены, что хотите отвязать Discord аккаунт?')) {
      try {
        const success = await unlinkDiscord();
        if (success) {
          toast({
            title: "Discord аккаунт отвязан",
            description: "Ваш Discord аккаунт успешно отвязан от профиля",
          });
        } else {
          toast({
            title: "Ошибка",
            description: "Не удалось отвязать Discord аккаунт",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Failed to unlink Discord:', error);
        toast({
          title: "Ошибка",
          description: "Произошла ошибка при отвязке Discord",
          variant: "destructive"
        });
      }
    }
  };
  
  return (
    <motion.div variants={item} initial="hidden" animate="show" transition={{ delay: 0.6 }}>
      <Card className="bg-gradient-to-br from-[#5865F2] via-[#5865F2] to-[#4752C4] border-none overflow-hidden relative group hover:shadow-[0_0_30px_rgba(88,101,242,0.4)] transition-all duration-500 cursor-pointer transform hover:scale-[1.02]">
        <div className="absolute inset-0 bg-[url('https://assets-global.website-files.com/6257adef93867e56f84d3109/636e0a6918e57475a843f59f_layer_1.svg')] opacity-10 bg-repeat" />
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:bg-white/15 transition-colors duration-500" />
        
        <CardHeader className="relative z-10 pb-2">
          <CardTitle className="flex items-center gap-3 text-white font-display text-xl">
            <svg className="w-8 h-8 drop-shadow-lg" viewBox="0 0 127.14 96.36" fill="white">
              <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z"/>
            </svg>
            Discord аккаунт
          </CardTitle>
        </CardHeader>
        
        <CardContent className="relative z-10 space-y-4">
          {isLinked ? (
            <>
              <div className="flex items-center justify-between p-3 rounded-xl bg-black/20 backdrop-blur-sm border border-white/10 group-hover:bg-black/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="w-12 h-12 border-2 border-white/20 shadow-lg">
                      <AvatarFallback className="bg-[#5865F2] text-white font-bold">
                        {user.discordUsername?.slice(0, 2).toUpperCase() || 'DC'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 bg-[#5865F2] rounded-full p-1 border-2 border-white/10 shadow-md">
                      <CheckCircle2 className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white">{user.discordUsername}</span>
                    <span className="text-[10px] text-white/80 uppercase tracking-wider font-bold flex items-center gap-1">
                      <Zap className="w-3 h-3 text-yellow-300 fill-yellow-300" />
                      Подтверждено
                    </span>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-white/50 hover:text-white hover:bg-white/10 rounded-full"
                  onClick={handleUnlinkDiscord}
                  data-testid="button-unlink-discord"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="p-4 rounded-xl bg-black/20 backdrop-blur-sm border border-white/10 text-center">
              <p className="text-white/80 text-sm mb-4">Discord аккаунт не привязан</p>
            </div>
          )}
          
          <Button 
            className="w-full bg-white text-[#5865F2] hover:bg-white/90 font-bold font-display tracking-wide shadow-lg border-none h-11 group-hover:scale-[1.02] transition-transform gap-2"
            onClick={handleLinkDiscord}
            disabled={isLinking}
            data-testid="button-link-discord"
          >
            {isLinking ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 127.14 96.36" fill="currentColor">
                <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z"/>
              </svg>
            )}
            {isLinked ? 'Обновить привязку' : 'Привязать аккаунт'}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default function ProfilePage() {
  const { user, logout, isAdmin, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [userRole, setUserRole] = useState("guest"); // Default to guest for demo
  const [selectedClan, setSelectedClan] = useState(null);
  // Загружаем список кланов из API для гостевых пользователей
  const { data: clansData = [] } = useQuery({
    queryKey: ['/api/clans'],
    enabled: userRole === 'guest', // Загружать только для гостей
    staleTime: 2 * 60 * 1000,
  });
  
  const clans = clansData;
  
  // Мемоизированное состояние Discord кнопки для GUEST view
  const selectedClanData = useMemo(() => 
    clans?.find(c => c.id === selectedClan), 
    [clans, selectedClan]
  );
  const discordUrl = selectedClanData?.requirements?.discordLink?.trim();
  const hasDiscordLink = Boolean(discordUrl);
  
  // Инициализируем selectedClan первым кланом когда данные загрузятся
  useEffect(() => {
    if (!selectedClan && clans && clans.length > 0) {
      setSelectedClan(clans[0].id);
    }
  }, [clans, selectedClan]);
  
  const [isVip, setIsVip] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [applicationMessage, setApplicationMessage] = useState("");
  
  // Mutation для отправки заявки в клан
  const submitApplicationMutation = useMutation({
    mutationFn: async ({ clanId, message }) => {
      return await apiRequest('POST', `/api/clans/${clanId}/applications`, { message });
    },
    onSuccess: () => {
      toast({
        title: "Заявка отправлена!",
        description: "Владелец клана получит уведомление о вашей заявке",
      });
      setApplicationMessage("");
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: error.message || "Не удалось отправить заявку",
      });
    }
  });
  
  // Обновляем локальное состояние при изменении user
  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
      setAvatarUrl(user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username || 'Player'}`);
    }
  }, [user]);
  
  // Показываем загрузку если нет пользователя
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Требуется авторизация</CardTitle>
            <CardDescription>Пожалуйста, войдите через Steam для доступа к профилю</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }
  
  // Squad Stats Integration - используем Steam ID из user если доступен
  const steamId = user?.steamId;
  const { stats: squadStats, isLoading: statsLoading, error: statsError } = useSquadStats(steamId);
  
  // Owner specific state
  const [ownerTab, setOwnerTab] = useState("squad");
  const [selectedMemberStats, setSelectedMemberStats] = useState(null);
  const [sortBy, setSortBy] = useState("default");
  
  // Clan Assets State (Owner Settings) - будут инициализированы из clanData
  const [clanBanner, setClanBanner] = useState(null);
  const [clanLogo, setClanLogo] = useState(null);
  const [discordLink, setDiscordLink] = useState("");
  
  // Clan Requirements & Theme Settings - будут инициализированы из clanData
  const [clanRequirements, setClanRequirements] = useState({
    microphone: false,
    ageRestriction: false,
    customRequirement: ""
  });
  const [clanTheme, setClanTheme] = useState("orange");

  // Получаем ID клана пользователя
  const currentClanId = user?.currentClanId;
  
  // Загружаем информацию о клане
  const { data: clanData, isLoading: clanLoading } = useQuery({
    queryKey: ['/api/clans', currentClanId],
    enabled: !!currentClanId,
  });
  
  // Загружаем участников клана
  const { data: clanMembersResponse, isLoading: membersLoading } = useQuery({
    queryKey: ['/api/clans', currentClanId, 'members'],
    enabled: !!currentClanId,
  });
  
  // Преобразуем данные участников из API в нужный формат
  // queryClient автоматически распаковывает {success: true, members: [...]} в просто массив
  const squadMembers = clanMembersResponse?.map(member => {
    const onlineStatus = member.player?.onlineStatus || 'НЕ В СЕТИ';
    const statusColor = onlineStatus === 'В СЕТИ' ? 'text-emerald-500' : 
                       onlineStatus === 'В ИГРЕ' ? 'text-yellow-500' : 
                       'text-zinc-500';
    
    return {
      id: member.id,
      name: member.player?.username || 'Unknown',
      role: member.role === 'owner' ? 'Лидер' : member.role === 'officer' ? 'Офицер' : member.role === 'member' ? 'Боец' : 'Рекрут',
      status: onlineStatus,
      statusColor: statusColor,
      roleColor: member.role === 'owner' ? 'text-primary border-primary/20 bg-primary/10' : 
                 member.role === 'officer' ? 'text-orange-400 border-orange-400/20 bg-orange-400/10' : 
                 'text-muted-foreground border-white/10 bg-white/5',
      avatar: member.player?.username?.substring(0, 2).toUpperCase() || 'UN',
      stats: { 
        games: 0, 
        hours: '0д 0ч', 
        sl: '0ч', 
        driver: '0ч', 
        pilot: '0ч', 
        cmd: '0ч', 
        likes: 0, 
        tk: 0, 
        winrate: 0, 
        kills: 0, 
        deaths: 0, 
        kd: 0, 
        wins: 0, 
        avgKills: 0, 
        vehicleKills: 0, 
        knifeKills: 0 
      } // TODO: Получить реальную статистику
    };
  }) || [];
  
  // DEBUG: Логирование данных
  useEffect(() => {
    console.log('[CLAN DEBUG] ================');
    console.log('[CLAN DEBUG] User:', user);
    console.log('[CLAN DEBUG] currentClanId:', currentClanId);
    console.log('[CLAN DEBUG] Queries enabled:', !!currentClanId);
    console.log('[CLAN DEBUG] clanData:', clanData);
    console.log('[CLAN DEBUG] clanMembersResponse:', clanMembersResponse);
    console.log('[CLAN DEBUG] clanLoading:', clanLoading, 'membersLoading:', membersLoading);
    console.log('[CLAN DEBUG] squadMembers length:', squadMembers.length);
    console.log('[CLAN DEBUG] ================');
  }, [user, currentClanId, clanData, clanMembersResponse, clanLoading, membersLoading, squadMembers]);
  
  // Определяем роль пользователя в клане
  useEffect(() => {
    if (clanMembersResponse && user) {
      const myMembership = clanMembersResponse.find(m => m.player?.id === user.id);
      if (myMembership) {
        if (myMembership.role === 'owner') {
          setUserRole('owner');
        } else {
          setUserRole('member');
        }
      } else {
        setUserRole('guest');
      }
    } else if (!currentClanId) {
      setUserRole('guest');
    }
  }, [clanMembersResponse, user, currentClanId]);
  
  // Инициализируем настройки клана из данных API
  useEffect(() => {
    if (clanData) {
      setClanBanner(clanData.bannerUrl);
      setClanLogo(clanData.logoUrl);
      setClanTheme(clanData.theme || 'orange');
      
      // Парсим requirements из JSON
      const reqs = clanData.requirements || {};
      setClanRequirements({
        microphone: reqs.microphone || false,
        ageRestriction: reqs.ageRestriction || false,
        customRequirement: reqs.customRequirement || ""
      });
      
      // Discord link (пока нет в схеме, будет добавлено позже)
      setDiscordLink(reqs.discordLink || "");
    }
  }, [clanData]);

  // Загружаем заявки на вступление (только для владельцев клана)
  // queryClient автоматически распаковывает {success: true, player: {}} -> player
  // Поэтому user это сам объект player с полем id
  const isOwner = clanData?.ownerId === user?.id;
  
  // Debug - проверим данные
  console.log('DEBUG Applications:', {
    currentClanId,
    clanOwnerId: clanData?.ownerId,
    userId: user?.id,
    isOwner,
    userFull: user,
    clanDataFull: clanData
  });
  
  const { data: applicationsResponse, isLoading: applicationsLoading } = useQuery({
    queryKey: ['/api/clans', currentClanId, 'applications'],
    enabled: !!currentClanId && isOwner,
  });
  
  console.log('Applications Response:', applicationsResponse);
  
  // Преобразуем заявки в нужный формат для UI
  const applications = (applicationsResponse?.applications || []).map(app => ({
    id: app.id,
    name: app.player?.username || 'Unknown',
    avatar: app.player?.username?.substring(0, 2).toUpperCase() || 'UN',
    message: app.message || '',
    time: new Date(app.createdAt).toLocaleDateString('ru-RU'),
    stats: {
      hours: '0ч',  // TODO: загружать из statsSnapshot
      kd: 0.0       // TODO: загружать из statsSnapshot
    }
  }));

  const handleRoleChange = (memberId, newRole) => {
    // TODO: Implement API call to change member role
    console.log('Change role for member', memberId, 'to', newRole);
  };

  // Мутация для отклонения заявки
  const rejectApplicationMutation = useMutation({
    mutationFn: async (applicationId) => {
      return await apiRequest('POST', `/api/clans/${currentClanId}/applications/${applicationId}/reject`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clans', currentClanId, 'applications'] });
      toast({
        title: "Заявка отклонена",
        description: "Заявка успешно отклонена",
      });
    },
    onError: (error) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось отклонить заявку",
        variant: "destructive"
      });
    }
  });

  const handleRejectApp = (id) => {
    rejectApplicationMutation.mutate(id);
  };

  // Мутация для принятия заявки
  const acceptApplicationMutation = useMutation({
    mutationFn: async (applicationId) => {
      return await apiRequest('POST', `/api/clans/${currentClanId}/applications/${applicationId}/approve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clans', currentClanId, 'applications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/clans', currentClanId, 'members'] });
      toast({
        title: "Заявка принята",
        description: "Игрок добавлен в клан",
      });
    },
    onError: (error) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось принять заявку",
        variant: "destructive"
      });
    }
  });

  const handleAcceptApp = (id) => {
    acceptApplicationMutation.mutate(id);
  };
  
  // Мутация для сохранения настроек клана
  const updateClanMutation = useMutation({
    mutationFn: async (updates) => {
      return await apiRequest('PUT', `/api/clans/${currentClanId}`, {
        theme: updates.theme,
        bannerUrl: updates.bannerUrl,
        logoUrl: updates.logoUrl,
        requirements: {
          microphone: updates.requirements.microphone,
          ageRestriction: updates.requirements.ageRestriction,
          customRequirement: updates.requirements.customRequirement,
          discordLink: updates.discordLink
        }
      });
    },
    onSuccess: () => {
      // Инвалидируем кеш клана чтобы обновить данные
      queryClient.invalidateQueries({ queryKey: ['/api/clans', currentClanId] });
      toast({
        title: "Настройки сохранены",
        description: "Изменения успешно применены",
      });
      setIsSettingsOpen(false);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Ошибка сохранения",
        description: error.message || "Не удалось сохранить настройки",
      });
    }
  });
  
  // Загрузка изображений на сервер через authenticated fetch
  // Note: Cannot use apiRequest because it JSON-serializes body, which breaks FormData
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  
  const uploadFileWithAuth = async (endpoint, file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    // Add clanId for backend ownership validation
    if (currentClanId) {
      formData.append('clanId', currentClanId);
    }
    
    // Get access token from localStorage (same as apiRequest)
    const token = localStorage.getItem('access_token');
    
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: formData,
        credentials: 'include',
      });
      
      // Parse response body once
      const responseData = await response.json().catch(() => ({}));
      
      if (!response.ok) {
        // Mirror apiRequest error handling
        const errorMessage = responseData.error || responseData.message || `Upload failed with status ${response.status}`;
        throw new Error(errorMessage);
      }
      
      return responseData;
    } catch (error) {
      // Re-throw with better context
      if (error.message) throw error;
      throw new Error('Network error during file upload');
    }
  };
  
  const handleUploadBanner = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setUploadingBanner(true);
    try {
      const data = await uploadFileWithAuth('/api/uploads/clan-banner', file);
      const uploadedUrl = data.bannerUrl || data.url || data.path;
      
      setClanBanner(uploadedUrl);
      toast({
        title: "Баннер загружен",
        description: "Не забудьте сохранить изменения",
      });
    } catch (error) {
      console.error('Banner upload error:', error);
      toast({
        variant: "destructive",
        title: "Ошибка загрузки",
        description: error.message || "Не удалось загрузить баннер",
      });
    } finally {
      setUploadingBanner(false);
      // Reset input value to allow re-uploading same file
      event.target.value = '';
    }
  };
  
  const handleUploadLogo = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setUploadingLogo(true);
    try {
      const data = await uploadFileWithAuth('/api/uploads/clan-logo', file);
      const uploadedUrl = data.logoUrl || data.url || data.path;
      
      setClanLogo(uploadedUrl);
      toast({
        title: "Логотип загружен",
        description: "Не забудьте сохранить изменения",
      });
    } catch (error) {
      console.error('Logo upload error:', error);
      toast({
        variant: "destructive",
        title: "Ошибка загрузки",
        description: error.message || "Не удалось загрузить логотип",
      });
    } finally {
      setUploadingLogo(false);
      // Reset input value to allow re-uploading same file
      event.target.value = '';
    }
  };
  
  const handleSaveSettings = () => {
    updateClanMutation.mutate({
      theme: clanTheme,
      bannerUrl: clanBanner,
      logoUrl: clanLogo,
      discordLink: discordLink,
      requirements: clanRequirements
    });
  };

  const getSortedMembers = () => {
    if (sortBy === "default") return squadMembers;

    return [...squadMembers].sort((a, b) => {
      switch (sortBy) {
        case "kd": return b.stats.kd - a.stats.kd;
        case "winrate": return b.stats.winrate - a.stats.winrate;
        case "kills": return b.stats.kills - a.stats.kills;
        case "hours": return parseGameDuration(b.stats.hours) - parseGameDuration(a.stats.hours);
        default: return 0;
      }
    });
  };
  
  // Get theme colors based on clanTheme state
  const getThemeColors = () => {
    switch(clanTheme) {
      case "blue":
        return {
          color: "text-blue-500",
          bgColor: "bg-blue-500/10",
          borderColor: "border-blue-500/30",
          glow: "shadow-blue-500/20"
        };
      case "yellow":
        return {
          color: "text-yellow-500",
          bgColor: "bg-yellow-500/10",
          borderColor: "border-yellow-500/30",
          glow: "shadow-yellow-500/20"
        };
      default: // orange
        return {
          color: "text-primary",
          bgColor: "bg-primary/10",
          borderColor: "border-primary/30",
          glow: "shadow-primary/20"
        };
    }
  };
  
  // Generate requirements badge summary from selectedClanData for guest view
  const getRequirementsBadge = () => {
    const reqs = selectedClanData?.requirements || {};
    const parts = [];
    
    if (reqs.microphone) parts.push("Микрофон");
    // Support both old (ageRestriction) and new (age) formats
    if (reqs.ageRestriction || reqs.age) {
      const ageValue = reqs.age || 18;
      parts.push(`Возраст ${ageValue}+`);
    }
    // Support both old (customRequirement) and new (experience) formats
    if (reqs.customRequirement) parts.push(reqs.customRequirement);
    if (reqs.experience) parts.push(reqs.experience);
    if (reqs.custom && Array.isArray(reqs.custom)) {
      parts.push(...reqs.custom);
    }
    
    return parts.length > 0 ? parts.join(", ") : "Открыто для всех";
  };

  const achievements = [
    { name: "Ветеран", icon: Medal, color: "text-yellow-500", desc: "500+ часов" },
    { name: "Снайпер", icon: Crosshair, color: "text-primary", desc: "1000 хедшотов" },
    { name: "Тактик", icon: Shield, color: "text-blue-500", desc: "50 побед командиром" },
  ];

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 relative">
      
      {/* Player Stats Modal (Shared) */}
      <Dialog open={!!selectedMemberStats} onOpenChange={(open) => !open && setSelectedMemberStats(null)}>
        <DialogContent className="max-w-4xl bg-transparent border-none p-0 shadow-none overflow-hidden">
          {selectedMemberStats && (
            <div className="relative w-full max-w-4xl mx-auto bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-300">
                {/* Decorative Glow */}
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
                
                {/* Main Content */}
                <div className="flex-1 p-8 relative z-10 space-y-8">
                    {/* Header */}
                    <div className="space-y-4">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                {selectedMemberStats.avatar && (
                                    <Avatar className="w-16 h-16 border-2 border-white/10 shadow-lg md:hidden">
                                        <AvatarFallback className="bg-zinc-800 font-bold text-xl">{selectedMemberStats.avatar}</AvatarFallback>
                                    </Avatar>
                                )}
                                <h2 className="text-4xl font-black font-display text-white uppercase tracking-tight">{selectedMemberStats.name}</h2>
                            </div>
                            <div className="text-right">
                                <span className="text-xs text-muted-foreground font-display uppercase tracking-widest block mb-1">Медленно, но верно!</span>
                            </div>
                        </div>
                        
                        {/* Rank Progress */}
                        <div className="relative">
                            <div className="h-8 bg-zinc-800/50 rounded-sm overflow-hidden border border-white/5 relative">
                                <div className="absolute inset-0 bg-primary w-[86%] flex items-center justify-end px-4">
                                    <span className="text-xs font-bold text-black font-mono">8660/10000</span>
                                </div>
                            </div>
                            <div className="flex justify-between mt-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                <span className="flex items-center gap-1"><ChevronRight className="w-3 h-3 text-primary"/> Текущий ранг</span>
                                <span className="flex items-center gap-1">Следующий ранг <ChevronRight className="w-3 h-3 text-zinc-600"/></span>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-4 gap-y-8 gap-x-4 py-4 border-y border-white/5">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase font-bold tracking-wider">
                                <Play className="w-4 h-4 text-primary" /> Всего игр
                            </div>
                            <div className="text-2xl font-black text-white font-display">{selectedMemberStats.stats.games}</div>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase font-bold tracking-wider">
                                <Clock className="w-4 h-4 text-primary" /> Все часы
                            </div>
                            <div className="text-2xl font-black text-white font-display">{selectedMemberStats.stats.hours}</div>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase font-bold tracking-wider">
                                <Users className="w-4 h-4 text-primary" /> Сквадной
                            </div>
                            <div className="text-2xl font-black text-white font-display">{selectedMemberStats.stats.sl}</div>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase font-bold tracking-wider">
                                <Car className="w-4 h-4 text-primary" /> Мехвод
                            </div>
                            <div className="text-2xl font-black text-white font-display">{selectedMemberStats.stats.driver}</div>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase font-bold tracking-wider">
                                <Plane className="w-4 h-4 text-primary" /> Пилот
                            </div>
                            <div className="text-2xl font-black text-white font-display">{selectedMemberStats.stats.pilot}</div>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase font-bold tracking-wider">
                                <Star className="w-4 h-4 text-primary" /> CMD
                            </div>
                            <div className="text-2xl font-black text-white font-display">{selectedMemberStats.stats.cmd}</div>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase font-bold tracking-wider">
                                <ThumbsUp className="w-4 h-4 text-primary" /> Помощь
                            </div>
                            <div className="text-2xl font-black text-white font-display">{selectedMemberStats.stats.likes}</div>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase font-bold tracking-wider">
                                <ThumbsDown className="w-4 h-4 text-primary" /> Тимкилы
                            </div>
                            <div className="text-2xl font-black text-white font-display">{selectedMemberStats.stats.tk}</div>
                        </div>
                    </div>

                    {/* Favorites */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full border-2 border-white/10 flex items-center justify-center bg-white/5">
                                <Shield className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Любимая роль</div>
                                <div className="text-xl font-black text-white font-display">SL</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 text-right">
                            <div>
                                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Любимое оружие</div>
                                <div className="text-xl font-black text-white font-display">31 убийств</div>
                            </div>
                            <Gun className="w-10 h-10 text-white/50" />
                        </div>
                    </div>

                    {/* Bottom Cards */}
                    <div className="grid grid-cols-2 gap-4 pt-4">
                        {/* Win Rate Card */}
                        <div className="bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-xl p-4 border border-white/5 relative overflow-hidden">
                            <div className="absolute -right-4 -top-4 text-white/5">
                                <Trophy className="w-24 h-24" />
                            </div>
                            <div className="relative z-10">
                                <div className="text-xs text-white font-bold mb-1">Побед</div>
                                <div className="text-5xl font-black text-white font-display tracking-tighter mb-4">{selectedMemberStats.stats.winrate}%</div>
                                <div className="grid grid-cols-3 gap-2 text-xs">
                                    <div>
                                        <div className="text-muted-foreground mb-0.5">У/С</div>
                                        <div className="font-bold text-white">{selectedMemberStats.stats.kd}</div>
                                    </div>
                                    <div>
                                        <div className="text-muted-foreground mb-0.5">Смертей</div>
                                        <div className="font-bold text-white">{selectedMemberStats.stats.deaths}</div>
                                    </div>
                                    <div>
                                        <div className="text-muted-foreground mb-0.5">Кол-во побед</div>
                                        <div className="font-bold text-white">{selectedMemberStats.stats.wins}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Kills Card */}
                        <div className="bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-xl p-4 border border-white/5 relative overflow-hidden">
                            <div className="absolute -right-4 -top-4 text-white/5">
                                <Crosshair className="w-24 h-24" />
                            </div>
                            <div className="relative z-10">
                                <div className="text-xs text-white font-bold mb-1">Всего убийств</div>
                                <div className="text-5xl font-black text-white font-display tracking-tighter mb-4">{selectedMemberStats.stats.kills}</div>
                                <div className="grid grid-cols-3 gap-2 text-xs">
                                    <div>
                                        <div className="text-muted-foreground mb-0.5">Сред. за игры</div>
                                        <div className="font-bold text-white">{selectedMemberStats.stats.avgKills}</div>
                                    </div>
                                    <div>
                                        <div className="text-muted-foreground mb-0.5">Уб. техникой</div>
                                        <div className="font-bold text-white">{selectedMemberStats.stats.vehicleKills}</div>
                                    </div>
                                    <div>
                                        <div className="text-muted-foreground mb-0.5">Уб. ножом</div>
                                        <div className="font-bold text-white">{selectedMemberStats.stats.knifeKills}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Right Side Image (Mocked with Soldier) */}
                <div className="w-80 relative hidden md:block">
                    <div className="absolute inset-0 bg-[url('https://w.forfun.com/fetch/9c/9c028de189727234587a8d47d6d8e606.jpeg')] bg-cover bg-center">
                        <div className="absolute inset-0 bg-gradient-to-l from-zinc-950 via-zinc-950/50 to-transparent" />
                    </div>
                    <div className="absolute bottom-8 right-8">
                        <div className="w-24 h-24 bg-orange-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(255,102,0,0.5)] border-4 border-black">
                            <div className="text-center leading-none">
                                <div className="font-black text-black text-lg font-display">ZARUBA</div>
                                <div className="font-bold text-black text-[8px] tracking-widest uppercase">SERVER</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dev Tool for Role Switching (Hidden in prod) */}
      <div className="fixed bottom-4 right-4 z-50 bg-black/90 backdrop-blur border border-white/10 p-2 rounded-lg space-y-1 shadow-xl">
        <p className="text-[9px] text-muted-foreground font-mono">DEMO</p>
        <div className="flex gap-1">
          <Button size="sm" variant={userRole === "guest" ? "default" : "outline"} onClick={() => setUserRole("guest")} className="h-5 text-[9px] px-2">G</Button>
          <Button size="sm" variant={userRole === "member" ? "default" : "outline"} onClick={() => setUserRole("member")} className="h-5 text-[9px] px-2">M</Button>
          <Button size="sm" variant={userRole === "owner" ? "default" : "outline"} onClick={() => setUserRole("owner")} className="h-5 text-[9px] px-2">O</Button>
          <Button size="sm" variant={isVip ? "default" : "outline"} onClick={() => setIsVip(!isVip)} className="h-5 text-[9px] px-2">V</Button>
        </div>
      </div>

      {/* Header / Identity Section - Compressed */}
      <TiltCard className="relative mb-8 rounded-2xl overflow-hidden border border-white/10 shadow-2xl group">
        {/* Dynamic Banner Background - Reduced height */}
        <div className="absolute inset-0 h-48 z-0">
           <img src={profileBg} className="w-full h-full object-cover opacity-60 mix-blend-overlay" />
           <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-transparent" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-end gap-4 pt-16 px-6 md:px-8 pb-6">
          <motion.div 
            className="relative group cursor-pointer"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="w-28 h-28 rounded-xl overflow-hidden border-4 border-background/50 backdrop-blur-sm shadow-[0_0_30px_rgba(255,102,0,0.2)] group-hover:shadow-[0_0_50px_rgba(255,102,0,0.5)] transition-all duration-500 bg-zinc-900 relative">
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/20 to-transparent h-[20%] w-full animate-scanline pointer-events-none" />
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-background p-1 rounded-full">
              <Badge className="bg-primary text-black hover:bg-primary/90 border-2 border-background px-2 py-0.5 text-sm font-black font-display shadow-lg flex items-center gap-1">
                <Crown className="w-3 h-3 fill-black" />
                52
              </Badge>
            </div>
          </motion.div>

          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-4xl md:text-5xl font-black text-white font-display tracking-tighter uppercase drop-shadow-2xl"
              >
                <GlitchText text={username} />
              </motion.h1>
              
              {isVip && (
                <Badge variant="outline" className="border-primary text-primary bg-primary/10 px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase animate-pulse shadow-[0_0_10px_rgba(255,102,0,0.3)]">
                  VIP
                </Badge>
              )}
              
              {userRole !== "guest" && (
                 <Badge variant="outline" className="border-white/20 text-white bg-white/5 px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase flex items-center gap-1">
                   <Shield className="w-2.5 h-2.5" />
                   ALPHA
                 </Badge>
              )}
            </div>
            
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-2 py-1 rounded-full border border-white/5">
                 <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-mono uppercase text-white/50">XP</span>
                    <Progress value={68} className="w-16 h-1 bg-white/10" indicatorClassName="bg-primary" />
                    <span className="text-[9px] font-mono text-primary">68%</span>
                 </div>
              </div>
              <span className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2 py-1 rounded-full border border-white/5">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Steam_icon_logo.svg/512px-Steam_icon_logo.svg.png" className="w-3 h-3 opacity-70" />
                <span className="font-mono text-white/70 text-[10px]">STEAM_0:1:12345678</span>
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/5 px-2 py-1 rounded-full border border-emerald-500/10">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                <span className="text-[10px]">Online</span>
              </span>
            </div>
          </div>

          <div className="flex gap-2 w-full md:w-auto">
             <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
               <DialogTrigger asChild>
                 <Button variant="outline" size="sm" className="flex-1 md:flex-none h-9 border-white/10 hover:border-white/20 hover:bg-white/5 text-white bg-zinc-900/50 backdrop-blur-sm text-xs">
                   <Settings className="w-4 h-4 md:mr-2" />
                   <span className="hidden md:inline">Настройки</span>
                 </Button>
               </DialogTrigger>
               <DialogContent className="bg-zinc-950 border-white/10 sm:max-w-[425px]">
                 <DialogHeader>
                   <DialogTitle className="text-xl font-display tracking-wide">Настройки профиля</DialogTitle>
                   <DialogDescription>
                     Измените ваш публичный профиль.
                   </DialogDescription>
                 </DialogHeader>
                 <div className="grid gap-6 py-4">
                   <div className="flex flex-col items-center gap-4">
                     <div className="relative group cursor-pointer">
                       <Avatar className="w-24 h-24 border-2 border-white/10 group-hover:border-primary transition-colors">
                         <AvatarImage src={avatarUrl} />
                         <AvatarFallback>AV</AvatarFallback>
                       </Avatar>
                       <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <Camera className="w-6 h-6 text-white" />
                       </div>
                     </div>
                     <Button variant="outline" size="sm" className="text-xs" onClick={() => setAvatarUrl(`https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`)}>
                       Случайный аватар
                     </Button>
                   </div>
                   <div className="grid gap-2">
                     <Label htmlFor="username" className="text-left">
                       Никнейм
                     </Label>
                     <Input
                       id="username"
                       value={username}
                       onChange={(e) => setUsername(e.target.value)}
                       className="bg-zinc-900 border-white/10 focus:border-primary/50"
                     />
                   </div>
                 </div>
                 <DialogFooter>
                   <Button 
                    type="submit" 
                    className="bg-primary text-black font-bold hover:bg-primary/90" 
                    onClick={handleSaveSettings}
                    disabled={updateClanMutation.isPending}
                    data-testid="button-save-settings"
                  >
                    {updateClanMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Сохранение...
                      </>
                    ) : (
                      'Сохранить изменения'
                    )}
                  </Button>
                 </DialogFooter>
               </DialogContent>
             </Dialog>
             
             {isAdmin && (
               <Link href="/admin">
                 <Button 
                   variant="outline" 
                   size="sm" 
                   className="flex-1 md:flex-none h-9 border-white/10 hover:border-primary/20 hover:bg-primary/5 text-white bg-zinc-900/50 backdrop-blur-sm text-xs"
                   data-testid="button-admin"
                 >
                   <Shield className="w-4 h-4 md:mr-2" />
                   <span className="hidden md:inline">Админ</span>
                 </Button>
               </Link>
             )}
             
             <Button 
               variant="ghost" 
               size="sm" 
               className="h-9 w-9 border border-white/10 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 bg-zinc-900/50 backdrop-blur-sm"
               onClick={logout}
               data-testid="button-logout"
             >
                <LogOut className="w-4 h-4" />
             </Button>
          </div>
        </div>
      </TiltCard>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column - Stats & Info */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Squad Stats Card */}
          <motion.div variants={container} initial="hidden" animate="show">
            <Card className="bg-gradient-to-br from-zinc-900/50 via-zinc-900/40 to-black/50 border-primary/10 backdrop-blur-md overflow-hidden relative group hover:border-primary/30 hover:shadow-[0_0_20px_rgba(255,102,0,0.15)] transition-all duration-500">
              <CardHeader className="pb-3 relative z-10">
                <CardTitle className="text-lg font-display flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Боевая Статистика
                </CardTitle>
              </CardHeader>
              
              <CardContent className="pt-0">
                {statsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : statsError ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">Не удалось загрузить статистику</p>
                  </div>
                ) : squadStats ? (
                  <div className="space-y-4">
                    {/* Rank and Progress */}
                    {squadStats.rank && squadStats.rank.current && (
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden border-2 border-primary/30 bg-zinc-800/50 flex items-center justify-center shrink-0">
                          {squadStats.rank.current.iconUrl ? (
                            <img src={squadStats.rank.current.iconUrl} alt="Rank" className="w-full h-full object-contain" />
                          ) : (
                            <Star className="w-6 h-6 text-primary" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground">Ранг</span>
                            <span className="text-primary font-bold">{(squadStats.rank.progress || 0).toFixed(1)}%</span>
                          </div>
                          <Progress value={squadStats.rank.progress || 0} className="h-2" />
                        </div>
                      </div>
                    )}
                    
                    {/* Main Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <div className="text-center p-2 bg-zinc-800/50 rounded-lg">
                        <Crosshair className="w-4 h-4 text-primary mx-auto mb-1" />
                        <div className="text-xs text-muted-foreground">K/D</div>
                        <div className="text-sm font-bold text-primary">{squadStats.kd?.toFixed(2)}</div>
                      </div>
                      <div className="text-center p-2 bg-zinc-800/50 rounded-lg">
                        <Trophy className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
                        <div className="text-xs text-muted-foreground">Винрейт</div>
                        <div className="text-sm font-bold text-yellow-400">{squadStats.winrate?.toFixed(0)}%</div>
                      </div>
                      <div className="text-center p-2 bg-zinc-800/50 rounded-lg">
                        <Target className="w-4 h-4 text-red-400 mx-auto mb-1" />
                        <div className="text-xs text-muted-foreground">Убийств</div>
                        <div className="text-sm font-bold text-red-400">{squadStats.kills}</div>
                      </div>
                      <div className="text-center p-2 bg-zinc-800/50 rounded-lg">
                        <Clock className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                        <div className="text-xs text-muted-foreground">Время</div>
                        <div className="text-sm font-bold text-blue-400">{squadStats.playtime}</div>
                      </div>
                    </div>

                    {/* Top Weapon & Role */}
                    {(squadStats.topWeapon || squadStats.topRole) && (
                      <div className="flex gap-2">
                        {squadStats.topWeapon && (
                          <div className="flex-1 p-2 bg-zinc-800/30 rounded-lg">
                            <div className="text-[10px] text-muted-foreground mb-1">🔫 Оружие</div>
                            <div className="text-sm font-bold truncate">{squadStats.topWeapon.name || 'Unknown'}</div>
                            <div className="text-xs text-primary">{squadStats.topWeapon.kills || 0} убийств</div>
                          </div>
                        )}
                        {squadStats.topRole && (
                          <div className="flex-1 p-2 bg-zinc-800/30 rounded-lg">
                            <div className="text-[10px] text-muted-foreground mb-1">🎖️ Роль</div>
                            <div className="text-sm font-bold truncate">{squadStats.topRole.name || 'Unknown'}</div>
                            <div className="text-xs text-primary">{squadStats.topRole.time || '0м'}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Нет данных о статистике</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Achievements Section - Compact Horizontal */}
          <motion.div variants={item} initial="hidden" animate="show" transition={{ delay: 0.4 }}>
             <Card className="bg-gradient-to-br from-zinc-900/50 via-zinc-900/40 to-black/50 border-yellow-500/10 backdrop-blur-md overflow-hidden group hover:border-yellow-500/20 hover:shadow-[0_0_15px_rgba(234,179,8,0.1)] transition-all duration-500">
                <CardHeader className="pb-3">
                   <CardTitle className="text-base font-display flex items-center gap-2">
                      <Medal className="w-4 h-4 text-yellow-500" />
                      Достижения
                   </CardTitle>
                </CardHeader>
                <CardContent>
                   <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                      {achievements.map((ach, i) => (
                         <motion.div 
                           key={i} 
                           className="flex-shrink-0 w-36 p-3 rounded-lg bg-zinc-900/50 border border-white/5 hover:border-white/10 hover:bg-zinc-900/70 transition-all cursor-pointer"
                           whileHover={{ y: -2 }}
                         >
                            <div className={`p-2 rounded-lg bg-zinc-900 border border-white/10 ${ach.color} shadow-inner mb-2 w-fit mx-auto`}>
                               <ach.icon className="w-5 h-5" />
                            </div>
                            <h4 className="font-bold text-xs text-white text-center mb-1">{ach.name}</h4>
                            <p className="text-[10px] text-muted-foreground text-center line-clamp-2">{ach.desc}</p>
                         </motion.div>
                      ))}
                   </div>
                </CardContent>
             </Card>
          </motion.div>

          {/* Discord Integration Card */}
          <DiscordCard />
        </div>

        {/* Right Column - Clan Management */}
        <div className="lg:col-span-6">
          <motion.div 
            variants={item} 
            initial="hidden" 
            animate="show" 
            transition={{ delay: 0.2 }}
            className="h-full"
          >
            <Card className="glass-card overflow-hidden shadow-2xl border-white/5 h-full flex flex-col bg-black/20 backdrop-blur-xl">
              <div className="h-1 bg-gradient-to-r from-primary via-orange-400 to-primary w-full shadow-[0_0_10px_rgba(255,102,0,0.5)]" />
              <CardHeader className="pb-0 border-b border-white/5 bg-zinc-950/30 shrink-0">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-4">
                  <div>
                    <CardTitle className="text-3xl flex items-center gap-3 text-white drop-shadow-md font-display">
                      <Shield className="w-8 h-8 text-primary filter drop-shadow-[0_0_5px_rgba(255,102,0,0.5)]" />
                      {userRole === "guest" ? "ВСТУПЛЕНИЕ В КЛАН" : "МОЙ ОТРЯД"}
                    </CardTitle>
                    <CardDescription className="mt-1 font-medium text-muted-foreground text-base">
                      {userRole === "guest" 
                        ? "Найдите соратников и присоединитесь к битве."
                        : "Управление вашим отрядом и личным составом."
                      }
                    </CardDescription>
                  </div>
                  {userRole === "owner" && (
                    <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 px-3 py-1">
                      Владелец Клана
                    </Badge>
                  )}
                  {userRole === "member" && (
                    <Badge variant="outline" className="border-white/10 text-muted-foreground bg-white/5 px-3 py-1">
                      Участник
                    </Badge>
                  )}
                </div>
                
                {/* TABS only for Owner */}
                {userRole === "owner" && (
                   <div className="flex items-center gap-6 border-b border-white/5 -mb-[1px]">
                      <div 
                        onClick={() => setOwnerTab("squad")}
                        className={`px-0 py-4 border-b-2 ${ownerTab === "squad" ? "border-primary text-primary shadow-[0_4px_15px_-3px_rgba(255,102,0,0.3)]" : "border-transparent text-muted-foreground hover:text-white"} font-display tracking-wide font-bold cursor-pointer transition-all`}
                      >
                        ОТРЯД
                      </div>
                      <div 
                        onClick={() => setOwnerTab("applications")}
                        className={`px-0 py-4 border-b-2 ${ownerTab === "applications" ? "border-primary text-primary shadow-[0_4px_15px_-3px_rgba(255,102,0,0.3)]" : "border-transparent text-muted-foreground hover:text-white"} font-display tracking-wide font-bold cursor-pointer transition-all flex items-center gap-2`}
                      >
                        ЗАЯВКИ 
                        {applications.length > 0 && (
                          <Badge className="bg-primary text-black h-4 px-1 text-[10px] animate-pulse">{applications.length}</Badge>
                        )}
                      </div>
                      <div 
                        onClick={() => setOwnerTab("settings")}
                        className={`px-0 py-4 border-b-2 ${ownerTab === "settings" ? "border-primary text-primary shadow-[0_4px_15px_-3px_rgba(255,102,0,0.3)]" : "border-transparent text-muted-foreground hover:text-white"} font-display tracking-wide font-bold cursor-pointer transition-all`}
                      >
                        НАСТРОЙКИ
                      </div>
                   </div>
                )}
              </CardHeader>

              <div className="p-6 md:p-8 bg-zinc-900/20 flex-1 relative">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none" />

                <AnimatePresence mode="wait">
                  
                  {/* GUEST VIEW - APPLY FOR CLAN */}
                  {userRole === "guest" && (
                    <motion.div 
                      key="guest-view"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-8"
                    >
                       {/* Visual Clan Selector */}
                       <div className="space-y-4">
                          <div className="flex items-center justify-between">
                             <Label className="text-xs uppercase text-muted-foreground font-bold tracking-wider flex items-center gap-2">
                                <Search className="w-4 h-4" />
                                Выберите Клан для вступления
                             </Label>
                             <span className="text-xs text-muted-foreground bg-zinc-900 px-2 py-1 rounded border border-white/5">{clans.length} доступно</span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                             {clans.map((clan) => {
                                // Use theme colors for "alpha" clan (owner's clan), static colors for others
                                const clanColors = clan.id === "alpha" ? getThemeColors() : {
                                  color: clan.color,
                                  bgColor: clan.bgColor,
                                  borderColor: clan.borderColor
                                };
                                
                                return (
                                <motion.div 
                                  key={clan.id}
                                  onClick={() => setSelectedClan(clan.id)}
                                  whileHover={{ scale: 1.03, y: -5 }}
                                  whileTap={{ scale: 0.98 }}
                                  className={`relative rounded-2xl border cursor-pointer transition-all duration-300 group overflow-hidden ${selectedClan === clan.id ? `${clanColors.borderColor} ring-1 ring-offset-0 ring-white/20 shadow-2xl scale-[1.02]` : "border-white/10 hover:border-white/20"}`}
                                >
                                   {/* Clan Banner Image */}
                                   <div className="h-32 relative">
                                      <img src={clan.bannerUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                      <div className={`absolute inset-0 ${selectedClan === clan.id ? "bg-black/20" : "bg-black/60 group-hover:bg-black/40"} transition-colors duration-300`} />
                                      
                                      {/* Clan Logo - Positioned absolutely but rendered visually on top */}
                                      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 z-20">
                                        <motion.div 
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: 0.2 }}
                                            className="w-16 h-16 rounded-xl border-4 border-zinc-900 bg-zinc-900/90 flex items-center justify-center shadow-lg overflow-hidden p-1"
                                        >
                                           <img src={clan.logoUrl} className="w-full h-full object-contain" />
                                        </motion.div>
                                      </div>
                                   </div>
                                   
                                   <div className="pt-12 pb-6 px-5 bg-zinc-950/80 backdrop-blur-sm relative z-10">
                                      {selectedClan === clan.id && (
                                        <div className="absolute top-4 right-4 animate-in zoom-in duration-300">
                                            <CheckCircle2 className={`w-5 h-5 ${clanColors.color}`} />
                                        </div>
                                      )}

                                      <div className="text-center space-y-2">
                                         <h4 className={`font-black text-white text-lg uppercase tracking-tight group-hover:text-white/90 ${clanColors.color}`}>{clan.name}</h4>
                                         <div className="flex items-center justify-center gap-2">
                                           <Badge variant="outline" className="border-white/10 bg-white/5 text-[10px] px-1.5 h-5">{clan.tag}</Badge>
                                           <span className="text-[10px] text-muted-foreground font-bold flex items-center gap-1">
                                             <Users className="w-3 h-3" />
                                             {clan.members}
                                           </span>
                                         </div>
                                      </div>
                                      
                                      <Separator className={`bg-white/5 my-4 ${selectedClan === clan.id ? "opacity-50" : ""}`} />
                                      
                                      <div className="space-y-3">
                                        <p className="text-xs text-muted-foreground text-center line-clamp-2 min-h-[32px] leading-relaxed px-1">
                                          {clan.description}
                                        </p>
                                        <div className="flex justify-center pt-1">
                                           <Badge variant="outline" className={`text-[10px] h-6 px-2 border-white/10 ${clanColors.color} bg-black/40 backdrop-blur-md`}>
                                             {clan.id === "alpha" ? getRequirementsBadge() : clan.req}
                                           </Badge>
                                        </div>
                                      </div>
                                   </div>
                                </motion.div>
                                );
                             })}
                          </div>
                       </div>

                       {/* Requirements & Form */}
                       <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-4 border-t border-white/5">
                          <div className="md:col-span-4 space-y-4">
                             <div className={`rounded-2xl p-6 border backdrop-blur-sm ${getThemeColors().bgColor} ${getThemeColors().borderColor} shadow-lg`}>
                                <h4 className={`font-display font-bold text-xl mb-4 flex items-center gap-2 ${getThemeColors().color}`}>
                                   <AlertCircle className="w-6 h-6" />
                                   Требования
                                </h4>
                                <ul className="space-y-4">
                                   {selectedClanData?.requirements?.microphone && (
                                     <li className="flex items-start gap-3 text-sm text-white/90">
                                        <div className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 opacity-80 bg-current ${getThemeColors().color}`} />
                                        <span className="leading-relaxed">Наличие микрофона и Discord</span>
                                     </li>
                                   )}
                                   {/* Support both old (ageRestriction) and new (age) formats */}
                                   {(selectedClanData?.requirements?.ageRestriction || selectedClanData?.requirements?.age) && (
                                     <li className="flex items-start gap-3 text-sm text-white/90">
                                        <div className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 opacity-80 bg-current ${getThemeColors().color}`} />
                                        <span className="leading-relaxed">Возраст {selectedClanData.requirements.age || '18'}+</span>
                                     </li>
                                   )}
                                   {/* Support both old (customRequirement) and new (experience) formats */}
                                   {selectedClanData?.requirements?.customRequirement && (
                                     <li className="flex items-start gap-3 text-sm text-white/90">
                                        <div className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 opacity-80 bg-current ${getThemeColors().color}`} />
                                        <span className="leading-relaxed">{selectedClanData.requirements.customRequirement}</span>
                                     </li>
                                   )}
                                   {selectedClanData?.requirements?.experience && (
                                     <li className="flex items-start gap-3 text-sm text-white/90">
                                        <div className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 opacity-80 bg-current ${getThemeColors().color}`} />
                                        <span className="leading-relaxed">{selectedClanData.requirements.experience}</span>
                                     </li>
                                   )}
                                   {selectedClanData?.requirements?.custom?.map((req, index) => (
                                     <li key={index} className="flex items-start gap-3 text-sm text-white/90">
                                        <div className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 opacity-80 bg-current ${getThemeColors().color}`} />
                                        <span className="leading-relaxed">{req}</span>
                                     </li>
                                   ))}
                                </ul>
                             </div>
                             
                             {/* Discord Join Button for Guests */}
                             <Button 
                               className="w-full bg-[#5865F2] hover:bg-[#5865F2]/90 text-white font-bold font-display tracking-wide shadow-lg h-12 gap-2 hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                               onClick={() => {
                                 if (hasDiscordLink) {
                                   window.open(discordUrl, '_blank', 'noopener,noreferrer');
                                 } else {
                                   toast({
                                     variant: "destructive",
                                     title: "Ошибка",
                                     description: "Ссылка на Discord не настроена для этого клана",
                                   });
                                 }
                               }}
                               disabled={!hasDiscordLink}
                               data-testid="button-join-discord"
                             >
                                <svg className="w-5 h-5" viewBox="0 0 127.14 96.36" fill="white">
                                  <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z"/>
                                </svg>
                                Вступить в Discord
                             </Button>
                          </div>

                          <div className="md:col-span-8 space-y-4">
                             <div className="space-y-2">
                               <Label className="text-xs uppercase text-muted-foreground font-bold tracking-wider pl-1">Сопроводительное письмо</Label>
                               <div className="relative">
                                 <textarea 
                                   value={applicationMessage}
                                   onChange={(e) => setApplicationMessage(e.target.value.slice(0, 500))}
                                   className="flex min-h-[220px] w-full rounded-2xl border border-white/10 bg-zinc-950/30 px-6 py-5 text-sm ring-offset-background placeholder:text-muted-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 resize-none hover:border-white/20 transition-all backdrop-blur-md text-white/90 leading-relaxed shadow-inner"
                                   placeholder={`Привет! Я хочу вступить в ${clans.find(c => c.id === selectedClan)?.name} потому что...`}
                                   data-testid="textarea-application-message"
                                 />
                                 <div className="absolute bottom-4 right-4 text-[10px] text-muted-foreground font-mono">
                                   {applicationMessage.length} / 500
                                 </div>
                               </div>
                             </div>
                             <div className="flex justify-end pt-2">
                               <MagneticButton 
                                 size="lg" 
                                 className={`w-full md:w-auto bg-white text-black font-black font-display tracking-wider hover:bg-zinc-200 shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all hover:scale-105 hover:-translate-y-1 h-14 px-8 text-lg border-none disabled:opacity-50 disabled:cursor-not-allowed`}
                                 onClick={() => {
                                   if (!selectedClan) {
                                     toast({
                                       variant: "destructive",
                                       title: "Выберите клан",
                                       description: "Сначала выберите клан из списка",
                                     });
                                     return;
                                   }
                                   if (!applicationMessage.trim()) {
                                     toast({
                                       variant: "destructive",
                                       title: "Заполните сопроводительное письмо",
                                       description: "Напишите несколько слов о себе",
                                     });
                                     return;
                                   }
                                   submitApplicationMutation.mutate({
                                     clanId: selectedClan,
                                     message: applicationMessage
                                   });
                                 }}
                                 disabled={submitApplicationMutation.isPending || !selectedClan || !applicationMessage.trim()}
                                 data-testid="button-submit-application"
                               >
                                 {submitApplicationMutation.isPending ? (
                                   <>
                                     <Loader2 className="w-5 h-5 animate-spin inline-block mr-2" />
                                     ОТПРАВКА...
                                   </>
                                 ) : (
                                   'ОТПРАВИТЬ ЗАЯВКУ'
                                 )}
                               </MagneticButton>
                             </div>
                          </div>
                       </div>
                    </motion.div>
                  )}

                  {/* OWNER - SETTINGS VIEW */}
                  {userRole === "owner" && ownerTab === "settings" && (
                    <motion.div 
                      key="settings-view"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-8 max-w-3xl mx-auto"
                    >
                      <div className="text-center mb-8">
                         <h3 className="text-2xl font-display font-bold text-white">Настройки Клана</h3>
                         <p className="text-muted-foreground mt-2">Управляйте внешним видом и информацией о вашем отряде.</p>
                      </div>

                      {/* Visual Settings */}
                      <div className="space-y-6 bg-black/20 p-6 rounded-2xl border border-white/5">
                         <div className="flex items-center gap-3 mb-4">
                            <ImageIcon className="w-5 h-5 text-primary" />
                            <h4 className="font-bold text-white text-lg">Визуальное оформление</h4>
                         </div>
                         
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Banner Upload */}
                            <div className="space-y-3">
                               <Label className="text-xs uppercase font-bold text-muted-foreground">Баннер Отряда</Label>
                               <input
                                 type="file"
                                 id="banner-upload"
                                 accept="image/*"
                                 onChange={handleUploadBanner}
                                 className="hidden"
                                 disabled={uploadingBanner}
                               />
                               <label 
                                 htmlFor="banner-upload" 
                                 className="relative h-40 rounded-xl overflow-hidden border border-white/10 group cursor-pointer block"
                               >
                                  {clanBanner ? (
                                    <img src={clanBanner} className="w-full h-full object-cover transition-transform group-hover:scale-105" alt="Clan banner" />
                                  ) : (
                                    <div className="w-full h-full bg-zinc-900/50 flex items-center justify-center">
                                      <ImageIcon className="w-12 h-12 text-muted-foreground" />
                                    </div>
                                  )}
                                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                     {uploadingBanner ? (
                                       <Loader2 className="w-8 h-8 text-white animate-spin" />
                                     ) : (
                                       <Camera className="w-8 h-8 text-white" />
                                     )}
                                  </div>
                               </label>
                               <p className="text-[10px] text-muted-foreground">Рекомендуемый размер: 1920x1080px (16:9)</p>
                            </div>

                            {/* Logo Upload */}
                            <div className="space-y-3">
                               <Label className="text-xs uppercase font-bold text-muted-foreground">Логотип Отряда</Label>
                               <input
                                 type="file"
                                 id="logo-upload"
                                 accept="image/*"
                                 onChange={handleUploadLogo}
                                 className="hidden"
                                 disabled={uploadingLogo}
                               />
                               <div className="flex items-center gap-4">
                                  <label htmlFor="logo-upload" className="w-24 h-24 rounded-xl border border-white/10 overflow-hidden group cursor-pointer relative block bg-zinc-900/50 p-2">
                                     {clanLogo ? (
                                       <img src={clanLogo} className="w-full h-full object-contain" alt="Clan logo" />
                                     ) : (
                                       <div className="w-full h-full flex items-center justify-center">
                                         <ImageIcon className="w-8 h-8 text-muted-foreground" />
                                       </div>
                                     )}
                                     <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        {uploadingLogo ? (
                                          <Loader2 className="w-6 h-6 text-white animate-spin" />
                                        ) : (
                                          <Camera className="w-6 h-6 text-white" />
                                        )}
                                     </div>
                                  </label>
                                  <div className="flex-1">
                                     <Button 
                                       variant="outline" 
                                       size="sm" 
                                       className="w-full border-white/10 mb-2"
                                       onClick={() => document.getElementById('logo-upload').click()}
                                       disabled={uploadingLogo}
                                       data-testid="button-upload-logo"
                                     >
                                       {uploadingLogo ? (
                                         <>
                                           <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                           Загрузка...
                                         </>
                                       ) : (
                                         'Загрузить'
                                       )}
                                     </Button>
                                     <p className="text-[10px] text-muted-foreground">Квадратное изображение, мин. 512x512px</p>
                                  </div>
                               </div>
                            </div>
                         </div>
                      </div>

                      {/* Discord Settings */}
                      <div className="space-y-6 bg-black/20 p-6 rounded-2xl border border-white/5">
                         <div className="flex items-center gap-3 mb-4">
                            <LinkIcon className="w-5 h-5 text-primary" />
                            <h4 className="font-bold text-white text-lg">Discord Интеграция</h4>
                         </div>
                         
                         <div className="grid gap-4">
                            <div className="grid gap-2">
                               <Label>Ссылка на Discord (Embed/Invite)</Label>
                               <div className="relative">
                                  <div className="absolute left-3 top-2.5 text-[#5865F2]">
                                     <img src={discordLogo} className="w-5 h-5 brightness-0 invert" />
                                  </div>
                                  <Input 
                                     value={discordLink}
                                     onChange={(e) => setDiscordLink(e.target.value)}
                                     className="bg-black/20 border-white/10 pl-10 font-mono text-sm text-blue-400" 
                                     placeholder="https://discord.gg/..."
                                  />
                               </div>
                               <p className="text-[10px] text-muted-foreground">Эта ссылка будет использоваться для кнопки вступления в Discord.</p>
                            </div>
                         </div>
                      </div>

                      {/* Requirements & Theme Settings */}
                      <div className="space-y-6 bg-black/20 p-6 rounded-2xl border border-white/5">
                         <div className="flex items-center gap-3 mb-4">
                            <AlertCircle className="w-5 h-5 text-primary" />
                            <h4 className="font-bold text-white text-lg">Дополнительные требования</h4>
                         </div>
                         
                         <div className="grid gap-4">
                            <div className="space-y-3">
                               <Label className="text-xs uppercase font-bold text-muted-foreground">Условия для вступления</Label>
                               <div className="space-y-2">
                                  <div className="flex items-center gap-3 p-3 rounded-lg bg-black/20 border border-white/10">
                                     <input 
                                       type="checkbox" 
                                       checked={clanRequirements.microphone}
                                       onChange={(e) => setClanRequirements({...clanRequirements, microphone: e.target.checked})}
                                       className="w-4 h-4 rounded border-white/20 bg-black/20 text-primary focus:ring-primary focus:ring-offset-0" 
                                       id="req-mic" 
                                     />
                                     <Label htmlFor="req-mic" className="flex-1 cursor-pointer text-sm">Наличие микрофона и Discord</Label>
                                  </div>
                                  <div className="flex items-center gap-3 p-3 rounded-lg bg-black/20 border border-white/10">
                                     <input 
                                       type="checkbox" 
                                       checked={clanRequirements.ageRestriction}
                                       onChange={(e) => setClanRequirements({...clanRequirements, ageRestriction: e.target.checked})}
                                       className="w-4 h-4 rounded border-white/20 bg-black/20 text-primary focus:ring-primary focus:ring-offset-0" 
                                       id="req-age" 
                                     />
                                     <Label htmlFor="req-age" className="flex-1 cursor-pointer text-sm">Возраст 18+</Label>
                                  </div>
                                  <div className="flex items-center gap-3 p-3 rounded-lg bg-black/20 border border-white/10">
                                     <Input 
                                       placeholder="Добавить своё требование..." 
                                       value={clanRequirements.customRequirement}
                                       onChange={(e) => setClanRequirements({...clanRequirements, customRequirement: e.target.value})}
                                       className="flex-1 bg-transparent border-none p-0 h-auto focus-visible:ring-0 text-sm" 
                                     />
                                  </div>
                               </div>
                            </div>
                            
                            <div className="grid gap-2 pt-2">
                               <Label className="text-xs uppercase font-bold text-muted-foreground">Цветовая тема клана</Label>
                               <div className="grid grid-cols-3 gap-3">
                                  <div 
                                    onClick={() => setClanTheme("orange")}
                                    className={`flex items-center gap-2 p-3 rounded-lg bg-black/20 border cursor-pointer hover:bg-black/30 transition-colors ${clanTheme === "orange" ? "border-primary/30 ring-1 ring-primary/20" : "border-white/10"}`}
                                  >
                                     <div className="w-6 h-6 rounded-full bg-primary border-2 border-white/20" />
                                     <span className="text-xs font-bold text-primary">Оранжевый</span>
                                  </div>
                                  <div 
                                    onClick={() => setClanTheme("blue")}
                                    className={`flex items-center gap-2 p-3 rounded-lg bg-black/20 border cursor-pointer hover:bg-black/30 transition-colors ${clanTheme === "blue" ? "border-blue-500/30 ring-1 ring-blue-500/20" : "border-white/10"}`}
                                  >
                                     <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-white/20" />
                                     <span className="text-xs font-bold text-blue-500">Синий</span>
                                  </div>
                                  <div 
                                    onClick={() => setClanTheme("yellow")}
                                    className={`flex items-center gap-2 p-3 rounded-lg bg-black/20 border cursor-pointer hover:bg-black/30 transition-colors ${clanTheme === "yellow" ? "border-yellow-500/30 ring-1 ring-yellow-500/20" : "border-white/10"}`}
                                  >
                                     <div className="w-6 h-6 rounded-full bg-yellow-500 border-2 border-white/20" />
                                     <span className="text-xs font-bold text-yellow-500">Золотой</span>
                                  </div>
                               </div>
                               <p className="text-[10px] text-muted-foreground mt-1">Цвет будет использоваться для акцентов на карточке клана и в интерфейсе.</p>
                            </div>
                         </div>
                      </div>

                      {/* General Info Settings */}
                      <div className="space-y-6 bg-black/20 p-6 rounded-2xl border border-white/5">
                         <div className="flex items-center gap-3 mb-4">
                            <Edit className="w-5 h-5 text-primary" />
                            <h4 className="font-bold text-white text-lg">Информация</h4>
                         </div>

                         <div className="grid gap-4">
                            <div className="grid gap-2">
                               <Label>Название Отряда</Label>
                               <Input 
                                 value={clanData?.name || ''} 
                                 readOnly
                                 className="bg-black/20 border-white/10 opacity-70 cursor-not-allowed"
                                 data-testid="input-clan-name" 
                               />
                               <p className="text-xs text-muted-foreground">Название клана можно изменить только через администратора</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                               <div className="grid gap-2">
                                  <Label>Тег Клана</Label>
                                  <Input 
                                    value={clanData?.tag || ''} 
                                    readOnly
                                    className="bg-black/20 border-white/10 opacity-70 cursor-not-allowed"
                                    data-testid="input-clan-tag"
                                  />
                               </div>
                               <div className="grid gap-2">
                                  <Label>Максимум участников</Label>
                                  <Input 
                                    value={clanData?.maxMembers || 0}
                                    readOnly 
                                    className="bg-black/20 border-white/10 opacity-70 cursor-not-allowed"
                                    data-testid="input-clan-max-members"
                                  />
                               </div>
                            </div>
                            <div className="grid gap-2">
                               <Label>Описание</Label>
                               <textarea 
                                 value={clanData?.description || ''} 
                                 readOnly
                                 className="flex min-h-[100px] w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none opacity-70 cursor-not-allowed" 
                               />
                               <p className="text-xs text-muted-foreground">Описание клана можно изменить только через администратора</p>
                            </div>
                         </div>
                      </div>

                      <div className="flex justify-end gap-4">
                         <Button variant="ghost" className="text-muted-foreground hover:text-white">Отмена</Button>
                         <Button 
                          className="bg-primary text-black font-bold hover:bg-primary/90"
                          onClick={handleSaveSettings}
                          disabled={updateClanMutation.isPending}
                          data-testid="button-save-clan-settings"
                        >
                          {updateClanMutation.isPending ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Сохранение...
                            </>
                          ) : (
                            'Сохранить изменения'
                          )}
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {/* OWNER - APPLICATIONS VIEW */}
                  {userRole === "owner" && ownerTab === "applications" && (
                    <motion.div 
                      key="applications-view"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6"
                    >
                      <h3 className="text-xl font-display font-bold text-white flex items-center gap-3 mb-6">
                        <Users className="w-6 h-6 text-primary" />
                        Заявки на вступление
                        <Badge variant="outline" className="border-white/10 bg-white/5 ml-auto font-mono">Всего: {applications.length}</Badge>
                      </h3>

                      {applications.length === 0 ? (
                         <div className="flex flex-col items-center justify-center py-20 text-center">
                           <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center border border-white/5 mb-4">
                             <Users className="w-10 h-10 text-muted-foreground" />
                           </div>
                           <h4 className="text-lg font-bold text-white">Нет новых заявок</h4>
                           <p className="text-muted-foreground">В данный момент никто не подавал заявку в ваш отряд.</p>
                         </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-4">
                          {applications.map((app) => (
                            <div key={app.id} onClick={() => setSelectedMemberStats(app)} className="cursor-pointer group relative bg-zinc-900/40 border border-white/5 rounded-2xl p-6 overflow-hidden hover:bg-zinc-900/60 transition-all duration-300">
                              <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-50 group-hover:opacity-100 transition-opacity" />
                              
                              <div className="flex flex-col lg:flex-row gap-6 lg:items-center justify-between relative z-10">
                                <div className="flex items-start gap-4">
                                  <Avatar className="w-16 h-16 border-2 border-white/10 shadow-lg group-hover:scale-105 transition-transform">
                                    <AvatarFallback className="bg-zinc-800 font-bold text-xl">{app.avatar}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h4 className="text-xl font-bold text-white group-hover:text-primary transition-colors">{app.name}</h4>
                                      <span className="text-xs text-muted-foreground bg-zinc-900 px-2 py-0.5 rounded border border-white/5">{app.time}</span>
                                    </div>
                                    <div className="flex items-center gap-4 mt-2 text-sm">
                                      <div className="flex items-center gap-1.5 text-zinc-400">
                                        <Clock className="w-4 h-4 text-primary" />
                                        <span className="font-mono text-white">{app.stats.hours}</span>
                                      </div>
                                      <div className="flex items-center gap-1.5 text-zinc-400">
                                        <Target className="w-4 h-4 text-rose-500" />
                                        <span className="font-mono text-white">K/D {app.stats.kd}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="flex-1 lg:mx-8 p-4 bg-black/20 rounded-xl border border-white/5">
                                  <p className="text-sm text-zinc-300 italic">"{app.message}"</p>
                                </div>

                                <div className="flex items-center gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
                                  <Button onClick={() => handleAcceptApp(app.id)} className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-black border border-emerald-500/20 hover:border-emerald-500 transition-all font-bold gap-2">
                                    <Check className="w-4 h-4" />
                                    Принять
                                  </Button>
                                  <Button onClick={() => handleRejectApp(app.id)} variant="outline" className="border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white bg-red-500/5 hover:border-red-500 transition-all font-bold gap-2">
                                    <X className="w-4 h-4" />
                                    Отклонить
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}


                  {/* MEMBER & OWNER (SQUAD) VIEW */}
                  {((userRole === "member") || (userRole === "owner" && ownerTab === "squad")) && (
                    <motion.div 
                      key="squad-view"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex flex-col md:flex-row gap-8 h-full"
                    >
                      {/* Clan Stats Card - Left Side */}
                      <div className="w-full md:w-80 shrink-0 space-y-4">
                          <div className="bg-gradient-to-b from-zinc-800 to-zinc-950 border border-white/10 rounded-2xl p-6 relative overflow-hidden shadow-2xl group hover:border-primary/30 transition-all duration-500">
                              <div className="absolute top-0 right-0 p-24 bg-primary/10 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/20 transition-colors duration-700" />
                              <div className="absolute inset-0 bg-scanline opacity-10" />
                              
                              {/* Clan Logo & Banner in Stats Card */}
                              <div className="flex items-start justify-between mb-8 relative z-10">
                                  <div className="w-20 h-20 bg-gradient-to-br from-zinc-800 to-black rounded-xl border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.5)] overflow-hidden group-hover:scale-105 transition-transform duration-300 p-2">
                                      {clanData?.logoUrl ? (
                                        <img src={clanData.logoUrl} className="w-full h-full object-contain" alt="Clan Logo" />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center text-primary text-2xl font-bold">
                                          {clanData?.tag || '?'}
                                        </div>
                                      )}
                                  </div>
                                  <Badge className="bg-black/60 backdrop-blur-md text-primary border border-primary/30 font-mono text-sm px-3 py-1 shadow-[0_0_10px_rgba(255,102,0,0.2)]">
                                    LVL {clanData?.level || 1}
                                  </Badge>
                              </div>
                              
                              <div className="relative z-10 mb-8">
                                <h3 className="text-3xl font-display font-black text-white mb-1 tracking-tight">
                                  {!currentClanId ? 'Нет клана' : clanLoading ? 'Загрузка...' : (clanData?.name || 'Ошибка загрузки')}
                                </h3>
                                <p className="text-xs text-primary font-bold tracking-[0.2em] uppercase">
                                  {clanData?.description || 'Клан'}
                                </p>
                              </div>
                              
                              <div className="space-y-2 relative z-10">
                                  <div className="flex justify-between items-center text-sm p-3 bg-black/40 rounded-lg border border-white/5 hover:border-white/10 transition-colors">
                                      <span className="text-muted-foreground flex items-center gap-2 font-medium"><Users className="w-4 h-4 text-zinc-500"/> Всего бойцов</span>
                                      <span className="font-mono font-bold text-white">{squadMembers.length} / {clanData?.maxMembers || 50}</span>
                                  </div>
                                  <div className="flex justify-between items-center text-sm p-3 bg-black/40 rounded-lg border border-white/5 hover:border-white/10 transition-colors">
                                      <span className="text-muted-foreground flex items-center gap-2 font-medium"><div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"/> В строю</span>
                                      <span className="font-mono font-bold text-emerald-500">
                                        {squadMembers.filter(m => m.status === 'В СЕТИ' || m.status === 'В ИГРЕ').length}
                                      </span>
                                  </div>
                                  <div className="flex justify-between items-center text-sm p-3 bg-black/40 rounded-lg border border-white/5 hover:border-white/10 transition-colors">
                                      <span className="text-muted-foreground flex items-center gap-2 font-medium"><Trophy className="w-4 h-4 text-yellow-500"/> Винрейт</span>
                                      <span className="font-mono font-bold text-yellow-500">
                                        {clanData?.winrate ? `${Math.round(clanData.winrate)}%` : 'N/A'}
                                      </span>
                                  </div>
                              </div>
                          </div>
                          
                          {userRole === "owner" ? (
                             <div /> 
                          ) : (
                             <Button variant="destructive" className="w-full font-bold font-display tracking-wide h-12 shadow-lg border-none bg-red-500/10 hover:bg-red-500/20 text-red-500 border-red-500/20">
                                 <LogOut className="w-4 h-4 mr-2" />
                                 Покинуть Клан
                             </Button>
                          )}
                      </div>

                      {/* Squad List */}
                      <div className="flex-1">
                          <div className="flex items-center justify-between mb-6">
                              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                  <Swords className="w-4 h-4" />
                                  Активный Состав
                              </h3>
                              <div className="flex items-center gap-2">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-8 text-xs font-mono bg-zinc-900 border-white/10 text-muted-foreground hover:text-white">
                                      <ListFilter className="w-3 h-3 mr-2" />
                                      {sortBy === "default" ? "Сортировка" : 
                                       sortBy === "kd" ? "По K/D" : 
                                       sortBy === "hours" ? "По Часам" : 
                                       sortBy === "winrate" ? "По Винрейту" : 
                                       sortBy === "kills" ? "По Убийствам" : "Сортировка"}
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="bg-zinc-900 border-white/10">
                                    <DropdownMenuLabel className="text-xs text-muted-foreground">Сортировать по</DropdownMenuLabel>
                                    <DropdownMenuSeparator className="bg-white/10" />
                                    <DropdownMenuItem onClick={() => setSortBy("default")} className="text-white hover:bg-white/10 cursor-pointer text-xs">По Умолчанию</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setSortBy("kd")} className="text-white hover:bg-white/10 cursor-pointer text-xs">K/D Ratio</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setSortBy("hours")} className="text-white hover:bg-white/10 cursor-pointer text-xs">Часы в игре</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setSortBy("winrate")} className="text-white hover:bg-white/10 cursor-pointer text-xs">Винрейт</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setSortBy("kills")} className="text-white hover:bg-white/10 cursor-pointer text-xs">Убийства</DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                                <span className="text-xs font-mono bg-zinc-800 px-3 py-1.5 rounded border border-white/5 text-muted-foreground font-bold">
                                  {squadMembers.length} / {clanData?.clan?.maxMembers || 50}
                                </span>
                              </div>
                          </div>

                          <div className="space-y-3">
                              {/* Members including owner */}
                              <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
                                {getSortedMembers().map((member, i) => {
                                  const isOwner = member.role === 'Лидер';
                                  
                                  if (isOwner) {
                                    // Render owner with special styling
                                    return (
                                      <motion.div 
                                        key={member.id}
                                        whileHover={{ scale: 1.01 }}
                                        className="flex items-center justify-between p-4 bg-zinc-900/80 border border-primary/30 rounded-xl group hover:bg-zinc-800 hover:border-primary/50 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.2)] relative overflow-hidden cursor-pointer"
                                      >
                                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary shadow-[0_0_10px_rgba(255,102,0,0.5)]" />
                                          <div className="flex items-center gap-5 pl-2">
                                              <div className="relative">
                                                  <Avatar className="h-14 w-14 border-2 border-primary shadow-[0_0_15px_rgba(255,102,0,0.3)]">
                                                      <AvatarFallback className="bg-primary text-black font-bold">{member.avatar}</AvatarFallback>
                                                  </Avatar>
                                                  <div className="absolute -top-2 -right-2 bg-zinc-900 rounded-full p-1.5 border border-yellow-500/30 shadow-lg">
                                                      <Crown className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                                  </div>
                                              </div>
                                              <div>
                                                  <div className="flex items-center gap-2">
                                                      <h4 className="font-bold text-white text-xl group-hover:text-primary transition-colors">{member.name}</h4>
                                                      <Badge variant="outline" className="text-[10px] h-5 px-1.5 border-yellow-500/50 text-yellow-500 bg-yellow-500/10 shadow-[0_0_5px_rgba(234,179,8,0.2)]">VIP</Badge>
                                                  </div>
                                                  <div className="flex items-center gap-3 text-xs mt-1">
                                                      <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 rounded-sm px-1.5 py-0.5 uppercase font-bold tracking-wider">Лидер</Badge>
                                                      <span className="w-1 h-1 rounded-full bg-zinc-700" />
                                                      <span className={`${member.statusColor} font-medium flex items-center gap-1`}>
                                                         <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                         {member.status}
                                                      </span>
                                                  </div>
                                              </div>
                                          </div>
                                          {userRole === "owner" && (
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button size="icon" variant="ghost" className="h-10 w-10 text-muted-foreground hover:text-white hover:bg-white/5"><Settings className="w-5 h-5" /></Button>
                                            </div>
                                          )}
                                      </motion.div>
                                    );
                                  }
                                  
                                  // Render regular members
                                  return (
                                    <Dialog key={member.id} open={selectedMemberStats?.id === member.id} onOpenChange={(open) => !open && setSelectedMemberStats(null)}>
                                      <DialogTrigger asChild>
                                        <motion.div 
                                            variants={item}
                                            onClick={() => setSelectedMemberStats(member)} 
                                            className={`flex items-center justify-between p-3 bg-zinc-900/40 border border-white/5 rounded-xl group hover:bg-zinc-900/80 hover:border-white/10 transition-all cursor-pointer hover:shadow-lg hover:shadow-black/50`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <Avatar className="h-10 w-10 border border-white/10 group-hover:border-white/30 transition-colors">
                                                    <AvatarFallback className="bg-zinc-800 text-zinc-400 font-bold">{member.avatar}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-bold text-white text-base">{member.name}</h4>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs mt-1">
                                                        <Badge variant="outline" className={`rounded-sm px-1.5 py-0 h-5 uppercase font-bold tracking-wider border ${member.roleColor}`}>{member.role}</Badge>
                                                        <span className="w-1 h-1 rounded-full bg-zinc-700" />
                                                        <span className={`${member.statusColor} font-medium`}>{member.status}</span>
                                                    </div>
                                                    {sortBy !== "default" && (
                                                       <div className="text-[10px] text-muted-foreground mt-1 font-mono">
                                                          {sortBy === "kd" && `K/D: ${member.stats.kd}`}
                                                          {sortBy === "hours" && `${member.stats.hours}`}
                                                          {sortBy === "winrate" && `Win: ${member.stats.winrate}%`}
                                                          {sortBy === "kills" && `Kills: ${member.stats.kills}`}
                                                       </div>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            {/* Owner Actions Dropdown - Stop propagation to avoid opening stats modal when clicking settings */}
                                            {userRole === "owner" && (
                                              <div className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                                                <DropdownMenu>
                                                  <DropdownMenuTrigger asChild>
                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-white hover:bg-white/5">
                                                      <Settings className="w-4 h-4" />
                                                    </Button>
                                                  </DropdownMenuTrigger>
                                                  <DropdownMenuContent align="end" className="bg-zinc-900 border-white/10">
                                                    <DropdownMenuSub>
                                                      <DropdownMenuSubTrigger className="text-white hover:bg-white/10 cursor-pointer">
                                                        <User className="w-4 h-4 mr-2" /> Изменить роль
                                                      </DropdownMenuSubTrigger>
                                                      <DropdownMenuSubContent className="bg-zinc-900 border-white/10">
                                                        <DropdownMenuRadioGroup value={member.role} onValueChange={(val) => handleRoleChange(member.id, val)}>
                                                          <DropdownMenuRadioItem value="Офицер" className="cursor-pointer text-orange-400 focus:text-orange-400">Офицер</DropdownMenuRadioItem>
                                                          <DropdownMenuRadioItem value="Боец" className="cursor-pointer text-white focus:text-white">Боец</DropdownMenuRadioItem>
                                                          <DropdownMenuRadioItem value="Рекрут" className="cursor-pointer text-emerald-500 focus:text-emerald-500">Рекрут</DropdownMenuRadioItem>
                                                        </DropdownMenuRadioGroup>
                                                      </DropdownMenuSubContent>
                                                    </DropdownMenuSub>
                                                    <DropdownMenuItem className="text-red-500 hover:bg-red-500/10 cursor-pointer focus:text-red-500 focus:bg-red-500/10">
                                                      <Trash2 className="w-4 h-4 mr-2" /> Исключить
                                                    </DropdownMenuItem>
                                                  </DropdownMenuContent>
                                                </DropdownMenu>
                                              </div>
                                            )}
                                        </motion.div>
                                      </DialogTrigger>
                                    </Dialog>
                                  );
                                })}
                              </motion.div>
                              
                              {userRole === "owner" && (
                                <Button variant="outline" className="w-full border-dashed border-white/10 hover:border-white/30 hover:bg-white/5 text-muted-foreground h-12">
                                  <Plus className="w-4 h-4 mr-2" />
                                  Пригласить Игрока
                                </Button>
                              )}
                          </div>
                      </div>
                    </motion.div>
                  )}
                  
                </AnimatePresence>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
