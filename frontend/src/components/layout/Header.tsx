import React from 'react';
import { 
  Search, 
  Bell, 
  MapPin, 
  Calendar, 
  RefreshCw, 
  LayoutGrid,
  History,
  Plus,
  Filter,
  Settings,
  HelpCircle,
  Headphones
} from 'lucide-react';

interface HeaderProps {
  selectedRegion: string;
  setSelectedRegion: (reg: string) => void;
  urgentAlertsCount: number;
  onResetDemo: () => void;
  isResetting: boolean;
  onOpenAlertsList: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedRegion,
  setSelectedRegion,
  urgentAlertsCount,
  onResetDemo,
  isResetting,
  onOpenAlertsList
}) => {
  const regions = [
    { id: 'Todas', label: 'Todos os Polos' },
    { id: 'Salvador', label: 'Salvador (BA)' },
    { id: 'Sao Paulo', label: 'São Paulo (SP)' },
    { id: 'Santa Catarina', label: 'Santa Catarina (SC)' },
  ];

  return (
    <header className="bg-[#ebedf0] border-b border-slate-300/70 sticky top-0 z-30 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4 select-none">
      
      {/* Lado Esquerdo: Grid de 9 pontos + Naturebarr Sales Hub */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-slate-700 font-extrabold text-sm">
          <LayoutGrid className="w-4 h-4 text-slate-500" />
          <span className="tracking-tight text-slate-900 font-black">Naturebarr</span>
          <span className="text-slate-300">|</span>
          <span className="text-xs text-slate-600 font-bold">Sales Hub</span>
        </div>

        {/* Seletor de Polo em formato Pílula Suave */}
        <div className="hidden sm:flex items-center bg-white/80 border border-slate-300/80 rounded-full px-3 py-1 text-xs font-bold text-slate-800 shadow-2xs ml-3">
          <MapPin className="w-3.5 h-3.5 text-[#5a6d1f] mr-1.5 shrink-0" />
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="bg-transparent border-none text-xs font-black text-slate-800 focus:outline-none cursor-pointer pr-1"
          >
            {regions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Lado Direito: Barra de Botões Circulares do Dynamics 365 (Search, Clock, Plus, Filter, Settings, Help, Avatar) */}
      <div className="flex items-center gap-1.5">
        
        {/* Reset Demo */}
        <button
          onClick={onResetDemo}
          disabled={isResetting}
          title="Recarregar demonstração"
          className="w-8 h-8 rounded-full bg-white/70 hover:bg-white border border-slate-300/70 flex items-center justify-center text-slate-600 shadow-2xs transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin text-[#5a6d1f]' : ''}`} />
        </button>

        {/* Notificações / Alertas de Reposição */}
        <button
          onClick={onOpenAlertsList}
          className="relative w-8 h-8 rounded-full bg-white/70 hover:bg-white border border-slate-300/70 flex items-center justify-center text-slate-600 shadow-2xs transition-colors"
          title="Ver alertas de reposição urgente"
        >
          <Bell className="w-3.5 h-3.5" />
          {urgentAlertsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] font-black flex items-center justify-center shadow-xs">
              {urgentAlertsCount}
            </span>
          )}
        </button>

        {/* Avatar Gemima */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-300/70">
          <div className="w-8 h-8 rounded-full bg-[#afcb48] text-slate-950 font-black text-xs flex items-center justify-center shadow-xs border border-[#94b032]">
            G
          </div>
          <div className="hidden lg:block text-left">
            <span className="text-xs font-black text-slate-900 block leading-tight">Gemima</span>
            <span className="text-[10px] text-slate-500 font-semibold block leading-tight">Vendas B2B</span>
          </div>
        </div>

      </div>

    </header>
  );
};
