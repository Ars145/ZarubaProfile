import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
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
 * Fetches player stats from backend API
 */
async function fetchPlayerStats(steamId) {
  const response = await fetch(`${API_URL}/api/players/${steamId}/stats`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch player stats');
  }
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch stats');
  }
  
  return data.stats;
}

/**
 * Hook для получения и обработки статистики игрока Squad через API
 * @param {string} steamId - Steam ID игрока
 * @param {object} ranksConfig - Конфигурация рангов
 * @returns {object} - обработанная статистика
 */
export function usePlayerStats(steamId, ranksConfig = null) {
  // Fetch raw stats from backend
  const { data: rawStats, isLoading, isError, error } = useQuery({
    queryKey: ['playerStats', steamId],
    queryFn: () => fetchPlayerStats(steamId),
    enabled: !!steamId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1
  });

  // Process stats when raw data is available
  const processedStats = useMemo(() => {
    if (!rawStats) return null;

    // Расчет времени на технике
    const [heavyTime, heliTime] = calcVehicleTime(rawStats.possess || {});
    
    // Расчет специальных убийств
    const vehicleKills = calcVehicleKills(rawStats.weapons || {});
    const knifeKills = calcKnifeKills(rawStats.weapons || {});
    
    // Топ роль и оружие
    const topRole = getTopRole(rawStats.roles || {});
    const topWeapon = getTopWeapon(rawStats.weapons || {});
    
    // Ранги (если конфиг передан)
    const rank = ranksConfig ? getCurrentRank(rawStats, ranksConfig) : null;
    
    // Детальная статистика
    const detailedWeapons = getDetailedWeapons(rawStats.weapons || {});
    const detailedRoles = getDetailedRoles(rawStats.roles || {});
    
    // Средние значения
    const avgKills = calcAvgKillsPerMatch(
      rawStats.kills || 0,
      rawStats.matches?.matches || 0
    );
    
    return {
      // Базовая информация
      steamId: rawStats._id,
      name: rawStats.name,
      
      // Основная статистика
      kills: rawStats.kills || 0,
      deaths: rawStats.death || 0,
      kd: rawStats.kd || 0,
      revives: rawStats.revives || 0,
      teamkills: rawStats.teamkills || 0,
      
      // Матчи
      matches: rawStats.matches?.matches || 0,
      wins: rawStats.matches?.won || 0,
      winrate: rawStats.matches?.winrate || 0,
      
      // Время игры (форматированное)
      playtime: formatTime(rawStats.squad?.timeplayed || 0),
      playtimeMinutes: rawStats.squad?.timeplayed || 0,
      squadLeaderTime: formatTime(rawStats.squad?.leader || 0),
      commanderTime: formatTime(rawStats.squad?.cmd || 0),
      driverTime: formatTime(heavyTime / 60, 'min'),
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
      rawRoles: rawStats.roles || {},
      rawWeapons: rawStats.weapons || {},
      rawPossess: rawStats.possess || {}
    };
  }, [rawStats, ranksConfig]);

  return {
    stats: processedStats,
    isLoading,
    isError,
    error
  };
}

/**
 * Хук для получения топ N оружий
 */
export function useTopWeapons(steamId, limit = 5) {
  const { stats } = usePlayerStats(steamId);
  
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
  const { stats } = usePlayerStats(steamId);
  
  return useMemo(() => {
    if (!stats || !stats.detailedRoles) return [];
    
    return stats.detailedRoles.slice(0, limit);
  }, [stats, limit]);
}
