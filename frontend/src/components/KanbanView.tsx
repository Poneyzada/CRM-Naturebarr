import React, { useState } from 'react';
import { 
  Plus, 
  MessageSquare, 
  ChevronRight, 
  ChevronLeft, 
  AlertTriangle, 
  Search, 
  Phone
} from 'lucide-react';
import { PDV, PipelineStatus } from '../types';

interface KanbanViewProps {
  pdvs: PDV[];
  onSelectPDV: (pdv: PDV) => void;
  onUpdateStatus: (id: string, newStatus: PipelineStatus) => void;
  onOpenNewPDV: () => void;
  selectedRegion: string;
  setSelectedRegion: (reg: string) => void;
}

const COLUMNS: { id: PipelineStatus; title: string; color: string; badgeBg: string; headerBg: string }[] = [
  { id: 'Novo Lead', title: '1. Novo Lead (Tráfego)', color: 'text-sky-900', badgeBg: 'bg-sky-200 text-sky-900', headerBg: 'bg-sky-50/80 border-sky-200' },
  { id: 'Contato Feito', title: '2. Contato Feito', color: 'text-indigo-900', badgeBg: 'bg-indigo-200 text-indigo-900', headerBg: 'bg-indigo-50/80 border-indigo-200' },
  { id: 'Amostra Enviada', title: '3. Amostra Enviada', color: 'text-purple-900', badgeBg: 'bg-purple-200 text-purple-900', headerBg: 'bg-purple-50/80 border-purple-200' },
  { id: 'PDV Ativo', title: '4. PDV Ativo (Comprando)', color: 'text-[#364308]', badgeBg: 'bg-[#eff5d6] text-[#364308] border border-[#cfdf9b]', headerBg: 'bg-[#f7faeb] border-[#cfdf9b]' },
  { id: 'Alerta de Reposicao', title: '5. Alerta de Reposição', color: 'text-slate-950', badgeBg: 'bg-[#afcb48] text-slate-950 font-black', headerBg: 'bg-gradient-to-r from-[#f7faeb] via-[#eff5d6] to-[#e1ecc0] border-[#afcb48] ring-1 ring-[#afcb48]/60' },
  { id: 'Inativo', title: '6. Inativo / Churn', color: 'text-slate-700', badgeBg: 'bg-slate-300 text-slate-800', headerBg: 'bg-slate-100/80 border-slate-200' },
];

