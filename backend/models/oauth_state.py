import uuid
from datetime import datetime, timedelta
from sqlalchemy.dialects.postgresql import UUID
from . import db


class OAuthState(db.Model):
    """Временное хранилище state для OAuth (CSRF защита)"""
    __tablename__ = 'oauth_states'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    state = db.Column(db.Text, unique=True, nullable=False, index=True)
    player_id = db.Column(UUID(as_uuid=True), db.ForeignKey('players.id', ondelete='CASCADE'), nullable=False)
    provider = db.Column(db.Text, nullable=False)  # 'discord', 'steam'
    return_url = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    expires_at = db.Column(db.DateTime, nullable=False)
    
    player = db.relationship('Player')
    
    @property
    def is_expired(self):
        return datetime.utcnow() > self.expires_at
    
    @classmethod
    def create(cls, player_id, provider, return_url, minutes=10):
        """Создать state с автоматической очисткой через 10 минут"""
        state = uuid.uuid4().hex
        return cls(
            state=state,
            player_id=player_id,
            provider=provider,
            return_url=return_url,
            expires_at=datetime.utcnow() + timedelta(minutes=minutes)
        )
    
    @classmethod
    def cleanup_expired(cls):
        """Удалить истекшие states"""
        cls.query.filter(cls.expires_at < datetime.utcnow()).delete()
        db.session.commit()
