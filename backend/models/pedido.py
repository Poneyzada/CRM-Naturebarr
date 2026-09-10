import uuid
from datetime import datetime, date
from sqlalchemy import Column, String, Integer, Float, Date, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from backend.database import Base

class Pedido(Base):
    __tablename__ = "pedidos"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    pdv_id = Column(String(36), ForeignKey("pdvs.id", ondelete="CASCADE"), nullable=False)
    numero_pedido = Column(Integer, autoincrement=True, nullable=True)
    data_pedido = Column(Date, default=date.today, nullable=False)
    valor_total = Column(Float, default=0.0, nullable=False)
    total_caixas = Column(Integer, default=0, nullable=False)
    forma_pagamento = Column(String(50), default="Boleto 30d")  # Boleto 30d, PIX, Cartao de Credito, Transferencia
    status_faturamento = Column(String(50), default="Aprovado")  # Pendente, Aprovado, Faturado, Cancelado
    status_entrega = Column(String(50), default="Preparando")  # Preparando, Em Transito, Entregue, Cancelado
    observacoes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relacionamentos
    pdv = relationship("PDV", back_populates="pedidos")
    itens = relationship("PedidoItem", back_populates="pedido", cascade="all, delete-orphan")


class PedidoItem(Base):
    __tablename__ = "pedido_itens"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    pedido_id = Column(String(36), ForeignKey("pedidos.id", ondelete="CASCADE"), nullable=False)
    sabor = Column(String(100), nullable=False)
    # Sabores Oficiais Naturebarr: 'Chocolate', 'Torta de Maçã', 'Amendoim', 'Frutas Vermelhas'
    quantidade_caixas = Column(Integer, nullable=False, default=1)
    unidades_por_caixa = Column(Integer, nullable=False, default=12)
    preco_caixa = Column(Float, nullable=False, default=96.00)  # R$ 8,00 por barra * 12 = R$ 96 por caixa
    subtotal = Column(Float, nullable=False, default=96.00)
    created_at = Column(DateTime, default=datetime.utcnow)

    pedido = relationship("Pedido", back_populates="itens")
