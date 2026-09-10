from typing import Optional, List
from datetime import date, datetime
from pydantic import BaseModel, Field

class PedidoItemBase(BaseModel):
    sabor: str  # 'Chocolate', 'Torta de Maçã', 'Amendoim', 'Frutas Vermelhas'
    quantidade_caixas: int = Field(gt=0, default=1)
    unidades_por_caixa: int = 12
    preco_caixa: float = 96.00
    subtotal: Optional[float] = None

class PedidoItemCreate(PedidoItemBase):
    pass

class PedidoItemResponse(PedidoItemBase):
    id: str
    pedido_id: str
    subtotal: float
    created_at: datetime

    class Config:
        from_attributes = True

class PedidoCreate(BaseModel):
    data_pedido: date = Field(default_factory=date.today)
    forma_pagamento: str = "Boleto 30d"  # Boleto 30d, Boleto 15d, Boleto 45d, PIX, Cartao de Credito, Transferencia
    status_faturamento: str = "Aprovado"
    status_entrega: str = "Preparando"
    observacoes: Optional[str] = None
    itens: List[PedidoItemCreate]

class PedidoResponse(BaseModel):
    id: str
    pdv_id: str
    numero_pedido: Optional[int] = None
    data_pedido: date
    valor_total: float
    total_caixas: int
    forma_pagamento: str
    status_faturamento: str
    status_entrega: str
    observacoes: Optional[str] = None
    created_at: datetime
    itens: List[PedidoItemResponse] = []

    class Config:
        from_attributes = True
