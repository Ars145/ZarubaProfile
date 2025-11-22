import uuid
from datetime import datetime, timedelta
from sqlalchemy.dialects.postgresql import UUID
from . import db


class Session(db.Model):
    """JWT Session для аутентификации"""
    __tablename__ = 'sessions'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    player_id = db.Column(UUID(as_uuid=True), db.ForeignKey('players.id', ondelete='CASCADE'), nullable=False, index=True)
    refresh_token = db.Column(db.Text, unique=True, nullable=False, index=True)
    user_agent = db.Column(db.Text, nullable=True)
    ip_address = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    expires_at = db.Column(db.DateTime, nullable=False)
    last_used = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    player = db.relationship('Player', backref=db.backref('sessions', cascade='all, delete-orphan'))
    
    @property
    def is_expired(self):
        return datetime.utcnow() > self.expires_at
    
    @classmethod
    def create(cls, player_id, refresh_token, user_agent=None, ip_address=None, days=30):
        """Создать новую сессию"""
        return cls(
            player_id=player_id,
            refresh_token=refresh_token,
            user_agent=user_agent,
            ip_address=ip_address,
            expires_at=datetime.utcnow() + timedelta(days=days)
        )
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'playerId': str(self.player_id),
            'createdAt': self.created_at.isoformat(),
            'expiresAt': self.expires_at.isoformat(),
            'lastUsed': self.last_used.isoformat(),
            'isExpired': self.is_expired
        }
    
    def __repr__(self):
        return f'<Session {self.id} for Player {self.player_id}>'
