import random
from datetime import date, timedelta
from backend.database import SessionLocal, engine, Base
from backend.models.pdv import PDV
from backend.models.pedido import Pedido, PedidoItem
from backend.models.visita import HistoricoVisita
from backend.models.lead_webhook import LeadWebhook
from backend.services.repurchase_engine import recalculate_pdv_metrics

SABORES_NATUREBARR = [
    "Cacau & Avela",
    "Pasta de Amendoim",
    "Banana & Canela",
    "Coco & Castanhas",
    "Frutas Vermelhas & Chia"
]

PDVS_INICIAIS = [
    # --- POLO SALVADOR (BA) ---
    {
        "razao_social": "Grão Real Emporio e Cafe Ltda",
        "nome_fantasia": "Grão Real Barra",
        "cnpj_cpf": "14.288.910/0001-33",
        "responsavel": "Rodrigo Matos",
        "telefone_whatsapp": "71991234567",
        "email": "rodrigo@graoreal.com.br",
        "endereco": "Av. Oceânica, 1420",
        "bairro": "Barra",
        "cidade": "Salvador",
        "estado": "BA",
        "regiao": "Salvador",
        "categoria": "Emporio",
        "origem": "Trafego Pago",
        "status_pipeline": "Alerta de Reposicao",
        "dias_atras_primeiro_pedido": 45,
        "dias_atras_ultimo_pedido": 19,
        "media_dias": 20,
        "observacoes": "PDV com altíssimo giro no balcão de café. Sabores Cacau e Pasta de Amendoim esgotam rápido."
    },
    {
        "razao_social": "Academia Alpha Fitness Pituba Eireli",
        "nome_fantasia": "Alpha Pituba Suplementos",
        "cnpj_cpf": "22.334.455/0001-88",
        "responsavel": "Juliana Cerqueira",
        "telefone_whatsapp": "71988776655",
        "email": "suplementos@alphapituba.com.br",
        "endereco": "Rua das Rosas, 350",
        "bairro": "Pituba",
        "cidade": "Salvador",
        "estado": "BA",
        "regiao": "Salvador",
        "categoria": "Academia",
        "origem": "Prospeccao Ativa",
        "status_pipeline": "PDV Ativo",
        "dias_atras_primeiro_pedido": 30,
        "dias_atras_ultimo_pedido": 8,
        "media_dias": 22,
        "observacoes": "Público de alta renda, compram caixas com frequência quinzenal."
    },
    {
        "razao_social": "Box CrossFit Ondina Sports Ltda",
        "nome_fantasia": "CrossFit Ondina",
        "cnpj_cpf": "31.982.344/0001-02",
        "responsavel": "Coach Bruno Vianna",
        "telefone_whatsapp": "71992223344",
        "email": "bruno@crossfitondina.com.br",
        "endereco": "Av. Adhemar de Barros, 710",
        "bairro": "Ondina",
        "cidade": "Salvador",
        "estado": "BA",
        "regiao": "Salvador",
        "categoria": "Box Crossfit",
        "origem": "Trafego Pago",
        "status_pipeline": "Novo Lead",
        "observacoes": "Lead capturado via Instagram Lead Ads demonstrando interesse em revender na recepção do box."
    },
    {
        "razao_social": "Mundo Verde Shopping Salvador Ltda",
        "nome_fantasia": "Mundo Verde Salvador Shopping",
        "cnpj_cpf": "08.112.334/0001-77",
        "responsavel": "Mariana Barreto",
        "telefone_whatsapp": "71987651234",
        "email": "salvador@mundoverdefranquia.com.br",
        "endereco": "Av. Tancredo Neves, 3133 - L2",
        "bairro": "Caminho das Árvores",
        "cidade": "Salvador",
        "estado": "BA",
        "regiao": "Salvador",
        "categoria": "Mercado Saudavel",
        "origem": "Indicacao",
        "status_pipeline": "Contato Feito",
        "observacoes": "Gemima conversou com a gerente e enviou a tabela de atacado para 20 caixas."
    },

    # --- POLO SÃO PAULO (SP) ---
    {
        "razao_social": "BioFit Jardins Centro de Treinamento",
        "nome_fantasia": "BioFit Jardins",
        "cnpj_cpf": "19.882.123/0001-99",
        "responsavel": "Camila Duarte",
        "telefone_whatsapp": "11987654321",
        "email": "camila@biofitjardins.com.br",
        "endereco": "Rua Oscar Freire, 1100",
        "bairro": "Jardins",
        "cidade": "São Paulo",
        "estado": "SP",
        "regiao": "Sao Paulo",
        "categoria": "Academia",
        "origem": "Prospeccao Ativa",
        "status_pipeline": "PDV Ativo",
        "dias_atras_primeiro_pedido": 60,
        "dias_atras_ultimo_pedido": 12,
        "media_dias": 16,
        "observacoes": "Cliente Classe A em SP. Média de 10 caixas a cada duas semanas."
    },
    {
        "razao_social": "Empório Moema Produtos Naturais Eireli",
        "nome_fantasia": "Empório Natural Moema",
        "cnpj_cpf": "28.334.998/0001-55",
        "responsavel": "Henrique Vasconcelos",
        "telefone_whatsapp": "11993334455",
        "email": "henrique@emporiomoema.com.br",
        "endereco": "Av. Moema, 450",
        "bairro": "Moema",
        "cidade": "São Paulo",
        "estado": "SP",
        "regiao": "Sao Paulo",
        "categoria": "Emporio",
        "origem": "Trafego Pago",
        "status_pipeline": "Alerta de Reposicao",
        "dias_atras_primeiro_pedido": 40,
        "dias_atras_ultimo_pedido": 20,
        "media_dias": 21,
        "observacoes": "Previsão de reposição para hoje! Entrar em contato via WhatsApp com urgência."
    },
    {
        "razao_social": "Vila Madalena Coffee & Snack Bar",
        "nome_fantasia": "Cafeteria Madá Fit",
        "cnpj_cpf": "33.441.229/0001-14",
        "responsavel": "Renata Silveira",
        "telefone_whatsapp": "11977778899",
        "email": "renata@madafit.com.br",
        "endereco": "Rua Harmonia, 320",
        "bairro": "Vila Madalena",
        "cidade": "São Paulo",
        "estado": "SP",
        "regiao": "Sao Paulo",
        "categoria": "Cafeteria",
        "origem": "Trafego Pago",
        "status_pipeline": "Amostra Enviada",
        "observacoes": "Kit degustação com os 5 sabores enviado via transportadora para testes no balcão."
    },

    # --- POLO SANTA CATARINA (SC) ---
    {
        "razao_social": "CrossFit Ilha Campeche Sports Ltda",
        "nome_fantasia": "CrossFit Ilha Campeche",
        "cnpj_cpf": "45.123.789/0001-44",
        "responsavel": "Felipe Koerich",
        "telefone_whatsapp": "48999887766",
        "email": "felipe@crossfitcampeche.com.br",
        "endereco": "Av. Pequeno Príncipe, 1850",
        "bairro": "Campeche",
        "cidade": "Florianópolis",
        "estado": "SC",
        "regiao": "Santa Catarina",
        "categoria": "Box Crossfit",
        "origem": "Trafego Pago",
        "status_pipeline": "PDV Ativo",
        "dias_atras_primeiro_pedido": 50,
        "dias_atras_ultimo_pedido": 15,
        "media_dias": 18,
        "observacoes": "Atletas do box adoraram o sabor Banana & Canela e Cacau & Avelã."
    },
    {
        "razao_social": "Farmácia e Manipulação Vida Natural",
        "nome_fantasia": "Vida Natural Balneário",
        "cnpj_cpf": "52.887.661/0001-20",
        "responsavel": "Dra. Patrícia Klein",
        "telefone_whatsapp": "47991112233",
        "email": "patricia@vidanatural.com.br",
        "endereco": "Av. Brasil, 980",
        "bairro": "Centro",
        "cidade": "Balneário Camboriú",
        "estado": "SC",
        "regiao": "Santa Catarina",
        "categoria": "Farmacia",
        "origem": "Indicacao",
        "status_pipeline": "Alerta de Reposicao",
        "dias_atras_primeiro_pedido": 35,
        "dias_atras_ultimo_pedido": 17,
        "media_dias": 18,
        "observacoes": "Reposição preventiva necessária! As barras ficam expostas no caixa da farmácia."
    },
    {
        "razao_social": "Suplementos Joinville Prime Eireli",
        "nome_fantasia": "Joinville Suplementos Prime",
        "cnpj_cpf": "60.443.112/0001-09",
        "responsavel": "Lucas Zimmermann",
        "telefone_whatsapp": "47984445566",
        "email": "lucas@joinvilleprime.com.br",
        "endereco": "Rua Ottokar Doerffel, 510",
        "bairro": "Atiradores",
        "cidade": "Joinville",
        "estado": "SC",
        "regiao": "Santa Catarina",
        "categoria": "Suplementos",
        "origem": "Trafego Pago",
        "status_pipeline": "Novo Lead",
        "observacoes": "Chegou hoje pelo tráfego pago da campanha Meta B2B Sul."
    }
]

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Se já tiver PDVs, não duplica
        if db.query(PDV).count() > 0:
            print("Banco de dados já contém registros. Pulando seed.")
            return

        print("Populando banco de dados Naturebarr com dados de Salvador, SP e SC...")
        hoje = date.today()

        for dados in PDVS_INICIAIS:
            p_primeiro = dados.pop("dias_atras_primeiro_pedido", None)
            p_ultimo = dados.pop("dias_atras_ultimo_pedido", None)
            media_dias = dados.pop("media_dias", 21)

            pdv = PDV(
                razao_social=dados["razao_social"],
                nome_fantasia=dados["nome_fantasia"],
                cnpj_cpf=dados.get("cnpj_cpf"),
                responsavel=dados.get("responsavel"),
                telefone_whatsapp=dados["telefone_whatsapp"],
                email=dados.get("email"),
                endereco=dados.get("endereco"),
                bairro=dados.get("bairro"),
                cidade=dados["cidade"],
                estado=dados["estado"],
                regiao=dados["regiao"],
                categoria=dados.get("categoria", "Emporio"),
                origem=dados.get("origem", "Trafego Pago"),
                status_pipeline=dados["status_pipeline"],
                media_dias_recompra=media_dias,
                observacoes_gerais=dados.get("observacoes")
            )
            db.add(pdv)
            db.flush()

            # Se tinha pedidos simulados, cria os registros de compras passadas
            if p_primeiro is not None and p_ultimo is not None:
                # Pedido 1
                data_p1 = hoje - timedelta(days=p_primeiro)
                ped1 = Pedido(
                    pdv_id=pdv.id,
                    data_pedido=data_p1,
                    forma_pagamento="Boleto 30d",
                    status_faturamento="Faturado",
                    status_entrega="Entregue",
                    observacoes="Primeiro pedido B2B de abertura de conta.",
                    total_caixas=4,
                    valor_total=384.00
                )
                db.add(ped1)
                db.flush()
                # Itens do Pedido 1
                db.add(PedidoItem(pedido_id=ped1.id, sabor="Cacau & Avela", quantidade_caixas=2, preco_caixa=96.00, subtotal=192.00))
                db.add(PedidoItem(pedido_id=ped1.id, sabor="Pasta de Amendoim", quantidade_caixas=2, preco_caixa=96.00, subtotal=192.00))

                # Pedido 2 (se houve intervalo)
                if p_primeiro > p_ultimo:
                    data_p2 = hoje - timedelta(days=p_ultimo)
                    ped2 = Pedido(
                        pdv_id=pdv.id,
                        data_pedido=data_p2,
                        forma_pagamento="PIX",
                        status_faturamento="Faturado",
                        status_entrega="Entregue",
                        observacoes="Reposição de estoque após giro acelerado.",
                        total_caixas=6,
                        valor_total=576.00
                    )
                    db.add(ped2)
                    db.flush()
                    # Itens do Pedido 2
                    db.add(PedidoItem(pedido_id=ped2.id, sabor="Cacau & Avela", quantidade_caixas=2, preco_caixa=96.00, subtotal=192.00))
                    db.add(PedidoItem(pedido_id=ped2.id, sabor="Pasta de Amendoim", quantidade_caixas=2, preco_caixa=96.00, subtotal=192.00))
                    db.add(PedidoItem(pedido_id=ped2.id, sabor="Banana & Canela", quantidade_caixas=1, preco_caixa=96.00, subtotal=96.00))
                    db.add(PedidoItem(pedido_id=ped2.id, sabor="Coco & Castanhas", quantidade_caixas=1, preco_caixa=96.00, subtotal=96.00))

            # Adiciona anotação de contato inicial da Gemima
            visita = HistoricoVisita(
                pdv_id=pdv.id,
                vendedor_nome="Gemima",
                tipo_contato="WhatsApp",
                anotacoes=f"Contato inicial com {pdv.responsavel}. Apresentação da linha Naturebarr e condições comerciais para {pdv.regiao}.",
                proxima_acao="Acompanhar recompra e giro de estoque" if pdv.status_pipeline in ["PDV Ativo", "Alerta de Reposicao"] else "Enviar apresentação comercial",
                data_proxima_acao=hoje + timedelta(days=2)
            )
            db.add(visita)

            # Recalcula as métricas do PDV
            db.commit()
            recalculate_pdv_metrics(db, pdv.id)

        print("Seed concluído com sucesso!")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
