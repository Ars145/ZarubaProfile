// Адаптировано из Discord бота - расчеты статистики Squad

const HEAVY_VEHICLES = [
  'ZTZ99', 'T72B3', 'T62', 'M1A1', 'AUS', 'M1A2', '2A6', 'FV4034',
  'ZBD04A', 'FV510UA', 'FV510', 'BFV', 'BMP2', 'BMP1', 'MTLB',
  'FV107', 'FV432', 'AAVP7A1', 'ZSL10', 'ZBL08', 'M1126',
  'M113A3', 'LAV', 'LAV6', 'CROWS', 'ASLAV', 'LAV2', 'LAV25',
  'BTR82A', 'BTR80', 'Sprut', 'BMD4M', 'BMD1M', 'ZTD05', 'ZBD05'
];

const HELI_VEHICLES = [
  'Z8G', 'CH146', 'MRH90', 'SA330', 'MI8', 'UH60',
  'UH1Y', 'MI17', 'Z8J'
];

const VEHICLE_WEAPON_PATTERNS = [
  '_pg9v_', '_White_ZU23_', '_M2_Technical_', '_S5_Proj2_',
  '_DShK_Technical_', '_QJY88_CTM131_', '_QJZ89_CTM131_',
  '_Kord_Safir_', '_MG3_DoorGun_', '_CROWS_M2_', '_50Cal_M1151_',
  '_50Cal_LUVW_', '_C6_LUVW_', '_M240_Loaders_', '_CROWS_M240_',
  '_GPMG_', '_RWS_M2_', '_Mag58_Bushmaser_', '_Kord_Tigr_',
  '_Arbalet_Kord_', '_BTR80_', '_BRDM2_', '_QJZ89_RWS_',
  '_QJZ89_CSK131_', '_QJY88_CSK131_', '_BTR82A_', '_30mm_',
  'LAV25_', 'Coyote_', 'ASLAV_', '_LAV_762_', '_LAV_C6_',
  '_RWS_C6_', '_TLAV_M2_', '_ZBL08_', '_HJ73_', '_Cupola_QJZ89_',
  '_AAVP7A1_M2_', '_40MM_MK19_', '_FV432_', '_EnforcerRWS_',
  '_MTLB_', '_23mm_', '_Scimitar_Rarden_', '_BMP1_', '_ZBD04A_',
  '_Refleks_Proj2_', '_100mm_Frag_', '_Warrior_', '_40mm_',
  'BFV_', '_Konkurs_', '_BMP2_', '_BMD4M_', '_BMD1M_',
  '_Kord_BTR-D_', '_PK_RWS_Gun_', '_Sprut_', '_2A45_',
  '_125mm_', '_ZPT-98_', '_2A46_', '_Cupola_Dshk_', '_2A20_',
  '_115mm_', '_M256A1_', '_L55_', '_L30A1_', '_L94A1_',
  '_BM21_', '_120mm_'
];

const KNIFE_WEAPONS = [
  'SOCP', 'AK74Bayonet', 'M9Bayonet', 'G3Bayonet',
  'Bayonet2000', 'AKMBayonet', 'SA80Bayonet', 'QNL-95', 'OKC-3S'
];

/**
 * Расчет времени на тяжелой технике и вертолетах
 * @param {Object} possess - объект с временем владения техникой (в секундах)
 * @returns {[number, number]} - [heavyTime, heliTime] в секундах
 */
export function calcVehicleTime(possess) {
  if (!possess) return [0, 0];
  
  let heliTime = 0;
  let heavyTime = 0;

  for (let key in possess) {
    const vehicleType = key.split('_')[1];
    
    if (HELI_VEHICLES.includes(vehicleType)) {
      heliTime += possess[key];
    }
    
    if (HEAVY_VEHICLES.includes(vehicleType)) {
      heavyTime += possess[key];
    }
  }

  return [heavyTime, heliTime];
}

/**
 * Расчет убийств на технике
 * @param {Object} weapons - объект с убийствами по оружию
 * @returns {number} - общее количество убийств на технике
 */
