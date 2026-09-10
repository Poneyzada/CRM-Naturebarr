from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import or_
from backend.database import get_db
from backend.models.pdv import PDV
from backend.schemas.pdv import PDVCreate, PDVUpdate, PDVResponse
from backend.services.repurchase_engine import enrich_pdv_response, recalculate_pdv_metrics
from backend.services.csv_importer import parse_csv_or_excel

router = APIRouter(prefix="/api/v1/pdvs", tags=["PDVs - Pontos de Venda"])

@router.get("", response_model=List[PDVResponse])
def list_pdvs(
    regiao: Optional[str] = Query(None, description="Filtro por região: Salvador, Sao Paulo, Santa Catarina"),
    status: Optional[str] = Query(None, description="Filtro por status do pipeline"),
    alerta_reposicao: Optional[bool] = Query(None, description="Filtrar apenas PDVs com alerta de reposição ativo"),
    categoria: Optional[str] = Query(None, description="Filtro por categoria"),
    search: Optional[str] = Query(None, description="Busca por nome, razão social, CNPJ ou responsável"),
    db: Session = Depends(get_db)
):
    query = db.query(PDV)

    if regiao and regiao != "Todas":
        query = query.filter(PDV.regiao == regiao)

    if status and status != "Todos":
        query = query.filter(PDV.status_pipeline == status)

    if alerta_reposicao is not None:
        query = query.filter(PDV.alerta_reposicao == alerta_reposicao)

    if categoria and categoria != "Todas":
        query = query.filter(PDV.categoria == categoria)

    if search:
        s = f"%{search}%"
        query = query.filter(
            or_(
                PDV.nome_fantasia.ilike(s),
                PDV.razao_social.ilike(s),
                PDV.responsavel.ilike(s),
                PDV.cidade.ilike(s),
                PDV.cnpj_cpf.ilike(s),
                PDV.telefone_whatsapp.ilike(s)
            )
        )

    pdvs = query.order_by(PDV.updated_at.desc()).all()
    return [enrich_pdv_response(p) for p in pdvs]

@router.post("", response_model=PDVResponse)
def create_pdv(payload: PDVCreate, db: Session = Depends(get_db)):
    pdv = PDV(**payload.model_dump())
    db.add(pdv)
    db.commit()
    db.refresh(pdv)
    recalculate_pdv_metrics(db, pdv.id)
    return enrich_pdv_response(pdv)

@router.get("/{id}", response_model=PDVResponse)
def get_pdv(id: str, db: Session = Depends(get_db)):
    pdv = db.query(PDV).filter(PDV.id == id).first()
    if not pdv:
        raise HTTPException(status_code=404, detail="PDV não encontrado")
    return enrich_pdv_response(pdv)

@router.put("/{id}", response_model=PDVResponse)
def update_pdv(id: str, payload: PDVUpdate, db: Session = Depends(get_db)):
    pdv = db.query(PDV).filter(PDV.id == id).first()
    if not pdv:
        raise HTTPException(status_code=404, detail="PDV não encontrado")

    update_data = payload.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(pdv, field, val)

    db.commit()
    recalculate_pdv_metrics(db, pdv.id)
    return enrich_pdv_response(pdv)

@router.patch("/{id}/status", response_model=PDVResponse)
def update_pdv_status(
    id: str, 
    status_pipeline: str = Query(..., description="Novo status do Kanban"),
    motivo_perda: Optional[str] = Query(None, description="Motivo de perda se for Inativo"),
    db: Session = Depends(get_db)
):
    pdv = db.query(PDV).filter(PDV.id == id).first()
    if not pdv:
        raise HTTPException(status_code=404, detail="PDV não encontrado")

    pdv.status_pipeline = status_pipeline
    if motivo_perda:
        pdv.motivo_perda = motivo_perda

    db.commit()
    return enrich_pdv_response(pdv)

@router.delete("/{id}")
def delete_pdv(id: str, db: Session = Depends(get_db)):
    pdv = db.query(PDV).filter(PDV.id == id).first()
    if not pdv:
        raise HTTPException(status_code=404, detail="PDV não encontrado")
    db.delete(pdv)
    db.commit()
    return {"message": "PDV excluído com sucesso", "id": id}

@router.post("/import-csv")
async def import_csv_pdvs(file: UploadFile = File(...), db: Session = Depends(get_db)):
    contents = await file.read()
    mapped_pdvs, errors = parse_csv_or_excel(contents, file.filename or "")

    if not mapped_pdvs:
        raise HTTPException(status_code=400, detail="Nenhum PDV válido encontrado no arquivo.")

    inseridos = 0
    for item in mapped_pdvs:
        pdv = PDV(**item)
        db.add(pdv)
        inseridos += 1

    db.commit()

    return {
        "message": f"{inseridos} PDVs importados com sucesso!",
        "total_importados": inseridos,
        "erros": errors
    }
