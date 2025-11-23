import uuid
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID, JSONB
from . import db


class ClanMember(db.Model):
    __tablename__ = 'clan_members'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    clan_id = db.Column(UUID(as_uuid=True), db.ForeignKey('clans.id', ondelete='CASCADE'), nullable=False)
    player_id = db.Column(UUID(as_uuid=True), db.ForeignKey('players.id', ondelete='CASCADE'), nullable=False)
    role = db.Column(db.Text, nullable=False, default='member')  # owner|member
    stats_snapshot = db.Column(JSONB, nullable=True, default=dict)
    joined_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    
    # Unique constraint
    __table_args__ = (
        db.UniqueConstraint('clan_id', 'player_id', name='unique_clan_member'),
    )
    
    # Relationships
    clan = db.relationship('Clan', back_populates='members')
    player = db.relationship('Player', back_populates='memberships')
    
    def to_dict(self, include_online_status=True):
        return {
            'id': str(self.id),
            'clanId': str(self.clan_id),
            'playerId': str(self.player_id),
            'role': self.role,
            'statsSnapshot': self.stats_snapshot or {},
            'joinedAt': self.joined_at.isoformat() if self.joined_at else None,
            'player': self.player.to_dict(include_online_status=include_online_status) if self.player else None
        }
    
    def __repr__(self):
        return f'<ClanMember clan={self.clan_id} player={self.player_id} role={self.role}>'
