import React from 'react';
import { 
  BarChart3, 
  Kanban, 
  Users, 
  UploadCloud, 
  Webhook, 
  Plus, 
  RefreshCw,
  Sparkles,
  MapPin
} from 'lucide-react';
import { Region } from '../types';

interface NavbarProps {
  activeTab: 'dashboard' | 'pipeline' | 'pdvs' | 'importar' | 'webhook';
  setActiveTab: (tab: 'dashboard' | 'pipeline' | 'pdvs' | 'importar' | 'webhook') => void;
  selectedRegion: string;
  setSelectedRegion: (reg: string) => void;
  onOpenNewPDV: () => void;
  onResetDemo: () => void;
  isResetting: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  selectedRegion,
  setSelectedRegion,
  onOpenNewPDV,
  onResetDemo,
  isResetting
}) => {
  const regions: { id: string; label: string }[] = [
    { id: 'Todas', label: 'Todos os Polos' },
    { id: 'Salvador', label: 'Salvador (BA)' },
    { id: 'Sao Paulo', label: 'São Paulo (SP)' },
    { id: 'Santa Catarina', label: 'Santa Catarina (SC)' },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo Naturebarr */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-nature-500 to-nature-700 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-nature-500/20">
                N
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xl tracking-tight text-slate-900">
                    Naturebarr
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-nature-100 text-nature-800 border border-nature-200">
                    B2B CRM
                  </span>
                </div>
                <p className="text-xs text-slate-500 hidden sm:block">
                  Gestão Comercial & Ciclo de Recompra
                </p>
              </div>
            </div>

            {/* Seletor de Polo Regional Global */}
            <div className="hidden md:flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-medium">
              <MapPin className="w-3.5 h-3.5 text-nature-600 ml-1.5 mr-1" />
              {regions.map((reg) => (
                <button
                  key={reg.id}
                  onClick={() => setSelectedRegion(reg.id)}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    selectedRegion === reg.id
                      ? 'bg-white text-nature-700 font-semibold shadow-xs border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {reg.label}
                </button>
              ))}
            </div>
          </div>

          {/* Navegação Principal */}
          <nav className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-nature-50 text-nature-700 font-semibold border border-nature-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('pipeline')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'pipeline'
                  ? 'bg-nature-50 text-nature-700 font-semibold border border-nature-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Kanban className="w-4 h-4" />
              <span>Pipeline & Recompra</span>
            </button>

            <button
              onClick={() => setActiveTab('pdvs')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'pdvs'
                  ? 'bg-nature-50 text-nature-700 font-semibold border border-nature-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>PDVs</span>
            </button>

            <button
              onClick={() => setActiveTab('importar')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'importar'
                  ? 'bg-nature-50 text-nature-700 font-semibold border border-nature-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              <span className="hidden lg:inline">Importar CSV</span>
            </button>

            <button
              onClick={() => setActiveTab('webhook')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'webhook'
                  ? 'bg-nature-50 text-nature-700 font-semibold border border-nature-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
              title="Testar Webhook Meta Ads"
            >
              <Webhook className="w-4 h-4" />
              <span className="hidden lg:inline">Meta Ads</span>
            </button>
          </nav>

          {/* Ações Rápidas */}
          <div className="flex items-center gap-2">
            <button
              onClick={onResetDemo}
              disabled={isResetting}
              title="Restaurar dados de demonstração (Salvador, SP, SC)"
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isResetting ? 'animate-spin text-nature-600' : ''}`} />
            </button>

            <button
              onClick={onOpenNewPDV}
              className="flex items-center gap-2 px-3.5 py-2 bg-nature-600 hover:bg-nature-700 text-white rounded-lg text-sm font-medium shadow-sm transition-all hover:shadow-md hover:shadow-nature-600/20 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Novo PDV</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
