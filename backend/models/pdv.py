import uuid
from datetime import datetime, date
from sqlalchemy import Column, String, Integer, Float, Boolean, Date, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from backend.database import Base

class PDV(Base):
    __tablename__ = "pdvs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    razao_social = Column(String(200), nullable=False)
    nome_fantasia = Column(String(200), nullable=False)
    cnpj_cpf = Column(String(25), nullable=True)
    responsavel = Column(String(120), nullable=True)
    telefone_whatsapp = Column(String(30), nullable=False)
    email = Column(String(150), nullable=True)

    # Localização e Polos Regionais (Salvador, SP, SC)
    endereco = Column(Text, nullable=True)
    bairro = Column(String(100), nullable=True)
    cidade = Column(String(100), nullable=False)
    estado = Column(String(2), nullable=False)
    regiao = Column(String(50), nullable=False, default="Salvador")  # 'Salvador', 'Sao Paulo', 'Santa Catarina', 'Outro'
    cep = Column(String(15), nullable=True)

    # Segmentação e Origem
    categoria = Column(String(50), default="Emporio")  # 'Emporio', 'Academia', 'Box Crossfit', 'Farmacia', 'Suplementos', 'Cafeteria', 'Outro'
    origem = Column(String(50), default="Trafego Pago")  # 'Trafego Pago', 'Organico', 'Indicacao', 'Prospeccao Ativa', 'Evento', 'Outro'
    classe_abc = Column(String(1), default="B")  # 'A', 'B', 'C'

    # Pipeline de Vendas & Recompra
    status_pipeline = Column(String(50), default="Novo Lead")
    # 'Novo Lead', 'Contato Feito', 'Amostra Enviada', 'PDV Ativo', 'Alerta de Reposicao', 'Inativo'
    motivo_perda = Column(String(150), nullable=True)

    # Inteligência de Ciclo de Recompra
    media_dias_recompra = Column(Integer, default=21)
    data_primeira_compra = Column(Date, nullable=True)
    data_ultima_compra = Column(Date, nullable=True)
    data_prevista_recompra = Column(Date, nullable=True)
    alerta_reposicao = Column(Boolean, default=False)
    faturamento_acumulado = Column(Float, default=0.0)
    total_pedidos = Column(Integer, default=0)

    # Gestão Comercial
    vendedor_nome = Column(String(100), default="Gemima")
    proxima_acao_comercial = Column(String(200), nullable=True)
    data_proxima_acao = Column(Date, nullable=True)
    observacoes_gerais = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relacionamentos
    pedidos = relationship("Pedido", back_populates="pdv", cascade="all, delete-orphan", order_by="desc(Pedido.data_pedido)")
    visitas = relationship("HistoricoVisita", back_populates="pdv", cascade="all, delete-orphan", order_by="desc(HistoricoVisita.data_contato)")
