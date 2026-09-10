-- ==============================================================================
-- SCHEMA SQL SUPABASE / POSTGRESQL - CRM B2B NATUREBARR
-- Foco Comercial: Salvador (BA), São Paulo (SP) e Santa Catarina (SC)
-- ==============================================================================

-- Habilitar extensão UUID caso não esteja habilitada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. TABELA DE PERFIS / USUÁRIOS (Admin / Vendedor Comercial)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS perfis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    nome VARCHAR(150) NOT NULL,
    cargo VARCHAR(50) DEFAULT 'vendedor' CHECK (cargo IN ('admin', 'vendedor', 'gerente')),
    telefone VARCHAR(30),
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 2. TABELA DE PDVs (Pontos de Venda B2B / Carteira de Clientes)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pdvs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    razao_social VARCHAR(200) NOT NULL,
    nome_fantasia VARCHAR(200) NOT NULL,
    cnpj_cpf VARCHAR(25),
    responsavel VARCHAR(120),
    telefone_whatsapp VARCHAR(30) NOT NULL,
    email VARCHAR(150),
    
    -- Localização e Polos Regionais
    endereco TEXT,
    bairro VARCHAR(100),
    cidade VARCHAR(100) NOT NULL,
    estado VARCHAR(2) NOT NULL,
    regiao VARCHAR(50) NOT NULL CHECK (regiao IN ('Salvador', 'Sao Paulo', 'Santa Catarina', 'Outro')),
    cep VARCHAR(15),

    -- Segmentação e Origem
    categoria VARCHAR(50) DEFAULT 'Emporio' CHECK (categoria IN ('Emporio', 'Academia', 'Box Crossfit', 'Farmacia', 'Suplementos', 'Cafeteria', 'Mercado Saudavel', 'Outro')),
    origem VARCHAR(50) DEFAULT 'Trafego Pago' CHECK (origem IN ('Trafego Pago', 'Organico', 'Indicacao', 'Prospeccao Ativa', 'Evento', 'Outro')),
    classe_abc VARCHAR(1) DEFAULT 'B' CHECK (classe_abc IN ('A', 'B', 'C')),

    -- Pipeline de Vendas & Recompra
    status_pipeline VARCHAR(50) DEFAULT 'Novo Lead' CHECK (status_pipeline IN (
        'Novo Lead',
        'Contato Feito',
        'Amostra Enviada',
        'PDV Ativo',
        'Alerta de Reposicao',
        'Inativo'
    )),
    motivo_perda VARCHAR(150),

    -- Inteligência de Ciclo de Recompra
    media_dias_recompra INTEGER DEFAULT 21,
    data_primeira_compra DATE,
    data_ultima_compra DATE,
    data_prevista_recompra DATE,
    alerta_reposicao BOOLEAN DEFAULT FALSE,
    faturamento_acumulado NUMERIC(12, 2) DEFAULT 0.00,
    total_pedidos INTEGER DEFAULT 0,

    -- Acompanhamento Comercial
    vendedor_id UUID REFERENCES perfis(id) ON DELETE SET NULL,
    proxima_acao_comercial VARCHAR(200),
    data_proxima_acao DATE,
    observacoes_gerais TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para buscas rápidas
CREATE INDEX IF NOT EXISTS idx_pdvs_regiao ON pdvs(regiao);
CREATE INDEX IF NOT EXISTS idx_pdvs_status ON pdvs(status_pipeline);
CREATE INDEX IF NOT EXISTS idx_pdvs_alerta ON pdvs(alerta_reposicao);
CREATE INDEX IF NOT EXISTS idx_pdvs_cidade ON pdvs(cidade);
CREATE INDEX IF NOT EXISTS idx_pdvs_telefone ON pdvs(telefone_whatsapp);

