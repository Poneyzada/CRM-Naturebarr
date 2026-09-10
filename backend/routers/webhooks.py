import json
from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models.pdv import PDV
from backend.models.lead_webhook import LeadWebhook
from backend.services.csv_importer import detect_region

router = APIRouter(prefix="/api/v1/webhooks", tags=["Webhooks & Tráfego Pago"])

@router.post("/meta-leads")
async def receive_meta_lead(request: Request, db: Session = Depends(get_db)):
    """
    Endpoint dedicado para receber leads automáticos de formulários nativos
    do Meta Ads (Facebook/Instagram Lead Ads) ou Landing Pages comerciais.
    Insere o lead diretamente no Kanban com status 'Novo Lead'.
    """
    raw_body = await request.body()
    try:
        payload = json.loads(raw_body.decode("utf-8")) if raw_body else {}
    except Exception:
        payload = {}

    nome = payload.get("nome") or payload.get("full_name") or payload.get("name")
    email = payload.get("email")
    telefone = payload.get("telefone") or payload.get("phone_number") or payload.get("phone") or "71999998888"
    empresa = payload.get("empresa") or payload.get("company_name") or payload.get("loja") or payload.get("pdv") or "Novo PDV (Meta Ads)"
    cidade = payload.get("cidade") or payload.get("city") or "Salvador"
    estado = payload.get("estado") or payload.get("state") or ("BA" if "salvador" in cidade.lower() else "SP")
    categoria = payload.get("categoria") or "Emporio"
    campaign = payload.get("campaign_name") or payload.get("campaign") or "Campanha B2B Instagram/Facebook"
    ad_id = str(payload.get("ad_id") or "")
    form_id = str(payload.get("form_id") or "")

    # Caso venha no formato aninhado oficial do Meta (field_data)
    if "field_data" in payload and isinstance(payload["field_data"], list):
        for item in payload["field_data"]:
            f_name = item.get("name", "").lower()
            vals = item.get("values", [])
            val = vals[0] if vals else ""
            if "name" in f_name or "nome" in f_name:
                nome = val
            elif "email" in f_name:
                email = val
            elif "phone" in f_name or "telefone" in f_name or "whats" in f_name:
                telefone = val
            elif "company" in f_name or "empresa" in f_name or "loja" in f_name or "pdv" in f_name:
                empresa = val
            elif "city" in f_name or "cidade" in f_name:
                cidade = val
            elif "state" in f_name or "estado" in f_name:
                estado = val

    regiao = payload.get("regiao") or detect_region(cidade, estado)

    # Cria o PDV direto na coluna 'Novo Lead'
    pdv = PDV(
        razao_social=empresa,
        nome_fantasia=empresa,
        responsavel=nome or "Comprador Responsável",
        telefone_whatsapp=telefone,
        email=email,
        cidade=cidade,
        estado=estado[:2].upper() if estado else "BA",
        regiao=regiao,
        categoria=categoria,
        origem="Trafego Pago",
        status_pipeline="Novo Lead",
        observacoes_gerais=f"Lead capturado via Meta Ads. Campanha: {campaign}."
    )
    db.add(pdv)
    db.flush()

    # Salva o log do webhook
    webhook_log = LeadWebhook(
        ad_id=ad_id,
        form_id=form_id,
        campaign_name=campaign,
        nome=nome,
        email=email,
        telefone=telefone,
        empresa=empresa,
        cidade=cidade,
        estado=estado[:2].upper() if estado else "BA",
        regiao=regiao,
        payload_bruto=json.dumps(payload, ensure_ascii=False),
        processado=True,
        pdv_id=pdv.id
    )
    db.add(webhook_log)
    db.commit()

    return {
        "success": True,
        "message": "Lead do Meta Ads processado com sucesso e adicionado ao pipeline!",
        "pdv_id": pdv.id,
        "empresa": empresa,
        "regiao": regiao,
        "status": "Novo Lead"
    }

@router.get("/meta-leads")
def list_meta_leads(db: Session = Depends(get_db)):
    """Lista os últimos logs de webhooks recebidos do tráfego pago."""
    leads = db.query(LeadWebhook).order_by(LeadWebhook.created_at.desc()).limit(20).all()
    return leads
