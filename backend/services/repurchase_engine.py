import urllib.parse
from datetime import date, timedelta
from typing import Optional
from sqlalchemy.orm import Session
from backend.models.pdv import PDV
from backend.models.pedido import Pedido

def format_whatsapp_number(raw_phone: str) -> str:
    """Limpa o número e garante DDI 55 do Brasil se necessário."""
    digits = "".join(ch for ch in raw_phone if ch.isdigit())
    if digits.startswith("55") and len(digits) >= 12:
        return digits
    if len(digits) in (10, 11):
        return f"55{digits}"
    return digits

def generate_whatsapp_link(pdv: PDV, template_type: str = "reposicao") -> str:
    """Gera link direto com texto pronto e personalizado para a Gemima."""
    phone = format_whatsapp_number(pdv.telefone_whatsapp or "")
    if not phone:
        return ""
    
    responsavel = pdv.responsavel or "amigo(a)"
    nome_loja = pdv.nome_fantasia or pdv.razao_social

    if template_type == "reposicao":
        texto = (
            f"Olá {responsavel}, tudo bem? Aqui é a Gemima da Naturebarr! "
            f"Notei aqui pelo nosso controle que o estoque de barras da {nome_loja} "
            f"deve estar acabando esta semana. Quer que eu já separe a sua reposição "
            f"para chegar antes do fim de semana?"
        )
    elif template_type == "primeiro_contato":
        texto = (
            f"Olá {responsavel}, tudo bem? Sou a Gemima da Naturebarr (barras de proteína saudáveis). "
            f"Recebemos seu contato com interesse em revender nossos produtos na {nome_loja}. "
            f"Gostaria de lhe enviar nosso catálogo B2B e condições especiais de atacado!"
        )
    elif template_type == "amostra":
        texto = (
            f"Olá {responsavel}! Aqui é a Gemima da Naturebarr. "
            f"As amostras dos nossos sabores mais vendidos (Chocolate e Amendoim) "
            f"estão a caminho da {nome_loja}. Quando receber, me avise para alinharmos os feedbacks!"
        )
    elif template_type == "reativacao":
        texto = (
            f"Olá {responsavel}! Gemima da Naturebarr por aqui. "
            f"Faz um tempinho que não repomos a {nome_loja}. "
            f"Estamos com uma condição especial de frete e bonificação para pedidos de reposição essa semana. "
            f"Podemos conversar 2 minutinhos?"
        )
    else:
        texto = f"Olá {responsavel}, sou a Gemima da Naturebarr!"

    encoded = urllib.parse.quote(texto)
    return f"https://wa.me/{phone}?text={encoded}"

