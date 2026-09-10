from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel

class MetaLeadWebhookPayload(BaseModel):
    # Formato comum enviado pelo Meta Ads / Facebook Lead Ads ou zapier/make/landing page
    ad_id: Optional[str] = None
    form_id: Optional[str] = None
    campaign_name: Optional[str] = None
    full_name: Optional[str] = None
    nome: Optional[str] = None
    email: Optional[str] = None
    phone_number: Optional[str] = None
    telefone: Optional[str] = None
    company_name: Optional[str] = None
    empresa: Optional[str] = None
    city: Optional[str] = None
    cidade: Optional[str] = None
    state: Optional[str] = None
    estado: Optional[str] = None
    regiao: Optional[str] = None
    categoria: Optional[str] = None
    mensagem: Optional[str] = None

class LeadWebhookResponse(BaseModel):
    id: str
    nome: Optional[str] = None
    empresa: Optional[str] = None
    telefone: Optional[str] = None
    cidade: Optional[str] = None
    regiao: Optional[str] = None
    pdv_id: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
