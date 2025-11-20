import { motion } from "framer-motion";
import { Trophy, Target, Clock, Shield, Swords, Users, ChevronRight, CheckCircle2, AlertCircle, Crosshair, Skull, X, Crown, Star, User, Trash2, Plus, Settings, LogOut } from "lucide-react";
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
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      
      {/* Header / Identity Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mb-12"
      >
        {/* Banner Background */}
        <div className="absolute inset-0 h-48 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl -z-10 border border-white/5" />
        
        <div className="flex flex-col md:flex-row items-start md:items-end gap-8 pt-12 px-6 md:px-10 pb-6">
          <div className="relative group">
            <div className="w-32 h-32 md:w-44 md:h-44 rounded-2xl overflow-hidden border-4 border-background shadow-[0_0_40px_rgba(255,102,0,0.2)] group-hover:shadow-[0_0_60px_rgba(255,102,0,0.4)] transition-all duration-500 bg-zinc-900">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=TacticalViper" alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-background p-1.5 rounded-full">
              <Badge className="bg-primary text-black hover:bg-primary/90 border-4 border-background px-4 py-1.5 text-sm font-black font-display shadow-lg whitespace-nowrap">
                LVL 52
              </Badge>
            </div>
          </div>

          <div className="flex-1 space-y-3 mb-2">
            <div className="flex flex-wrap items-center gap-4">
              <h1 className="text-4xl md:text-6xl font-black text-white font-display tracking-tighter uppercase drop-shadow-lg">
                TacticalViper
              </h1>
              <Badge variant="outline" className="border-primary text-primary bg-primary/10 px-3 py-1 text-xs font-bold tracking-widest uppercase">
                VIP Account
              </Badge>
            </div>
            
            <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-muted-foreground">
              <span className="flex items-center gap-2 bg-zinc-900/50 px-3 py-1.5 rounded-full border border-white/5">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Steam_icon_logo.svg/512px-Steam_icon_logo.svg.png" className="w-4 h-4 opacity-70" />
                <span className="font-mono">STEAM_0:1:12345678</span>
              </span>
              <span className="flex items-center gap-2 text-emerald-500 bg-emerald-500/5 px-3 py-1.5 rounded-full border border-emerald-500/10">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Online
              </span>
            </div>
          </div>

          <div className="flex gap-3 w-full md:w-auto mt-6 md:mt-0">
             <Button variant="outline" className="flex-1 md:flex-none h-12 border-white/10 hover:border-white/20 hover:bg-white/5 text-white bg-zinc-900/50 backdrop-blur-sm">
               <Settings className="w-5 h-5 mr-2" />
               Настройки
             </Button>
             <Button variant="ghost" size="icon" className="h-12 w-12 border border-white/10 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20">
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
              { label: "Убийств", value: "1,245", icon: Crosshair, color: "text-rose-500", bg: "bg-rose-500/10" },
              { label: "Смертей", value: "892", icon: Skull, color: "text-zinc-400", bg: "bg-zinc-500/10" },
              { label: "K/D Ratio", value: "1.42", icon: Target, color: "text-primary", bg: "bg-primary/10" },
              { label: "В Игре", value: "342ч", icon: Clock, color: "text-blue-500", bg: "bg-blue-500/10" },
            ].map((stat, i) => (
              <Card key={i} className="bg-zinc-900/40 border-white/5 backdrop-blur-md hover:bg-zinc-900/60 hover:border-primary/20 transition-all group overflow-hidden">
                <CardContent className="p-5 flex flex-col items-center text-center relative">
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-b from-transparent to-${stat.color.split('-')[1]}-500/5`} />
                  <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} mb-3 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <span className="text-2xl font-bold font-display text-white tracking-wide">{stat.value}</span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-1">{stat.label}</span>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          {/* Discord Integration Card */}
          <motion.div variants={item} initial="hidden" animate="show">
            <Card className="bg-[#5865F2] border-none overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent" />
              <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-colors" />
              
              <CardHeader className="relative z-10 pb-2">
                <CardTitle className="flex items-center gap-3 text-white font-display">
                  <img src={discordLogo} className="w-8 h-8 brightness-0 invert" alt="Discord" />
                  Discord Связь
                </CardTitle>
              </CardHeader>
              
              <CardContent className="relative z-10 space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-black/20 backdrop-blur-sm border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="w-10 h-10 border-2 border-white/10">
                        <AvatarImage src="https://github.com/shadcn.png" />
                        <AvatarFallback>DS</AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 bg-[#5865F2] rounded-full p-0.5 border-2 border-[#5865F2]">
                        <CheckCircle2 className="w-3 h-3 text-white" />
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white">TacticalViper#9999</span>
                      <span className="text-[10px] text-white/70 uppercase tracking-wider font-bold">Подтверждено</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="text-white/50 hover:text-white hover:bg-white/10 rounded-full">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <Button className="w-full bg-white text-[#5865F2] hover:bg-white/90 font-bold font-display tracking-wide shadow-lg border-none">
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
            <Card className="bg-zinc-900/30 border-white/5 overflow-hidden shadow-xl backdrop-blur-sm">
              <div className="h-1 bg-gradient-to-r from-primary via-orange-400 to-primary w-full" />
              <CardHeader className="pb-0 border-b border-white/5 bg-zinc-900/50">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-4">
                  <div>
                    <CardTitle className="text-2xl flex items-center gap-3">
                      <Shield className="w-6 h-6 text-primary" />
                      УПРАВЛЕНИЕ КЛАНОМ
                    </CardTitle>
                    <CardDescription className="mt-1 font-medium text-muted-foreground">
                      Центр управления вашим отрядом и личным составом.
                    </CardDescription>
                  </div>
                </div>
                
                <Tabs defaultValue="clan" className="w-full">
                  <TabsList className="w-full justify-start bg-transparent p-0 h-auto gap-6">
                    <TabsTrigger 
                      value="clan" 
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none px-0 py-3 font-display tracking-wide text-muted-foreground hover:text-white transition-colors"
                    >
                      КЛАН
                    </TabsTrigger>
                    <TabsTrigger 
                      value="apply" 
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none px-0 py-3 font-display tracking-wide text-muted-foreground hover:text-white transition-colors"
                    >
                      ЗАЯВКА
                    </TabsTrigger>
                    <TabsTrigger 
                      value="search" 
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none px-0 py-3 font-display tracking-wide text-muted-foreground hover:text-white transition-colors"
                    >
                      ПОИСК КЛАНОВ
                    </TabsTrigger>
                  </TabsList>

                  <div className="p-6 md:p-8 bg-zinc-900/20 min-h-[400px]">
                    {/* CLAN TAB (RENAMED FROM MY SQUAD) */}
                    <TabsContent value="clan" className="mt-0 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className="flex flex-col md:flex-row gap-8">
                            {/* Clan Stats Card */}
                            <div className="w-full md:w-80 shrink-0 space-y-4">
                                <div className="bg-gradient-to-b from-zinc-800 to-zinc-900 border border-white/10 rounded-2xl p-6 relative overflow-hidden shadow-2xl group">
                                    <div className="absolute top-0 right-0 p-24 bg-primary/10 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/20 transition-colors duration-700" />
                                    
                                    <div className="flex items-start justify-between mb-8 relative z-10">
                                        <div className="p-4 bg-gradient-to-br from-primary to-orange-600 rounded-xl shadow-lg text-white transform group-hover:scale-105 transition-transform duration-300">
                                            <Crown className="w-8 h-8" />
                                        </div>
                                        <Badge className="bg-zinc-950 text-primary border border-primary/30 font-mono">LVL 5</Badge>
                                    </div>
                                    
                                    <div className="relative z-10 mb-8">
                                      <h3 className="text-2xl font-display font-bold text-white mb-1">ОТРЯД АЛЬФА</h3>
                                      <p className="text-xs text-primary font-bold tracking-widest uppercase">Элитный Клан</p>
                                    </div>
                                    
                                    <div className="space-y-1 relative z-10">
                                        <div className="flex justify-between items-center text-sm p-3 bg-black/20 rounded-lg border border-white/5">
                                            <span className="text-muted-foreground flex items-center gap-2 font-medium"><Users className="w-4 h-4 text-zinc-500"/> Всего бойцов</span>
                                            <span className="font-mono font-bold text-white">5</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm p-3 bg-black/20 rounded-lg border border-white/5">
                                            <span className="text-muted-foreground flex items-center gap-2 font-medium"><div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"/> В строю</span>
                                            <span className="font-mono font-bold text-emerald-500">3</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm p-3 bg-black/20 rounded-lg border border-white/5">
                                            <span className="text-muted-foreground flex items-center gap-2 font-medium"><Trophy className="w-4 h-4 text-yellow-500"/> Винрейт</span>
                                            <span className="font-mono font-bold text-yellow-500">68%</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <Button className="w-full bg-white text-black hover:bg-zinc-200 font-bold font-display tracking-wide h-12 shadow-lg">
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
                                    <span className="text-xs font-mono bg-zinc-800 px-2 py-1 rounded border border-white/5 text-muted-foreground">5 / 50</span>
                                </div>

                                <div className="space-y-3">
                                    {/* Leader */}
                                    <div className="flex items-center justify-between p-4 bg-zinc-900/80 border border-primary/30 rounded-xl group hover:bg-zinc-800 hover:border-primary/50 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <Avatar className="h-12 w-12 border-2 border-primary">
                                                    <AvatarFallback className="bg-primary text-black font-bold">CX</AvatarFallback>
                                                </Avatar>
                                                <div className="absolute -top-2 -right-2 bg-zinc-900 rounded-full p-1 border border-yellow-500/30 shadow-lg">
                                                    <Crown className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-bold text-white text-lg">CommanderX</h4>
                                                    <Badge variant="outline" className="text-[10px] h-5 px-1.5 border-yellow-500/50 text-yellow-500 bg-yellow-500/10">VIP</Badge>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs mt-0.5">
                                                    <span className="text-primary font-bold uppercase tracking-wider">Лидер</span>
                                                    <span className="w-1 h-1 rounded-full bg-zinc-700" />
                                                    <span className="text-emerald-500 font-medium">В СЕТИ</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button size="icon" variant="ghost" className="h-9 w-9 text-muted-foreground hover:text-white hover:bg-white/5"><Settings className="w-4 h-4" /></Button>
                                        </div>
                                    </div>

                                    {/* Members Loop */}
                                    {[
                                        { name: 'TacticalViper', role: 'Офицер', status: 'В ИГРЕ', statusColor: 'text-blue-400', roleColor: 'text-orange-400', avatar: 'TV' },
                                        { name: 'SniperWolf', role: 'Боец', status: 'НЕ В СЕТИ', statusColor: 'text-zinc-500', roleColor: 'text-muted-foreground', avatar: 'SW' },
                                        { name: 'MedicMain', role: 'Боец', status: 'В СЕТИ', statusColor: 'text-emerald-500', roleColor: 'text-muted-foreground', avatar: 'MM' }
                                    ].map((member, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-zinc-900/40 border border-white/5 rounded-xl group hover:bg-zinc-900/80 hover:border-white/10 transition-all">
                                            <div className="flex items-center gap-4">
                                                <Avatar className="h-10 w-10 border border-white/10">
                                                    <AvatarFallback className="bg-zinc-800 text-zinc-400">{member.avatar}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-bold text-white">{member.name}</h4>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs mt-0.5">
                                                        <span className={`${member.roleColor} font-bold uppercase tracking-wider`}>{member.role}</span>
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
                    <TabsContent value="apply" className="mt-0 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                       <div className="max-w-2xl mx-auto space-y-6 pt-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                              <Label className="text-xs uppercase text-muted-foreground font-bold tracking-wider">Выберите Клан</Label>
                              <select className="w-full h-11 rounded-xl border border-input bg-zinc-950/50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all hover:border-primary/30">
                                <option>Отряд Альфа [ALPHA]</option>
                                <option>Delta Force [DF]</option>
                                <option>Zaruba Elite [ZE]</option>
                              </select>
                            </div>
                            <div className="space-y-3">
                              <Label className="text-xs uppercase text-muted-foreground font-bold tracking-wider">Желаемая роль</Label>
                              <select className="w-full h-11 rounded-xl border border-input bg-zinc-950/50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all hover:border-primary/30">
                                <option>Штурмовик</option>
                                <option>Снайпер</option>
                                <option>Медик</option>
                                <option>Поддержка</option>
                              </select>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <Label className="text-xs uppercase text-muted-foreground font-bold tracking-wider">Комментарий к заявке</Label>
                            <textarea 
                              className="flex min-h-[140px] w-full rounded-xl border border-input bg-zinc-950/50 px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 resize-none hover:border-primary/30 transition-all"
                              placeholder="Расскажите о своем опыте, любимых классах и почему вы хотите вступить именно к нам..."
                            />
                          </div>

                          <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 flex items-start gap-4">
                            <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                            <div className="space-y-1">
                              <p className="text-sm font-bold text-primary uppercase tracking-wide">Требования к кандидатам</p>
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                Для вступления в клан необходимо иметь минимум 100 часов игры на сервере, положительный K/D (&gt;1.0) и работающий микрофон. Лидер клана рассмотрит вашу заявку в течение 24 часов.
                              </p>
                            </div>
                          </div>

                          <div className="flex justify-end pt-4">
                            <Button size="lg" className="w-full md:w-auto bg-primary text-black font-bold font-display tracking-wide hover:bg-primary/90 shadow-[0_0_30px_rgba(255,102,0,0.3)] transition-all hover:scale-105">
                              ОТПРАВИТЬ ЗАЯВКУ
                            </Button>
                          </div>
                       </div>
                    </TabsContent>

                    {/* Search Placeholder */}
                    <TabsContent value="search" className="mt-0">
                       <div className="text-center py-20 flex flex-col items-center justify-center opacity-50">
                          <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mb-6">
                             <Shield className="w-10 h-10 text-zinc-500" />
                          </div>
                          <h3 className="text-xl font-display font-bold text-white mb-2">Поиск кланов</h3>
                          <p className="text-muted-foreground max-w-sm mx-auto">
                             Воспользуйтесь фильтрами чтобы найти подходящий клан по уровню игры и требованиям.
                          </p>
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
