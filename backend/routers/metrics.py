from datetime import date
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.database import get_db
from backend.models.pdv import PDV
from backend.models.pedido import Pedido, PedidoItem
from backend.services.repurchase_engine import enrich_pdv_response

router = APIRouter(prefix="/api/v1/metrics", tags=["Métricas e Dashboard"])

@router.get("/dashboard")
def get_dashboard_metrics(db: Session = Depends(get_db)):
    hoje = date.today()
    mes_atual = hoje.month
    ano_atual = hoje.year

    # Totais de PDVs
    total_pdvs = db.query(func.count(PDV.id)).scalar() or 0
    pdvs_ativos = db.query(func.count(PDV.id)).filter(PDV.status_pipeline.in_(["PDV Ativo", "Alerta de Reposicao"])).scalar() or 0
    alertas_reposicao = db.query(func.count(PDV.id)).filter(PDV.alerta_reposicao == True).scalar() or 0
    novos_leads = db.query(func.count(PDV.id)).filter(PDV.status_pipeline == "Novo Lead").scalar() or 0

    # Pedidos e Faturamento B2B
    faturamento_total = db.query(func.sum(Pedido.valor_total)).scalar() or 0.0
    total_caixas = db.query(func.sum(Pedido.total_caixas)).scalar() or 0

    # Pedidos deste mês
    # Para SQLite e Postgres, podemos comparar por mês/ano
    pedidos_mes_query = db.query(Pedido).all()
    pedidos_mes = [p for p in pedidos_mes_query if p.data_pedido.month == mes_atual and p.data_pedido.year == ano_atual]
    faturamento_mes = sum(p.valor_total for p in pedidos_mes)

    # Métricas por Região (Salvador, SP, SC)
    regioes = ["Salvador", "Sao Paulo", "Santa Catarina", "Outro"]
    metricas_regiao = {}
    for reg in regioes:
        count = db.query(func.count(PDV.id)).filter(PDV.regiao == reg).scalar() or 0
        fat = (
            db.query(func.sum(Pedido.valor_total))
            .join(PDV, Pedido.pdv_id == PDV.id)
            .filter(PDV.regiao == reg)
            .scalar() or 0.0
        )
        metricas_regiao[reg] = {
            "pdvs": count,
            "faturamento": round(fat, 2)
        }

    # Distribuição por Status do Funil / Kanban
    status_list = [
        "Novo Lead",
        "Contato Feito",
        "Amostra Enviada",
        "PDV Ativo",
        "Alerta de Reposicao",
        "Inativo"
    ]
    distribuicao_status = {}
    for st in status_list:
        c = db.query(func.count(PDV.id)).filter(PDV.status_pipeline == st).scalar() or 0
        distribuicao_status[st] = c

    # Ranking de Sabores mais vendidos (por caixas)
    sabores_raw = (
        db.query(PedidoItem.sabor, func.sum(PedidoItem.quantidade_caixas))
        .group_by(PedidoItem.sabor)
        .order_by(func.sum(PedidoItem.quantidade_caixas).desc())
        .all()
    )
    ranking_sabores = [{"sabor": s[0], "caixas": int(s[1] or 0)} for s in sabores_raw]

    # Ações urgentes hoje (PDVs com alerta de reposição ou próximos)
    pdvs_alerta = (
        db.query(PDV)
        .filter(PDV.alerta_reposicao == True)
        .order_by(PDV.data_prevista_recompra.asc())
        .limit(6)
        .all()
    )
    urgentes = [enrich_pdv_response(p) for p in pdvs_alerta]

    return {
        "faturamento_total_b2b": round(faturamento_total, 2),
        "faturamento_mes_atual": round(faturamento_mes, 2),
        "total_caixas_vendidas": int(total_caixas),
        "total_pdvs": total_pdvs,
        "pdvs_ativos": pdvs_ativos,
        "novos_leads": novos_leads,
        "alertas_reposicao_urgente": alertas_reposicao,
        "regioes": metricas_regiao,
        "status_pipeline": distribuicao_status,
        "top_sabores": ranking_sabores,
        "acoes_urgentes_hoje": urgentes
    }
