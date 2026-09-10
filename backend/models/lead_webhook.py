import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Text, ForeignKey
from backend.database import Base

class LeadWebhook(Base):
    __tablename__ = "leads_webhook"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    ad_id = Column(String(100), nullable=True)
    form_id = Column(String(100), nullable=True)
    campaign_name = Column(String(200), nullable=True)
    nome = Column(String(150), nullable=True)
    email = Column(String(150), nullable=True)
    telefone = Column(String(50), nullable=True)
    empresa = Column(String(150), nullable=True)
    cidade = Column(String(100), nullable=True)
    estado = Column(String(2), nullable=True)
    regiao = Column(String(50), default="Salvador")
    payload_bruto = Column(Text, nullable=False)
    processado = Column(Boolean, default=True)
    pdv_id = Column(String(36), ForeignKey("pdvs.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
