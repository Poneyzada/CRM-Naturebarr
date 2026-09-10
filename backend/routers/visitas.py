from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models.pdv import PDV
from backend.models.visita import HistoricoVisita
from backend.schemas.visita import VisitaCreate, VisitaResponse

router = APIRouter(prefix="/api/v1/pdvs", tags=["Visitas e Contatos"])

@router.get("/{pdv_id}/visitas", response_model=List[VisitaResponse])
def list_pdv_visitas(pdv_id: str, db: Session = Depends(get_db)):
    pdv = db.query(PDV).filter(PDV.id == pdv_id).first()
    if not pdv:
        raise HTTPException(status_code=404, detail="PDV não encontrado")

    visitas = (
        db.query(HistoricoVisita)
        .filter(HistoricoVisita.pdv_id == pdv_id)
        .order_by(HistoricoVisita.data_contato.desc())
        .all()
    )
    return visitas

@router.post("/{pdv_id}/visitas", response_model=VisitaResponse)
def create_pdv_visita(pdv_id: str, payload: VisitaCreate, db: Session = Depends(get_db)):
    pdv = db.query(PDV).filter(PDV.id == pdv_id).first()
    if not pdv:
        raise HTTPException(status_code=404, detail="PDV não encontrado")

    visita = HistoricoVisita(
        pdv_id=pdv_id,
        vendedor_nome=payload.vendedor_nome,
        tipo_contato=payload.tipo_contato,
        anotacoes=payload.anotacoes,
        proxima_acao=payload.proxima_acao,
        data_proxima_acao=payload.data_proxima_acao
    )
    db.add(visita)

    # Se informou próxima ação, atualiza também no cadastro do PDV
    if payload.proxima_acao:
        pdv.proxima_acao_comercial = payload.proxima_acao
        pdv.data_proxima_acao = payload.data_proxima_acao

    db.commit()
    db.refresh(visita)
    return visita
