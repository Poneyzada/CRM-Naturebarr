import React, { useState } from 'react';
import { 
  Users, 
  CheckCircle2, 
  DollarSign, 
  AlertTriangle, 
  TrendingUp, 
  ArrowUpRight, 
  ChevronDown, 
  Phone, 
  Mail, 
  Calendar, 
  Package, 
  MessageSquare, 
  ChevronRight,
  ExternalLink,
  Store,
  Sparkles,
  MapPin,
  Clock
} from 'lucide-react';
import { DashboardMetrics, PDV } from '../types';

interface DashboardViewProps {
  metrics: DashboardMetrics | null;
  onSelectPDV: (pdv: PDV) => void;
  onOpenPipeline: () => void;
  onOpenPDVs: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  metrics,
  onSelectPDV,
  onOpenPipeline,
  onOpenPDVs
}) => {
  const [salesTimeframe, setSalesTimeframe] = useState<'semana' | 'mes'>('semana');
  const [pipelineTimeframe, setPipelineTimeframe] = useState<'mes' | 'ano'>('mes');

  if (!metrics) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#afcb48]"></div>
      </div>
    );
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
  };

  // Coleta de dados dos polos
  const polos = [
    {
      rank: 1,
      name: 'Salvador (BA)',
      rep: 'Polo Bahia / Nordeste',
      revenue: metrics.regioes['Salvador']?.faturamento || 0,
      pdvs: metrics.regioes['Salvador']?.pdvs || 0,
      color: 'bg-amber-400 text-amber-950',
      tag: 'Alta Performance'
    },
    {
      rank: 2,
      name: 'São Paulo (SP)',
      rep: 'Polo Sudeste Capital',
      revenue: metrics.regioes['Sao Paulo']?.faturamento || 0,
      pdvs: metrics.regioes['Sao Paulo']?.pdvs || 0,
      color: 'bg-slate-200 text-slate-700',
      tag: 'Expansão Rápida'
    },
    {
      rank: 3,
      name: 'Santa Catarina (SC)',
      rep: 'Polo Sul Litoral & Serra',
      revenue: metrics.regioes['Santa Catarina']?.faturamento || 0,
      pdvs: metrics.regioes['Santa Catarina']?.pdvs || 0,
      color: 'bg-amber-600/80 text-white',
      tag: 'Alto Ticket Médio'
    },
  ];

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-6 space-y-7">
      
      {/* 1. TOP METRIC CARDS (4 Cards Quadrados estilo Nexora com ícones coloridos suaves) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Novos Leads */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-[#afcb48] transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100 shadow-2xs">
              <Users className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              <ArrowUpRight className="w-3 h-3 mr-0.5" /> +18.6%
            </span>
          </div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Novos Leads (Meta Ads)
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              {metrics.novos_leads}
            </span>
            <span className="text-[11px] text-slate-400 font-medium">no funil</span>
          </div>
        </div>

        {/* Card 2: PDVs Ativos */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-[#afcb48] transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-2xs">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              <ArrowUpRight className="w-3 h-3 mr-0.5" /> +12.4%
            </span>
          </div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            PDVs Ativos Comprando
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              {metrics.pdvs_ativos}
            </span>
            <span className="text-[11px] text-slate-400 font-medium">de {metrics.total_pdvs} cadastrados</span>
          </div>
        </div>

        {/* Card 3: Faturamento B2B */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-[#afcb48] transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-xl bg-[#f7faeb] text-[#5a6d1f] flex items-center justify-center border border-[#cfdf9b] shadow-2xs">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              <ArrowUpRight className="w-3 h-3 mr-0.5" /> +15.3%
            </span>
          </div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Faturamento B2B Total
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              {formatCurrency(metrics.faturamento_total_b2b)}
            </span>
            <span className="text-[11px] text-slate-400 font-medium">acumulado</span>
          </div>
        </div>

        {/* Card 4: Alertas de Reposição (O Diferencial de Recompra) */}
        <div className="bg-white p-5 rounded-2xl border border-amber-200/90 shadow-xs hover:border-amber-300 transition-all relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200 shadow-2xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
              ≤ 5 dias
            </span>
          </div>
          <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider block">
            Alertas de Reposição
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-amber-950 tracking-tight">
              {metrics.alertas_reposicao_urgente} PDVs
            </span>
            <span className="text-[11px] text-amber-700 font-bold">contatar hoje!</span>
          </div>
        </div>

      </div>

      {/* 2. SALES OVERVIEW CARD (Gráfico Suave com Faturamento B2B e Giro por Sabor) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
              Visão Geral de Vendas B2B & Giro
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Volume faturado e reposições distribuídas por polos e sabores
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-slate-100 p-1 rounded-xl flex items-center text-xs font-semibold text-slate-600">
              <button
                onClick={() => setSalesTimeframe('semana')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  salesTimeframe === 'semana' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'hover:text-slate-900'
                }`}
              >
                Esta Semana
              </button>
              <button
                onClick={() => setSalesTimeframe('mes')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  salesTimeframe === 'mes' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'hover:text-slate-900'
                }`}
              >
                Este Mês
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-4">
          <div>
            <span className="text-xs text-slate-400 font-semibold block">Total em Caixas Fechadas</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-slate-900 tracking-tight">
                {metrics.total_caixas_vendidas} cx
              </span>
              <span className="text-xs font-bold text-slate-950 bg-[#f7faeb] px-2 py-0.5 rounded-full border border-[#cfdf9b]">
                {metrics.total_caixas_vendidas * 12} barras entregues
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Faturamento médio por caixa: <strong>R$ 96,00</strong> (R$ 8,00 por barra no atacado)
            </p>
          </div>

          {/* Giro por Sabores Naturebarr em Grid com Barras de Progresso */}
          <div className="flex-1 max-w-xl grid grid-cols-1 sm:grid-cols-2 gap-3">
            {metrics.top_sabores.map((s, idx) => {
              const maxCaixas = Math.max(...metrics.top_sabores.map(x => x.caixas), 1);
              const pct = Math.round((s.caixas / maxCaixas) * 100);

              return (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-slate-800 truncate pr-2">{s.sabor}</span>
                    <span className="font-extrabold text-slate-900 shrink-0">{s.caixas} cx</span>
                  </div>
                  <div className="w-full bg-slate-200/80 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-[#afcb48] h-1.5 rounded-full transition-all duration-700" 
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Gráfico Visual Curvo Simulado (SVG Vector com degradê moderno #afcb48) */}
        <div className="relative pt-4 mt-4 border-t border-slate-100">
          <div className="h-40 w-full relative">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 800 120" preserveAspectRatio="none">
              <defs>
                <linearGradient id="natureGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#afcb48" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#afcb48" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M 0,90 Q 150,40 300,65 T 550,20 T 800,10 L 800,120 L 0,120 Z"
                fill="url(#natureGradient)"
              />
              <path
                d="M 0,90 Q 150,40 300,65 T 550,20 T 800,10"
                fill="none"
                stroke="#afcb48"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              {/* Pontos no gráfico */}
              <circle cx="0" cy="90" r="4" fill="#94b032" />
              <circle cx="300" cy="65" r="4" fill="#94b032" />
              <circle cx="550" cy="20" r="4" fill="#94b032" />
              <circle cx="800" cy="10" r="5" fill="#ffffff" stroke="#afcb48" strokeWidth="3" />
            </svg>
          </div>
          <div className="flex justify-between text-[11px] text-slate-400 font-medium pt-2">
            <span>Segunda</span>
            <span>Terça</span>
            <span>Quarta</span>
            <span>Quinta</span>
            <span>Sexta</span>
            <span>Sábado</span>
            <span>Domingo</span>
          </div>
        </div>
      </div>

      {/* 3. GRID DE 2 COLUNAS: FUNIL DE VENDAS (Deal Pipeline) & DESEMPENHO DOS POLOS (Top Performing Reps) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Card: Funil de Vendas B2B (Deal Pipeline estilo Nexora com gráfico de funil) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                Funil de Vendas B2B
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Etapas da prospecção ao PDV ativo</p>
            </div>

            <button 
              onClick={onOpenPipeline}
              className="text-xs font-extrabold text-slate-800 hover:text-slate-950 flex items-center gap-1"
            >
              <span>Ver Kanban</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Gráfico do Funil com Formas Trapezoidais Coloridas (como na imagem de referência) */}
          <div className="space-y-2.5 my-auto py-2">
            
            {/* Topo do Funil: Novos Leads */}
            <div className="flex items-center gap-4">
              <div className="flex-1 bg-gradient-to-r from-sky-500 to-sky-600 text-white font-black text-xs py-2.5 px-4 rounded-xl shadow-2xs flex items-center justify-between">
                <span>1. Novos Leads (Meta Ads / Orgânico)</span>
                <span className="bg-white/20 px-2 py-0.5 rounded-md">{metrics.novos_leads}</span>
              </div>
            </div>

            {/* Etapa 2: Contato Feito / Em Negociação */}
            <div className="flex items-center gap-4 pl-4 pr-4">
              <div className="flex-1 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-black text-xs py-2.5 px-4 rounded-xl shadow-2xs flex items-center justify-between">
                <span>2. Contato Feito / Apresentação</span>
                <span className="bg-white/20 px-2 py-0.5 rounded-md">{metrics.status_pipeline['Contato Feito'] || 0}</span>
              </div>
            </div>

            {/* Etapa 3: Amostra Enviada */}
            <div className="flex items-center gap-4 pl-8 pr-8">
              <div className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-black text-xs py-2.5 px-4 rounded-xl shadow-2xs flex items-center justify-between">
                <span>3. Amostra Enviada (Degustação)</span>
                <span className="bg-white/20 px-2 py-0.5 rounded-md">{metrics.status_pipeline['Amostra Enviada'] || 0}</span>
              </div>
            </div>

            {/* Base do Funil: PDVs Ativos Fechados */}
            <div className="flex items-center gap-4 pl-12 pr-12">
              <div className="flex-1 bg-gradient-to-r from-[#afcb48] to-[#94b032] text-slate-950 font-black text-xs py-2.5 px-4 rounded-xl shadow-2xs flex items-center justify-between">
                <span>4. PDVs Ativos (Comprando)</span>
                <span className="bg-white/40 text-slate-950 px-2 py-0.5 rounded-md font-black">{metrics.pdvs_ativos}</span>
              </div>
            </div>

          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Taxa de Conversão do Funil:</span>
            <span className="font-extrabold text-slate-950 bg-[#f7faeb] px-2.5 py-1 rounded-lg border border-[#cfdf9b]">
              {metrics.total_pdvs > 0 ? Math.round((metrics.pdvs_ativos / metrics.total_pdvs) * 100) : 0}% de conversão
            </span>
          </div>
        </div>

        {/* Card: Desempenho por Polos Comerciais (Top Performing Reps estilo Nexora) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                Polos Comerciais Naturebarr
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Ranking por faturamento B2B e volume</p>
            </div>

            <button
              onClick={onOpenPDVs}
              className="text-xs font-extrabold text-slate-800 hover:text-slate-950 flex items-center gap-1"
            >
              <span>Ver Carteira</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 my-auto">
            {polos.map((polo) => (
              <div key={polo.name} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-full ${polo.color} font-black text-xs flex items-center justify-center shadow-2xs`}>
                    {polo.rank}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{polo.name}</span>
                      <span className="text-[10px] font-black text-slate-950 bg-[#f7faeb] border border-[#cfdf9b] px-1.5 py-0.5 rounded-full">
                        {polo.tag}
                      </span>
                    </h4>
                    <span className="text-[11px] text-slate-400">{polo.rep}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-extrabold text-slate-900 block">
                    {formatCurrency(polo.revenue)}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {polo.pdvs} {polo.pdvs === 1 ? 'PDV' : 'PDVs'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Logística & Atendimento:</span>
            <span className="font-bold text-slate-800">Salvador, SP e SC cobertos</span>
          </div>
        </div>

      </div>

      {/* 4. GRID DE 2 COLUNAS: PRÓXIMAS TAREFAS (Ações Imediatas da Gemima) & ATIVIDADE RECENTE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Card: Próximas Tarefas & Recompras (Upcoming Tasks estilo Nexora) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Ações Comerciais da Gemima</span>
                {metrics.alertas_reposicao_urgente > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold border border-amber-200">
                    {metrics.alertas_reposicao_urgente} urgentes
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Rotina de reposição preventiva e follow-ups</p>
            </div>

            <button 
              onClick={onOpenPipeline}
              className="text-xs font-extrabold text-slate-800 hover:text-slate-950"
            >
              Ver Todas
            </button>
          </div>

          <div className="space-y-3">
            {metrics.acoes_urgentes_hoje && metrics.acoes_urgentes_hoje.length > 0 ? (
              metrics.acoes_urgentes_hoje.map((pdv) => (
                <div 
                  key={pdv.id}
                  className="p-3 bg-slate-50 hover:bg-[#f7faeb]/60 rounded-xl border border-slate-200/70 hover:border-[#afcb48] transition-all flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 
                        onClick={() => onSelectPDV(pdv)}
                        className="text-xs font-bold text-slate-900 hover:text-[#5a6d1f] cursor-pointer"
                      >
                        Reposição: {pdv.nome_fantasia}
                      </h4>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                        <span>{pdv.responsavel || 'Comprador'}</span>
                        <span>•</span>
                        <span className={
                          pdv.dias_para_recompra !== undefined && pdv.dias_para_recompra <= 1
                            ? 'text-red-600 font-black animate-pulse'
                            : 'text-amber-700 font-semibold'
                        }>
                          {pdv.dias_para_recompra !== undefined && pdv.dias_para_recompra <= 0
                            ? '0d (Vencido!)'
                            : pdv.dias_para_recompra === 1
                            ? '1d (Crítico!)'
                            : `Resta ${pdv.dias_para_recompra}d`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <a
                    href={pdv.link_whatsapp || `https://wa.me/${pdv.telefone_whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#afcb48] hover:bg-[#a0bc3d] text-slate-950 rounded-full text-xs font-black shadow-2xs transition-colors shrink-0"
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-slate-400 text-xs">
                Nenhuma ação pendente de reposição para hoje!
              </div>
            )}
          </div>
        </div>

        {/* Card: Atividade Recente Comercial (Recent Activity estilo Nexora) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                Atividade Recente da Carteira
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Últimos pedidos faturados e contatos comerciais</p>
            </div>

            <button 
              onClick={onOpenPDVs}
              className="text-xs font-extrabold text-slate-800 hover:text-slate-950"
            >
              Ver PDVs
            </button>
          </div>

          <div className="space-y-3 text-xs">
            
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                <Package className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-slate-800">
                  <strong className="text-slate-900">BioFit Jardins (SP)</strong> faturou novo pedido de reposição no valor de <strong className="text-[#5a6d1f]">R$ 576,00</strong>.
                </p>
                <span className="text-[10px] text-slate-400 mt-1 block">Hoje às 14:30</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center shrink-0 mt-0.5">
                <Users className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-slate-800">
                  Novo lead <strong className="text-slate-900">CrossFit Ondina (SSA)</strong> capturado pela campanha de tráfego pago Meta Ads.
                </p>
                <span className="text-[10px] text-slate-400 mt-1 block">Hoje às 11:15</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center shrink-0 mt-0.5">
                <Mail className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-slate-800">
                  Kit de amostras Naturebarr despachado para <strong className="text-slate-900">Cafeteria Madá Fit (SP)</strong>.
                </p>
                <span className="text-[10px] text-slate-400 mt-1 block">Ontem às 16:40</span>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
