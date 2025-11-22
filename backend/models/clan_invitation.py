import uuid
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID, JSONB
from . import db


class ClanInvitation(db.Model):
    __tablename__ = 'clan_invitations'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    clan_id = db.Column(UUID(as_uuid=True), db.ForeignKey('clans.id', ondelete='CASCADE'), nullable=False)
    player_id = db.Column(UUID(as_uuid=True), db.ForeignKey('players.id', ondelete='CASCADE'), nullable=False)
    invited_by_id = db.Column(UUID(as_uuid=True), db.ForeignKey('players.id', ondelete='CASCADE'), nullable=False)
    message = db.Column(db.Text, nullable=True)
    status = db.Column(db.Text, nullable=False, default='pending')  # pending|accepted|rejected
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    
    # Unique constraint - один игрок может иметь только одно активное приглашение в клан
    __table_args__ = (
        db.UniqueConstraint('clan_id', 'player_id', name='unique_clan_invitation'),
    )
    
    # Relationships
    clan = db.relationship('Clan', foreign_keys=[clan_id])
    player = db.relationship('Player', foreign_keys=[player_id], backref='invitations')
    invited_by = db.relationship('Player', foreign_keys=[invited_by_id])
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'clanId': str(self.clan_id),
            'playerId': str(self.player_id),
            'invitedById': str(self.invited_by_id),
            'message': self.message,
            'status': self.status,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'player': self.player.to_dict() if self.player else None,
            'invitedBy': self.invited_by.to_dict() if self.invited_by else None,
            'clan': {
                'id': str(self.clan.id),
                'name': self.clan.name,
                'tag': self.clan.tag
            } if self.clan else None
        }
    
    def __repr__(self):
        return f'<ClanInvitation player={self.player_id} -> clan={self.clan_id} status={self.status}>'