export function calcVehicleKills(weapons) {
  if (!weapons) return 0;
  
  const totalSum = VEHICLE_WEAPON_PATTERNS.reduce((sum, pattern) => {
    const keys = Object.keys(weapons);
    const matchingKeys = keys.filter((key) => key.includes(pattern));
    const sumForPattern = matchingKeys.reduce((vehicleSum, key) => {
      return vehicleSum + weapons[key];
    }, 0);
    return sum + sumForPattern;
  }, 0);

  return totalSum;
}

/**
 * Расчет убийств ножом
 * @param {Object} weapons - объект с убийствами по оружию
 * @returns {number} - количество убийств ножом
 */
export function calcKnifeKills(weapons) {
  if (!weapons) return 0;
  
  let knifeSum = 0;
  
  for (const [weaponKey, kills] of Object.entries(weapons)) {
    const weaponName = weaponKey.split('_').pop() || '';
    if (KNIFE_WEAPONS.includes(weaponName)) {
      knifeSum += kills;
    }
  }
  
  return knifeSum;
}

/**
 * Форматирование времени из минут или секунд
 * @param {number} time - время
 * @param {string} field - 'min' или 'sec'
 * @returns {string} - форматированное время
 */
export function formatTime(time, field = 'min') {
  if (!time || time === 0) return '0ч';
  
  let totalMinutes = time;
  
  if (field === 'sec') {
    totalMinutes = Math.floor(time / 60);
  }
  
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  
  const dDisplay = days > 0 ? days + 'д ' : '';
  const hDisplay = hours > 0 ? hours + 'ч' : '';
  const mDisplay = minutes > 0 && days === 0 ? ' ' + minutes + 'м' : '';
  
  return (dDisplay + hDisplay + mDisplay).trim() || '0ч';
}

/**
 * Получить топ роль игрока
 * @param {Object} roles - объект с временем по ролям (в минутах)
 * @returns {Object|null} - {name, time, icon, timeMinutes}
 */
export function getTopRole(roles) {
  if (!roles) return null;
  
  const rolesArray = Object.entries(roles);
  if (rolesArray.length === 0) return null;
  
  const sortedRoles = rolesArray.sort((a, b) => b[1] - a[1]);
  const [roleName, timeMinutes] = sortedRoles[0];
  
  // Извлекаем читабельное имя роли
  const roleDisplayName = roleName.split('_').pop() || roleName;
  
  return {
    name: roleDisplayName,
    time: formatTime(timeMinutes),
    icon: roleName.split('_').join(''),
    timeMinutes
  };
}

/**
 * Получить топ оружие игрока
 * @param {Object} weapons - объект с убийствами по оружию
 * @returns {Object|null} - {name, kills}
 */
export function getTopWeapon(weapons) {
  if (!weapons) return null;
  
  // Фильтруем техническое оружие и ножи
  const filteredWeapons = Object.entries(weapons).filter(([key]) => {
    // Исключаем оружие техники
    const isVehicle = VEHICLE_WEAPON_PATTERNS.some(pattern => key.includes(pattern));
    // Исключаем ножи
    const weaponName = key.split('_').pop() || '';
    const isKnife = KNIFE_WEAPONS.includes(weaponName);
    // Исключаем гранаты и артиллерию
    const isGrenade = key.includes('Projectile') || key.includes('Heavy');
    
    return !isVehicle && !isKnife && !isGrenade;
  });
  
  if (filteredWeapons.length === 0) return null;
  
  const sortedWeapons = filteredWeapons.sort((a, b) => b[1] - a[1]);
  const [weaponKey, kills] = sortedWeapons[0];
  
  // Извлекаем читабельное имя оружия
  const weaponParts = weaponKey.split('_');
  const weaponName = weaponParts[weaponParts.length - 1] || weaponKey;
  
  return {
    name: weaponName,
    kills,
    fullName: weaponKey
  };
}

/**
 * Получить текущий ранг и прогресс
 * @param {Object} user - объект игрока с scoreGroups
 * @param {Object} config - конфигурация рангов
 * @returns {Object|null} - {current, next, progress, groupId}
 */
