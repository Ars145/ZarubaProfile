import uuid
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID, JSONB
from . import db


class ClanApplication(db.Model):
    __tablename__ = 'clan_applications'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    clan_id = db.Column(UUID(as_uuid=True), db.ForeignKey('clans.id', ondelete='CASCADE'), nullable=False)
    player_name = db.Column(db.Text, nullable=False)
    player_steam_id = db.Column(db.Text, nullable=False)
    message = db.Column(db.Text, nullable=True)
    status = db.Column(db.Text, nullable=False, default='pending')  # pending|accepted|rejected
    stats_snapshot = db.Column(JSONB, nullable=True, default=dict)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    
    # Relationships
    clan = db.relationship('Clan', back_populates='applications')
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'clanId': str(self.clan_id),
            'playerName': self.player_name,
            'playerSteamId': self.player_steam_id,
            'message': self.message,
            'status': self.status,
            'statsSnapshot': self.stats_snapshot or {},
            'createdAt': self.created_at.isoformat() if self.created_at else None
        }
    
    def __repr__(self):
        return f'<ClanApplication {self.player_name} -> clan={self.clan_id} status={self.status}>'
