import { motion } from "framer-motion";
import { Trophy, Target, Clock, Shield, Swords, Users, ChevronRight, CheckCircle2, AlertCircle, Crosshair, Skull, X, Crown, Star, User, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

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
        className="flex flex-col md:flex-row items-start md:items-end gap-6 mb-12 pb-8 border-b border-white/5"
      >
        <div className="relative">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-xl overflow-hidden border-2 border-primary/20 shadow-[0_0_30px_rgba(255,102,0,0.15)]">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=TacticalViper" alt="Avatar" className="w-full h-full object-cover bg-zinc-900" />
          </div>
          <div className="absolute -bottom-3 -right-3 bg-background p-1 rounded-full">
            <Badge className="bg-primary text-black hover:bg-primary border-2 border-background px-3 py-1 text-xs font-bold font-display">
              LVL 52
            </Badge>
          </div>
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-4xl md:text-5xl font-bold text-white font-display tracking-tight uppercase">
              TacticalViper
            </h1>
            <Badge variant="outline" className="border-primary/50 text-primary bg-primary/10">VIP ИГРОК</Badge>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground font-mono">
            <span className="flex items-center gap-2">
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Steam_icon_logo.svg/512px-Steam_icon_logo.svg.png" className="w-4 h-4 opacity-70" />
              STEAM_0:1:12345678
            </span>
            <span className="w-1 h-1 rounded-full bg-zinc-700" />
            <span className="flex items-center gap-2 text-green-500">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Online
            </span>
          </div>
        </div>

        <div className="flex gap-3 w-full md:w-auto mt-4 md:mt-0">
           <Button variant="outline" className="flex-1 md:flex-none border-white/10 hover:border-primary/50 hover:bg-primary/5 text-white">
             <img src="https://assets-global.website-files.com/6257adef93867e56f84d3109/636e0a6ca814282eca7172c6_icon_clyde_white_RGB.png" className="w-5 h-5 mr-2" />
             Discord
           </Button>
           <Button className="flex-1 md:flex-none bg-primary text-black hover:bg-primary/90 font-bold font-display tracking-wide">
             Настройки
           </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column - Stats & Info */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Stats Card */}
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 gap-3"
          >
            <Card className="bg-zinc-900/50 border-white/5 backdrop-blur-sm hover:border-primary/30 transition-colors group">
              <CardContent className="p-4 flex flex-col items-center text-center py-6">
                <div className="p-3 rounded-full bg-red-500/10 text-red-500 mb-3 group-hover:scale-110 transition-transform">
                  <Crosshair className="w-6 h-6" />
                </div>
                <span className="text-3xl font-bold font-display text-white">1,245</span>
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-bold mt-1">Убийств</span>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-white/5 backdrop-blur-sm hover:border-primary/30 transition-colors group">
              <CardContent className="p-4 flex flex-col items-center text-center py-6">
                <div className="p-3 rounded-full bg-zinc-500/10 text-zinc-400 mb-3 group-hover:scale-110 transition-transform">
                  <Skull className="w-6 h-6" />
                </div>
                <span className="text-3xl font-bold font-display text-white">892</span>
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-bold mt-1">Смертей</span>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-white/5 backdrop-blur-sm hover:border-primary/30 transition-colors group">
              <CardContent className="p-4 flex flex-col items-center text-center py-6">
                <div className="p-3 rounded-full bg-primary/10 text-primary mb-3 group-hover:scale-110 transition-transform">
                  <Target className="w-6 h-6" />
                </div>
                <span className="text-3xl font-bold font-display text-white">1.42</span>
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-bold mt-1">K/D Ratio</span>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-white/5 backdrop-blur-sm hover:border-primary/30 transition-colors group">
              <CardContent className="p-4 flex flex-col items-center text-center py-6">
                <div className="p-3 rounded-full bg-blue-500/10 text-blue-500 mb-3 group-hover:scale-110 transition-transform">
                  <Clock className="w-6 h-6" />
                </div>
                <span className="text-3xl font-bold font-display text-white">342ч</span>
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-bold mt-1">В Игре</span>
              </CardContent>
            </Card>
          </motion.div>

          {/* Discord Integration Card */}
          <Card className="bg-gradient-to-br from-[#5865F2]/20 to-background border-[#5865F2]/30 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-20 bg-[#5865F2]/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-display">
                <img src="https://assets-global.website-files.com/6257adef93867e56f84d3109/636e0a6ca814282eca7172c6_icon_clyde_white_RGB.png" className="w-6 h-6" />
                Discord Связь
              </CardTitle>
              <CardDescription>Привяжите аккаунт для доступа к закрытым каналам</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-white/5 mb-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>DS</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-white">TacticalViper#9999</span>
                    <span className="text-[10px] text-green-500 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Подтверждено
                    </span>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-white h-8 w-8 p-0">
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <Button className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white font-medium">
                Обновить привязку
              </Button>
            </CardContent>
          </Card>

        </div>

        {/* Right Column - Clan & Applications */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Clan Dashboard */}
          <Card className="bg-card border-white/5 overflow-hidden">
            <div className="h-2 bg-primary w-full" />
            <CardHeader className="pb-4 border-b border-white/5">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl flex items-center gap-3">
                    <Shield className="w-6 h-6 text-primary" />
                    Управление Кланом
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Центр управления вашим отрядом и личным составом.
                  </CardDescription>
                </div>
                <Button variant="outline" className="hidden md:flex border-primary/20 text-primary hover:bg-primary hover:text-black">
                  <Plus className="w-4 h-4 mr-2" />
                  Создать Клан
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs defaultValue="squad" className="w-full">
                <div className="p-6 pb-0">
                   <TabsList className="grid w-full grid-cols-3 bg-zinc-900 p-1">
                    <TabsTrigger value="squad" className="data-[state=active]:bg-primary data-[state=active]:text-black font-display tracking-wide">МОЙ ОТРЯД</TabsTrigger>
                    <TabsTrigger value="apply" className="data-[state=active]:bg-zinc-800 font-display tracking-wide">ЗАЯВКА</TabsTrigger>
                    <TabsTrigger value="search" className="data-[state=active]:bg-zinc-800 font-display tracking-wide">ПОИСК</TabsTrigger>
                  </TabsList>
                </div>
               
                {/* MY SQUAD TAB - Reproducing the screenshot */}
                <TabsContent value="squad" className="p-6 space-y-6 mt-0">
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Clan Stats Card */}
                        <div className="w-full md:w-1/3 space-y-4">
                            <div className="bg-zinc-900/80 border border-white/5 rounded-xl p-6 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-16 bg-primary/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
                                <div className="flex items-start justify-between mb-6 relative z-10">
                                    <div className="p-3 bg-primary/10 rounded-lg border border-primary/20 text-primary">
                                        <Crown className="w-8 h-8" />
                                    </div>
                                    <Badge className="bg-orange-500/20 text-orange-500 border-orange-500/20">LVL 5</Badge>
                                </div>
                                <h3 className="text-xl font-display font-bold text-white mb-1">ОТРЯД АЛЬФА</h3>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-6">Элитный Клан</p>
                                
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-sm p-2 bg-black/20 rounded">
                                        <span className="text-muted-foreground flex items-center gap-2"><Users className="w-4 h-4"/> Всего бойцов</span>
                                        <span className="font-mono font-bold text-white">5</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm p-2 bg-black/20 rounded">
                                        <span className="text-muted-foreground flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"/> В строю</span>
                                        <span className="font-mono font-bold text-green-500">3</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm p-2 bg-black/20 rounded">
                                        <span className="text-muted-foreground flex items-center gap-2"><Trophy className="w-4 h-4"/> Винрейт</span>
                                        <span className="font-mono font-bold text-orange-500">68%</span>
                                    </div>
                                </div>
                            </div>
                            
                            <Button className="w-full bg-primary text-black font-bold font-display">
                                <Users className="w-4 h-4 mr-2" />
                                Добавить Игрока
                            </Button>
                        </div>

                        {/* Squad List */}
                        <div className="w-full md:w-2/3">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                    <Swords className="w-4 h-4" />
                                    Активный Состав
                                </h3>
                                <span className="text-xs bg-zinc-900 px-2 py-1 rounded text-muted-foreground">5 / 50</span>
                            </div>

                            <div className="space-y-3">
                                {/* Leader */}
                                <div className="flex items-center justify-between p-4 bg-zinc-900/50 border border-primary/20 rounded-xl group hover:bg-zinc-900 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <Avatar className="h-10 w-10 border-2 border-primary/30">
                                                <AvatarFallback className="bg-primary/10 text-primary">CX</AvatarFallback>
                                            </Avatar>
                                            <div className="absolute -bottom-1 -right-1 bg-black rounded-full p-0.5">
                                                <Crown className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-white">CommanderX</h4>
                                                <Badge variant="outline" className="text-[10px] h-4 px-1 border-yellow-500/50 text-yellow-500 bg-yellow-500/10">VIP</Badge>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs">
                                                <span className="text-primary font-bold">Лидер</span>
                                                <span className="w-1 h-1 rounded-full bg-zinc-700" />
                                                <span className="text-green-500">В СЕТИ</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-white"><Star className="w-4 h-4 text-yellow-500 fill-yellow-500" /></Button>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-red-500"><Trash2 className="w-4 h-4" /></Button>
                                    </div>
                                </div>

                                {/* Officer */}
                                <div className="flex items-center justify-between p-4 bg-zinc-900/30 border border-white/5 rounded-xl group hover:bg-zinc-900 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <Avatar className="h-10 w-10">
                                                <AvatarFallback className="bg-zinc-800 text-zinc-400">TV</AvatarFallback>
                                            </Avatar>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-white">TacticalViper</h4>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs">
                                                <span className="text-orange-400 font-bold">Офицер</span>
                                                <span className="w-1 h-1 rounded-full bg-zinc-700" />
                                                <span className="text-blue-400">В ИГРЕ</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-white"><Star className="w-4 h-4" /></Button>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-red-500"><Trash2 className="w-4 h-4" /></Button>
                                    </div>
                                </div>

                                {/* Members */}
                                {['SniperWolf', 'MedicMain'].map((name, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-zinc-900/30 border border-white/5 rounded-xl group hover:bg-zinc-900 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarFallback className="bg-zinc-800 text-zinc-400">{name.substring(0,2).toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-bold text-white">{name}</h4>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs">
                                                    <span className="text-muted-foreground font-bold">Боец</span>
                                                    <span className="w-1 h-1 rounded-full bg-zinc-700" />
                                                    <span className={i === 0 ? "text-zinc-500" : "text-green-500"}>{i === 0 ? "НЕ В СЕТИ" : "В СЕТИ"}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-white"><Star className="w-4 h-4" /></Button>
                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-red-500"><Trash2 className="w-4 h-4" /></Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="apply" className="p-6 space-y-6 mt-0">
                   <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs uppercase text-muted-foreground font-bold tracking-wider">Выберите Клан</Label>
                          <select className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                            <option>Отряд Альфа [ALPHA]</option>
                            <option>Delta Force [DF]</option>
                            <option>Zaruba Elite [ZE]</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs uppercase text-muted-foreground font-bold tracking-wider">Ваша роль</Label>
                          <select className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                            <option>Штурмовик</option>
                            <option>Снайпер</option>
                            <option>Медик</option>
                            <option>Поддержка</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs uppercase text-muted-foreground font-bold tracking-wider">Комментарий к заявке</Label>
                        <textarea 
                          className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                          placeholder="Расскажите о своем опыте и почему вы хотите вступить..."
                        />
                      </div>

                      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-primary">Требования к вступлению</p>
                          <p className="text-xs text-muted-foreground">
                            Для вступления в клан необходимо иметь минимум 100 часов игры на сервере, положительный K/D и работающий микрофон. Лидер клана рассмотрит вашу заявку в течение 24 часов.
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button size="lg" className="w-full md:w-auto bg-primary text-black font-bold font-display tracking-wide hover:bg-primary/90 shadow-[0_0_20px_rgba(255,102,0,0.2)]">
                          ОТПРАВИТЬ ЗАЯВКУ
                        </Button>
                      </div>
                   </div>
                </TabsContent>

                <TabsContent value="search" className="p-6 mt-0">
                   <div className="text-center py-12">
                      <Shield className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-muted-foreground">Список кланов загружается...</h3>
                   </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <div className="space-y-4">
             <h3 className="text-lg font-display font-bold text-white flex items-center gap-2">
               <Swords className="w-5 h-5 text-primary" />
               История Матчей
             </h3>
             
             <div className="space-y-2">
               {[1, 2, 3].map((match, i) => (
                 <motion.div 
                   key={i}
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: i * 0.1 }}
                   className="group flex items-center justify-between p-4 rounded-lg bg-zinc-900/50 border border-white/5 hover:border-primary/30 hover:bg-zinc-900 transition-all cursor-pointer"
                 >
                   <div className="flex items-center gap-4">
                      <div className={`w-1 h-12 rounded-full ${i === 0 ? 'bg-green-500' : i === 1 ? 'bg-red-500' : 'bg-green-500'}`} />
                      <div>
                        <h4 className="font-bold text-white group-hover:text-primary transition-colors">ZARUBA #1 SUPERMOD</h4>
                        <p className="text-xs text-muted-foreground">Kohat Toi Invasion v1 • 42 мин назад</p>
                      </div>
                   </div>
                   
                   <div className="flex items-center gap-6 md:gap-12">
                      <div className="text-center hidden md:block">
                        <span className="block text-xs text-muted-foreground font-bold uppercase">Score</span>
                        <span className="block text-sm font-mono text-white">2,450</span>
                      </div>
                      <div className="text-center">
                        <span className="block text-xs text-muted-foreground font-bold uppercase">K/D</span>
                        <span className={`block text-sm font-mono font-bold ${i === 1 ? 'text-red-500' : 'text-green-500'}`}>
                          {i === 1 ? '0.8' : '2.1'}
                        </span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                   </div>
                 </motion.div>
               ))}
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
