import os
import requests
from typing import Dict, List, Optional


class SteamService:
    """Сервис для работы со Steam Web API"""
    
    BASE_URL = "https://api.steampowered.com"
    
    def __init__(self):
        self.api_key = os.getenv('STEAM_WEB_API_KEY')
        if not self.api_key:
            raise ValueError("STEAM_WEB_API_KEY не установлен в переменных окружения")
    
    def get_player_summaries(self, steam_ids: List[str]) -> Dict[str, dict]:
        """
        Получить информацию о игроках из Steam API
        
        Args:
            steam_ids: Список Steam ID (до 100 за раз)
            
        Returns:
            Словарь {steam_id: player_data}
        """
        if not steam_ids:
            return {}
        
        # Steam API принимает до 100 ID за раз
        steam_ids = steam_ids[:100]
        
        url = f"{self.BASE_URL}/ISteamUser/GetPlayerSummaries/v2/"
        params = {
            'key': self.api_key,
            'steamids': ','.join(steam_ids)
        }
        
        try:
            response = requests.get(url, params=params, timeout=5)
            response.raise_for_status()
            data = response.json()
            
            # Преобразуем в словарь для быстрого доступа
            result = {}
            for player in data.get('response', {}).get('players', []):
                result[player['steamid']] = player
            
            return result
            
        except requests.RequestException as e:
            print(f"[STEAM API ERROR] Не удалось получить данные: {e}")
            return {}
    
    def get_online_status(self, steam_id: str) -> Optional[str]:
        """
        Получить онлайн статус одного игрока
        
        Args:
            steam_id: Steam ID игрока
            
        Returns:
            Статус: "В СЕТИ", "В ИГРЕ", "НЕ В СЕТИ" или None если ошибка
        """
        players = self.get_player_summaries([steam_id])
        
        if steam_id not in players:
            return None
        
        player = players[steam_id]
        return self._map_persona_state(player.get('personastate', 0), player.get('gameid'))
    
    def get_online_statuses(self, steam_ids: List[str]) -> Dict[str, str]:
        """
        Получить онлайн статусы нескольких игроков
        
        Args:
            steam_ids: Список Steam ID
            
        Returns:
            Словарь {steam_id: status}
        """
        players = self.get_player_summaries(steam_ids)
        
        result = {}
        for steam_id in steam_ids:
            if steam_id in players:
                player = players[steam_id]
                result[steam_id] = self._map_persona_state(
                    player.get('personastate', 0),
                    player.get('gameid')
                )
            else:
                result[steam_id] = 'НЕ В СЕТИ'
        
        return result
    
    def _map_persona_state(self, persona_state: int, game_id: Optional[str] = None) -> str:
        """
        Преобразовать personastate Steam API в наш формат
        
        Steam API personastate:
        0 - Offline
        1 - Online
        2 - Busy
        3 - Away
        4 - Snooze
        5 - Looking to trade
        6 - Looking to play
        
        Args:
            persona_state: Код статуса из Steam API
            game_id: ID игры если играет
            
        Returns:
            "В СЕТИ", "В ИГРЕ", или "НЕ В СЕТИ"
        """
        # Если игрок в игре - показываем "В ИГРЕ"
        if game_id:
            return 'В ИГРЕ'
        
        # Если онлайн (любой активный статус кроме offline)
        if persona_state in [1, 2, 3, 5, 6]:
            return 'В СЕТИ'
        
        # Offline, Snooze или неизвестный статус
        return 'НЕ В СЕТИ'


# Singleton instance
steam_service = SteamService()
