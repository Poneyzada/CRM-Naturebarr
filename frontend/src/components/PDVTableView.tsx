import React, { useState } from 'react';
import { 
  Search, 
  MessageSquare, 
  Eye, 
  PlusCircle, 
  Trash2, 
  AlertTriangle, 
  Plus
} from 'lucide-react';
import { PDV } from '../types';

interface PDVTableViewProps {
  pdvs: PDV[];
  onSelectPDV: (pdv: PDV) => void;
  onOpenNewOrder: (pdv: PDV) => void;
  onDeletePDV: (id: string) => void;
  onOpenNewPDV: () => void;
  selectedRegion: string;
  setSelectedRegion: (reg: string) => void;
}

export const PDVTableView: React.FC<PDVTableViewProps> = ({
  pdvs,
  onSelectPDV,
  onOpenNewOrder,
  onDeletePDV,
  onOpenNewPDV,
  selectedRegion,
  setSelectedRegion
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [onlyAlerts, setOnlyAlerts] = useState(false);

  const filtered = pdvs.filter((p) => {
    const matchRegion = selectedRegion === 'Todas' || p.regiao === selectedRegion;
    const matchCat = categoryFilter === 'Todas' || p.categoria === categoryFilter;
    const matchStatus = statusFilter === 'Todos' || p.status_pipeline === statusFilter;
    const matchAlert = !onlyAlerts || p.alerta_reposicao === true;
    const matchSearch = 
      !searchTerm ||
      p.nome_fantasia.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.razao_social.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.responsavel && p.responsavel.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.cnpj_cpf && p.cnpj_cpf.includes(searchTerm)) ||
      p.cidade.toLowerCase().includes(searchTerm.toLowerCase());

    return matchRegion && matchCat && matchStatus && matchAlert && matchSearch;
  });

  const calculateScore = (pdv: PDV) => {
    if (pdv.alerta_reposicao) return 92;
    if (pdv.classe_abc === 'A') return 95;
    if (pdv.status_pipeline === 'PDV Ativo') return 84;
    if (pdv.status_pipeline === 'Amostra Enviada') return 76;
    if (pdv.status_pipeline === 'Novo Lead') return 65;
    return 45;
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="max-w-[1700px] mx-auto p-3 sm:p-6 space-y-6">
      
      {/* Barra de Filtros em Pílulas */}
      <div className="bg-[#fcfdfd] border border-slate-200/90 rounded-[28px] p-4 shadow-xs space-y-3">
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por Loja, Razão, CNPJ, Cidade ou Responsável..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-100/80 border border-slate-200/80 rounded-full text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#afcb48] font-medium"
            />
          </div>

          <button
            onClick={onOpenNewPDV}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-950 hover:bg-slate-800 text-white rounded-full text-xs font-black shadow-xs transition-all self-start md:self-auto"
          >
            <Plus className="w-4 h-4 text-[#afcb48]" />
            <span>Cadastrar Novo PDV</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 pt-3 border-t border-slate-100">
          
          {/* Filtro de Polo */}
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

          {/* Filtro de Status */}
          <div className="flex items-center gap-1.5 bg-slate-100/80 border border-slate-200/80 rounded-full px-3 py-1.5">
            <span className="text-[11px] font-black text-slate-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent border-none text-xs font-black text-slate-900 focus:outline-none cursor-pointer"
            >
              <option value="Todos">Todos os Status</option>
              <option value="Novo Lead">Novo Lead</option>
              <option value="Contato Feito">Contato Feito</option>
              <option value="Amostra Enviada">Amostra Enviada</option>
              <option value="PDV Ativo">PDV Ativo</option>
              <option value="Alerta de Reposicao">Alerta de Reposição</option>
              <option value="Inativo">Inativo</option>
            </select>
          </div>

          {/* Filtro de Categoria */}
          <div className="flex items-center gap-1.5 bg-slate-100/80 border border-slate-200/80 rounded-full px-3 py-1.5">
            <span className="text-[11px] font-black text-slate-500">Categoria:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent border-none text-xs font-black text-slate-900 focus:outline-none cursor-pointer"
            >
              <option value="Todas">Todas</option>
              <option value="Emporio">Empório</option>
              <option value="Academia">Academia</option>
              <option value="Box Crossfit">Box CrossFit</option>
              <option value="Farmacia">Farmácia</option>
              <option value="Suplementos">Suplementos</option>
              <option value="Cafeteria">Cafeteria</option>
              <option value="Mercado Saudavel">Mercado Saudável</option>
            </select>
          </div>

          {/* Toggle Alerta de Reposição */}
          <label className="flex items-center gap-2 text-xs font-black text-slate-800 cursor-pointer select-none ml-auto">
            <input
              type="checkbox"
              checked={onlyAlerts}
              onChange={(e) => setOnlyAlerts(e.target.checked)}
              className="rounded text-[#5a6d1f] focus:ring-[#afcb48] h-4 w-4"
            />
            <span className="flex items-center gap-1.5 text-slate-950 bg-[#afcb48] px-3 py-1.5 rounded-full border border-[#86a323] font-black shadow-2xs">
              <AlertTriangle className="w-3.5 h-3.5 text-slate-950" />
              Apenas Alertas de Reposição
            </span>
          </label>

        </div>

      </div>

      {/* Tabela de Contas e PDVs */}
      <div className="bg-[#fcfdfd] border border-slate-200/90 rounded-[28px] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-extrabold">
              <tr>
                <th className="px-5 py-4">Ponto de Venda (PDV)</th>
                <th className="px-5 py-4">Polo / Cidade</th>
                <th className="px-5 py-4">Comprador</th>
                <th className="px-5 py-4">Status & Score</th>
                <th className="px-5 py-4">Ciclo de Estoque</th>
                <th className="px-5 py-4 text-right">Faturamento B2B</th>
                <th className="px-5 py-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filtered.map((pdv) => {
                const score = calculateScore(pdv);

                return (
                  <tr 
                    key={pdv.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    {/* PDV / Razão */}
                    <td className="px-5 py-4">
                      <div 
                        onClick={() => onSelectPDV(pdv)}
                        className="cursor-pointer group flex items-center gap-3"
                      >
                        <div className="w-9 h-9 rounded-xl bg-[#5a6d1f] text-white font-black text-xs flex items-center justify-center shrink-0">
                          {pdv.nome_fantasia.charAt(0)}
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-900 group-hover:text-[#5a6d1f] flex items-center gap-1.5">
                            <span>{pdv.nome_fantasia}</span>
                            {pdv.alerta_reposicao && (
                              <span 
                                title="Reposição Imediata necessária" 
                                className="inline-flex items-center gap-1 text-[10px] font-black text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-md animate-pulse"
                              >
                                <AlertTriangle className="w-3 h-3 text-red-600 shrink-0" />
                                <span>{pdv.dias_para_recompra !== undefined && pdv.dias_para_recompra <= 0 ? '0d' : pdv.dias_para_recompra === 1 ? '1d' : 'Reposição'}</span>
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                            {pdv.razao_social}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Polo e Cidade */}
                    <td className="px-5 py-4">
                      <div className="font-extrabold text-slate-900">
                        {pdv.cidade} - {pdv.estado}
                      </div>
                      <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-[#eff5d6] text-[#364308] border border-[#cfdf9b] font-bold">
                        {pdv.regiao}
                      </span>
                    </td>

                    {/* Responsável e WhatsApp */}
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-800">
                        {pdv.responsavel || 'Não informado'}
                      </div>
                      <a
                        href={pdv.link_whatsapp || `https://wa.me/${pdv.telefone_whatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-[#4a5b1c] font-black hover:underline mt-1"
                      >
                        <MessageSquare className="w-3 h-3 text-[#5a6d1f]" />
                        <span>{pdv.telefone_whatsapp}</span>
                      </a>
                    </td>

                    {/* Status e Score */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-black ${
                          pdv.status_pipeline === 'Alerta de Reposicao'
                            ? 'bg-[#afcb48] text-slate-950 border border-[#86a323]'
                            : pdv.status_pipeline === 'PDV Ativo'
                            ? 'bg-[#eff5d6] text-[#364308] border border-[#cfdf9b]'
                            : pdv.status_pipeline === 'Novo Lead'
                            ? 'bg-sky-100 text-sky-900 border border-sky-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {pdv.status_pipeline}
                        </span>

                        <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-black text-[9px] flex items-center justify-center shadow-2xs shrink-0">
                          {score}
                        </span>
                      </div>
                    </td>

                    {/* Ciclo de Estoque */}
                    <td className="px-5 py-4">
                      <div className="text-slate-800 font-bold">
                        Ciclo: <strong>{pdv.media_dias_recompra} dias</strong>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {pdv.data_prevista_recompra ? (
                          <span className={pdv.dias_para_recompra !== undefined && pdv.dias_para_recompra <= 1 ? 'text-red-600 font-extrabold animate-pulse' : pdv.alerta_reposicao ? 'text-amber-800 font-extrabold' : ''}>
                            Previsão: {new Date(pdv.data_prevista_recompra).toLocaleDateString('pt-BR')}
                            {pdv.dias_para_recompra !== undefined && pdv.dias_para_recompra <= 1 && (
                              <span className="ml-1 text-red-600 font-black">
                                ({pdv.dias_para_recompra <= 0 ? '0d' : '1d'}!)
                              </span>
                            )}
                          </span>
                        ) : (
                          'A calcular'
                        )}
                      </div>
                    </td>

                    {/* Faturamento */}
                    <td className="px-5 py-4 text-right">
                      <div className="font-black text-slate-900">
                        {formatCurrency(pdv.faturamento_acumulado)}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {pdv.total_pedidos} {pdv.total_pedidos === 1 ? 'pedido' : 'pedidos'}
                      </div>
                    </td>

                    {/* Ações */}
                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onSelectPDV(pdv)}
                          title="Abrir no Cockpit 360°"
                          className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onOpenNewOrder(pdv)}
                          title="Lançar novo pedido B2B"
                          className="w-8 h-8 rounded-full bg-slate-950 hover:bg-slate-800 flex items-center justify-center text-[#afcb48] font-bold shadow-2xs transition-colors"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                        </button>

                        <a
                          href={pdv.link_whatsapp || `https://wa.me/${pdv.telefone_whatsapp}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="WhatsApp Direto"
                          className="w-8 h-8 rounded-full bg-[#afcb48] hover:bg-[#9ebb3b] flex items-center justify-center text-slate-950 font-bold border border-[#86a323] shadow-2xs transition-colors"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </a>

                        <button
                          onClick={() => {
                            if (confirm(`Deseja realmente excluir o PDV ${pdv.nome_fantasia}?`)) {
                              onDeletePDV(pdv.id);
                            }
                          }}
                          title="Excluir PDV"
                          className="w-8 h-8 rounded-full bg-white border border-slate-200 hover:bg-red-50 hover:text-red-600 flex items-center justify-center text-slate-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                    Nenhum cliente encontrado para os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
