import uuid
from sqlalchemy.dialects.postgresql import UUID
from . import db


class Player(db.Model):
    __tablename__ = 'players'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    steam_id = db.Column(db.Text, unique=True, nullable=False, index=True)
    username = db.Column(db.Text, nullable=False)
    discord_id = db.Column(db.Text, nullable=True)
    current_clan_id = db.Column(UUID(as_uuid=True), db.ForeignKey('clans.id', ondelete='SET NULL'), nullable=True)
    
    # Relationships
    current_clan = db.relationship('Clan', foreign_keys=[current_clan_id], backref='current_members')
    memberships = db.relationship('ClanMember', back_populates='player', cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'steamId': self.steam_id,
            'username': self.username,
            'discordId': self.discord_id,
            'currentClanId': str(self.current_clan_id) if self.current_clan_id else None
        }
    
    def __repr__(self):
        return f'<Player {self.username} ({self.steam_id})>'
