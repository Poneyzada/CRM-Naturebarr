import React from 'react';
import { 
  Rocket, 
  LayoutDashboard, 
  Kanban, 
  Store, 
  Plus
} from 'lucide-react';

interface BottomNavProps {
  activeTab: 'cockpit' | 'dashboard' | 'pipeline' | 'pdvs' | 'importar' | 'webhook';
  setActiveTab: (tab: 'cockpit' | 'dashboard' | 'pipeline' | 'pdvs' | 'importar' | 'webhook') => void;
  onOpenNewPDV: () => void;
  urgentAlertsCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewPDV,
  urgentAlertsCount
}) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-300/80 px-2 py-1 shadow-lg select-none">
      <div className="flex items-center justify-around max-w-md mx-auto">
        
        {/* Tab 1: Sales Accelerator / Cockpit */}
        <button
          onClick={() => setActiveTab('cockpit')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-full transition-all ${
            activeTab === 'cockpit'
              ? 'bg-[#afcb48] text-slate-950 font-black shadow-2xs'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Rocket className="w-4 h-4 mb-0.5" />
          <span className="text-[9px] font-bold">Cockpit</span>
        </button>

        {/* Tab 2: Dashboard Executivo */}
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-full transition-all ${
            activeTab === 'dashboard'
              ? 'bg-[#afcb48] text-slate-950 font-black shadow-2xs'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <LayoutDashboard className="w-4 h-4 mb-0.5" />
          <span className="text-[9px] font-bold">Métricas</span>
        </button>

        {/* Botão Central: Novo PDV */}
        <button
          onClick={onOpenNewPDV}
          className="w-11 h-11 -mt-4 rounded-full bg-slate-950 text-[#afcb48] border-2 border-white flex items-center justify-center shadow-lg shadow-black/20 hover:scale-105 active:scale-95 transition-transform"
          title="Cadastrar Novo PDV"
        >
          <Plus className="w-6 h-6 stroke-[3]" />
        </button>

        {/* Tab 4: Funil de Recompra */}
        <button
          onClick={() => setActiveTab('pipeline')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-full relative transition-all ${
            activeTab === 'pipeline'
              ? 'bg-[#afcb48] text-slate-950 font-black shadow-2xs'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Kanban className="w-4 h-4 mb-0.5" />
          <span className="text-[9px] font-bold">Funil</span>
          {urgentAlertsCount > 0 && (
            <span className="absolute top-0 right-1 w-4 h-4 rounded-full bg-[#afcb48] text-slate-950 text-[9px] font-black flex items-center justify-center shadow-2xs border border-slate-900">
              {urgentAlertsCount}
            </span>
          )}
        </button>

        {/* Tab 5: PDVs */}
        <button
          onClick={() => setActiveTab('pdvs')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-full transition-all ${
            activeTab === 'pdvs'
              ? 'bg-[#afcb48] text-slate-950 font-black shadow-2xs'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Store className="w-4 h-4 mb-0.5" />
          <span className="text-[9px] font-bold">PDVs</span>
        </button>

      </div>
    </nav>
  );
};
