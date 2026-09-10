from typing import Optional, List
from datetime import date, datetime
from pydantic import BaseModel, Field

class PDVBase(BaseModel):
    razao_social: str
    nome_fantasia: str
    cnpj_cpf: Optional[str] = None
    responsavel: Optional[str] = None
    telefone_whatsapp: str
    email: Optional[str] = None
    endereco: Optional[str] = None
    bairro: Optional[str] = None
    cidade: str
    estado: str = "BA"
    regiao: str = "Salvador"  # 'Salvador', 'Sao Paulo', 'Santa Catarina', 'Outro'
    cep: Optional[str] = None
    categoria: str = "Emporio"  # 'Emporio', 'Academia', 'Box Crossfit', 'Farmacia', 'Suplementos', 'Cafeteria', 'Outro'
    origem: str = "Trafego Pago"  # 'Trafego Pago', 'Organico', 'Indicacao', 'Prospeccao Ativa', 'Evento', 'Outro'
    classe_abc: str = "B"
    status_pipeline: str = "Novo Lead"
    # 'Novo Lead', 'Contato Feito', 'Amostra Enviada', 'PDV Ativo', 'Alerta de Reposicao', 'Inativo'
    motivo_perda: Optional[str] = None
    media_dias_recompra: int = 21
    vendedor_nome: str = "Gemima"
    proxima_acao_comercial: Optional[str] = None
    data_proxima_acao: Optional[date] = None
    observacoes_gerais: Optional[str] = None

class PDVCreate(PDVBase):
    pass

class PDVUpdate(BaseModel):
    razao_social: Optional[str] = None
    nome_fantasia: Optional[str] = None
    cnpj_cpf: Optional[str] = None
    responsavel: Optional[str] = None
    telefone_whatsapp: Optional[str] = None
    email: Optional[str] = None
    endereco: Optional[str] = None
    bairro: Optional[str] = None
    cidade: Optional[str] = None
    estado: Optional[str] = None
    regiao: Optional[str] = None
    cep: Optional[str] = None
    categoria: Optional[str] = None
    origem: Optional[str] = None
    classe_abc: Optional[str] = None
    status_pipeline: Optional[str] = None
    motivo_perda: Optional[str] = None
    media_dias_recompra: Optional[int] = None
    vendedor_nome: Optional[str] = None
    proxima_acao_comercial: Optional[str] = None
    data_proxima_acao: Optional[date] = None
    observacoes_gerais: Optional[str] = None

class PDVResponse(PDVBase):
    id: str
    data_primeira_compra: Optional[date] = None
    data_ultima_compra: Optional[date] = None
    data_prevista_recompra: Optional[date] = None
    alerta_reposicao: bool = False
    faturamento_acumulado: float = 0.0
    total_pedidos: int = 0
    dias_sem_comprar: Optional[int] = None
    dias_para_recompra: Optional[int] = None
    link_whatsapp: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
