import uuid
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID
from . import db


class Player(db.Model):
    __tablename__ = 'players'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    steam_id = db.Column(db.Text, unique=True, nullable=False, index=True)
    username = db.Column(db.Text, nullable=False)
    discord_id = db.Column(db.Text, nullable=True, index=True)
    discord_username = db.Column(db.Text, nullable=True)
    discord_avatar = db.Column(db.Text, nullable=True)
    avatar_url = db.Column(db.Text, nullable=True)
    current_clan_id = db.Column(UUID(as_uuid=True), db.ForeignKey('clans.id', ondelete='SET NULL'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime, nullable=True)
    
    # Relationships
    current_clan = db.relationship('Clan', foreign_keys=[current_clan_id], backref='current_members')
    memberships = db.relationship('ClanMember', back_populates='player', cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'steamId': self.steam_id,
            'username': self.username,
            'discordId': self.discord_id,
            'discordUsername': self.discord_username,
            'discordAvatar': self.discord_avatar,
            'avatarUrl': self.avatar_url,
            'currentClanId': str(self.current_clan_id) if self.current_clan_id else None,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'lastLogin': self.last_login.isoformat() if self.last_login else None
        }
    
    def __repr__(self):
        return f'<Player {self.username} ({self.steam_id})>'
