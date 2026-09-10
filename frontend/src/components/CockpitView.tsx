import React, { useState, useEffect } from 'react';
import { 
  Search, 
  RotateCcw, 
  Calendar, 
  Phone, 
  MessageSquare, 
  Check, 
  ChevronRight, 
  ExternalLink, 
  AlertTriangle, 
  Clock, 
  Building2, 
  Mail, 
  User, 
  Plus, 
  Sparkles,
  TrendingUp,
  MapPin,
  Package,
  Send,
  CheckCircle2,
  DollarSign,
  PlusCircle
} from 'lucide-react';
import { PDV, Pedido, HistoricoVisita } from '../types';
import { createPDVVisita, getPDVPedidos, getPDVVisitas } from '../api';

interface CockpitViewProps {
  pdvs: PDV[];
  selectedPDV: PDV | null;
  onSelectPDV: (pdv: PDV) => void;
  onOpenNewOrder: (pdv: PDV) => void;
  onRefreshData: () => void;
}

export const CockpitView: React.FC<CockpitViewProps> = ({
  pdvs,
  selectedPDV,
  onSelectPDV,
  onOpenNewOrder,
  onRefreshData
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'summary' | 'recompra' | 'pedidos' | 'timeline'>('summary');
  const [novaNota, setNovaNota] = useState('');
  const [savingNota, setSavingNota] = useState(false);

  // Estados dinâmicos das abas
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [visitas, setVisitas] = useState<HistoricoVisita[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Formulário da aba de Linha do Tempo
  const [tipoContatoTimeline, setTipoContatoTimeline] = useState('WhatsApp');
  const [proximaAcaoTimeline, setProximaAcaoTimeline] = useState('');
  const [dataProximaAcaoTimeline, setDataProximaAcaoTimeline] = useState('');
  const [savingTimeline, setSavingTimeline] = useState(false);

  const currentPDV = selectedPDV || pdvs.find(p => p.alerta_reposicao) || pdvs[0];

  const reloadDetails = async () => {
    if (!currentPDV) return;
    setLoadingDetails(true);
    try {
      const [peds, vists] = await Promise.all([
        getPDVPedidos(currentPDV.id),
        getPDVVisitas(currentPDV.id)
      ]);
      setPedidos(peds);
      setVisitas(vists);
    } catch (err) {
      console.error('Erro ao carregar detalhes no Cockpit:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  useEffect(() => {
    reloadDetails();
  }, [currentPDV?.id]);

  const filteredPDVs = pdvs.filter(p => 
    !searchTerm || 
    p.nome_fantasia.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.responsavel && p.responsavel.toLowerCase().includes(searchTerm.toLowerCase())) ||
    p.cidade.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pdvsUrgentes = filteredPDVs.filter(p => p.alerta_reposicao || (p.dias_para_recompra !== undefined && p.dias_para_recompra <= 5));
  const pdvsRegulares = filteredPDVs.filter(p => !pdvsUrgentes.includes(p));

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
  };

  const calculateScore = (pdv: PDV) => {
    if (pdv.alerta_reposicao) return 92;
    if (pdv.classe_abc === 'A') return 95;
    if (pdv.status_pipeline === 'PDV Ativo') return 84;
    if (pdv.status_pipeline === 'Amostra Enviada') return 76;
    if (pdv.status_pipeline === 'Novo Lead') return 65;
    return 45;
  };

  const handleSalvarNotaRapida = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPDV || !novaNota.trim()) return;

    setSavingNota(true);
    try {
      await createPDVVisita(currentPDV.id, {
        vendedor_nome: 'Gemima',
        tipo_contato: 'WhatsApp',
        anotacoes: novaNota.trim(),
        proxima_acao: 'Follow-up de reposição',
      });
      setNovaNota('');
      await reloadDetails();
      onRefreshData();
    } catch (err) {
      alert('Erro ao salvar anotação');
    } finally {
      setSavingNota(false);
    }
  };

  const handleSalvarContatoTimeline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPDV || !novaNota.trim()) return;

    setSavingTimeline(true);
    try {
      await createPDVVisita(currentPDV.id, {
        vendedor_nome: 'Gemima',
        tipo_contato: tipoContatoTimeline,
        anotacoes: novaNota.trim(),
        proxima_acao: proximaAcaoTimeline || undefined,
        data_proxima_acao: dataProximaAcaoTimeline || undefined,
      });
      setNovaNota('');
      setProximaAcaoTimeline('');
      setDataProximaAcaoTimeline('');
      await reloadDetails();
      onRefreshData();
    } catch (err) {
      alert('Erro ao salvar contato');
    } finally {
      setSavingTimeline(false);
    }
  };

  return (
    <div className="max-w-[1700px] mx-auto p-3 sm:p-6">
      
      {/* Container Principal Estilo Dynamic 365 Sales Hub com Cantos Arredondados */}
      <div className="bg-[#fcfdfd] border border-slate-200/90 rounded-[32px] shadow-sm overflow-hidden flex flex-col xl:flex-row min-h-[calc(100vh-120px)]">
        
        {/* ========================================================================= */}
        {/* COLUNA ESQUERDA: "MY WORK" / FILA DE TRABALHO DA GEMIMA                   */}
        {/* ========================================================================= */}
        <div className="w-full xl:w-96 border-b xl:border-b-0 xl:border-r border-slate-200/80 bg-white/70 flex flex-col shrink-0">
          
          {/* Header da Fila */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Fila Comercial</h2>
              <span className="text-[11px] font-semibold text-slate-400">My Work • Naturebarr</span>
            </div>

            <div className="flex items-center gap-1">
              <button 
                onClick={onRefreshData}
                title="Recarregar fila"
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Campo de Busca Rápida */}
          <div className="p-3 border-b border-slate-100">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar cliente na fila..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-100/70 border border-slate-200/60 rounded-full text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#afcb48] font-medium"
              />
            </div>
          </div>

          {/* Lista de Contas */}
          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            
            {/* Seção 1: Prioridade Hoje (Alertas de Reposição) */}
            {pdvsUrgentes.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between px-2 text-[10px] font-extrabold uppercase tracking-wider text-[#5a6d1f]">
                  <span>Ações de Hoje (Reposição Urgente)</span>
                  <span className="bg-[#eff5d6] text-[#4a5b1c] border border-[#cfdf9b] px-1.5 py-0.5 rounded-full font-black">{pdvsUrgentes.length}</span>
                </div>

                {pdvsUrgentes.map((pdv) => {
                  const isSelected = currentPDV?.id === pdv.id;
                  const score = calculateScore(pdv);

                  return (
                    <div
                      key={pdv.id}
                      onClick={() => onSelectPDV(pdv)}
                      className={`p-3.5 rounded-2xl cursor-pointer transition-all border relative ${
                        isSelected
                          ? 'bg-gradient-to-r from-[#f7faeb] via-[#eff5d6] to-[#e1ecc0] border-[#afcb48] shadow-sm ring-2 ring-[#afcb48]/40'
                          : 'bg-white hover:bg-slate-50 border-slate-200/80'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-[#5a6d1f] text-white font-black text-xs flex items-center justify-center shadow-xs shrink-0">
                            {pdv.nome_fantasia.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-900 truncate">
                              {pdv.nome_fantasia}
                            </h4>
                            <p className="text-[11px] text-slate-500 truncate">
                              {pdv.responsavel || 'Comprador'} • {pdv.cidade}
                            </p>
                          </div>
                        </div>

                        {/* Health Score Pill */}
                        <div className="w-7 h-7 rounded-full bg-slate-900 text-white font-black text-[10px] flex items-center justify-center shadow-xs shrink-0">
                          {score}
                        </div>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px]">
                        <span className={`font-bold px-2 py-0.5 rounded-md ${
                          (pdv.dias_para_recompra !== undefined && pdv.dias_para_recompra <= 1)
                            ? 'text-red-600 font-black bg-red-50 border border-red-200 animate-pulse'
                            : 'text-[#364308] bg-[#eff5d6] border border-[#cfdf9b]'
                        }`}>
                          {pdv.dias_para_recompra !== undefined && pdv.dias_para_recompra <= 0
                            ? '0d de estoque'
                            : pdv.dias_para_recompra === 1
                            ? '1d de estoque'
                            : `≤ ${pdv.dias_para_recompra !== undefined ? pdv.dias_para_recompra : 5}d de estoque`}
                        </span>

                        <a
                          href={pdv.link_whatsapp || `https://wa.me/${pdv.telefone_whatsapp}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="w-7 h-7 rounded-full bg-white border border-slate-300 hover:bg-[#eff5d6] hover:border-[#afcb48] text-slate-900 flex items-center justify-center shadow-xs transition-colors"
                        >
                          <Phone className="w-3 h-3 text-[#5a6d1f]" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Seção 2: Outros Contatos da Carteira */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                <span>Carteira Geral</span>
                <span>{pdvsRegulares.length}</span>
              </div>

              {pdvsRegulares.map((pdv) => {
                const isSelected = currentPDV?.id === pdv.id;
                const score = calculateScore(pdv);

                return (
                  <div
                    key={pdv.id}
                    onClick={() => onSelectPDV(pdv)}
                    className={`p-3.5 rounded-2xl cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#f7faeb] via-[#eff5d6] to-[#e1ecc0] border-[#afcb48] shadow-sm ring-2 ring-[#afcb48]/40'
                        : 'bg-white hover:bg-slate-50 border-slate-200/70'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center border border-slate-200 shrink-0">
                          {pdv.nome_fantasia.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 truncate">
                            {pdv.nome_fantasia}
                          </h4>
                          <p className="text-[11px] text-slate-500 truncate">
                            {pdv.responsavel || 'Contato'} • {pdv.regiao}
                          </p>
                        </div>
                      </div>

                      <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] flex items-center justify-center border border-slate-200 shrink-0">
                        {score}
                      </div>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                      <span className="font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {pdv.status_pipeline}
                      </span>

                      <span className="text-slate-400 font-medium">
                        Ciclo: {pdv.media_dias_recompra}d
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

        </div>

        {/* ========================================================================= */}
        {/* COLUNA DIREITA: COCKPIT 360° DO CLIENTE COM O VERDE #afcb48               */}
        {/* ========================================================================= */}
        {currentPDV ? (
          <div className="flex-1 flex flex-col overflow-y-auto bg-slate-50/40">
            
            {/* 1. Barra de Ações Superior */}
            <div className="px-6 py-3 bg-white border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenNewOrder(currentPDV)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#afcb48] hover:bg-[#9ebb3b] text-slate-950 rounded-full text-xs font-black shadow-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 text-slate-950" />
                  <span>Novo Pedido B2B</span>
                </button>

                <a
                  href={currentPDV.link_whatsapp || `https://wa.me/${currentPDV.telefone_whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-900 rounded-full text-xs font-bold shadow-2xs transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-[#5a6d1f]" />
                  <span>WhatsApp Direto</span>
                </a>
              </div>

              <div className="flex items-center gap-1 text-slate-400">
                <span className="text-[11px] font-semibold text-slate-500 mr-2">
                  Polo: <strong className="text-slate-800">{currentPDV.regiao}</strong>
                </span>
                <span className="text-slate-200">•</span>
                <span className="text-[11px] font-semibold text-slate-500 ml-2">
                  Vendedora: <strong className="text-slate-800">Gemima</strong>
                </span>
              </div>
            </div>

            {/* 2. Hero Banner com o Gradiente Radiante no tom Verde #afcb48 */}
            <div className="p-6 bg-gradient-to-r from-[#f7faeb] via-[#eff5d6] to-[#e1ecc0] border-b border-[#cfdf9b] relative overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                
                {/* Perfil & Nome */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#5a6d1f] text-white font-black text-2xl flex items-center justify-center shadow-md border-2 border-white">
                    {currentPDV.nome_fantasia.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                        {currentPDV.nome_fantasia}
                      </h1>
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white/90 text-slate-900 border border-[#afcb48] shadow-2xs">
                        {currentPDV.categoria}
                      </span>
                      {currentPDV.alerta_reposicao && (
                        <span className="text-[11px] font-black px-3 py-0.5 rounded-full bg-red-50 text-red-600 shadow-2xs border border-red-200 animate-pulse flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-red-600 shrink-0" />
                          <span>Reposição Imediata</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-700 font-medium mt-1">
                      {currentPDV.razao_social} • {currentPDV.cidade} - {currentPDV.estado} ({currentPDV.regiao})
                    </p>
                  </div>
                </div>

                {/* Metadados Rápidos */}
                <div className="flex items-center gap-6 text-xs bg-white/80 backdrop-blur-xs px-5 py-3 rounded-2xl border border-white shadow-2xs self-start md:self-auto">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Origem</span>
                    <span className="font-extrabold text-slate-800">{currentPDV.origem}</span>
                  </div>
                  <div className="w-px h-6 bg-slate-200"></div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Curva ABC</span>
                    <span className="font-extrabold text-[#5a6d1f]">Classe {currentPDV.classe_abc}</span>
                  </div>
                  <div className="w-px h-6 bg-slate-200"></div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Status</span>
                    <span className="font-extrabold text-slate-800">{currentPDV.status_pipeline}</span>
                  </div>
                </div>

              </div>

              {/* 3. Faixa de Estágios do Processo Comercial */}
              <div className="mt-6 pt-4 border-t border-black/5 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                
                {/* Estágio 1 */}
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 text-[#afcb48] font-black shadow-2xs shrink-0">
                  <Check className="w-3.5 h-3.5 text-[#afcb48]" />
                  <span>1. Lead Qualificado</span>
                </div>

                <div className="w-4 h-0.5 bg-slate-300"></div>

                {/* Estágio 2 */}
                <div className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold shadow-2xs shrink-0 ${
                  currentPDV.status_pipeline !== 'Novo Lead' ? 'bg-slate-900 text-[#afcb48]' : 'bg-white/80 text-slate-600 border border-slate-200'
                }`}>
                  <span>2. Primeiro Contato</span>
                </div>

                <div className="w-4 h-0.5 bg-slate-300"></div>

                {/* Estágio 3 */}
                <div className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold shadow-2xs shrink-0 ${
                  ['Amostra Enviada', 'PDV Ativo', 'Alerta de Reposicao'].includes(currentPDV.status_pipeline)
                    ? 'bg-slate-900 text-[#afcb48]'
                    : 'bg-white/80 text-slate-600 border border-slate-200'
                }`}>
                  <span>3. Amostra / Proposta</span>
                </div>

                <div className="w-4 h-0.5 bg-slate-300"></div>

                {/* Estágio 4 */}
                <div className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold shadow-2xs shrink-0 ${
                  ['PDV Ativo', 'Alerta de Reposicao'].includes(currentPDV.status_pipeline)
                    ? 'bg-slate-900 text-[#afcb48]'
                    : 'bg-white/80 text-slate-600 border border-slate-200'
                }`}>
                  <span>4. PDV Ativo (Comprando)</span>
                </div>

                <div className="w-4 h-0.5 bg-slate-300"></div>

                {/* Estágio 5: Recompra */}
                <div className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-black shadow-2xs shrink-0 ${
                  currentPDV.alerta_reposicao
                    ? 'bg-[#afcb48] text-slate-950 border border-[#738a24]'
                    : 'bg-white/80 text-slate-600 border border-slate-200'
                }`}>
                  <span>5. Ciclo de Recompra ({currentPDV.media_dias_recompra}d)</span>
                </div>

              </div>

            </div>

            {/* 4. Tab Strip */}
            <div className="px-6 py-3 bg-white border-b border-slate-200/80 flex items-center gap-2 text-xs font-bold">
              <button
                onClick={() => setActiveTab('summary')}
                className={`px-4 py-1.5 rounded-full transition-all ${
                  activeTab === 'summary'
                    ? 'bg-slate-950 text-[#afcb48] shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                }`}
              >
                Visão 360°
              </button>

              <button
                onClick={() => setActiveTab('recompra')}
                className={`px-4 py-1.5 rounded-full transition-all ${
                  activeTab === 'recompra'
                    ? 'bg-slate-950 text-[#afcb48] shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                }`}
              >
                Inteligência de Recompra
              </button>

              <button
                onClick={() => setActiveTab('pedidos')}
                className={`px-4 py-1.5 rounded-full transition-all ${
                  activeTab === 'pedidos'
                    ? 'bg-slate-950 text-[#afcb48] shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                }`}
              >
                Pedidos B2B ({pedidos.length})
              </button>

              <button
                onClick={() => setActiveTab('timeline')}
                className={`px-4 py-1.5 rounded-full transition-all ${
                  activeTab === 'timeline'
                    ? 'bg-slate-950 text-[#afcb48] shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                }`}
              >
                Anotações & Contatos ({visitas.length})
              </button>
            </div>

            {/* 5. Conteúdo Dinâmico das Abas */}

            {/* ABA 1: VISÃO 360° (Bento Grid Executivo) */}
            {activeTab === 'summary' && (
              <div className="p-6 space-y-6 animate-in fade-in duration-200">
                
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  
                  {/* Bento 1: Contato */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contato do Comprador</h3>
                      <User className="w-4 h-4 text-slate-400" />
                    </div>

                    <div className="space-y-2.5 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Nome do Responsável</span>
                        <strong className="text-slate-900 text-sm">{currentPDV.responsavel || 'Não cadastrado'}</strong>
                      </div>

                      <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200/60">
                        <div>
                          <span className="text-slate-400 block text-[10px]">WhatsApp / Celular</span>
                          <strong className="text-slate-800">{currentPDV.telefone_whatsapp}</strong>
                        </div>
                        <a
                          href={currentPDV.link_whatsapp || `https://wa.me/${currentPDV.telefone_whatsapp}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-[#afcb48] hover:bg-[#9ebb3b] text-slate-950 rounded-lg shadow-2xs transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[11px]">E-mail</span>
                        <span className="text-slate-800 font-medium">{currentPDV.email || 'Não informado'}</span>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[11px]">CNPJ / CPF</span>
                        <span className="text-slate-800 font-medium">{currentPDV.cnpj_cpf || 'Não informado'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Bento 2: Ação Imediata (Up Next) no tom verde #afcb48 */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Próxima Ação (Up Next)</h3>
                      <Clock className="w-4 h-4 text-[#5a6d1f]" />
                    </div>

                    <span className="text-[11px] text-slate-500 font-medium block">
                      Sequência: Reposição Preventiva Naturebarr
                    </span>

                    {/* Card em Destaque no tom verde #eff5d6 / #afcb48 */}
                    <div className="p-4 rounded-2xl bg-[#eff5d6] border border-[#cfdf9b] space-y-3 shadow-2xs">
                      <div className="flex items-center gap-2 text-[#364308] font-black text-xs">
                        <Phone className="w-4 h-4 text-[#5a6d1f]" />
                        <span>Primeiro Contato de Reposição</span>
                      </div>

                      <p className="text-xs text-[#27320b] font-medium leading-relaxed">
                        "Ligar para o {currentPDV.responsavel || 'comprador'} e sugerir reposição dos sabores mais vendidos antes de zerar o estoque."
                      </p>

                      <div className="flex items-center gap-2 pt-1">
                        <a
                          href={currentPDV.link_whatsapp || `https://wa.me/${currentPDV.telefone_whatsapp}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-[#afcb48] rounded-full text-xs font-black shadow-xs transition-colors flex items-center gap-1.5"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-[#afcb48]" />
                          <span>Chamar WhatsApp</span>
                        </a>

                        <button
                          onClick={() => onOpenNewOrder(currentPDV)}
                          className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-900 rounded-full text-xs font-black border border-[#cfdf9b] shadow-2xs transition-colors"
                        >
                          Lançar Pedido
                        </button>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-400 pt-1">
                      Última compra realizada há <strong>{currentPDV.dias_sem_comprar || 0} dias</strong>
                    </div>
                  </div>

                  {/* Bento 3: Lead Score / Health Score */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Score Comercial</h3>
                      <TrendingUp className="w-4 h-4 text-[#5a6d1f]" />
                    </div>

                    <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/60 flex items-center justify-around">
                      <div className="text-center">
                        <div className="text-4xl font-black text-slate-900 tracking-tight">
                          {calculateScore(currentPDV)}
                        </div>
                        <span className="text-[10px] uppercase font-bold text-slate-400">Pontuação B2B</span>
                      </div>

                      <div className="border-l border-slate-200 pl-4 space-y-1">
                        <span className="text-xs font-black text-slate-950 bg-[#afcb48] px-3 py-1 rounded-full border border-[#86a323] inline-block">
                          Classe {currentPDV.classe_abc}
                        </span>
                        <p className="text-[11px] text-slate-500">Alto potencial de recompra contínua</p>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 pt-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#afcb48]"></div>
                        <span>Ciclo médio: <strong>{currentPDV.media_dias_recompra} dias</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#afcb48]"></div>
                        <span>Faturamento acumulado: <strong>{formatCurrency(currentPDV.faturamento_acumulado)}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#afcb48]"></div>
                        <span>Previsão de reposição: <strong>{currentPDV.data_prevista_recompra ? new Date(currentPDV.data_prevista_recompra).toLocaleDateString('pt-BR') : 'A calcular'}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Bento 4: Dados do Estabelecimento */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Localização & PDV</h3>
                      <Building2 className="w-4 h-4 text-slate-400" />
                    </div>

                    <div className="space-y-2.5 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Polo Regional</span>
                        <strong className="text-slate-900 text-sm">{currentPDV.regiao}</strong>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[11px]">Cidade / Bairro</span>
                        <span className="text-slate-800 font-medium">
                          {currentPDV.cidade} - {currentPDV.estado} {currentPDV.bairro ? `(${currentPDV.bairro})` : ''}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[11px]">Endereço</span>
                        <span className="text-slate-800 font-medium">{currentPDV.endereco || 'Não informado'}</span>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[11px]">Segmento / Categoria</span>
                        <span className="text-slate-800 font-medium">{currentPDV.categoria}</span>
                      </div>
                    </div>
                  </div>

                  {/* Bento 5: Registrar Nota Rápida */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3 xl:col-span-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Registrar Contato / Observação Comercial</h3>
                      <Send className="w-4 h-4 text-[#5a6d1f]" />
                    </div>

                    <form onSubmit={handleSalvarNotaRapida} className="space-y-3">
                      <textarea
                        rows={3}
                        placeholder="Ex: Liguei para o Rodrigo. O estoque de Chocolate acabou e ele vai pedir 4 caixas na sexta-feira..."
                        value={novaNota}
                        onChange={(e) => setNovaNota(e.target.value)}
                        className="w-full p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#afcb48] font-medium"
                      />

                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-slate-400">
                          Anotação será vinculada à linha do tempo de {currentPDV.nome_fantasia}
                        </span>

                        <button
                          type="submit"
                          disabled={savingNota || !novaNota.trim()}
                          className="px-5 py-2 bg-[#afcb48] hover:bg-[#9ebb3b] text-slate-950 rounded-full text-xs font-black shadow-xs transition-colors disabled:opacity-50"
                        >
                          {savingNota ? 'Gravando...' : 'Salvar no Histórico'}
                        </button>
                      </div>
                    </form>
                  </div>

                </div>

              </div>
            )}

            {/* ABA 2: INTELIGÊNCIA DE RECOMPRA */}
            {activeTab === 'recompra' && (
              <div className="p-6 space-y-6 animate-in fade-in duration-200">
                {/* Banner de Diagnóstico do Ciclo */}
                <div className={`p-6 rounded-[28px] border transition-all ${
                  currentPDV.alerta_reposicao 
                    ? 'bg-amber-50/80 border-amber-300/80 shadow-xs' 
                    : 'bg-[#f7faeb] border-[#cfdf9b] shadow-xs'
                }`}>
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2.5">
                        {currentPDV.alerta_reposicao ? (
                          <>
                            <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                              <AlertTriangle className="w-4 h-4" />
                            </div>
                            <div>
                              <h3 className="text-base font-black text-amber-950 tracking-tight flex items-center gap-2 flex-wrap">
                                <span>Alerta de Reposição Preventiva Acionado</span>
                                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200 animate-pulse">
                                  Reposição Imediata
                                </span>
                              </h3>
                              <span className="text-xs font-bold text-slate-700">
                                Restam apenas{' '}
                                <strong className={currentPDV.dias_para_recompra !== undefined && currentPDV.dias_para_recompra <= 1 ? "text-red-600 font-black text-sm animate-pulse" : "text-amber-800 font-black"}>
                                  {currentPDV.dias_para_recompra !== undefined ? currentPDV.dias_para_recompra : 0}d
                                </strong>{' '}
                                estimados de estoque no PDV!
                              </span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="w-8 h-8 rounded-full bg-[#afcb48] text-slate-950 flex items-center justify-center font-bold shadow-xs shrink-0">
                              <CheckCircle2 className="w-4 h-4" />
                            </div>
                            <div>
                              <h3 className="text-base font-black text-slate-900 tracking-tight">
                                Ciclo de Estoque Regular & Saudável
                              </h3>
                              <span className="text-xs font-bold text-[#4a5b1c]">
                                PDV com abastecimento recente dentro da janela de consumo prevista
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 max-w-2xl leading-relaxed pt-1">
                        {currentPDV.alerta_reposicao 
                          ? 'A barra de proteína tem alto giro e não podemos esperar o cliente ficar com prateleira vazia. O algoritmo calcula o sell-out e sinaliza para a Gemima agir proativamente hoje.'
                          : 'O ciclo de recompra estimado recalcula automaticamente a cada pedido recebido, mantendo a previsão de demanda atualizada.'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={currentPDV.link_whatsapp || `https://wa.me/${currentPDV.telefone_whatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-5 py-2.5 bg-slate-950 hover:bg-slate-800 text-[#afcb48] rounded-full text-xs font-black shadow-xs transition-colors"
                      >
                        <MessageSquare className="w-4 h-4 text-[#afcb48]" />
                        <span>Chamar no WhatsApp</span>
                      </a>

                      <button
                        onClick={() => onOpenNewOrder(currentPDV)}
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-[#afcb48] hover:bg-[#a0bc3d] text-slate-950 rounded-full text-xs font-black shadow-xs transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Lançar Pedido</span>
                      </button>
                    </div>
                  </div>

                  {/* 4 Indicadores Numéricos */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-slate-200/70 text-xs">
                    <div className="bg-white/90 p-3.5 rounded-2xl border border-slate-200/60 shadow-2xs">
                      <span className="text-slate-400 font-bold uppercase text-[10px] block">Ciclo Médio Calculado</span>
                      <p className="text-lg font-black text-slate-900 mt-1">{currentPDV.media_dias_recompra} dias</p>
                      <span className="text-[10px] text-slate-500">giro médio no PDV</span>
                    </div>

                    <div className="bg-white/90 p-3.5 rounded-2xl border border-slate-200/60 shadow-2xs">
                      <span className="text-slate-400 font-bold uppercase text-[10px] block">Última Compra</span>
                      <p className="text-lg font-black text-slate-900 mt-1">
                        {currentPDV.data_ultima_compra ? new Date(currentPDV.data_ultima_compra).toLocaleDateString('pt-BR') : 'Sem histórico'}
                      </p>
                      <span className="text-[10px] text-slate-500">há {currentPDV.dias_sem_comprar || 0} dias</span>
                    </div>

                    <div className="bg-white/90 p-3.5 rounded-2xl border border-slate-200/60 shadow-2xs">
                      <span className="text-slate-400 font-bold uppercase text-[10px] block">Previsão de Reposição</span>
                      <p className="text-lg font-black text-slate-900 mt-1">
                        {currentPDV.data_prevista_recompra ? new Date(currentPDV.data_prevista_recompra).toLocaleDateString('pt-BR') : 'A calcular'}
                      </p>
                      <span className={`text-[10px] font-bold ${
                        currentPDV.dias_para_recompra !== undefined && currentPDV.dias_para_recompra <= 1
                          ? 'text-red-600 font-black animate-pulse'
                          : 'text-amber-700'
                      }`}>
                        {currentPDV.dias_para_recompra !== undefined && currentPDV.dias_para_recompra <= 0
                          ? '0d (Vencido!)'
                          : currentPDV.dias_para_recompra === 1
                          ? '1d (Crítico!)'
                          : `Resta ${currentPDV.dias_para_recompra} dias`}
                      </span>
                    </div>

                    <div className="bg-white/90 p-3.5 rounded-2xl border border-slate-200/60 shadow-2xs">
                      <span className="text-slate-400 font-bold uppercase text-[10px] block">Faturamento Total B2B</span>
                      <p className="text-lg font-black text-slate-900 mt-1">{formatCurrency(currentPDV.faturamento_acumulado)}</p>
                      <span className="text-[10px] text-[#5a6d1f] font-bold">LTV acumulado</span>
                    </div>
                  </div>
                </div>

                {/* Script Comercial Recomendado da Gemima */}
                <div className="bg-white p-6 rounded-[28px] border border-slate-200/80 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#5a6d1f]" />
                      <span>Script Recomendado para {currentPDV.responsavel || 'o Comprador'}</span>
                    </h3>
                    <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                      Polo: {currentPDV.regiao}
                    </span>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs text-slate-700 leading-relaxed italic">
                    "Olá {currentPDV.responsavel || 'amigo'}, aqui é a Gemima da Naturebarr! Notei aqui pelo nosso controle que o lote de barras da {currentPDV.nome_fantasia} deve estar acabando esta semana. Temos os sabores Chocolate e Amendoim frescos saindo para entrega em {currentPDV.cidade}. Quer que eu já reserve as caixas da sua reposição para chegar antes do fim de semana?"
                  </div>
                </div>
              </div>
            )}

            {/* ABA 3: PEDIDOS B2B */}
            {activeTab === 'pedidos' && (
              <div className="p-6 space-y-6 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-[28px] border border-slate-200/80 shadow-xs">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                      Histórico de Pedidos Faturados ({pedidos.length})
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Faturamento total acumulado: <strong className="text-slate-900 font-extrabold">{formatCurrency(currentPDV.faturamento_acumulado)}</strong>
                    </p>
                  </div>

                  <button
                    onClick={() => onOpenNewOrder(currentPDV)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#afcb48] hover:bg-[#a0bc3d] text-slate-950 rounded-full text-xs font-extrabold shadow-xs transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Lançar Novo Pedido B2B</span>
                  </button>
                </div>

                {pedidos.length > 0 ? (
                  <div className="space-y-4">
                    {pedidos.map((ped) => (
                      <div key={ped.id} className="bg-white p-5 rounded-[24px] border border-slate-200/80 shadow-xs space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-[#f7faeb] text-[#5a6d1f] flex items-center justify-center font-black border border-[#cfdf9b] shadow-2xs">
                              <Package className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <strong className="text-sm font-black text-slate-900">
                                  Pedido #{ped.id.slice(0, 8)}
                                </strong>
                                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                                  {ped.status_faturamento}
                                </span>
                              </div>
                              <span className="text-xs text-slate-500">
                                Realizado em {new Date(ped.data_pedido).toLocaleDateString('pt-BR')} • {ped.forma_pagamento}
                              </span>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-base font-black text-slate-900 block">
                              {formatCurrency(ped.valor_total)}
                            </span>
                            <span className="text-xs text-slate-500 font-semibold">
                              {ped.total_caixas} caixas ({ped.total_caixas * 12} barras)
                            </span>
                          </div>
                        </div>

                        {ped.itens && ped.itens.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 pt-1 text-xs">
                            {ped.itens.map((item, idx) => (
                              <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center justify-between">
                                <span className="font-bold text-slate-800 truncate pr-2">{item.sabor}</span>
                                <span className="font-black text-slate-950 bg-white px-2 py-0.5 rounded-md border border-slate-200 shrink-0">
                                  {item.quantidade_caixas} cx
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white p-12 text-center rounded-[28px] border border-dashed border-slate-300 space-y-3">
                    <Package className="w-10 h-10 text-slate-300 mx-auto" />
                    <h4 className="text-sm font-bold text-slate-700">Nenhum pedido registrado ainda para este PDV</h4>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      Assim que a Gemima fechar o primeiro lote ou reposição, o histórico e o cálculo de giro aparecerão aqui.
                    </p>
                    <button
                      onClick={() => onOpenNewOrder(currentPDV)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#afcb48] hover:bg-[#a0bc3d] text-slate-950 rounded-full text-xs font-bold shadow-xs transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Registrar Primeiro Pedido</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ABA 4: ANOTAÇÕES & CONTATOS */}
            {activeTab === 'timeline' && (
              <div className="p-6 space-y-6 animate-in fade-in duration-200">
                {/* Form para Registrar Novo Contato */}
                <div className="bg-white p-5 rounded-[28px] border border-slate-200/80 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-[#5a6d1f]" />
                      <span>Registrar Novo Contato Comercial (Gemima)</span>
                    </h3>
                    <span className="text-[11px] text-slate-400">
                      PDV: <strong>{currentPDV.nome_fantasia}</strong>
                    </span>
                  </div>

                  <form onSubmit={handleSalvarContatoTimeline} className="space-y-3 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-slate-500 font-bold mb-1">Canal de Contato</label>
                        <select
                          value={tipoContatoTimeline}
                          onChange={(e) => setTipoContatoTimeline(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#afcb48] font-semibold"
                        >
                          <option value="WhatsApp">WhatsApp</option>
                          <option value="Ligacao">Ligação Telefônica</option>
                          <option value="Visita Presencial">Visita Presencial ao PDV</option>
                          <option value="Envio de Amostra">Envio de Amostras</option>
                          <option value="Reuniao">Reunião Comercial</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-500 font-bold mb-1">Próxima Ação</label>
                        <input
                          type="text"
                          placeholder="Ex: Ligar para confirmar se o estoque zerou"
                          value={proximaAcaoTimeline}
                          onChange={(e) => setProximaAcaoTimeline(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#afcb48]"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-500 font-bold mb-1">Data Prevista da Ação</label>
                        <input
                          type="date"
                          value={dataProximaAcaoTimeline}
                          onChange={(e) => setDataProximaAcaoTimeline(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#afcb48]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-500 font-bold mb-1">Anotações do Contato / Feedback *</label>
                      <textarea
                        rows={3}
                        placeholder="Descreva o que foi conversado com o comprador, retorno sobre sabores, objeções ou pedidos combinados..."
                        value={novaNota}
                        onChange={(e) => setNovaNota(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#afcb48] font-medium"
                        required
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-slate-400">
                        O registro ficará salvo na linha do tempo permanente da conta
                      </span>
                      <button
                        type="submit"
                        disabled={savingTimeline || !novaNota.trim()}
                        className="flex items-center gap-1.5 px-5 py-2.5 bg-[#afcb48] hover:bg-[#a0bc3d] text-slate-950 rounded-full font-black shadow-xs transition-colors disabled:opacity-50"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{savingTimeline ? 'Gravando...' : 'Gravar no Histórico'}</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Timeline de Contatos Anteriores */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider px-1">
                    Linha do Tempo de Interações ({visitas.length})
                  </h4>

                  {visitas.length > 0 ? (
                    <div className="space-y-3">
                      {visitas.map((v) => (
                        <div key={v.id} className="bg-white p-4 rounded-[22px] border border-slate-200/80 shadow-xs text-xs space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 flex items-center gap-2">
                              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 font-black text-[10px]">
                                {v.tipo_contato}
                              </span>
                              <span>{v.vendedor_nome}</span>
                            </span>
                            <span className="text-slate-400 text-[11px]">
                              {new Date(v.data_contato).toLocaleDateString('pt-BR')} às {new Date(v.data_contato).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          <p className="text-slate-700 leading-relaxed pl-1">{v.anotacoes}</p>

                          {v.proxima_acao && (
                            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-600 font-semibold flex items-center gap-1.5 pl-1">
                              <Calendar className="w-3.5 h-3.5 text-[#5a6d1f]" />
                              <span>Próxima ação: <strong className="text-slate-900">{v.proxima_acao}</strong> {v.data_proxima_acao ? `em ${new Date(v.data_proxima_acao).toLocaleDateString('pt-BR')}` : ''}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white p-8 text-center rounded-[24px] border border-dashed border-slate-300 text-xs text-slate-400">
                      Nenhum contato registrado ainda para este PDV. Utilize o formulário acima para registrar o primeiro atendimento da Gemima.
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-12 text-slate-400 text-xs">
            Selecione um PDV na fila ao lado para abrir o Cockpit 360°.
          </div>
        )}

      </div>

    </div>
  );
};
