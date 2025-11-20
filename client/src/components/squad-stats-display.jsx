import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Target, Swords, Shield, Trophy, Star, Zap, 
  Crosshair, Activity, Award 
} from "lucide-react";

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

/**
 * Компонент прогресса ранга
 */
export function RankProgressCard({ rank }) {
  if (!rank || !rank.current) {
    return null;
  }

  return (
    <motion.div variants={item}>
      <Card className="bg-gradient-to-br from-zinc-900/90 to-zinc-800/50 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Award className="w-5 h-5" />
            Прогресс Ранга
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-primary/30 bg-zinc-800/50 flex items-center justify-center">
                {rank.current.iconUrl ? (
                  <img 
                    src={rank.current.iconUrl} 
                    alt="Current Rank" 
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Star className="w-8 h-8 text-primary" />
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Текущий ранг</p>
                <p className="text-lg font-bold text-primary">
                  {rank.current.score.toLocaleString()} очков
                </p>
              </div>
            </div>
            
            {rank.next && !rank.isMaxRank && (
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-sm text-muted-foreground text-right">Следующий ранг</p>
                  <p className="text-lg font-bold text-right">
                    {rank.next.needScore.toLocaleString()} очков
                  </p>
                </div>
                <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-zinc-600 bg-zinc-800/50 flex items-center justify-center">
                  {rank.next.iconUrl ? (
                    <img 
                      src={rank.next.iconUrl} 
                      alt="Next Rank" 
                      className="w-full h-full object-contain opacity-60"
                    />
                  ) : (
                    <Star className="w-8 h-8 text-zinc-600" />
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Прогресс</span>
              <span className="text-primary font-bold">{rank.progress.toFixed(1)}%</span>
            </div>
            <Progress value={rank.progress} className="h-3" />
          </div>
          
          {rank.isMaxRank && (
            <Badge className="w-full justify-center bg-gradient-to-r from-yellow-600 to-orange-600 border-0">
              <Trophy className="w-4 h-4 mr-2" />
              Максимальный ранг достигнут!
            </Badge>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

/**
 * Компонент статистики основных показателей
 */
export function MainStatsCard({ stats }) {
  if (!stats) return null;

  const statItems = [
    { icon: Target, label: "Убийства", value: stats.kills, color: "text-red-400" },
    { icon: Crosshair, label: "K/D", value: stats.kd?.toFixed(2), color: "text-orange-400" },
    { icon: Trophy, label: "Победы", value: stats.wins, color: "text-yellow-400" },
    { icon: Activity, label: "Винрейт", value: `${stats.winrate?.toFixed(1)}%`, color: "text-green-400" },
  ];

  return (
    <motion.div variants={item}>
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Основная Статистика
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {statItems.map((stat, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/50">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-lg font-bold">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/**
 * Компонент детальной статистики оружия
 */
export function WeaponsStatsCard({ weapons, topWeapon }) {
  if (!weapons || weapons.length === 0) return null;

  const infantryWeapons = weapons.filter(w => w.type === 'infantry').slice(0, 10);
  const vehicleWeapons = weapons.filter(w => w.type === 'vehicle').slice(0, 5);

  return (
    <motion.div variants={item}>
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-primary" />
            Статистика Оружия
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="infantry" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="infantry">Пехотное</TabsTrigger>
              <TabsTrigger value="vehicle">Техника</TabsTrigger>
            </TabsList>
            
            <TabsContent value="infantry" className="space-y-2">
              {infantryWeapons.map((weapon, idx) => (
                <div 
                  key={idx} 
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    idx === 0 ? 'bg-primary/10 border border-primary/30' : 'bg-zinc-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {idx === 0 && <Trophy className="w-4 h-4 text-primary" />}
                    <div>
                      <p className="font-semibold">{weapon.name}</p>
                      {idx < 3 && (
                        <Badge variant="outline" className="text-xs mt-1">
                          Топ {idx + 1}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">{weapon.kills}</p>
                    <p className="text-xs text-muted-foreground">убийств</p>
                  </div>
                </div>
              ))}
            </TabsContent>
            
            <TabsContent value="vehicle" className="space-y-2">
              {vehicleWeapons.length > 0 ? (
                vehicleWeapons.map((weapon, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50"
                  >
                    <p className="font-semibold">{weapon.name}</p>
                    <div className="text-right">
                      <p className="text-lg font-bold text-orange-400">{weapon.kills}</p>
                      <p className="text-xs text-muted-foreground">убийств</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Нет убийств на технике
                </p>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/**
 * Компонент детальной статистики ролей
 */
export function RolesStatsCard({ roles, topRole }) {
  if (!roles || roles.length === 0) return null;

  const topRoles = roles.slice(0, 8);

  return (
    <motion.div variants={item}>
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Статистика Ролей
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {topRoles.map((role, idx) => {
            const percentage = topRole && topRole.timeMinutes > 0 
              ? (role.timeMinutes / topRole.timeMinutes) * 100 
              : 0;
            
            return (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {idx === 0 && <Star className="w-4 h-4 text-primary" />}
                    <p className={`font-semibold ${idx === 0 ? 'text-primary' : ''}`}>
                      {role.name}
                    </p>
                  </div>
                  <p className="text-sm font-bold">{role.time}</p>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            );
          })}
        </CardContent>
      </Card>
    </motion.div>
  );
}

/**
 * Компонент времени игры
 */
export function PlaytimeCard({ stats }) {
  if (!stats) return null;

  const timeStats = [
    { label: "Общее время", value: stats.playtime, icon: Zap },
    { label: "Сквад-лидер", value: stats.squadLeaderTime, icon: Shield },
    { label: "Командир", value: stats.commanderTime, icon: Star },
    { label: "Мехвод", value: stats.driverTime, icon: Target },
    { label: "Пилот", value: stats.pilotTime, icon: Activity },
  ];

  return (
    <motion.div variants={item}>
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Время в Игре
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3">
          {timeStats.map((stat, idx) => (
            <div 
              key={idx} 
              className={`p-3 rounded-lg ${
                idx === 0 ? 'col-span-2 bg-primary/10 border border-primary/30' : 'bg-zinc-800/50'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <stat.icon className={`w-4 h-4 ${idx === 0 ? 'text-primary' : 'text-muted-foreground'}`} />
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
              <p className={`text-lg font-bold ${idx === 0 ? 'text-primary' : ''}`}>
                {stat.value}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}
