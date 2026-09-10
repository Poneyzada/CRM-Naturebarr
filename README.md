# Naturebarr B2B CRM — Gestão Comercial & Ciclo de Recompra

Aplicação web completa de **CRM B2B** desenvolvida especificamente para a gestão comercial, expansão de carteira e controle de reposição preventiva da marca de barras de proteína saudáveis **Naturebarr**.

O sistema atua com foco nos três polos comerciais estratégicos: **Salvador (BA)**, **São Paulo (SP)** e **Santa Catarina (SC)**.

---

## 🚀 Como Inicializar o Sistema com 1 Clique

### Opção 1: Windows (Atalho Rápido)
Basta dar **duplo clique** no arquivo:
```bash
iniciar_crm.bat
```
ou via PowerShell:
```powershell
.\iniciar_crm.ps1
```

O script inicializará o Backend (FastAPI na porta 8000), o Frontend (React Vite na porta 5173) e abrirá automaticamente seu navegador!

### Opção 2: Manualmente em dois terminais

**Terminal 1 — Backend (FastAPI):**
```bash
# Instalar dependências (caso não tenha instalado)
pip install -r backend/requirements.txt

# Iniciar servidor
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```
Documentação OpenAPI interativa (Swagger): [http://localhost:8000/docs](http://localhost:8000/docs)

**Terminal 2 — Frontend (React + Vite):**
```bash
cd frontend
npm install
npm run dev
```
Interface do CRM: [http://localhost:5173](http://localhost:5173)

---

## 🌟 Principais Funcionalidades

### 1. Painel Executivo B2B (Dashboard)
- **Métricas Consolidadas**: Faturamento B2B total, faturamento do mês atual, volume em caixas (com conversão para total de barras) e total de PDVs ativos.
- **Desempenho por Polos Regionais**: Salvador (BA), São Paulo (SP) e Santa Catarina (SC).
- **Giro por Sabor da Naturebarr**: Cacau & Avelã, Pasta de Amendoim, Banana & Canela, Coco & Castanhas, Frutas Vermelhas & Chia.
- **Ações Imediatas da Semana (Gemima)**: Lista prioritária de clientes que estão com o estoque no fim para contato preventivo via WhatsApp com 1 clique.

### 2. Pipeline de Vendas & Kanban de Recompra
6 etapas estruturadas:
1. **Novo Lead (Tráfego Pago)**: Leads vindos de anúncios do Instagram/Facebook e landing page.
2. **Contato Feito / Em Negociação**: Apresentação comercial e envio da tabela de atacado.
3. **Amostra Enviada**: Kit de degustação em trânsito para o estabelecimento.
4. **PDV Ativo**: Cliente comprando no ritmo regular.
5. **Alerta de Reposição (O Diferencial)**: Alerta visual ativado automaticamente quando o estoque estimado está a **≤ 5 dias** do fim.
6. **Inativo / Churn**: Contas sem reposição ou perdidas.

### 3. Ficha Detalhada do PDV & WhatsApp Inteligente
- **Link direto para WhatsApp (`https://wa.me/55...`)** com 4 templates de mensagens pré-formatadas para a Gemima:
  - *Alerta de Reposição Preventiva*
  - *Primeiro Contato / Envio de Catálogo*
  - *Envio de Amostras*
  - *Reativação de Conta*
- **Linha do Tempo de Visitas e Contatos**: histórico com tipo de contato (WhatsApp, ligação, visita presencial), anotações e agendamento da próxima ação comercial.
- **Histórico Completo de Pedidos**: listagem com valores, formas de pagamento e sabores.

### 4. Lançamento de Pedidos B2B por Caixas Fechadas
- Registro simplificado por caixas (12 unidades/cx) de cada sabor da Naturebarr.
- Cálculo dinâmico do valor total do pedido e volume.
- Ao salvar o pedido, o motor de inteligência recalcula automaticamente a média de dias entre compras (`media_dias_recompra`), projeta a data estimada do próximo pedido e atualiza o faturamento acumulado.

### 5. Importador de Planilha (CSV / Excel)
- Interface com **Drag-and-Drop** para subir carteiras existentes de PDVs.
- Mapeamento inteligente tolerante a cabeçalhos variados (Razão Social, Nome Fantasia, CNPJ/CPF, Responsável, WhatsApp, Cidade, Estado, Região).
- Botão de download do **Modelo CSV Padrão** pronto para preenchimento.

### 6. Integração de Tráfego Pago (Meta Ads Webhook)
- Endpoint dedicado: `POST /api/v1/webhooks/meta-leads`.
- Compatível com formulários nativos do Meta Ads (Facebook/Instagram Lead Ads) e webhook de Landing Pages.
- **Simulador Interativo Integrado**: permite disparar leads de teste de Salvador, SP ou SC com 1 clique para ver o lead entrar instantaneamente na primeira coluna do Kanban.

---

## 🗄️ Estrutura do Banco de Dados & Supabase

O projeto acompanha o arquivo **`supabase_schema.sql`** na raiz, contendo:
- Tabela de `perfis` (vendedores e admins).
- Tabela de `pdvs` (com restrições de região, categoria e colunas de ciclo de recompra).
- Tabela de `pedidos` e `pedido_itens` (composição por sabores Naturebarr).
- Tabela de `historico_visitas` (log comercial da Gemima).
- Tabela de `leads_webhook` (auditoria de leads de tráfego pago).
- **Trigger e Função SQL (`fn_recalcular_ciclo_recompra`)**: recálculo automático em nível de banco de dados após cada pedido.

### Conectando ao Supabase em Produção
Por padrão, para desenvolvimento local imediato sem necessidade de configurar bancos externos, o sistema utiliza **SQLite** (`naturebarr.db`). Para conectar ao Supabase em produção:
1. No painel do Supabase, execute o script `supabase_schema.sql` no **SQL Editor**.
2. Defina a variável de ambiente no backend:
   ```bash
   export DATABASE_URL="postgresql://postgres:[SUA_SENHA]@db.[SEU_PROJETO].supabase.co:5432/postgres"
   ```
O SQLAlchemy se conectará automaticamente ao Supabase sem nenhuma alteração de código necessária!

---

## 🎨 Identidade Visual
- Fundo clean off-white / branco corporativo.
- Acentos na paleta **Verde Água (Teal / Emerald)** da Naturebarr: `#0d9488`, `#14b8a6`, `#0f766e`, `#f0fdfa`.
- Badges dinâmicos de alerta em tons âmbar/dourado para reposições urgentes.
