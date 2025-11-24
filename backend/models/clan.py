import uuid
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID, JSONB
from . import db


class Clan(db.Model):
    __tablename__ = 'clans'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = db.Column(db.Text, nullable=False)
    tag = db.Column(db.Text, unique=True, nullable=False, index=True)
    description = db.Column(db.Text, nullable=True)
    theme = db.Column(db.Text, nullable=False, default='orange')  # orange|blue|yellow
    banner_url = db.Column(db.Text, nullable=True)
    logo_url = db.Column(db.Text, nullable=True)
    requirements = db.Column(JSONB, nullable=True, default=dict)
    level = db.Column(db.Integer, nullable=False, default=1)
    winrate = db.Column(db.Float, nullable=False, default=0.0)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    
    # Relationships
    members = db.relationship('ClanMember', back_populates='clan', cascade='all, delete-orphan')
    applications = db.relationship('ClanApplication', back_populates='clan', cascade='all, delete-orphan')
    
    def to_dict(self, include_members=False):
        # Найти владельца клана
        owner = next((m for m in self.members if m.role == 'owner'), None)
        
        data = {
            'id': str(self.id),
            'name': self.name,
            'tag': self.tag,
            'description': self.description,
            'theme': self.theme,
            'bannerUrl': self.banner_url,
            'logoUrl': self.logo_url,
            'requirements': self.requirements or {},
            'level': self.level,
            'winrate': self.winrate,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'memberCount': len(self.members),
            'isRecruiting': self.requirements.get('isOpen', True) if self.requirements else True,
            'ownerId': str(owner.player_id) if owner else None
        }
        
        if include_members:
            data['members'] = [member.to_dict() for member in self.members]
        
        return data
    
    def __repr__(self):
        return f'<Clan [{self.tag}] {self.name}>'
