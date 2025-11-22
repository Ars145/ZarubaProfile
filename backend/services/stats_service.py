"""
Сервис для работы со статистикой игроков Squad
Портировано из Discord бота (JavaScript -> Python)
"""

# Списки техники для категоризации
HEAVY_VEHICLES = [
    "ZTZ99", "T72B3", "T62", "M1A1", "AUS", "M1A2", "2A6", "FV4034",
    "ZBD04A", "FV510UA", "FV510", "BFV", "BMP2", "BMP1", "MTLB",
    "FV107", "FV432", "AAVP7A1", "ZSL10", "ZBL08", "M1126", "M113A3",
    "LAV", "LAV6", "CROWS", "ASLAV", "LAV2", "LAV25", "BTR82A", "BTR80",
    "Sprut", "BMD4M", "BMD1M", "ZTD05", "ZBD05"
]

HELI_VEHICLES = [
    "Z8G", "CH146", "MRH90", "SA330", "MI8", "UH60",
    "UH1Y", "MI17", "Z8J"
]

HEAVY_VEHICLE_WEAPONS = [
    "_pg9v_", "_White_ZU23_", "_M2_Technical_", "_S5_Proj2_", "_DShK_Technical_",
    "_QJY88_CTM131_", "_QJZ89_CTM131_", "_Kord_Safir_", "_MG3_DoorGun_",
    "_CROWS_M2_", "_50Cal_M1151_", "_50Cal_LUVW_", "_C6_LUVW_", "_M240_Loaders_",
    "_CROWS_M240_", "_GPMG_", "_RWS_M2_", "_Mag58_Bushmaser_", "_Kord_Tigr_",
    "_Arbalet_Kord_", "_BTR80_", "_BRDM2_", "_QJZ89_RWS_", "_QJZ89_CSK131_",
    "_QJY88_CSK131_", "_BTR82A_", "_30mm_", "LAV25_", "Coyote_", "ASLAV_",
    "_LAV_762_", "_LAV_C6_", "_RWS_C6_", "_TLAV_M2_", "_ZBL08_", "_HJ73_",
    "_Cupola_QJZ89_", "_AAVP7A1_M2_", "_40MM_MK19_", "_FV432_", "_EnforcerRWS_",
    "_MTLB_", "_23mm_", "_Scimitar_Rarden_", "_BMP1_", "_ZBD04A_",
    "_Refleks_Proj2_", "_100mm_Frag_", "_Warrior_", "_40mm_", "BFV_",
    "_Konkurs_", "_BMP2_", "_BMD4M_", "_BMD1M_", "_Kord_BTR-D_", "_PK_RWS_Gun_",
    "_Sprut_", "_2A45_", "_125mm_", "_ZPT-98_", "_2A46_", "_Cupola_Dshk_",
    "_2A20_", "_115mm_", "_M256A1_", "_L55_", "_L30A1_", "_L94A1_",
    "_BM21_", "_120mm_"
]


def calc_vehicle_time(possess):
    """
    Расчёт времени в тяжёлой технике и вертолётах
    
    Args:
        possess: dict - словарь времени владения техникой {vehicle_name: time_ms}
    
    Returns:
        tuple: (heavy_time, heli_time) в миллисекундах
    """
    heli_time = 0
    heavy_time = 0
    
    for vehicle_key, time_value in possess.items():
        # Получаем название техники из ключа (формат: prefix_VehicleName_suffix)
        parts = vehicle_key.split('_')
        if len(parts) >= 2:
            vehicle_name = parts[1]
            
            if vehicle_name in HELI_VEHICLES:
                heli_time += time_value
            
            if vehicle_name in HEAVY_VEHICLES:
                heavy_time += time_value
    
    return heavy_time, heli_time


def calc_vehicle_kills(weapons):
    """
    Расчёт убийств из тяжёлой техники
    
    Args:
        weapons: dict - словарь убийств по оружию {weapon_name: kills}
    
    Returns:
        int: общее количество убийств из техники
    """
    total_kills = 0
    
    for vehicle_weapon in HEAVY_VEHICLE_WEAPONS:
        # Находим все оружия, содержащие название техники
        matching_weapons = [key for key in weapons.keys() if vehicle_weapon in key]
        
        # Суммируем убийства для найденных оружий
        for weapon_key in matching_weapons:
            total_kills += weapons[weapon_key]
    
    return total_kills


def format_time(time_value, field='min'):
    """
    Форматирование времени в читаемый вид
    
    Args:
        time_value: int - время в минутах или секундах (мс)
        field: str - 'min' или 'sec'
    
    Returns:
        str: отформатированное время (например, "5д 3ч" или "2ч 30м")
    """
    if field == 'sec':
        # Время в миллисекундах
        time_value = time_value / 1000  # переводим в секунды
        hours = int((time_value % (3600 * 24)) / 3600)
        minutes = int((time_value % 3600) / 60)
        
        h_display = f"{hours}ч" if hours > 0 else ""
        m_display = f"{minutes}м" if minutes > 0 else ""
        
        return h_display + m_display if (h_display or m_display) else "0м"
    
    # Время в минутах
    days = int(time_value / 1440)
    hours = int((time_value % 1440) / 60)
    
    d_display = f"{days}д " if days > 0 else ""
    h_display = f"{hours}ч" if hours > 0 else ""
    
    return d_display + h_display if (d_display or h_display) else "0ч"


def get_user_high_score_and_group(user):
    """
    Получить высший балл и группу игрока
    
    Args:
        user: dict - документ игрока из MongoDB
    
    Returns:
        tuple: (group_id, score) или None
    """
    if not user or 'scoreGroups' not in user:
        return None
    
    score_groups = user['scoreGroups']
    high_group_id = "1"
    
    for group_id, score in score_groups.items():
        if score >= score_groups.get(high_group_id, 0):
            high_group_id = group_id
    
    return high_group_id, score_groups.get(high_group_id, 0)


def categorize_weapons(weapons):
    """
    Категоризация оружия по типам (как в Discord боте)
    
    Args:
        weapons: dict - словарь убийств по оружию
    
    Returns:
        dict: категоризированное оружие
    """
    result = {}
    artillery_sum = 0
    knife_sum = 0
    
    for weapon_key, kills in weapons.items():
        parts = weapon_key.split('_')
        
        if len(parts) < 2:
            continue
        
        second_part = parts[1] if len(parts) > 1 else ""
        
        # Проверка на артиллерию
        if 'Projectile' in second_part:
            prefix = parts[1] if len(parts) > 1 else ""
            suffix = parts[2] if len(parts) > 2 else ""
            weapon_name = f"{prefix}_{suffix}"
            artillery_sum += kills
        else:
            weapon_name = second_part
        
        # Проверка на нож
        if 'knife' in weapon_key.lower() or 'shovel' in weapon_key.lower():
            knife_sum += kills
            continue
        
        # Суммируем убийства по типу оружия
        if weapon_name in result:
            result[weapon_name] += kills
        else:
            result[weapon_name] = kills
    
    # Добавляем суммарные данные
    if artillery_sum > 0:
        result['Artillery'] = artillery_sum
    if knife_sum > 0:
        result['Knife'] = knife_sum
    
    return result


def calculate_kd_ratio(kills, deaths):
    """
    Расчёт K/D соотношения
    
    Args:
        kills: int - количество убийств
        deaths: int - количество смертей
    
    Returns:
        float: K/D ratio (округлённый до 2 знаков)
    """
    if deaths == 0:
        return float(kills) if kills > 0 else 0.0
    
    return round(kills / deaths, 2)
