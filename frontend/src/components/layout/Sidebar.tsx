import React from 'react';
import { 
  Rocket, 
  LayoutDashboard, 
  Kanban, 
  Store, 
  UploadCloud, 
  Webhook, 
  Plus, 
  Home, 
  Clock, 
  PanelLeftClose,
  TrendingUp
} from 'lucide-react';

interface SidebarProps {
  activeTab: 'cockpit' | 'dashboard' | 'pipeline' | 'pdvs' | 'importar' | 'webhook';
  setActiveTab: (tab: 'cockpit' | 'dashboard' | 'pipeline' | 'pdvs' | 'importar' | 'webhook') => void;
  onOpenNewPDV: () => void;
  urgentAlertsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewPDV,
  urgentAlertsCount
}) => {
  return (
    <aside className="hidden md:flex flex-col w-64 bg-[#ebedf0] border-r border-slate-300/70 min-h-screen p-4 shrink-0 select-none text-slate-800">
      
      {/* Topo: "Menu" com botão circular de colapso */}
      <div className="flex items-center justify-between px-2 mb-4">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('cockpit')}>
          <div className="w-8 h-8 rounded-xl bg-[#afcb48] text-slate-950 flex items-center justify-center font-black text-base shadow-xs">
            N
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 tracking-tight leading-none">Menu</h2>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Naturebarr CRM</span>
          </div>
        </div>

        <button 
          title="Recolher menu"
          className="w-7 h-7 rounded-full bg-white/80 hover:bg-white border border-slate-300/80 flex items-center justify-center text-slate-500 shadow-2xs transition-colors"
        >
          <PanelLeftClose className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Botão de Ação Rápida: + Novo PDV */}
      <button
        onClick={onOpenNewPDV}
        className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-[#afcb48] rounded-full text-xs font-extrabold shadow-xs transition-all mb-4"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>+ Novo PDV B2B</span>
      </button>

      {/* Lista de Navegação com Seções do Dynamics 365 / Sales Hub */}
      <div className="space-y-4 overflow-y-auto flex-1 pr-1">
        
        {/* Seção 1: Atalhos Rápidos */}
        <div className="space-y-1">
          <button
            onClick={() => setActiveTab('cockpit')}
            className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeTab === 'cockpit'
                ? 'bg-[#afcb48] text-slate-950 font-black shadow-xs'
                : 'text-slate-600 hover:bg-white/60 hover:text-slate-900'
            }`}
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border ${
              activeTab === 'cockpit' ? 'bg-white border-[#94b032] text-slate-950' : 'bg-white/80 border-slate-300/60 text-slate-500'
            }`}>
              <Home className="w-3.5 h-3.5" />
            </div>
            <span>Home (Início)</span>
          </button>

          <button
            onClick={() => setActiveTab('pipeline')}
            className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-full text-xs font-semibold text-slate-600 hover:bg-white/60 hover:text-slate-900 transition-all"
          >
            <div className="w-7 h-7 rounded-full bg-white/80 border border-slate-300/60 flex items-center justify-center text-slate-500 shrink-0">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <span>Recentes</span>
          </button>
        </div>

        {/* Seção 2: Meu Trabalho */}
        <div className="space-y-1 pt-1">
          <span className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
            Meu Trabalho
          </span>

          {/* Sales Accelerator com a cor verde #afcb48 */}
          <button
            onClick={() => setActiveTab('cockpit')}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-full text-xs transition-all ${
              activeTab === 'cockpit'
                ? 'bg-[#afcb48] text-slate-950 font-black shadow-xs'
                : 'text-slate-600 hover:bg-white/60 hover:text-slate-900 font-semibold'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border ${
                activeTab === 'cockpit' ? 'bg-white border-[#94b032] text-slate-950' : 'bg-white/80 border-slate-300/60 text-slate-600'
              }`}>
                <Rocket className="w-3.5 h-3.5 text-[#5a6d1f]" />
              </div>
              <span className="truncate">Sales Accelerator</span>
            </div>

            {urgentAlertsCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-slate-950 text-[#afcb48] text-[10px] font-black flex items-center justify-center shrink-0 mr-1 shadow-2xs">
                {urgentAlertsCount}
              </span>
            )}
          </button>

          {/* Dashboards */}
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-full text-xs transition-all ${
              activeTab === 'dashboard'
                ? 'bg-[#afcb48] text-slate-950 font-black shadow-xs'
                : 'text-slate-600 hover:bg-white/60 hover:text-slate-900 font-semibold'
            }`}
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border ${
              activeTab === 'dashboard' ? 'bg-white border-[#94b032] text-slate-950' : 'bg-white/80 border-slate-300/60 text-slate-600'
            }`}>
              <LayoutDashboard className="w-3.5 h-3.5" />
            </div>
            <span>Dashboards Executivos</span>
          </button>
        </div>

        {/* Seção 3: Clientes */}
        <div className="space-y-1 pt-1">
          <span className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
            Clientes & PDVs
          </span>

          <button
            onClick={() => setActiveTab('pdvs')}
            className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-full text-xs transition-all ${
              activeTab === 'pdvs'
                ? 'bg-[#afcb48] text-slate-950 font-black shadow-xs'
                : 'text-slate-600 hover:bg-white/60 hover:text-slate-900 font-semibold'
            }`}
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border ${
              activeTab === 'pdvs' ? 'bg-white border-[#94b032] text-slate-950' : 'bg-white/80 border-slate-300/60 text-slate-600'
            }`}>
              <Store className="w-3.5 h-3.5" />
            </div>
            <span>Contas / PDVs</span>
          </button>
        </div>

        {/* Seção 4: Vendas */}
        <div className="space-y-1 pt-1">
          <span className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
            Funil & Vendas
          </span>

          <button
            onClick={() => setActiveTab('pipeline')}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-full text-xs transition-all ${
              activeTab === 'pipeline'
                ? 'bg-[#afcb48] text-slate-950 font-black shadow-xs'
                : 'text-slate-600 hover:bg-white/60 hover:text-slate-900 font-semibold'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border ${
                activeTab === 'pipeline' ? 'bg-white border-[#94b032] text-slate-950' : 'bg-white/80 border-slate-300/60 text-slate-600'
              }`}>
                <Kanban className="w-3.5 h-3.5" />
              </div>
              <span>Funil & Recompra</span>
            </div>

            {urgentAlertsCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-slate-950 text-[#afcb48] text-[10px] font-black flex items-center justify-center shrink-0 mr-1">
                {urgentAlertsCount}
              </span>
            )}
          </button>
        </div>

        {/* Seção 5: Integrações & Tráfego */}
        <div className="space-y-1 pt-1">
          <span className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
            Automações & Tráfego
          </span>

          <button
            onClick={() => setActiveTab('webhook')}
            className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-full text-xs transition-all ${
              activeTab === 'webhook'
                ? 'bg-[#afcb48] text-slate-950 font-black shadow-xs'
                : 'text-slate-600 hover:bg-white/60 hover:text-slate-900 font-semibold'
            }`}
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border ${
              activeTab === 'webhook' ? 'bg-white border-[#94b032] text-slate-950' : 'bg-white/80 border-slate-300/60 text-slate-600'
            }`}>
              <Webhook className="w-3.5 h-3.5" />
            </div>
            <span>Meta Ads Webhook</span>
          </button>

          <button
            onClick={() => setActiveTab('importar')}
            className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-full text-xs transition-all ${
              activeTab === 'importar'
                ? 'bg-[#afcb48] text-slate-950 font-black shadow-xs'
                : 'text-slate-600 hover:bg-white/60 hover:text-slate-900 font-semibold'
            }`}
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border ${
              activeTab === 'importar' ? 'bg-white border-[#94b032] text-slate-950' : 'bg-white/80 border-slate-300/60 text-slate-600'
            }`}>
              <UploadCloud className="w-3.5 h-3.5" />
            </div>
            <span>Importar Planilhas</span>
          </button>
        </div>

      </div>

      {/* Rodapé: Gemima Comercial */}
      <div className="pt-3 mt-auto border-t border-slate-300/60">
        <div className="flex items-center gap-2.5 p-2 rounded-2xl bg-white/70 border border-slate-300/60 shadow-2xs">
          <div className="w-8 h-8 rounded-full bg-[#afcb48] text-slate-950 font-black text-xs flex items-center justify-center shadow-xs shrink-0 border border-[#94b032]">
            G
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-extrabold text-slate-900 truncate">Gemima Vendas</p>
            <p className="text-[10px] font-semibold text-slate-500 truncate">Comercial B2B</p>
          </div>
          <div className="w-2.5 h-2.5 rounded-full bg-[#afcb48] border border-[#738a24] shrink-0"></div>
        </div>
      </div>

    </aside>
  );
};
