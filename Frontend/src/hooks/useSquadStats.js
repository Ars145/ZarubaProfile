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
    
    // Если нет вложенных данных (MongoDB недоступен), возвращаем базовую статистику
    const hasFullData = playerData.possess || playerData.weapons || playerData.roles || playerData.matches;
    
    if (!hasFullData) {
      // Возвращаем минимальную статистику из базовых полей
      return {
        steamId: playerData.steamId,
        name: playerData.playerName || 'Unknown',
        kills: playerData.kills || 0,
        deaths: playerData.deaths || 0,
        kd: playerData.kd || 0,
        revives: playerData.revives || 0,
        teamkills: playerData.teamkills || 0,
        matches: playerData.matches || 0,
        wins: playerData.wins || 0,
        winrate: playerData.winRate || 0,
        playtime: playerData.playtime || '0м',
        playtimeMinutes: playerData.playtimeMinutes || 0,
        squadLeaderTime: '0м',
        commanderTime: '0м',
        driverTime: '0м',
        pilotTime: '0м',
        vehicleKills: 0,
        knifeKills: 0,
        avgKills: 0,
        topRole: null,
        topWeapon: null,
        rank: null,
        detailedWeapons: [],
        detailedRoles: [],
        rawRoles: {},
        rawWeapons: {},
        rawPossess: {}
      };
    }
    
    // Расчет времени на технике
    const [heavyTime, heliTime] = calcVehicleTime(playerData.possess || {});
    
    // Расчет специальных убийств
    const vehicleKills = calcVehicleKills(playerData.weapons || {});
    const knifeKills = calcKnifeKills(playerData.weapons || {});
    
    // Топ роль и оружие
    const topRole = getTopRole(playerData.roles || {});
    const topWeapon = getTopWeapon(playerData.weapons || {});
    
    // Ранги (получаем конфиг из данных или используем дефолтный)
    const ranksConfig = playerData.ranksConfig || null;
    const rank = ranksConfig ? getCurrentRank(playerData, ranksConfig) : null;
    
    // Детальная статистика
    const detailedWeapons = getDetailedWeapons(playerData.weapons || {});
    const detailedRoles = getDetailedRoles(playerData.roles || {});
    
    // Средние значения
    const avgKills = calcAvgKillsPerMatch(playerData.kills, playerData.matches?.matches || 0);
    
    return {
      // Базовая информация
      steamId: playerData._id || playerData.steamId,
      name: playerData.name || playerData.playerName || 'Unknown',
      
      // Основная статистика
      kills: playerData.kills || 0,
      deaths: playerData.death || playerData.deaths || 0,
      kd: playerData.kd || 0,
      revives: playerData.revives || 0,
      teamkills: playerData.teamkills || 0,
      
      // Матчи
      matches: playerData.matches?.matches || 0,
      wins: playerData.matches?.won || 0,
      winrate: playerData.matches?.winrate || 0,
      
      // Время игры (форматированное)
      playtime: formatTime(playerData.squad?.timeplayed || 0),
      playtimeMinutes: playerData.squad?.timeplayed || 0,
      squadLeaderTime: formatTime(playerData.squad?.leader || 0),
      commanderTime: formatTime(playerData.squad?.cmd || 0),
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
      rawRoles: playerData.roles || {},
      rawWeapons: playerData.weapons || {},
      rawPossess: playerData.possess || {}
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
