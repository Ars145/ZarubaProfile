import { motion } from "framer-motion";
import { Trophy, Target, Clock, Shield, Swords, Users, ChevronRight, CheckCircle2, AlertCircle, Crosshair, Skull, X, Crown, Star, User, Trash2, Plus, Settings, LogOut, Search, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import discordLogo from "@assets/image_1763634265865.png";
import profileBg from "@assets/generated_images/dark_tactical_abstract_gaming_background.png";
import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function ProfilePage() {
  const [selectedClan, setSelectedClan] = useState("alpha");

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
      glow: "shadow-primary/20"
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
      glow: "shadow-blue-500/20"
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
      glow: "shadow-yellow-500/20"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 relative">
      
      {/* Header / Identity Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mb-12 rounded-3xl overflow-hidden border border-white/10 shadow-2xl"
      >
        {/* Dynamic Banner Background */}
        <div className="absolute inset-0 h-64 md:h-72 z-0">
           <img src={profileBg} className="w-full h-full object-cover opacity-60 mix-blend-overlay" />
           <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
           <div className="absolute inset-0 bg-scanline opacity-20" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-end gap-8 pt-24 px-6 md:px-10 pb-8">
          <div className="relative group">
            <div className="w-32 h-32 md:w-48 md:h-48 rounded-2xl overflow-hidden border-4 border-background/50 backdrop-blur-sm shadow-[0_0_40px_rgba(255,102,0,0.2)] group-hover:shadow-[0_0_60px_rgba(255,102,0,0.4)] transition-all duration-500 bg-zinc-900">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=TacticalViper" alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-background p-1.5 rounded-full">
              <Badge className="bg-primary text-black hover:bg-primary/90 border-4 border-background px-4 py-1.5 text-lg font-black font-display shadow-lg whitespace-nowrap flex items-center gap-2">
                <Crown className="w-4 h-4 fill-black" />
                LVL 52
              </Badge>
            </div>
          </div>

          <div className="flex-1 space-y-4 mb-2">
            <div className="flex flex-wrap items-center gap-4">
              <h1 className="text-5xl md:text-7xl font-black text-white font-display tracking-tighter uppercase drop-shadow-2xl shadow-black">
                TacticalViper
              </h1>
              <Badge variant="outline" className="border-primary text-primary bg-primary/10 px-3 py-1 text-xs font-bold tracking-widest uppercase backdrop-blur-md">
                VIP Account
              </Badge>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-muted-foreground">
              <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/5">
                 <Progress value={68} className="w-24 h-2 bg-white/10" />
                 <span className="text-xs font-mono text-white">XP: 68%</span>
              </div>

              <span className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/5">
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
             <Button variant="outline" className="flex-1 md:flex-none h-12 border-white/10 hover:border-white/20 hover:bg-white/5 text-white bg-zinc-900/50 backdrop-blur-sm hover-glow">
               <Settings className="w-5 h-5 mr-2" />
               Настройки
             </Button>
             <Button variant="ghost" size="icon" className="h-12 w-12 border border-white/10 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 bg-zinc-900/50 backdrop-blur-sm">
                <LogOut className="w-5 h-5" />
             </Button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column - Stats & Info */}
        <div className="lg:col-span-4 space-y-6">
          
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
              <Card key={i} className={`bg-zinc-900/40 border-white/5 backdrop-blur-md hover:bg-zinc-900/60 transition-all group overflow-hidden relative hover:-translate-y-1 duration-300 border ${stat.border}`}>
                <div className={`absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-${stat.color.split('-')[1]}-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <CardContent className="p-5 flex flex-col items-center text-center relative z-10">
                  <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} mb-3 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-lg`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <span className="text-3xl font-black font-display text-white tracking-wide drop-shadow-md">{stat.value}</span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-1 opacity-70 group-hover:opacity-100 transition-opacity">{stat.label}</span>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          {/* Discord Integration Card */}
          <motion.div variants={item} initial="hidden" animate="show">
            <Card className="bg-[#5865F2] border-none overflow-hidden relative group hover:shadow-[0_0_30px_rgba(88,101,242,0.4)] transition-shadow duration-500">
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
                <Button className="w-full bg-white text-[#5865F2] hover:bg-white/90 font-bold font-display tracking-wide shadow-lg border-none h-11">
                  ОБНОВИТЬ ПРИВЯЗКУ
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right Column - Clan & Applications */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Clan Dashboard */}
          <motion.div variants={item} initial="hidden" animate="show">
            <Card className="glass-card overflow-hidden shadow-2xl border-white/5">
              <div className="h-1 bg-gradient-to-r from-primary via-orange-400 to-primary w-full shadow-[0_0_10px_rgba(255,102,0,0.5)]" />
              <CardHeader className="pb-0 border-b border-white/5 bg-zinc-950/30">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-4">
                  <div>
                    <CardTitle className="text-3xl flex items-center gap-3 text-white drop-shadow-md">
                      <Shield className="w-8 h-8 text-primary filter drop-shadow-[0_0_5px_rgba(255,102,0,0.5)]" />
                      УПРАВЛЕНИЕ КЛАНОМ
                    </CardTitle>
                    <CardDescription className="mt-1 font-medium text-muted-foreground text-base">
                      Центр управления вашим отрядом и личным составом.
                    </CardDescription>
                  </div>
                </div>
                
                <Tabs defaultValue="clan" className="w-full">
                  <TabsList className="w-full justify-start bg-transparent p-0 h-auto gap-8 border-b border-white/5">
                    <TabsTrigger 
                      value="clan" 
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-[0_0_15px_rgba(255,102,0,0.3)] px-0 py-4 font-display tracking-wide text-muted-foreground hover:text-white transition-all text-lg"
                    >
                      КЛАН
                    </TabsTrigger>
                    <TabsTrigger 
                      value="apply" 
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-[0_0_15px_rgba(255,102,0,0.3)] px-0 py-4 font-display tracking-wide text-muted-foreground hover:text-white transition-all text-lg"
                    >
                      ПОДАТЬ ЗАЯВКУ
                    </TabsTrigger>
                  </TabsList>

                  <div className="p-6 md:p-8 bg-zinc-900/20 min-h-[500px] relative">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none" />
                    
                    {/* CLAN TAB */}
                    <TabsContent value="clan" className="mt-0 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="flex flex-col md:flex-row gap-8">
                            {/* Clan Stats Card */}
                            <div className="w-full md:w-80 shrink-0 space-y-4">
                                <div className="bg-gradient-to-b from-zinc-800 to-zinc-950 border border-white/10 rounded-2xl p-6 relative overflow-hidden shadow-2xl group hover:border-primary/30 transition-all duration-500">
                                    <div className="absolute top-0 right-0 p-24 bg-primary/10 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/20 transition-colors duration-700" />
                                    <div className="absolute inset-0 bg-scanline opacity-10" />
                                    
                                    <div className="flex items-start justify-between mb-8 relative z-10">
                                        <div className="p-4 bg-gradient-to-br from-primary to-orange-600 rounded-xl shadow-[0_0_20px_rgba(255,102,0,0.4)] text-white transform group-hover:scale-105 transition-transform duration-300 border border-white/10">
                                            <Crown className="w-8 h-8" />
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
                                
                                <Button className="w-full bg-white text-black hover:bg-zinc-200 font-bold font-display tracking-wide h-12 shadow-lg hover-glow border-none">
                                    <Users className="w-4 h-4 mr-2" />
                                    Управление Составом
                                </Button>
                            </div>

                            {/* Squad List */}
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                        <Swords className="w-4 h-4" />
                                        Активный Состав
                                    </h3>
                                    <span className="text-xs font-mono bg-zinc-800 px-3 py-1.5 rounded border border-white/5 text-muted-foreground font-bold">5 / 50</span>
                                </div>

                                <div className="space-y-3">
                                    {/* Leader */}
                                    <div className="flex items-center justify-between p-4 bg-zinc-900/80 border border-primary/30 rounded-xl group hover:bg-zinc-800 hover:border-primary/50 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.2)] relative overflow-hidden">
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
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button size="icon" variant="ghost" className="h-10 w-10 text-muted-foreground hover:text-white hover:bg-white/5"><Settings className="w-5 h-5" /></Button>
                                        </div>
                                    </div>

                                    {/* Members Loop */}
                                    {[
                                        { name: 'TacticalViper', role: 'Офицер', status: 'В ИГРЕ', statusColor: 'text-blue-400', roleColor: 'text-orange-400 border-orange-400/20 bg-orange-400/10', avatar: 'TV' },
                                        { name: 'SniperWolf', role: 'Боец', status: 'НЕ В СЕТИ', statusColor: 'text-zinc-500', roleColor: 'text-muted-foreground border-white/10 bg-white/5', avatar: 'SW' },
                                        { name: 'MedicMain', role: 'Боец', status: 'В СЕТИ', statusColor: 'text-emerald-500', roleColor: 'text-muted-foreground border-white/10 bg-white/5', avatar: 'MM' }
                                    ].map((member, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-zinc-900/40 border border-white/5 rounded-xl group hover:bg-zinc-900/80 hover:border-white/10 transition-all">
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
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-white hover:bg-white/5"><Settings className="w-4 h-4" /></Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Apply Form */}
                    <TabsContent value="apply" className="mt-0 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                       <div className="space-y-8 pt-4">
                          
                          {/* Visual Clan Selector */}
                          <div className="space-y-4">
                             <div className="flex items-center justify-between">
                                <Label className="text-xs uppercase text-muted-foreground font-bold tracking-wider flex items-center gap-2">
                                   <Search className="w-4 h-4" />
                                   Выберите Клан для вступления
                                </Label>
                                <span className="text-xs text-muted-foreground bg-zinc-900 px-2 py-1 rounded border border-white/5">{clans.length} доступно</span>
                             </div>

                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {clans.map((clan) => (
                                   <div 
                                     key={clan.id}
                                     onClick={() => setSelectedClan(clan.id)}
                                     className={`relative p-5 rounded-2xl border cursor-pointer transition-all duration-300 hover:scale-[1.02] group ${selectedClan === clan.id ? `${clan.bgColor} ${clan.borderColor} ${clan.glow} ring-1 ring-offset-0 ring-white/20 shadow-lg` : "bg-zinc-950/50 border-white/10 hover:border-white/20 hover:bg-zinc-900"}`}
                                   >
                                      {selectedClan === clan.id && (
                                        <div className="absolute top-4 right-4 animate-in zoom-in duration-300">
                                          <div className="relative">
                                            <div className={`absolute inset-0 ${clan.color} blur-sm opacity-50`} />
                                            <CheckCircle2 className={`w-6 h-6 ${clan.color} relative z-10`} />
                                          </div>
                                        </div>
                                      )}
                                      
                                      <div className="space-y-4">
                                         <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg border border-white/10 bg-black/40 ${clan.color} shadow-inner`}>
                                              {clan.tag}
                                            </div>
                                            <div>
                                              <h4 className="font-bold text-white leading-tight text-lg group-hover:text-white/90">{clan.name}</h4>
                                              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold flex items-center gap-1 mt-0.5">
                                                <Users className="w-3 h-3" />
                                                {clan.members} бойцов
                                              </span>
                                            </div>
                                         </div>
                                         
                                         <Separator className={`bg-white/5 ${selectedClan === clan.id ? "opacity-50" : ""}`} />
                                         
                                         <div className="space-y-2">
                                           <p className="text-xs text-muted-foreground line-clamp-2 h-8 leading-relaxed group-hover:text-muted-foreground/80">
                                             {clan.description}
                                           </p>
                                           <div className="flex items-center gap-2 pt-2">
                                              <Badge variant="outline" className={`text-[10px] h-6 border-white/10 ${clan.color} bg-black/40 backdrop-blur-md`}>
                                                {clan.req}
                                              </Badge>
                                           </div>
                                         </div>
                                      </div>
                                   </div>
                                ))}
                             </div>
                          </div>

                          {/* Requirements & Form based on selection */}
                          <motion.div 
                            key={selectedClan}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="grid grid-cols-1 md:grid-cols-12 gap-8"
                          >
                             {/* Requirements Panel */}
                             <div className="md:col-span-4 space-y-4">
                                <div className={`rounded-2xl p-6 border backdrop-blur-sm ${clans.find(c => c.id === selectedClan)?.bgColor} ${clans.find(c => c.id === selectedClan)?.borderColor} shadow-lg`}>
                                   <h4 className={`font-display font-bold text-xl mb-4 flex items-center gap-2 ${clans.find(c => c.id === selectedClan)?.color}`}>
                                      <AlertCircle className="w-6 h-6" />
                                      Требования
                                   </h4>
                                   <ul className="space-y-4">
                                      <li className="flex items-start gap-3 text-sm text-white/90">
                                         <div className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 opacity-80 bg-current ${clans.find(c => c.id === selectedClan)?.color}`} />
                                         <span className="leading-relaxed">Наличие микрофона и Discord обязательно для координации</span>
                                      </li>
                                      <li className="flex items-start gap-3 text-sm text-white/90">
                                         <div className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 opacity-80 bg-current ${clans.find(c => c.id === selectedClan)?.color}`} />
                                         <span className="leading-relaxed">Возраст 18+ (возможны исключения для адекватных)</span>
                                      </li>
                                      <li className="flex items-start gap-3 text-sm text-white/90">
                                         <div className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 opacity-80 bg-current ${clans.find(c => c.id === selectedClan)?.color}`} />
                                         <span className="leading-relaxed">Адекватность и умение играть в команде</span>
                                      </li>
                                      <li className="flex items-center gap-3 text-sm font-bold text-white pt-4 border-t border-white/10 mt-2">
                                         <div className="p-1 rounded-full bg-emerald-500/20">
                                           <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                         </div>
                                         Вы подходите под требования
                                      </li>
                                   </ul>
                                </div>
                             </div>

                             {/* Comment Form */}
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
                                  <Button size="lg" className={`w-full md:w-auto bg-white text-black font-black font-display tracking-wider hover:bg-zinc-200 shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all hover:scale-105 hover:-translate-y-1 h-14 px-8 text-lg border-none`}>
                                    ОТПРАВИТЬ ЗАЯВКУ В {clans.find(c => c.id === selectedClan)?.tag}
                                  </Button>
                                </div>
                             </div>
                          </motion.div>
                       </div>
                    </TabsContent>
                  </div>
                </Tabs>
              </CardHeader>
            </Card>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
