import uuid
from datetime import datetime, date
from sqlalchemy import Column, String, DateTime, Date, Text, ForeignKey
from sqlalchemy.orm import relationship
from backend.database import Base

class HistoricoVisita(Base):
    __tablename__ = "historico_visitas"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    pdv_id = Column(String(36), ForeignKey("pdvs.id", ondelete="CASCADE"), nullable=False)
    vendedor_nome = Column(String(100), default="Gemima")
    tipo_contato = Column(String(50), nullable=False, default="WhatsApp")
    # 'WhatsApp', 'Ligacao', 'Visita Presencial', 'Envio de Amostra', 'Reuniao'
    data_contato = Column(DateTime, default=datetime.utcnow)
    anotacoes = Column(Text, nullable=False)
    proxima_acao = Column(String(150), nullable=True)
    data_proxima_acao = Column(Date, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    pdv = relationship("PDV", back_populates="visitas")
