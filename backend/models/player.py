import uuid
from datetime import datetime, timedelta
from sqlalchemy.dialects.postgresql import UUID
from . import db


class Player(db.Model):
    __tablename__ = 'players'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    steam_id = db.Column(db.Text, unique=True, nullable=False, index=True)
    username = db.Column(db.Text, nullable=False)
    discord_id = db.Column(db.Text, nullable=True, index=True)
    discord_username = db.Column(db.Text, nullable=True)
    discord_avatar_url = db.Column(db.Text, nullable=True)
    avatar_url = db.Column(db.Text, nullable=True)
    current_clan_id = db.Column(UUID(as_uuid=True), db.ForeignKey('clans.id', ondelete='SET NULL'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime, nullable=True)
    
    # Relationships
    current_clan = db.relationship('Clan', foreign_keys=[current_clan_id], backref='current_members')
    memberships = db.relationship('ClanMember', back_populates='player', cascade='all, delete-orphan')
    applications = db.relationship('ClanApplication', back_populates='player', cascade='all, delete-orphan')
    
    def get_online_status(self, use_steam_api=False):
        """Определяет онлайн статус игрока
        
        Args:
            use_steam_api: Использовать Steam Web API для получения реального статуса
        
        Returns:
            - В СЕТИ: онлайн в Steam (если use_steam_api=True) или заходил менее 15 минут назад
            - В ИГРЕ: играет в игру (если use_steam_api=True) или заходил менее 1 часа назад
            - НЕ В СЕТИ: оффлайн
        """
        if use_steam_api:
            try:
                from services.steam_service import steam_service
                status = steam_service.get_online_status(self.steam_id)
                if status:
                    return status
            except Exception as e:
                print(f"[STEAM API ERROR] Fallback to last_login: {e}")
        
        # Fallback на last_login если Steam API недоступен
        if not self.last_login:
            return 'НЕ В СЕТИ'
        
        now = datetime.utcnow()
        time_diff = now - self.last_login
        
        if time_diff < timedelta(minutes=15):
            return 'В СЕТИ'
        elif time_diff < timedelta(hours=1):
            return 'В ИГРЕ'
        else:
            return 'НЕ В СЕТИ'
    
    def to_dict(self, include_online_status=False, use_steam_api=False):
        result = {
            'id': str(self.id),
            'steamId': self.steam_id,
            'username': self.username,
            'discordId': self.discord_id,
            'discordUsername': self.discord_username,
            'discordAvatarUrl': self.discord_avatar_url,
            'avatarUrl': self.avatar_url,
            'currentClanId': str(self.current_clan_id) if self.current_clan_id else None,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'lastLogin': self.last_login.isoformat() if self.last_login else None
        }
        
        if include_online_status:
            result['onlineStatus'] = self.get_online_status(use_steam_api=use_steam_api)
        
        return result
    
    def __repr__(self):
        return f'<Player {self.username} ({self.steam_id})>'
