import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  calcVehicleTime,
  calcVehicleKills,
  calcKnifeKills,
  formatTime,
  getTopRole,
  getTopWeapon,
  getCurrentRank,
  getDetailedWeapons,
  getDetailedRoles,
  calcAvgKillsPerMatch
} from '@/lib/statsCalculations';

const API_URL = import.meta.env.VITE_API_URL || '';

/**
 * Хук для работы со статистикой Squad
 * @param {string} steamId - Steam ID игрока
 * @returns {Object} - обработанная статистика
 */
export function useSquadStats(steamId) {
  // Загружаем реальные данные из API
  const { data: playerData, isLoading, error } = useQuery({
    queryKey: ['/api/stats', steamId],
    queryFn: async () => {
      if (!steamId) return null;
      const response = await fetch(`${API_URL}/api/stats/${steamId}`, {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }
      const data = await response.json();
      
      // Логируем если есть warning (MongoDB недоступен)
      if (data.warning) {
        console.warn('Stats warning:', data.warning);
      }
      
      return data.stats;
    },
    enabled: !!steamId,
    staleTime: 5 * 60 * 1000, // Кэш на 5 минут
  });

  const processedStats = useMemo(() => {
    if (!playerData) {
      return null;
    }
    
    // Расчет времени на технике
    const [heavyTime, heliTime] = calcVehicleTime(playerData.possess);
    
    // Расчет специальных убийств
    const vehicleKills = calcVehicleKills(playerData.weapons);
    const knifeKills = calcKnifeKills(playerData.weapons);
    
    // Топ роль и оружие
    const topRole = getTopRole(playerData.roles);
    const topWeapon = getTopWeapon(playerData.weapons);
    
    // Ранги (получаем конфиг из данных или используем дефолтный)
    const ranksConfig = playerData.ranksConfig || null;
    const rank = ranksConfig ? getCurrentRank(playerData, ranksConfig) : null;
    
    // Детальная статистика
    const detailedWeapons = getDetailedWeapons(playerData.weapons);
    const detailedRoles = getDetailedRoles(playerData.roles);
    
    // Средние значения
    const avgKills = calcAvgKillsPerMatch(playerData.kills, playerData.matches.matches);
    
    return {
      // Базовая информация
      steamId: playerData._id,
      name: playerData.name,
      
      // Основная статистика
      kills: playerData.kills,
      deaths: playerData.death,
      kd: playerData.kd,
      revives: playerData.revives,
      teamkills: playerData.teamkills,
      
      // Матчи
      matches: playerData.matches.matches,
      wins: playerData.matches.won,
      winrate: playerData.matches.winrate,
      
      // Время игры (форматированное)
      playtime: formatTime(playerData.squad.timeplayed),
      playtimeMinutes: playerData.squad.timeplayed,
      squadLeaderTime: formatTime(playerData.squad.leader),
      commanderTime: formatTime(playerData.squad.cmd),
      driverTime: formatTime(heavyTime / 60, 'min'), // конвертируем из секунд
      pilotTime: formatTime(heliTime / 60, 'min'),
      
      // Специальные убийства
      vehicleKills,
      knifeKills,
      avgKills,
      
      // Топ показатели
      topRole,
      topWeapon,
      
      // Ранги
      rank,
      
      // Детальная статистика
      detailedWeapons,
      detailedRoles,
      
      // Сырые данные
      rawRoles: playerData.roles,
      rawWeapons: playerData.weapons,
      rawPossess: playerData.possess
    };
  }, [playerData]);
  
  return {
    stats: processedStats,
    isLoading,
    error
  };
}

/**
 * Хук для получения топ N оружий
 */
export function useTopWeapons(steamId, limit = 5) {
  const { stats } = useSquadStats(steamId);
  
  return useMemo(() => {
    if (!stats || !stats.detailedWeapons) return [];
    
    return stats.detailedWeapons
      .filter(w => w.type === 'infantry')
      .slice(0, limit);
  }, [stats, limit]);
}

/**
 * Хук для получения топ N ролей
 */
export function useTopRoles(steamId, limit = 5) {
  const { stats } = useSquadStats(steamId);
  
  return useMemo(() => {
    if (!stats || !stats.detailedRoles) return [];
    
    return stats.detailedRoles.slice(0, limit);
  }, [stats, limit]);
}
