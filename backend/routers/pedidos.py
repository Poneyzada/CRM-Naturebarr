from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models.pdv import PDV
from backend.models.pedido import Pedido, PedidoItem
from backend.schemas.pedido import PedidoCreate, PedidoResponse
from backend.services.repurchase_engine import recalculate_pdv_metrics

router = APIRouter(tags=["Pedidos B2B"])

@router.get("/api/v1/pdvs/{pdv_id}/pedidos", response_model=List[PedidoResponse])
def list_pdv_pedidos(pdv_id: str, db: Session = Depends(get_db)):
    pdv = db.query(PDV).filter(PDV.id == pdv_id).first()
    if not pdv:
        raise HTTPException(status_code=404, detail="PDV não encontrado")
    
    pedidos = (
        db.query(Pedido)
        .filter(Pedido.pdv_id == pdv_id)
        .order_by(Pedido.data_pedido.desc())
        .all()
    )
    return pedidos

@router.post("/api/v1/pdvs/{pdv_id}/pedidos", response_model=PedidoResponse)
def create_pedido(pdv_id: str, payload: PedidoCreate, db: Session = Depends(get_db)):
    pdv = db.query(PDV).filter(PDV.id == pdv_id).first()
    if not pdv:
        raise HTTPException(status_code=404, detail="PDV não encontrado")

    if not payload.itens:
        raise HTTPException(status_code=400, detail="O pedido deve conter pelo menos um sabor de Naturebarr")

    # Calcula total de caixas e valor total
    total_caixas = 0
    valor_total = 0.0

    pedido = Pedido(
        pdv_id=pdv_id,
        data_pedido=payload.data_pedido,
        forma_pagamento=payload.forma_pagamento,
        status_faturamento=payload.status_faturamento,
        status_entrega=payload.status_entrega,
        observacoes=payload.observacoes,
        total_caixas=0,
        valor_total=0.0
    )
    db.add(pedido)
    db.flush()

    for item in payload.itens:
        subtotal = item.subtotal if item.subtotal else (item.quantidade_caixas * item.preco_caixa)
        p_item = PedidoItem(
            pedido_id=pedido.id,
            sabor=item.sabor,
            quantidade_caixas=item.quantidade_caixas,
            unidades_por_caixa=item.unidades_por_caixa,
            preco_caixa=item.preco_caixa,
            subtotal=subtotal
        )
        total_caixas += item.quantidade_caixas
        valor_total += subtotal
        db.add(p_item)

    pedido.total_caixas = total_caixas
    pedido.valor_total = valor_total

    db.commit()
    db.refresh(pedido)

    # Dispara o motor de inteligência de recompra
    recalculate_pdv_metrics(db, pdv_id)

    return pedido

@router.get("/api/v1/pedidos", response_model=List[PedidoResponse])
def list_all_pedidos(db: Session = Depends(get_db)):
    pedidos = db.query(Pedido).order_by(Pedido.data_pedido.desc()).limit(100).all()
    return pedidos

@router.delete("/api/v1/pedidos/{id}")
def delete_pedido(id: str, db: Session = Depends(get_db)):
    pedido = db.query(Pedido).filter(Pedido.id == id).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    
    pdv_id = pedido.pdv_id
    db.delete(pedido)
    db.commit()

    recalculate_pdv_metrics(db, pdv_id)
    return {"message": "Pedido excluído com sucesso"}
