from flask import jsonify
from . import api
from services.mongo_service import get_collection
from services.stats_service import (
    calc_vehicle_time,
    calc_vehicle_kills,
    format_time,
    get_user_high_score_and_group,
    categorize_weapons,
    calculate_kd_ratio
)


@api.route('/stats/<steam_id>', methods=['GET'])
def get_player_stats(steam_id):
    """Получить статистику игрока по Steam ID"""
    try:
        collection = get_collection('mainstats')
        user = collection.find_one({'_id': steam_id})
        
        if not user:
            return jsonify({
                'success': False,
                'error': 'Игрок не найден в базе данных'
            }), 404
        
        # Безопасное извлечение числовых полей (могут быть объектами или отсутствовать)
        def safe_int(value, default=0):
            """Безопасное извлечение integer из значения"""
            if isinstance(value, (int, float)):
                return int(value)
            elif isinstance(value, dict):
                # Если это объект, берём первое числовое значение
                for v in value.values():
                    if isinstance(v, (int, float)):
                        return int(v)
                return default
            return default
        
        kills = safe_int(user.get('kills', 0))
        deaths = safe_int(user.get('deaths', 0))
        matches = safe_int(user.get('matches', 0))
        wins = safe_int(user.get('wins', 0))
        
        # Базовая статистика
        stats = {
            'steamId': steam_id,
            'playerName': user.get('playerName', 'Unknown'),
            'kills': kills,
            'deaths': deaths,
            'kd': calculate_kd_ratio(kills, deaths),
            'revives': safe_int(user.get('revives', 0)),
            'teamkills': safe_int(user.get('teamkills', 0)),
            'matches': matches,
            'wins': wins,
            'winRate': round((wins / matches) * 100, 1) if matches > 0 else 0,
        }
        
        # Время игры
        if 'time' in user:
            stats['playtime'] = format_time(user['time'], 'min')
            stats['playtimeMinutes'] = user['time']
        
        # Время в роли командира и отделения
        commander_time = safe_int(user.get('commanderTime', 0))
        commander_matches = safe_int(user.get('commanderMatches', 0))
        squad_lead_time = safe_int(user.get('squadLeadTime', 0))
        
        if commander_time > 0:
            stats['commanderTime'] = format_time(commander_time, 'min')
            stats['commanderMatches'] = commander_matches
        
        if squad_lead_time > 0:
            stats['squadLeadTime'] = format_time(squad_lead_time, 'min')
        
        # Время в технике
        if 'possess' in user:
            heavy_time, heli_time = calc_vehicle_time(user['possess'])
            stats['heavyVehicleTime'] = format_time(heavy_time / 60000, 'min')  # мс -> минуты
            stats['heliTime'] = format_time(heli_time / 60000, 'min')
            stats['heavyVehicleTimeMs'] = heavy_time
            stats['heliTimeMs'] = heli_time
        
        # Убийства из техники
        if 'weapons' in user:
            stats['vehicleKills'] = calc_vehicle_kills(user['weapons'])
            
            # Категоризированное оружие (топ-10)
            categorized = categorize_weapons(user['weapons'])
            sorted_weapons = sorted(categorized.items(), key=lambda x: x[1], reverse=True)
            stats['topWeapons'] = [
                {'name': weapon, 'kills': kills} 
                for weapon, kills in sorted_weapons[:10]
            ]
        
        # Роли (топ-5)
        if 'roles' in user:
            sorted_roles = sorted(user['roles'].items(), key=lambda x: x[1], reverse=True)
            stats['topRoles'] = [
                {'name': role, 'time': format_time(time, 'min'), 'minutes': time} 
                for role, time in sorted_roles[:5]
            ]
        
        # Ранговая система
        if 'scoreGroups' in user:
            rank_data = get_user_high_score_and_group(user)
            if rank_data:
                group_id, score = rank_data
                stats['rank'] = {
                    'groupId': group_id,
                    'score': score
                }
        
        return jsonify({
            'success': True,
            'stats': stats
        }), 200
        
    except RuntimeError as e:
        return jsonify({
            'success': False,
            'error': 'MongoDB not configured'
        }), 503
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@api.route('/stats/search/<player_name>', methods=['GET'])
def search_player_by_name(player_name):
    """Поиск игрока по имени (частичное совпадение)"""
    try:
        collection = get_collection('mainstats')
        
        # Поиск по частичному совпадению имени (регистронезависимый)
        users = collection.find(
            {'playerName': {'$regex': player_name, '$options': 'i'}},
            {'_id': 1, 'playerName': 1, 'kills': 1, 'deaths': 1}
        ).limit(10)
        
        # Безопасное извлечение числовых полей
        def safe_int(value, default=0):
            if isinstance(value, (int, float)):
                return int(value)
            elif isinstance(value, dict):
                for v in value.values():
                    if isinstance(v, (int, float)):
                        return int(v)
            return default
        
        results = []
        for user in users:
            kills = safe_int(user.get('kills', 0))
            deaths = safe_int(user.get('deaths', 0))
            
            results.append({
                'steamId': user['_id'],
                'playerName': user.get('playerName', 'Unknown'),
                'kills': kills,
                'deaths': deaths,
                'kd': calculate_kd_ratio(kills, deaths)
            })
        
        return jsonify({
            'success': True,
            'players': results,
            'count': len(results)
        }), 200
        
    except RuntimeError:
        return jsonify({
            'success': False,
            'error': 'MongoDB not configured'
        }), 503
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@api.route('/stats/leaderboard', methods=['GET'])
def get_leaderboard():
    """Получить топ-10 игроков по убийствам"""
    try:
        from flask import request
        
        # Параметры сортировки
        sort_by = request.args.get('sortBy', 'kills')  # kills, kd, matches
        limit = min(int(request.args.get('limit', 10)), 50)  # максимум 50
        
        collection = get_collection('mainstats')
        
        # Определяем поле для сортировки
        sort_field = sort_by if sort_by in ['kills', 'deaths', 'matches', 'wins'] else 'kills'
        
        # Безопасное извлечение числовых полей
        def safe_int(value, default=0):
            if isinstance(value, (int, float)):
                return int(value)
            elif isinstance(value, dict):
                for v in value.values():
                    if isinstance(v, (int, float)):
                        return int(v)
            return default
        
        # Получаем топ игроков
        users = collection.find(
            {},
            {'_id': 1, 'playerName': 1, 'kills': 1, 'deaths': 1, 'matches': 1, 'wins': 1}
        ).sort(sort_field, -1).limit(limit)
        
        leaderboard = []
        for idx, user in enumerate(users, 1):
            kills = safe_int(user.get('kills', 0))
            deaths = safe_int(user.get('deaths', 0))
            matches = safe_int(user.get('matches', 0))
            wins = safe_int(user.get('wins', 0))
            
            leaderboard.append({
                'rank': idx,
                'steamId': user['_id'],
                'playerName': user.get('playerName', 'Unknown'),
                'kills': kills,
                'deaths': deaths,
                'kd': calculate_kd_ratio(kills, deaths),
                'matches': matches,
                'wins': wins,
                'winRate': round((wins / matches) * 100, 1) if matches > 0 else 0
            })
        
        return jsonify({
            'success': True,
            'leaderboard': leaderboard,
            'sortedBy': sort_by,
            'count': len(leaderboard)
        }), 200
        
    except RuntimeError:
        return jsonify({
            'success': False,
            'error': 'MongoDB not configured'
        }), 503
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@api.route('/stats/ranks', methods=['GET'])
def get_rank_config():
    """Получить конфигурацию ранговой системы"""
    try:
        config_collection = get_collection('configs')
        config = config_collection.find_one({'type': 'score'})
        
        if not config:
            return jsonify({
                'success': False,
                'error': 'Rank configuration not found'
            }), 404
        
        return jsonify({
            'success': True,
            'rankConfig': {
                'icons': config.get('icons', {}),
                'groups': list(config.get('icons', {}).keys())
            }
        }), 200
        
    except RuntimeError:
        return jsonify({
            'success': False,
            'error': 'MongoDB not configured'
        }), 503
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
