import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Target, Swords, Shield, Trophy, Star, Zap, 
  Crosshair, Activity, Award, Clock, Users
} from "lucide-react";

/**
 * Компактная секция статистики Squad - все в одной карточке с табами
 */
export function SquadStatsCompact({ stats }) {
  if (!stats) return null;

  return (
    <Card className="bg-gradient-to-br from-zinc-900/50 via-zinc-900/40 to-black/50 border-blue-500/10 overflow-hidden relative group hover:border-blue-500/20 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] transition-all duration-500">
      <CardHeader className="pb-4 relative z-10">
        <CardTitle className="flex items-center gap-2 text-primary">
          <Activity className="w-5 h-5" />
          Squad Intelligence
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Summary Section - Компактная сводка */}
        <div className="space-y-4">
          {/* Ранг и прогресс */}
          {stats.rank && stats.rank.current && (
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg overflow-hidden border-2 border-primary/30 bg-zinc-800/50 flex items-center justify-center shrink-0">
                {stats.rank.current.iconUrl ? (
                  <img 
                    src={stats.rank.current.iconUrl} 
                    alt="Rank" 
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Star className="w-6 h-6 text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Ранг</span>
                  <span className="text-primary font-bold">{stats.rank.progress.toFixed(1)}%</span>
                </div>
                <Progress value={stats.rank.progress} className="h-2" />
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                  <span>{stats.rank.current.score.toLocaleString()}</span>
                  {stats.rank.next && <span>{stats.rank.next.needScore.toLocaleString()}</span>}
                </div>
              </div>
            </div>
          )}
          
          {/* Основные показатели - Компактная сетка */}
          <div className="grid grid-cols-4 gap-2">
            <StatBox icon={Crosshair} label="K/D" value={stats.kd?.toFixed(2)} color="text-primary" />
            <StatBox icon={Trophy} label="Винрейт" value={`${stats.winrate?.toFixed(0)}%`} color="text-yellow-400" />
            <StatBox icon={Target} label="Убийств" value={stats.kills} color="text-red-400" />
            <StatBox icon={Clock} label="Время" value={stats.playtime} color="text-blue-400" />
          </div>
          
          {/* Время по ролям - Компактно */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <TimeRow icon={Shield} label="Сквад-лидер" value={stats.squadLeaderTime} />
            <TimeRow icon={Star} label="Командир" value={stats.commanderTime} />
            <TimeRow icon={Users} label="Мехвод" value={stats.driverTime} />
            <TimeRow icon={Activity} label="Пилот" value={stats.pilotTime} />
          </div>
        </div>
        
        {/* Tabs для детальной статистики */}
        <Tabs defaultValue="weapons" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="weapons">Оружие</TabsTrigger>
            <TabsTrigger value="roles">Роли</TabsTrigger>
          </TabsList>
          
          {/* Weapons Tab */}
          <TabsContent value="weapons" className="space-y-2 mt-4">
            {stats.detailedWeapons && stats.detailedWeapons
              .filter(w => w.type === 'infantry')
              .slice(0, 5)
              .map((weapon, idx) => (
                <div 
                  key={idx} 
                  className={`flex items-center justify-between p-2 rounded-lg text-sm ${
                    idx === 0 ? 'bg-primary/10 border border-primary/30' : 'bg-zinc-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {idx === 0 && <Trophy className="w-3 h-3 text-primary" />}
                    <span className={idx === 0 ? 'font-bold text-primary' : ''}>{weapon.name}</span>
                  </div>
                  <span className="font-bold text-primary">{weapon.kills}</span>
                </div>
              ))}
            
            {/* Специальные убийства */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-700">
              <div className="text-center p-2 bg-zinc-800/30 rounded">
                <div className="text-xs text-muted-foreground">Техника</div>
                <div className="text-lg font-bold text-orange-400">{stats.vehicleKills}</div>
              </div>
              <div className="text-center p-2 bg-zinc-800/30 rounded">
                <div className="text-xs text-muted-foreground">Ближний бой</div>
                <div className="text-lg font-bold text-red-400">{stats.knifeKills}</div>
              </div>
            </div>
          </TabsContent>
          
          {/* Roles Tab */}
          <TabsContent value="roles" className="space-y-2 mt-4">
            {stats.detailedRoles && stats.detailedRoles.slice(0, 6).map((role, idx) => {
              const percentage = stats.topRole && stats.topRole.timeMinutes > 0 
                ? (role.timeMinutes / stats.topRole.timeMinutes) * 100 
                : 0;
              
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      {idx === 0 && <Star className="w-3 h-3 text-primary" />}
                      <span className={idx === 0 ? 'font-bold text-primary' : ''}>{role.name}</span>
                    </div>
                    <span className="text-xs font-bold">{role.time}</span>
                  </div>
                  <Progress value={percentage} className="h-1.5" />
                </div>
              );
            })}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// Компактный бокс со статом
function StatBox({ icon: Icon, label, value, color }) {
  return (
    <div className="text-center p-2 bg-zinc-800/50 rounded-lg">
      <Icon className={`w-4 h-4 ${color} mx-auto mb-1`} />
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`text-sm font-bold ${color}`}>{value}</div>
    </div>
  );
}

// Компактная строка времени
function TimeRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2 p-2 bg-zinc-800/30 rounded">
      <Icon className="w-3 h-3 text-muted-foreground shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-muted-foreground truncate">{label}</div>
      </div>
      <div className="font-bold text-xs">{value}</div>
    </div>
  );
}
