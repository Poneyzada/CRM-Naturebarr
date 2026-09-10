export type Region = 'Salvador' | 'Sao Paulo' | 'Santa Catarina' | 'Outro';

export type PipelineStatus = 
  | 'Novo Lead'
  | 'Contato Feito'
  | 'Amostra Enviada'
  | 'PDV Ativo'
  | 'Alerta de Reposicao'
  | 'Inativo';

export type Category = 
  | 'Emporio'
  | 'Academia'
  | 'Box Crossfit'
  | 'Farmacia'
  | 'Suplementos'
  | 'Cafeteria'
  | 'Mercado Saudavel'
  | 'Outro';

export interface PDV {
  id: string;
  razao_social: string;
  nome_fantasia: string;
  cnpj_cpf?: string;
  responsavel?: string;
  telefone_whatsapp: string;
  email?: string;
  endereco?: string;
  bairro?: string;
  cidade: string;
  estado: string;
  regiao: Region;
  cep?: string;
  categoria: Category;
  origem: string;
  classe_abc: 'A' | 'B' | 'C';
  status_pipeline: PipelineStatus;
  motivo_perda?: string;
  media_dias_recompra: number;
  data_primeira_compra?: string;
  data_ultima_compra?: string;
  data_prevista_recompra?: string;
  alerta_reposicao: boolean;
  faturamento_acumulado: number;
  total_pedidos: number;
  vendedor_nome: string;
  proxima_acao_comercial?: string;
  data_proxima_acao?: string;
  observacoes_gerais?: string;
  dias_sem_comprar?: number;
  dias_para_recompra?: number;
  link_whatsapp?: string;
  created_at: string;
  updated_at: string;
}

export interface PedidoItem {
  id?: string;
  sabor: string;
  quantidade_caixas: number;
  unidades_por_caixa: number;
  preco_caixa: number;
  subtotal: number;
}

export interface Pedido {
  id: string;
  pdv_id: string;
  numero_pedido?: number;
  data_pedido: string;
  valor_total: number;
  total_caixas: number;
  forma_pagamento: string;
  status_faturamento: string;
  status_entrega: string;
  observacoes?: string;
  created_at: string;
  itens?: PedidoItem[];
}

export interface HistoricoVisita {
  id: string;
  pdv_id: string;
  vendedor_nome: string;
  tipo_contato: string;
  data_contato: string;
  anotacoes: string;
  proxima_acao?: string;
  data_proxima_acao?: string;
  created_at: string;
}

export interface DashboardMetrics {
  faturamento_total_b2b: number;
  faturamento_mes_atual: number;
  total_caixas_vendidas: number;
  total_pdvs: number;
  pdvs_ativos: number;
  novos_leads: number;
  alertas_reposicao_urgente: number;
  regioes: {
    [key: string]: {
      pdvs: number;
      faturamento: number;
    };
  };
  status_pipeline: {
    [key: string]: number;
  };
  top_sabores: Array<{
    sabor: string;
    caixas: number;
  }>;
  acoes_urgentes_hoje: PDV[];
}