-- ------------------------------------------------------------------------------
-- 3. TABELA DE PEDIDOS B2B (Venda em Caixas Fechadas)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pedidos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pdv_id UUID NOT NULL REFERENCES pdvs(id) ON DELETE CASCADE,
    numero_pedido SERIAL,
    data_pedido DATE NOT NULL DEFAULT CURRENT_DATE,
    valor_total NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_caixas INTEGER NOT NULL DEFAULT 0,
    forma_pagamento VARCHAR(50) DEFAULT 'Boleto 30d' CHECK (forma_pagamento IN ('Boleto 30d', 'Boleto 15d', 'Boleto 45d', 'PIX', 'Cartao de Credito', 'Transferencia', 'Outro')),
    status_faturamento VARCHAR(50) DEFAULT 'Aprovado' CHECK (status_faturamento IN ('Pendente', 'Aprovado', 'Faturado', 'Cancelado')),
    status_entrega VARCHAR(50) DEFAULT 'Preparando' CHECK (status_entrega IN ('Preparando', 'Em Transito', 'Entregue', 'Cancelado')),
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pedidos_pdv_id ON pedidos(pdv_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_data ON pedidos(data_pedido);

-- ------------------------------------------------------------------------------
-- 4. ITENS DO PEDIDO (SKUs / Sabores Naturebarr por Caixa)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pedido_itens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pedido_id UUID NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    sabor VARCHAR(100) NOT NULL CHECK (sabor IN (
        'Cacau & Avela',
        'Pasta de Amendoim',
        'Banana & Canela',
        'Coco & Castanhas',
        'Frutas Vermelhas & Chia'
    )),
    quantidade_caixas INTEGER NOT NULL CHECK (quantidade_caixas > 0),
    unidades_por_caixa INTEGER NOT NULL DEFAULT 12,
    preco_caixa NUMERIC(10, 2) NOT NULL,
    subtotal NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pedido_itens_pedido ON pedido_itens(pedido_id);

-- ------------------------------------------------------------------------------
-- 5. HISTÓRICO DE VISITAS E CONTATOS COMERCIAIS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS historico_visitas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pdv_id UUID NOT NULL REFERENCES pdvs(id) ON DELETE CASCADE,
    vendedor_nome VARCHAR(100) DEFAULT 'Gemima',
    tipo_contato VARCHAR(50) NOT NULL CHECK (tipo_contato IN ('WhatsApp', 'Ligacao', 'Visita Presencial', 'Envio de Amostra', 'Reuniao')),
    data_contato TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    anotacoes TEXT NOT NULL,
    proxima_acao VARCHAR(150),
    data_proxima_acao DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_visitas_pdv_id ON historico_visitas(pdv_id);

-- ------------------------------------------------------------------------------
-- 6. LEADS RECEBIDOS VIA WEBHOOK (Meta Ads / Facebook / Instagram Lead Ads)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS leads_webhook (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ad_id VARCHAR(100),
    form_id VARCHAR(100),
    campaign_name VARCHAR(200),
    nome VARCHAR(150),
    email VARCHAR(150),
    telefone VARCHAR(50),
    empresa VARCHAR(150),
    cidade VARCHAR(100),
    estado VARCHAR(2),
    payload_bruto JSONB NOT NULL,
    processado BOOLEAN DEFAULT TRUE,
    pdv_id UUID REFERENCES pdvs(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads_webhook(created_at);

-- ------------------------------------------------------------------------------
-- 7. FUNÇÃO E TRIGGER: RECÁLCULO AUTOMÁTICO DO CICLO DE RECOMPRA
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_recalcular_ciclo_recompra()
RETURNS TRIGGER AS $$
DECLARE
    v_pdv_id UUID;
    v_total_pedidos INTEGER;
    v_faturamento NUMERIC(12, 2);
    v_primeira_compra DATE;
    v_ultima_compra DATE;
    v_media_dias INTEGER;
    v_data_prevista DATE;
    v_dias_restantes INTEGER;
    v_alerta BOOLEAN;
    v_status_atual VARCHAR(50);
BEGIN
    v_pdv_id := NEW.pdv_id;

    -- Calcular totais do PDV
    SELECT 
        COUNT(*),
        COALESCE(SUM(valor_total), 0),
        MIN(data_pedido),
        MAX(data_pedido)
    INTO 
        v_total_pedidos,
        v_faturamento,
        v_primeira_compra,
        v_ultima_compra
    FROM pedidos
    WHERE pdv_id = v_pdv_id;

    -- Calcular média de dias entre pedidos se tiver 2 ou mais pedidos
    IF v_total_pedidos > 1 AND v_primeira_compra < v_ultima_compra THEN
        v_media_dias := ROUND((v_ultima_compra - v_primeira_compra)::NUMERIC / (v_total_pedidos - 1));
        IF v_media_dias < 7 THEN
            v_media_dias := 7;
        END IF;
    ELSE
        v_media_dias := 21; -- Padrão inicial de 21 dias para PDV
    END IF;

    -- Projetar próxima recompra
    v_data_prevista := v_ultima_compra + (v_media_dias || ' days')::INTERVAL;
    v_dias_restantes := v_data_prevista - CURRENT_DATE;

    -- Disparar alerta se faltar 5 dias ou menos
    IF v_dias_restantes <= 5 THEN
        v_alerta := TRUE;
    ELSE
        v_alerta := FALSE;
    END IF;

    -- Obter status atual para atualizar se necessário
    SELECT status_pipeline INTO v_status_atual FROM pdvs WHERE id = v_pdv_id;

    -- Atualizar PDV
    UPDATE pdvs
    SET 
        total_pedidos = v_total_pedidos,
        faturamento_acumulado = v_faturamento,
        data_primeira_compra = v_primeira_compra,
        data_ultima_compra = v_ultima_compra,
        media_dias_recompra = v_media_dias,
        data_prevista_recompra = v_data_prevista,
        alerta_reposicao = v_alerta,
        status_pipeline = CASE 
            WHEN v_alerta = TRUE THEN 'Alerta de Reposicao'
            WHEN v_status_atual IN ('Novo Lead', 'Contato Feito', 'Amostra Enviada') THEN 'PDV Ativo'
            ELSE v_status_atual
        END,
        updated_at = NOW()
    WHERE id = v_pdv_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger disparado após inserção ou atualização de pedido
DROP TRIGGER IF EXISTS trg_atualizar_ciclo_pedido ON pedidos;
CREATE TRIGGER trg_atualizar_ciclo_pedido
AFTER INSERT OR UPDATE OR DELETE ON pedidos
FOR EACH ROW
EXECUTE FUNCTION fn_recalcular_ciclo_recompra();

-- ------------------------------------------------------------------------------
-- DADOS INICIAIS DE DEMONSTRAÇÃO (SEED NATUREBARR)
-- ------------------------------------------------------------------------------
-- Inserir Vendedor Gemima
INSERT INTO perfis (id, email, nome, cargo, telefone)
VALUES ('11111111-1111-1111-1111-111111111111', 'gemima@naturebarr.com.br', 'Gemima Vendas', 'vendedor', '71988887777')
ON CONFLICT (email) DO NOTHING;

-- PDV Salvador
INSERT INTO pdvs (
    id, razao_social, nome_fantasia, cnpj_cpf, responsavel, telefone_whatsapp, 
    cidade, estado, regiao, bairro, categoria, origem, status_pipeline, media_dias_recompra
) VALUES (
    '22222222-2222-2222-2222-222222222222',
    'Emporio Saudavel Salvador Ltda',
    'Grão Real Barra',
    '12.345.678/0001-90',
    'Rodrigo Santos',
    '71991234567',
    'Salvador',
    'BA',
    'Salvador',
    'Barra',
    'Emporio',
    'Trafego Pago',
    'Alerta de Reposicao',
    18
) ON CONFLICT DO NOTHING;

-- PDV São Paulo
INSERT INTO pdvs (
    id, razao_social, nome_fantasia, cnpj_cpf, responsavel, telefone_whatsapp, 
    cidade, estado, regiao, bairro, categoria, origem, status_pipeline, media_dias_recompra
) VALUES (
    '33333333-3333-3333-3333-333333333333',
    'Academia BioFit Jardins Eireli',
    'BioFit Jardins',
    '98.765.432/0001-11',
    'Camila Duarte',
    '11987654321',
    'São Paulo',
    'SP',
    'Sao Paulo',
    'Jardins',
    'Academia',
    'Prospeccao Ativa',
    'PDV Ativo',
    21
) ON CONFLICT DO NOTHING;

-- PDV Santa Catarina
INSERT INTO pdvs (
    id, razao_social, nome_fantasia, cnpj_cpf, responsavel, telefone_whatsapp, 
    cidade, estado, regiao, bairro, categoria, origem, status_pipeline, media_dias_recompra
) VALUES (
    '44444444-4444-4444-4444-444444444444',
    'CrossFit Floripa Ilha Ltda',
    'CrossFit Ilha Campeche',
    '45.123.789/0001-44',
    'Felipe Koerich',
    '48999887766',
    'Florianópolis',
    'SC',
    'Santa Catarina',
    'Campeche',
    'Box Crossfit',
    'Trafego Pago',
    'Novo Lead',
    21
) ON CONFLICT DO NOTHING;
