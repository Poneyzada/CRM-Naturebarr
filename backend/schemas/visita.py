from typing import Optional
from datetime import date, datetime
from pydantic import BaseModel

class VisitaCreate(BaseModel):
    vendedor_nome: str = "Gemima"
    tipo_contato: str = "WhatsApp"  # WhatsApp, Ligacao, Visita Presencial, Envio de Amostra, Reuniao
    anotacoes: str
    proxima_acao: Optional[str] = None
    data_proxima_acao: Optional[date] = None

class VisitaResponse(BaseModel):
    id: str
    pdv_id: str
    vendedor_nome: str
    tipo_contato: str
    data_contato: datetime
    anotacoes: str
    proxima_acao: Optional[str] = None
    data_proxima_acao: Optional[date] = None
    created_at: datetime

    class Config:
        from_attributes = True