def recalculate_pdv_metrics(db: Session, pdv_id: str) -> Optional[PDV]:
    """Recalcula pedidos, faturamento acumulado, média de recompra e alerta de reposição."""
    pdv = db.query(PDV).filter(PDV.id == pdv_id).first()
    if not pdv:
        return None

    pedidos = (
        db.query(Pedido)
        .filter(Pedido.pdv_id == pdv_id)
        .order_by(Pedido.data_pedido.asc())
        .all()
    )

    pdv.total_pedidos = len(pedidos)
    pdv.faturamento_acumulado = sum(p.valor_total for p in pedidos)

    if not pedidos:
        pdv.data_primeira_compra = None
        pdv.data_ultima_compra = None
        pdv.data_prevista_recompra = None
        pdv.alerta_reposicao = False
        db.commit()
        db.refresh(pdv)
        return pdv

    pdv.data_primeira_compra = pedidos[0].data_pedido
    pdv.data_ultima_compra = pedidos[-1].data_pedido

    # Se tem 2 ou mais pedidos, calcula a média real dos intervalos
    if len(pedidos) >= 2:
        intervalos = []
        for i in range(1, len(pedidos)):
            delta = (pedidos[i].data_pedido - pedidos[i-1].data_pedido).days
            if delta > 0:
                intervalos.append(delta)
        
        if intervalos:
            pdv.media_dias_recompra = max(7, round(sum(intervalos) / len(intervalos)))
    else:
        if not pdv.media_dias_recompra or pdv.media_dias_recompra < 7:
            pdv.media_dias_recompra = 21  # 21 dias padrão B2B

    # Previsão da próxima compra
    data_prevista = pdv.data_ultima_compra + timedelta(days=pdv.media_dias_recompra)
    pdv.data_prevista_recompra = data_prevista

    hoje = date.today()
    dias_restantes = (data_prevista - hoje).days

    # Alerta ativado se faltar 5 dias ou menos (ou se já estiver vencido)
    if dias_restantes <= 5:
        pdv.alerta_reposicao = True
        if pdv.status_pipeline in ("Novo Lead", "Contato Feito", "Amostra Enviada", "PDV Ativo"):
            pdv.status_pipeline = "Alerta de Reposicao"
    else:
        pdv.alerta_reposicao = False
        if pdv.status_pipeline in ("Novo Lead", "Contato Feito", "Amostra Enviada"):
            pdv.status_pipeline = "PDV Ativo"

    # Atualiza classe ABC baseado no faturamento
    if pdv.faturamento_acumulado >= 5000:
        pdv.classe_abc = "A"
    elif pdv.faturamento_acumulado >= 1500:
        pdv.classe_abc = "B"
    else:
        pdv.classe_abc = "C"

    db.commit()
    db.refresh(pdv)
    return pdv

def enrich_pdv_response(pdv: PDV) -> dict:
    """Enriquece o objeto PDV com campos calculados para a UI."""
    hoje = date.today()
    dias_sem_comprar = None
    dias_para_recompra = None

    if pdv.data_ultima_compra:
        dias_sem_comprar = (hoje - pdv.data_ultima_compra).days

    if pdv.data_prevista_recompra:
        dias_para_recompra = (pdv.data_prevista_recompra - hoje).days

    # Checagem dinâmica de alerta se passou a data
    alerta = pdv.alerta_reposicao
    if dias_para_recompra is not None and dias_para_recompra <= 5:
        alerta = True

    link_wa = generate_whatsapp_link(pdv, "reposicao" if alerta else "primeiro_contato")

    return {
        "id": pdv.id,
        "razao_social": pdv.razao_social,
        "nome_fantasia": pdv.nome_fantasia,
        "cnpj_cpf": pdv.cnpj_cpf,
        "responsavel": pdv.responsavel,
        "telefone_whatsapp": pdv.telefone_whatsapp,
        "email": pdv.email,
        "endereco": pdv.endereco,
        "bairro": pdv.bairro,
        "cidade": pdv.cidade,
        "estado": pdv.estado,
        "regiao": pdv.regiao,
        "cep": pdv.cep,
        "categoria": pdv.categoria,
        "origem": pdv.origem,
        "classe_abc": pdv.classe_abc,
        "status_pipeline": pdv.status_pipeline,
        "motivo_perda": pdv.motivo_perda,
        "media_dias_recompra": pdv.media_dias_recompra,
        "data_primeira_compra": pdv.data_primeira_compra,
        "data_ultima_compra": pdv.data_ultima_compra,
        "data_prevista_recompra": pdv.data_prevista_recompra,
        "alerta_reposicao": alerta,
        "faturamento_acumulado": pdv.faturamento_acumulado or 0.0,
        "total_pedidos": pdv.total_pedidos or 0,
        "vendedor_nome": pdv.vendedor_nome,
        "proxima_acao_comercial": pdv.proxima_acao_comercial,
        "data_proxima_acao": pdv.data_proxima_acao,
        "observacoes_gerais": pdv.observacoes_gerais,
        "dias_sem_comprar": dias_sem_comprar,
        "dias_para_recompra": dias_para_recompra,
        "link_whatsapp": link_wa,
        "created_at": pdv.created_at,
        "updated_at": pdv.updated_at
    }