export const KanbanView: React.FC<KanbanViewProps> = ({
  pdvs,
  onSelectPDV,
  onUpdateStatus,
  onOpenNewPDV,
  selectedRegion,
  setSelectedRegion,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todas');

  const filteredPDVs = pdvs.filter((p) => {
    const matchRegion = selectedRegion === 'Todas' || p.regiao === selectedRegion;
    const matchCat = categoryFilter === 'Todas' || p.categoria === categoryFilter;
    const matchSearch = 
      !searchTerm ||
      p.nome_fantasia.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.razao_social.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.responsavel && p.responsavel.toLowerCase().includes(searchTerm.toLowerCase())) ||
      p.cidade.toLowerCase().includes(searchTerm.toLowerCase());
    return matchRegion && matchCat && matchSearch;
  });

  const getNextStatus = (current: PipelineStatus): PipelineStatus | null => {
    const idx = COLUMNS.findIndex(c => c.id === current);
    if (idx >= 0 && idx < COLUMNS.length - 1) {
      return COLUMNS[idx + 1].id;
    }
    return null;
  };

  const getPrevStatus = (current: PipelineStatus): PipelineStatus | null => {
    const idx = COLUMNS.findIndex(c => c.id === current);
    if (idx > 0) {
      return COLUMNS[idx - 1].id;
    }
    return null;
  };

  const calculateScore = (pdv: PDV) => {
    if (pdv.alerta_reposicao) return 92;
    if (pdv.classe_abc === 'A') return 95;
    if (pdv.status_pipeline === 'PDV Ativo') return 84;
    if (pdv.status_pipeline === 'Amostra Enviada') return 76;
    if (pdv.status_pipeline === 'Novo Lead') return 65;
    return 45;
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="max-w-[1700px] mx-auto p-3 sm:p-6 space-y-6">
      
      {/* Barra de Controles e Filtros */}
      <div className="bg-[#fcfdfd] border border-slate-200/90 rounded-[28px] p-4 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        {/* Campo de Busca em Pílula */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por cliente, responsável ou cidade no funil..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-100/80 border border-slate-200/80 rounded-full text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#afcb48] font-medium"
          />
        </div>

        {/* Filtros em Pílulas */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-slate-100/80 border border-slate-200/80 rounded-full px-3 py-1.5">
            <span className="text-[11px] font-black text-slate-500">Polo:</span>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="bg-transparent border-none text-xs font-black text-slate-900 focus:outline-none cursor-pointer"
            >
              <option value="Todas">Todos os Polos</option>
              <option value="Salvador">Salvador (BA)</option>
              <option value="Sao Paulo">São Paulo (SP)</option>
              <option value="Santa Catarina">Santa Catarina (SC)</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100/80 border border-slate-200/80 rounded-full px-3 py-1.5">
            <span className="text-[11px] font-black text-slate-500">Categoria:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent border-none text-xs font-black text-slate-900 focus:outline-none cursor-pointer"
            >
              <option value="Todas">Todas as Categorias</option>
              <option value="Emporio">Empório</option>
              <option value="Academia">Academia</option>
              <option value="Box Crossfit">Box CrossFit</option>
              <option value="Farmacia">Farmácia</option>
              <option value="Suplementos">Suplementos</option>
              <option value="Cafeteria">Cafeteria</option>
              <option value="Mercado Saudavel">Mercado Saudável</option>
            </select>
          </div>

          <button
            onClick={onOpenNewPDV}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-950 hover:bg-slate-800 text-white rounded-full text-xs font-black shadow-xs transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-[#afcb48]" />
            <span>+ Novo Lead</span>
          </button>
        </div>

      </div>

      {/* Grid das 6 Colunas do Funil */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-start overflow-x-auto pb-6">
        {COLUMNS.map((col) => {
          const colPDVs = filteredPDVs.filter((p) => p.status_pipeline === col.id);

          return (
            <div
              key={col.id}
              className="flex flex-col bg-[#fcfdfd] rounded-[28px] border border-slate-200/90 p-3.5 min-w-[275px] max-h-[calc(100vh-220px)] shadow-xs"
            >
              {/* Header da Coluna */}
              <div className={`p-2.5 rounded-2xl border ${col.headerBg} flex items-center justify-between mb-3 shadow-2xs`}>
                <span className={`text-xs font-extrabold ${col.color}`}>
                  {col.title}
                </span>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${col.badgeBg}`}>
                  {colPDVs.length}
                </span>
              </div>

              {/* Lista de Cards da Coluna */}
              <div className="space-y-3 overflow-y-auto pr-1 flex-1">
                {colPDVs.map((pdv) => {
                  const nextSt = getNextStatus(pdv.status_pipeline);
                  const prevSt = getPrevStatus(pdv.status_pipeline);
                  const score = calculateScore(pdv);

                  return (
                    <div
                      key={pdv.id}
                      onClick={() => onSelectPDV(pdv)}
                      className={`p-3.5 rounded-2xl border transition-all hover:shadow-md cursor-pointer relative group ${
                        pdv.alerta_reposicao
                          ? 'bg-gradient-to-r from-[#f7faeb] via-[#eff5d6] to-[#e1ecc0] border-[#afcb48] ring-2 ring-[#afcb48]/50 shadow-xs'
                          : 'bg-white hover:bg-slate-50 border-slate-200/80 shadow-2xs'
                      }`}
                    >
                      {/* Alerta de Reposição */}
                      {pdv.alerta_reposicao && (
                        <div className="mb-2 flex items-center justify-between px-2 py-0.5 bg-red-50 border border-red-200 rounded-lg text-[10px] font-black text-red-600 animate-pulse">
                          <div className="flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-red-600 shrink-0" />
                            <span>Reposição Imediata</span>
                          </div>
                          <span>
                            {pdv.dias_para_recompra !== undefined && pdv.dias_para_recompra <= 0
                              ? '0d'
                              : pdv.dias_para_recompra === 1
                              ? '1d'
                              : `≤ ${pdv.dias_para_recompra !== undefined ? pdv.dias_para_recompra : 5}d`}
                          </span>
                        </div>
                      )}

                      {/* Header do Card: Nome e Health Score */}
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-[#5a6d1f] text-white font-black text-xs flex items-center justify-center shrink-0">
                            {pdv.nome_fantasia.charAt(0)}
                          </div>
                          <h4 className="text-xs font-extrabold text-slate-900 truncate group-hover:text-[#5a6d1f]">
                            {pdv.nome_fantasia}
                          </h4>
                        </div>

                        <div className="w-6 h-6 rounded-full bg-slate-900 text-white font-black text-[9px] flex items-center justify-center shrink-0 shadow-2xs">
                          {score}
                        </div>
                      </div>

                      {/* Responsável, Região e Categoria */}
                      <div className="text-[11px] text-slate-500 mb-2 flex items-center justify-between">
                        <span className="truncate">{pdv.responsavel || 'Comprador'}</span>
                        <span className="text-[10px] font-bold text-[#364308] bg-[#eff5d6] border border-[#cfdf9b] px-1.5 py-0.5 rounded-md shrink-0">
                          {pdv.regiao === 'Sao Paulo' ? 'SP' : pdv.regiao === 'Santa Catarina' ? 'SC' : 'SSA'}
                        </span>
                      </div>

                      {/* Box de Informações de Recompra */}
                      <div className="p-2 rounded-xl bg-slate-50/80 border border-slate-200/60 text-[10px] space-y-1 mb-2.5">
                        <div className="flex justify-between text-slate-600">
                          <span className="text-slate-400">Ciclo de estoque:</span>
                          <span className="font-bold text-slate-900">{pdv.media_dias_recompra} dias</span>
                        </div>

                        {pdv.dias_sem_comprar !== undefined && pdv.dias_sem_comprar !== null && (
                          <div className="flex justify-between">
                            <span className="text-slate-400">Última compra:</span>
                            <span className={`font-bold ${pdv.alerta_reposicao ? 'text-[#4a5b1c]' : 'text-slate-700'}`}>
                              há {pdv.dias_sem_comprar} dias
                            </span>
                          </div>
                        )}

                        {pdv.faturamento_acumulado > 0 && (
                          <div className="flex justify-between border-t border-slate-200/60 pt-1 text-slate-900 font-black">
                            <span className="text-slate-400 font-normal">Faturamento:</span>
                            <span className="text-[#5a6d1f]">{formatCurrency(pdv.faturamento_acumulado)}</span>
                          </div>
                        )}
                      </div>

                      {/* Ações Rápidas: WhatsApp no tom verde #afcb48 */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                        <a
                          href={pdv.link_whatsapp || `https://wa.me/${pdv.telefone_whatsapp}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1.5 text-[11px] font-black text-slate-950 bg-[#afcb48] hover:bg-[#9ebb3b] px-2.5 py-1 rounded-full border border-[#86a323] shadow-2xs transition-colors"
                        >
                          <MessageSquare className="w-3 h-3 text-slate-950" />
                          <span>WhatsApp</span>
                        </a>

                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          {prevSt && (
                            <button
                              onClick={() => onUpdateStatus(pdv.id, prevSt)}
                              title={`Voltar para ${prevSt}`}
                              className="w-6 h-6 rounded-full bg-white border border-slate-300 hover:bg-slate-100 flex items-center justify-center text-slate-500 shadow-2xs transition-colors"
                            >
                              <ChevronLeft className="w-3 h-3" />
                            </button>
                          )}
                          {nextSt && (
                            <button
                              onClick={() => onUpdateStatus(pdv.id, nextSt)}
                              title={`Avançar para ${nextSt}`}
                              className="w-6 h-6 rounded-full bg-slate-950 hover:bg-slate-800 text-white flex items-center justify-center shadow-2xs transition-colors"
                            >
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>

                    </div>
                  );
                })}

                {colPDVs.length === 0 && (
                  <div className="py-10 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                    Nenhum cliente nesta etapa
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
