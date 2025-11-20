import { motion, AnimatePresence, useMotionValue, useTransform, useSpring, useAnimation } from "framer-motion";
import { Trophy, Target, Clock, Shield, Swords, Users, ChevronRight, CheckCircle2, AlertCircle, Crosshair, Skull, X, Crown, Star, User, Trash2, Plus, Settings, LogOut, Search, Zap, Medal, ChevronDown, UserPlus, UserMinus, MessageSquare, Edit, Camera, Play, Plane, Car, ThumbsUp, ThumbsDown, Percent, Swords as Gun, Check, XCircle, ArrowUpDown, ListFilter, Image as ImageIcon, Link as LinkIcon, Radar, Activity } from "lucide-react";
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
import { Radar as RadarChart, RadarChart as RechartsRadar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import discordLogo from "@assets/image_1763634265865.png";
import profileBg from "@assets/generated_images/dark_tactical_abstract_gaming_background.png";
import { useState, useRef, useEffect } from "react";

// Squad Stats Components
import { useSquadStats } from "@/hooks/useSquadStats";
import { SquadStatsCompact } from "@/components/squad-stats-compact";

// Generated Assets
import alphaBanner from "@assets/generated_images/dark_tactical_gaming_clan_banner_with_alpha_squad_theme.png";
import deltaBanner from "@assets/generated_images/blue_tactical_gaming_clan_banner_with_delta_force_theme.png";
import eliteBanner from "@assets/generated_images/yellow_tactical_gaming_clan_banner_with_elite_theme.png";
import wolfLogo from "@assets/generated_images/tactical_wolf_logo_for_clan.png";
import eagleLogo from "@assets/generated_images/tactical_eagle_logo_for_clan.png";
import skullLogo from "@assets/generated_images/tactical_skull_logo_for_clan.png";

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

// --- Skill Radar Chart Data ---
const skillData = [
  { subject: 'Стрельба', A: 120, fullMark: 150 },
  { subject: 'Тактика', A: 98, fullMark: 150 },
  { subject: 'Вождение', A: 86, fullMark: 150 },
  { subject: 'Лидерство', A: 99, fullMark: 150 },
  { subject: 'Коммуникация', A: 85, fullMark: 150 },
  { subject: 'Выживание', A: 65, fullMark: 150 },
];

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

export default function ProfilePage() {
  const [userRole, setUserRole] = useState("guest"); // Default to guest for demo
  const [selectedClan, setSelectedClan] = useState("alpha");
  const [isVip, setIsVip] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [username, setUsername] = useState("TacticalViper");
  const [avatarUrl, setAvatarUrl] = useState("https://api.dicebear.com/7.x/avataaars/svg?seed=TacticalViper");
  
  // Squad Stats Integration
  const squadStats = useSquadStats('STEAM_0:1:12345678');
  
  // Owner specific state
  const [ownerTab, setOwnerTab] = useState("squad");
  const [selectedMemberStats, setSelectedMemberStats] = useState(null);
  const [sortBy, setSortBy] = useState("default");
  
  // Clan Assets State (Owner Settings)
  const [clanBanner, setClanBanner] = useState(alphaBanner);
  const [clanLogo, setClanLogo] = useState(wolfLogo);
  const [discordLink, setDiscordLink] = useState("https://discord.gg/clan-alpha");

  // Mock data for squad members with roles
  const [squadMembers, setSquadMembers] = useState([
    { id: 1, name: 'TacticalViper', role: 'Офицер', status: 'В ИГРЕ', statusColor: 'text-blue-400', roleColor: 'text-orange-400 border-orange-400/20 bg-orange-400/10', avatar: 'TV', stats: { games: 178, hours: '6д 20ч', sl: '4д 7ч', driver: '2ч', pilot: '0', cmd: '21ч', likes: 82, tk: 39, winrate: 49, kills: 282, deaths: 908, kd: 0.31, wins: 88, avgKills: 1, vehicleKills: 9, knifeKills: 0 } },
    { id: 2, name: 'SniperWolf', role: 'Боец', status: 'НЕ В СЕТИ', statusColor: 'text-zinc-500', roleColor: 'text-muted-foreground border-white/10 bg-white/5', avatar: 'SW', stats: { games: 450, hours: '12д 5ч', sl: '1д 2ч', driver: '10ч', pilot: '50ч', cmd: '0ч', likes: 150, tk: 12, winrate: 55, kills: 1205, deaths: 800, kd: 1.5, wins: 247, avgKills: 3, vehicleKills: 45, knifeKills: 12 } },
    { id: 3, name: 'MedicMain', role: 'Рекрут', status: 'В СЕТИ', statusColor: 'text-emerald-500', roleColor: 'text-emerald-500/70 border-emerald-500/20 bg-emerald-500/5', avatar: 'MM', stats: { games: 42, hours: '1д 8ч', sl: '0ч', driver: '5ч', pilot: '0ч', cmd: '0ч', likes: 24, tk: 2, winrate: 42, kills: 89, deaths: 150, kd: 0.59, wins: 18, avgKills: 2, vehicleKills: 0, knifeKills: 1 } }
  ]);

  // Mock applications with full stats
  const [applications, setApplications] = useState([
    { 
      id: 101, 
      name: "Rookie_One", 
      role: "Кандидат",
      avatar: "R1",
      message: "Хочу в крутой клан, играю каждый день!", 
      time: "2ч назад",
      stats: { games: 50, hours: '5д 0ч', sl: '0ч', driver: '10ч', pilot: '0ч', cmd: '0ч', likes: 5, tk: 0, winrate: 45, kills: 150, deaths: 130, kd: 1.1, wins: 22, avgKills: 3, vehicleKills: 10, knifeKills: 0 }
    },
    { 
      id: 102, 
      name: "Tank_Master", 
      role: "Кандидат",
      avatar: "TM",
      message: "Ищу стак для игры на технике. Мейн мехвод.", 
      time: "5ч назад",
      stats: { games: 300, hours: '35д 10ч', sl: '0ч', driver: '200ч', pilot: '0ч', cmd: '0ч', likes: 100, tk: 5, winrate: 60, kills: 2400, deaths: 1000, kd: 2.4, wins: 180, avgKills: 8, vehicleKills: 1500, knifeKills: 10 }
    },
    { 
      id: 103, 
      name: "Silent_Bob", 
      role: "Кандидат",
      avatar: "SB",
      message: "Возьмите пж", 
      time: "1д назад",
      stats: { games: 20, hours: '1д 21ч', sl: '0ч', driver: '0ч', pilot: '0ч', cmd: '0ч', likes: 2, tk: 0, winrate: 35, kills: 40, deaths: 50, kd: 0.8, wins: 7, avgKills: 2, vehicleKills: 0, knifeKills: 0 }
    },
  ]);

  const handleRoleChange = (memberId, newRole) => {
    setSquadMembers(prev => prev.map(member => {
      if (member.id === memberId) {
        let roleColor = '';
        if (newRole === 'Офицер') roleColor = 'text-orange-400 border-orange-400/20 bg-orange-400/10';
        else if (newRole === 'Боец') roleColor = 'text-muted-foreground border-white/10 bg-white/5';
        else roleColor = 'text-emerald-500/70 border-emerald-500/20 bg-emerald-500/5'; // Recruit
        
        return { ...member, role: newRole, roleColor };
      }
      return member;
    }));
  };

  const handleRejectApp = (id) => {
    setApplications(prev => prev.filter(app => app.id !== id));
  };

  const handleAcceptApp = (id) => {
    const app = applications.find(a => a.id === id);
    if (app) {
        setSquadMembers(prev => [...prev, {
            id: Date.now(),
            name: app.name,
            role: 'Рекрут',
            status: 'НЕ В СЕТИ',
            statusColor: 'text-zinc-500',
            roleColor: 'text-emerald-500/70 border-emerald-500/20 bg-emerald-500/5',
            avatar: app.avatar,
            stats: app.stats
        }]);
        setApplications(prev => prev.filter(a => a.id !== id));
    }
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

  const clans = [
    { 
      id: "alpha", 
      name: "Отряд Альфа", 
      tag: "ALPHA", 
      members: 5, 
      req: "100ч+, KD > 1.0",
      description: "Элитный отряд для опытных игроков. Только командная игра.",
      color: "text-primary",
      bgColor: "bg-primary/10",
      borderColor: "border-primary/30",
      glow: "shadow-primary/20",
      banner: alphaBanner,
      logo: wolfLogo
    },
    { 
      id: "df", 
      name: "Delta Force", 
      tag: "DF", 
      members: 12, 
      req: "50ч+, Микрофон",
      description: "Тактический отряд специального назначения.",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/30",
      glow: "shadow-blue-500/20",
      banner: deltaBanner,
      logo: eagleLogo
    },
    { 
      id: "ze", 
      name: "Zaruba Elite", 
      tag: "ZE", 
      members: 24, 
      req: "500ч+, KD > 2.0",
      description: "Только для ветеранов сервера.",
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
      borderColor: "border-yellow-500/30",
      glow: "shadow-yellow-500/20",
      banner: eliteBanner,
      logo: skullLogo
    }
  ];

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
      <div className="fixed top-24 right-4 z-50 bg-black/80 backdrop-blur border border-white/10 p-2 rounded-lg space-y-2">
        <p className="text-[10px] text-muted-foreground mb-1 font-mono">DEMO MODE: ROLE SWITCHER</p>
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" variant={userRole === "guest" ? "default" : "outline"} onClick={() => setUserRole("guest")} className="h-6 text-[10px]">Guest</Button>
          <Button size="sm" variant={userRole === "member" ? "default" : "outline"} onClick={() => setUserRole("member")} className="h-6 text-[10px]">Member</Button>
          <Button size="sm" variant={userRole === "owner" ? "default" : "outline"} onClick={() => setUserRole("owner")} className="h-6 text-[10px]">Owner</Button>
        </div>
        <div className="flex items-center gap-2 mt-2">
           <label className="text-[10px] text-white cursor-pointer flex items-center gap-2 select-none">
             <input type="checkbox" checked={isVip} onChange={(e) => setIsVip(e.target.checked)} />
             Toggle VIP Status
           </label>
        </div>
      </div>

      {/* Header / Identity Section */}
      <TiltCard className="relative mb-12 rounded-3xl overflow-hidden border border-white/10 shadow-2xl group perspective-1000">
        {/* Dynamic Banner Background */}
        <div className="absolute inset-0 h-64 md:h-72 z-0">
           <img src={profileBg} className="w-full h-full object-cover opacity-60 mix-blend-overlay" />
           <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
           <div className="absolute inset-0 bg-scanline opacity-20" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-end gap-8 pt-24 px-6 md:px-10 pb-8">
          <motion.div 
            className="relative group cursor-pointer"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="w-32 h-32 md:w-48 md:h-48 rounded-2xl overflow-hidden border-4 border-background/50 backdrop-blur-sm shadow-[0_0_40px_rgba(255,102,0,0.2)] group-hover:shadow-[0_0_60px_rgba(255,102,0,0.6)] transition-all duration-500 bg-zinc-900 relative z-10">
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              {/* Scanner Effect */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/20 to-transparent h-[20%] w-full animate-scanline pointer-events-none z-20" />
            </div>
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-background p-1.5 rounded-full z-20">
              <Badge className="bg-primary text-black hover:bg-primary/90 border-4 border-background px-4 py-1.5 text-lg font-black font-display shadow-lg whitespace-nowrap flex items-center gap-2">
                <Crown className="w-4 h-4 fill-black" />
                LVL 52
              </Badge>
            </div>
          </motion.div>

          <div className="flex-1 space-y-4 mb-2">
            <div className="flex flex-wrap items-center gap-4">
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-5xl md:text-7xl font-black text-white font-display tracking-tighter uppercase drop-shadow-2xl shadow-black"
              >
                <GlitchText text={username} />
              </motion.h1>
              
              {isVip && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    <Badge variant="outline" className="border-primary text-primary bg-primary/10 px-3 py-1 text-xs font-bold tracking-widest uppercase backdrop-blur-md animate-pulse shadow-[0_0_15px_rgba(255,102,0,0.4)]">
                    VIP Account
                    </Badge>
                </motion.div>
              )}
              
              {userRole !== "guest" && (
                 <Badge variant="outline" className="border-white/20 text-white bg-white/5 px-3 py-1 text-xs font-bold tracking-widest uppercase backdrop-blur-md flex items-center gap-2">
                   <Shield className="w-3 h-3" />
                   ALPHA MEMBER
                 </Badge>
              )}
            </div>
            
            <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-muted-foreground">
              <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/5 hover:bg-white/5 transition-colors cursor-pointer group">
                 <div className="flex flex-col gap-1">
                    <div className="flex justify-between w-24 text-[10px] font-mono uppercase text-white/50 group-hover:text-primary/80 transition-colors">
                        <span>XP</span>
                        <span>68%</span>
                    </div>
                    <Progress value={68} className="w-24 h-1.5 bg-white/10 group-hover:bg-white/20" indicatorClassName="bg-primary group-hover:shadow-[0_0_10px_rgba(255,102,0,0.5)] transition-all" />
                 </div>
              </div>

              <span className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/5 hover:border-primary/30 transition-colors cursor-pointer">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Steam_icon_logo.svg/512px-Steam_icon_logo.svg.png" className="w-4 h-4 opacity-70" />
                <span className="font-mono text-white/70">STEAM_0:1:12345678</span>
              </span>
              <span className="flex items-center gap-2 text-emerald-400 bg-emerald-500/5 px-3 py-1.5 rounded-full border border-emerald-500/10 backdrop-blur-md shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Online
              </span>
            </div>
          </div>

          <div className="flex gap-3 w-full md:w-auto mt-6 md:mt-0">
             <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
               <DialogTrigger asChild>
                 <MagneticButton variant="outline" className="flex-1 md:flex-none h-12 border-white/10 hover:border-white/20 hover:bg-white/5 text-white bg-zinc-900/50 backdrop-blur-sm hover-glow transition-all duration-300">
                   <Settings className="w-5 h-5 mr-2" />
                   Настройки
                 </MagneticButton>
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
                   <Button type="submit" className="bg-primary text-black font-bold hover:bg-primary/90" onClick={() => setIsSettingsOpen(false)}>Сохранить изменения</Button>
                 </DialogFooter>
               </DialogContent>
             </Dialog>
             
             <MagneticButton variant="ghost" size="icon" className="h-12 w-12 border border-white/10 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 bg-zinc-900/50 backdrop-blur-sm transition-all duration-300">
                <LogOut className="w-5 h-5" />
             </MagneticButton>
          </div>
        </div>
      </TiltCard>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column - Stats & Info */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Radar Chart - Skills Analysis */}
          <motion.div variants={container} initial="hidden" animate="show" className="hidden md:block">
            <Card className="bg-zinc-900/40 border-white/5 backdrop-blur-md overflow-hidden relative">
                <CardHeader className="pb-0">
                   <CardTitle className="text-lg font-display flex items-center gap-2">
                      <Activity className="w-5 h-5 text-primary" />
                      Анализ Навыков
                   </CardTitle>
                </CardHeader>
                <div className="h-64 w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <RechartsRadar cx="50%" cy="50%" outerRadius="70%" data={skillData}>
                            <PolarGrid stroke="rgba(255,255,255,0.1)" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                            <RechartsRadar name="Skill" dataKey="A" stroke="#FF6600" strokeWidth={2} fill="#FF6600" fillOpacity={0.2} />
                            <RechartsTooltip 
                                contentStyle={{ backgroundColor: '#09090b', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }}
                                itemStyle={{ color: '#FF6600' }}
                            />
                        </RechartsRadar>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 bg-gradient-radial from-transparent to-zinc-900/20 pointer-events-none" />
                </div>
            </Card>
          </motion.div>

          {/* Stats Grid */}
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 gap-4"
          >
            {[
              { label: "Убийств", value: "1,245", icon: Crosshair, color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20" },
              { label: "Смертей", value: "892", icon: Skull, color: "text-zinc-400", bg: "bg-zinc-500/10", border: "border-zinc-500/20" },
              { label: "K/D Ratio", value: "1.42", icon: Target, color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
              { label: "В Игре", value: "342ч", icon: Clock, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
            ].map((stat, i) => (
              <motion.div variants={item} key={i}>
                  <Card className={`bg-zinc-900/40 border-white/5 backdrop-blur-md hover:bg-zinc-900/60 transition-all group overflow-hidden relative hover:-translate-y-1 duration-300 border ${stat.border} h-full`}>
                    <div className={`absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-${stat.color.split('-')[1]}-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                    <CardContent className="p-5 flex flex-col items-center text-center relative z-10">
                      <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} mb-3 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500 shadow-lg`}>
                        <stat.icon className="w-6 h-6" />
                      </div>
                      <span className="text-3xl font-black font-display text-white tracking-wide drop-shadow-md"><AnimatedCounter value={stat.value}/></span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-1 opacity-70 group-hover:opacity-100 transition-opacity">{stat.label}</span>
                    </CardContent>
                  </Card>
              </motion.div>
            ))}
          </motion.div>
          
          {/* Achievements Section (New Idea) */}
          <motion.div variants={item} initial="hidden" animate="show" transition={{ delay: 0.4 }}>
             <Card className="bg-zinc-900/40 border-white/5 backdrop-blur-md overflow-hidden group hover:border-white/10 transition-colors">
                <CardHeader>
                   <CardTitle className="text-lg font-display flex items-center gap-2">
                      <Medal className="w-5 h-5 text-yellow-500" />
                      Достижения
                   </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                   {achievements.map((ach, i) => (
                      <motion.div 
                        key={i} 
                        className="flex items-center gap-4 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-default"
                        whileHover={{ x: 5 }}
                      >
                         <div className={`p-2 rounded-lg bg-zinc-900 border border-white/10 ${ach.color} shadow-inner`}>
                            <ach.icon className="w-5 h-5" />
                         </div>
                         <div>
                            <h4 className="font-bold text-sm text-white">{ach.name}</h4>
                            <p className="text-xs text-muted-foreground">{ach.desc}</p>
                         </div>
                      </motion.div>
                   ))}
                   <Button variant="link" className="w-full text-muted-foreground text-xs uppercase tracking-widest h-auto p-0 mt-2 hover:text-white">Показать все</Button>
                </CardContent>
             </Card>
          </motion.div>

          {/* Discord Integration Card */}
          <motion.div variants={item} initial="hidden" animate="show" transition={{ delay: 0.6 }}>
            <Card className="bg-[#5865F2] border-none overflow-hidden relative group hover:shadow-[0_0_30px_rgba(88,101,242,0.4)] transition-shadow duration-500 cursor-pointer transform hover:scale-[1.02] duration-300">
              <div className="absolute inset-0 bg-[url('https://assets-global.website-files.com/6257adef93867e56f84d3109/636e0a6918e57475a843f59f_layer_1.svg')] opacity-10 bg-repeat" />
              <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-colors duration-500 animate-pulse" />
              
              <CardHeader className="relative z-10 pb-2">
                <CardTitle className="flex items-center gap-3 text-white font-display text-xl">
                  <img src={discordLogo} className="w-8 h-8 brightness-0 invert drop-shadow-lg" alt="Discord" />
                  Discord Связь
                </CardTitle>
              </CardHeader>
              
              <CardContent className="relative z-10 space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-black/20 backdrop-blur-sm border border-white/10 group-hover:bg-black/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="w-12 h-12 border-2 border-white/20 shadow-lg">
                        <AvatarImage src="https://github.com/shadcn.png" />
                        <AvatarFallback>DS</AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 bg-[#5865F2] rounded-full p-1 border-2 border-white/10 shadow-md">
                        <CheckCircle2 className="w-3 h-3 text-white" />
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white">TacticalViper#9999</span>
                      <span className="text-[10px] text-white/80 uppercase tracking-wider font-bold flex items-center gap-1">
                        <Zap className="w-3 h-3 text-yellow-300 fill-yellow-300" />
                        Подтверждено
                      </span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="text-white/50 hover:text-white hover:bg-white/10 rounded-full">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <Button className="w-full bg-white text-[#5865F2] hover:bg-white/90 font-bold font-display tracking-wide shadow-lg border-none h-11 group-hover:scale-[1.02] transition-transform">
                  ОБНОВИТЬ ПРИВЯЗКУ
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Squad Stats Section - Компактная версия */}
          {squadStats && (
            <motion.div variants={item} initial="hidden" animate="show" transition={{ delay: 0.8 }}>
              <SquadStatsCompact stats={squadStats} />
            </motion.div>
          )}
        </div>

        {/* Right Column - Clan Management */}
        <div className="lg:col-span-8">
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
                             {clans.map((clan) => (
                                <motion.div 
                                  key={clan.id}
                                  onClick={() => setSelectedClan(clan.id)}
                                  whileHover={{ scale: 1.03, y: -5 }}
                                  whileTap={{ scale: 0.98 }}
                                  className={`relative rounded-2xl border cursor-pointer transition-all duration-300 group overflow-hidden ${selectedClan === clan.id ? `${clan.borderColor} ring-1 ring-offset-0 ring-white/20 shadow-2xl scale-[1.02]` : "border-white/10 hover:border-white/20"}`}
                                >
                                   {/* Clan Banner Image */}
                                   <div className="h-32 relative">
                                      <img src={clan.banner} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                      <div className={`absolute inset-0 ${selectedClan === clan.id ? "bg-black/20" : "bg-black/60 group-hover:bg-black/40"} transition-colors duration-300`} />
                                      
                                      {/* Clan Logo - Positioned absolutely but rendered visually on top */}
                                      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 z-20">
                                        <motion.div 
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: 0.2 }}
                                            className={`w-16 h-16 rounded-xl border-4 border-zinc-900 ${clan.bgColor} flex items-center justify-center shadow-lg overflow-hidden`}
                                        >
                                           <img src={clan.logo} className="w-full h-full object-cover" />
                                        </motion.div>
                                      </div>
                                   </div>
                                   
                                   <div className="pt-12 pb-6 px-5 bg-zinc-950/80 backdrop-blur-sm relative z-10">
                                      {selectedClan === clan.id && (
                                        <div className="absolute top-4 right-4 animate-in zoom-in duration-300">
                                            <CheckCircle2 className={`w-5 h-5 ${clan.color}`} />
                                        </div>
                                      )}

                                      <div className="text-center space-y-2">
                                         <h4 className={`font-black text-white text-lg uppercase tracking-tight group-hover:text-white/90 ${clan.color}`}>{clan.name}</h4>
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
                                        <p className="text-xs text-muted-foreground text-center line-clamp-2 h-8 leading-relaxed">
                                          {clan.description}
                                        </p>
                                        <div className="flex justify-center">
                                           <Badge variant="outline" className={`text-[10px] h-6 border-white/10 ${clan.color} bg-black/40 backdrop-blur-md`}>
                                             {clan.req}
                                           </Badge>
                                        </div>
                                      </div>
                                   </div>
                                </motion.div>
                             ))}
                          </div>
                       </div>

                       {/* Requirements & Form */}
                       <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-4 border-t border-white/5">
                          <div className="md:col-span-4 space-y-4">
                             <div className={`rounded-2xl p-6 border backdrop-blur-sm ${clans.find(c => c.id === selectedClan)?.bgColor} ${clans.find(c => c.id === selectedClan)?.borderColor} shadow-lg`}>
                                <h4 className={`font-display font-bold text-xl mb-4 flex items-center gap-2 ${clans.find(c => c.id === selectedClan)?.color}`}>
                                   <AlertCircle className="w-6 h-6" />
                                   Требования
                                </h4>
                                <ul className="space-y-4">
                                   <li className="flex items-start gap-3 text-sm text-white/90">
                                      <div className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 opacity-80 bg-current ${clans.find(c => c.id === selectedClan)?.color}`} />
                                      <span className="leading-relaxed">Наличие микрофона и Discord</span>
                                   </li>
                                   <li className="flex items-start gap-3 text-sm text-white/90">
                                      <div className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 opacity-80 bg-current ${clans.find(c => c.id === selectedClan)?.color}`} />
                                      <span className="leading-relaxed">Возраст 18+</span>
                                   </li>
                                   <li className="flex items-center gap-3 text-sm font-bold text-white pt-4 border-t border-white/10 mt-2">
                                      <div className="p-1 rounded-full bg-emerald-500/20">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                      </div>
                                      Вы подходите под требования
                                   </li>
                                </ul>
                             </div>
                             
                             {/* Discord Join Button for Guests */}
                             <Button className="w-full bg-[#5865F2] hover:bg-[#5865F2]/90 text-white font-bold font-display tracking-wide shadow-lg h-12 gap-2 hover:scale-[1.02] transition-transform">
                                <img src={discordLogo} className="w-5 h-5 brightness-0 invert" />
                                Вступить в Discord
                             </Button>
                          </div>

                          <div className="md:col-span-8 space-y-4">
                             <div className="space-y-2">
                               <Label className="text-xs uppercase text-muted-foreground font-bold tracking-wider pl-1">Сопроводительное письмо</Label>
                               <div className="relative">
                                 <textarea 
                                   className="flex min-h-[220px] w-full rounded-2xl border border-white/10 bg-zinc-950/30 px-6 py-5 text-sm ring-offset-background placeholder:text-muted-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 resize-none hover:border-white/20 transition-all backdrop-blur-md text-white/90 leading-relaxed shadow-inner"
                                   placeholder={`Привет! Я хочу вступить в ${clans.find(c => c.id === selectedClan)?.name} потому что...`}
                                 />
                                 <div className="absolute bottom-4 right-4 text-[10px] text-muted-foreground font-mono">
                                   0 / 500
                                 </div>
                               </div>
                             </div>
                             <div className="flex justify-end pt-2">
                               <MagneticButton size="lg" className={`w-full md:w-auto bg-white text-black font-black font-display tracking-wider hover:bg-zinc-200 shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all hover:scale-105 hover:-translate-y-1 h-14 px-8 text-lg border-none`}>
                                 ОТПРАВИТЬ ЗАЯВКУ
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
                               <div className="relative h-40 rounded-xl overflow-hidden border border-white/10 group cursor-pointer">
                                  <img src={clanBanner} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                     <Camera className="w-8 h-8 text-white" />
                                  </div>
                               </div>
                               <p className="text-[10px] text-muted-foreground">Рекомендуемый размер: 1920x1080px (16:9)</p>
                            </div>

                            {/* Logo Upload */}
                            <div className="space-y-3">
                               <Label className="text-xs uppercase font-bold text-muted-foreground">Логотип Отряда</Label>
                               <div className="flex items-center gap-4">
                                  <div className="w-24 h-24 rounded-xl border border-white/10 overflow-hidden group cursor-pointer relative">
                                     <img src={clanLogo} className="w-full h-full object-cover" />
                                     <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera className="w-6 h-6 text-white" />
                                     </div>
                                  </div>
                                  <div className="flex-1">
                                     <Button variant="outline" size="sm" className="w-full border-white/10 mb-2">Загрузить</Button>
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

                      {/* General Info Settings */}
                      <div className="space-y-6 bg-black/20 p-6 rounded-2xl border border-white/5">
                         <div className="flex items-center gap-3 mb-4">
                            <Edit className="w-5 h-5 text-primary" />
                            <h4 className="font-bold text-white text-lg">Информация</h4>
                         </div>

                         <div className="grid gap-4">
                            <div className="grid gap-2">
                               <Label>Название Отряда</Label>
                               <Input defaultValue="Отряд Альфа" className="bg-black/20 border-white/10" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                               <div className="grid gap-2">
                                  <Label>Тег Клана</Label>
                                  <Input defaultValue="ALPHA" className="bg-black/20 border-white/10" />
                               </div>
                               <div className="grid gap-2">
                                  <Label>Требования</Label>
                                  <Input defaultValue="100ч+, KD > 1.0" className="bg-black/20 border-white/10" />
                               </div>
                            </div>
                            <div className="grid gap-2">
                               <Label>Описание</Label>
                               <textarea className="flex min-h-[100px] w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none" defaultValue="Элитный отряд для опытных игроков. Только командная игра." />
                            </div>
                         </div>
                      </div>

                      <div className="flex justify-end gap-4">
                         <Button variant="ghost" className="text-muted-foreground hover:text-white">Отмена</Button>
                         <Button className="bg-primary text-black font-bold hover:bg-primary/90">Сохранить изменения</Button>
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
                                  <div className="w-20 h-20 bg-gradient-to-br from-zinc-800 to-black rounded-xl border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.5)] overflow-hidden group-hover:scale-105 transition-transform duration-300">
                                      <img src={clanLogo} className="w-full h-full object-cover" />
                                  </div>
                                  <Badge className="bg-black/60 backdrop-blur-md text-primary border border-primary/30 font-mono text-sm px-3 py-1 shadow-[0_0_10px_rgba(255,102,0,0.2)]">LVL 5</Badge>
                              </div>
                              
                              <div className="relative z-10 mb-8">
                                <h3 className="text-3xl font-display font-black text-white mb-1 tracking-tight">ОТРЯД АЛЬФА</h3>
                                <p className="text-xs text-primary font-bold tracking-[0.2em] uppercase">Элитный Клан</p>
                              </div>
                              
                              <div className="space-y-2 relative z-10">
                                  <div className="flex justify-between items-center text-sm p-3 bg-black/40 rounded-lg border border-white/5 hover:border-white/10 transition-colors">
                                      <span className="text-muted-foreground flex items-center gap-2 font-medium"><Users className="w-4 h-4 text-zinc-500"/> Всего бойцов</span>
                                      <span className="font-mono font-bold text-white">5</span>
                                  </div>
                                  <div className="flex justify-between items-center text-sm p-3 bg-black/40 rounded-lg border border-white/5 hover:border-white/10 transition-colors">
                                      <span className="text-muted-foreground flex items-center gap-2 font-medium"><div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"/> В строю</span>
                                      <span className="font-mono font-bold text-emerald-500">3</span>
                                  </div>
                                  <div className="flex justify-between items-center text-sm p-3 bg-black/40 rounded-lg border border-white/5 hover:border-white/10 transition-colors">
                                      <span className="text-muted-foreground flex items-center gap-2 font-medium"><Trophy className="w-4 h-4 text-yellow-500"/> Винрейт</span>
                                      <span className="font-mono font-bold text-yellow-500">68%</span>
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
                                <span className="text-xs font-mono bg-zinc-800 px-3 py-1.5 rounded border border-white/5 text-muted-foreground font-bold">5 / 50</span>
                              </div>
                          </div>

                          <div className="space-y-3">
                              {/* Commander */}
                              <motion.div 
                                whileHover={{ scale: 1.01 }}
                                className="flex items-center justify-between p-4 bg-zinc-900/80 border border-primary/30 rounded-xl group hover:bg-zinc-800 hover:border-primary/50 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.2)] relative overflow-hidden cursor-pointer"
                              >
                                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary shadow-[0_0_10px_rgba(255,102,0,0.5)]" />
                                  <div className="flex items-center gap-5 pl-2">
                                      <div className="relative">
                                          <Avatar className="h-14 w-14 border-2 border-primary shadow-[0_0_15px_rgba(255,102,0,0.3)]">
                                              <AvatarFallback className="bg-primary text-black font-bold">CX</AvatarFallback>
                                          </Avatar>
                                          <div className="absolute -top-2 -right-2 bg-zinc-900 rounded-full p-1.5 border border-yellow-500/30 shadow-lg">
                                              <Crown className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                          </div>
                                      </div>
                                      <div>
                                          <div className="flex items-center gap-2">
                                              <h4 className="font-bold text-white text-xl group-hover:text-primary transition-colors">CommanderX</h4>
                                              <Badge variant="outline" className="text-[10px] h-5 px-1.5 border-yellow-500/50 text-yellow-500 bg-yellow-500/10 shadow-[0_0_5px_rgba(234,179,8,0.2)]">VIP</Badge>
                                          </div>
                                          <div className="flex items-center gap-3 text-xs mt-1">
                                              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 rounded-sm px-1.5 py-0.5 uppercase font-bold tracking-wider">Лидер</Badge>
                                              <span className="w-1 h-1 rounded-full bg-zinc-700" />
                                              <span className="text-emerald-500 font-medium flex items-center gap-1">
                                                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                 В СЕТИ
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

                              {/* Members */}
                              <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
                                {getSortedMembers().map((member, i) => (
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
                                ))}
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