export function getCurrentRank(user, config) {
  if (!user || !user.scoreGroups || !config) return null;
  
  const scoreGroups = user.scoreGroups;
  
  // Находим группу с максимальным скором
  let highGroupId = '1';
  let maxScore = 0;
  
  for (const groupId in scoreGroups) {
    if (scoreGroups[groupId] >= maxScore) {
      maxScore = scoreGroups[groupId];
      highGroupId = groupId;
    }
  }
  
  const currentGroup = config.icons?.[highGroupId];
  if (!currentGroup) return null;
  
  // Находим текущий и следующий ранг
  let currentRank = null;
  let nextRank = null;
  
  for (const rank of currentGroup) {
    if (maxScore >= rank.needScore) {
      currentRank = rank;
    } else if (!nextRank) {
      nextRank = rank;
      break;
    }
  }
  
  // Если нет следующего ранга, значит максимальный
  if (!nextRank) {
    nextRank = currentRank;
  }
  
  const progress = nextRank ? Math.min((maxScore / nextRank.needScore) * 100, 100) : 100;
  const isMaxRank = maxScore >= nextRank.needScore;
  
  return {
    current: currentRank ? {
      iconUrl: parseIconUrl(currentRank.iconUrl),
      needScore: currentRank.needScore,
      score: maxScore
    } : null,
    next: nextRank && !isMaxRank ? {
      iconUrl: parseIconUrl(nextRank.iconUrl),
      needScore: nextRank.needScore
    } : null,
    progress: Math.round(progress * 10) / 10,
    groupId: highGroupId,
    isMaxRank
  };
}

/**
 * Парсинг URL иконки
 * @param {string} url - URL с префиксом /URL:
 * @returns {string} - очищенный URL
 */
export function parseIconUrl(url) {
  if (!url) return '';
  let newUrl = url.replace('/URL:', '');
  if (newUrl.endsWith('+')) {
    newUrl = newUrl.slice(0, -1);
  }
  return newUrl;
}

/**
 * Получить детальную статистику по всем оружиям
 * @param {Object} weapons - объект с убийствами по оружию
 * @returns {Array} - массив {name, kills, type}
 */
export function getDetailedWeapons(weapons) {
  if (!weapons) return [];
  
  const result = [];
  
  for (const [weaponKey, kills] of Object.entries(weapons)) {
    if (kills === 0) continue;
    
    const weaponParts = weaponKey.split('_');
    const weaponName = weaponParts[weaponParts.length - 1] || weaponKey;
    
    let type = 'infantry';
    if (VEHICLE_WEAPON_PATTERNS.some(pattern => weaponKey.includes(pattern))) {
      type = 'vehicle';
    } else if (KNIFE_WEAPONS.includes(weaponName)) {
      type = 'knife';
    } else if (weaponKey.includes('Projectile') || weaponKey.includes('Heavy')) {
      type = 'artillery';
    }
    
    result.push({
      name: weaponName,
      kills,
      type,
      fullName: weaponKey
    });
  }
  
  return result.sort((a, b) => b.kills - a.kills);
}

/**
 * Получить детальную статистику по всем ролям
 * @param {Object} roles - объект с временем по ролям (в минутах)
 * @returns {Array} - массив {name, time, timeMinutes, icon}
 */
export function getDetailedRoles(roles) {
  if (!roles) return [];
  
  const result = [];
  
  for (const [roleName, timeMinutes] of Object.entries(roles)) {
    if (timeMinutes === 0) continue;
    
    const roleDisplayName = roleName.split('_').pop() || roleName;
    
    result.push({
      name: roleDisplayName,
      time: formatTime(timeMinutes),
      timeMinutes,
      icon: roleName.split('_').join('')
    });
  }
  
  return result.sort((a, b) => b.timeMinutes - a.timeMinutes);
}

/**
 * Расчет средних убийств за матч
 * @param {number} kills - убийства
 * @param {number} matches - матчи
 * @returns {number} - среднее
 */
export function calcAvgKillsPerMatch(kills, matches) {
  if (!matches || matches === 0) return 0;
  return Math.round((kills / matches) * 10) / 10;
}
