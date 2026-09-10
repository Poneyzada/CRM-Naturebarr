import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { BottomNav } from './BottomNav';

interface AppLayoutProps {
  activeTab: 'cockpit' | 'dashboard' | 'pipeline' | 'pdvs' | 'importar' | 'webhook';
  setActiveTab: (tab: 'cockpit' | 'dashboard' | 'pipeline' | 'pdvs' | 'importar' | 'webhook') => void;
  selectedRegion: string;
  setSelectedRegion: (reg: string) => void;
  urgentAlertsCount: number;
  onOpenNewPDV: () => void;
  onResetDemo: () => void;
  isResetting: boolean;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  activeTab,
  setActiveTab,
  selectedRegion,
  setSelectedRegion,
  urgentAlertsCount,
  onOpenNewPDV,
  onResetDemo,
  isResetting,
  children
}) => {
  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-800 flex flex-row font-sans selection:bg-[#e1ecc0] selection:text-slate-900">
      
      {/* 1. Sidebar Fixa Desktop */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewPDV={onOpenNewPDV}
        urgentAlertsCount={urgentAlertsCount}
      />

      {/* 2. Área Principal de Conteúdo */}
      <div className="flex-1 flex flex-col min-w-0 pb-24 md:pb-8">
        
        {/* Header Superior com Saudação e Controles */}
        <Header
          selectedRegion={selectedRegion}
          setSelectedRegion={setSelectedRegion}
          urgentAlertsCount={urgentAlertsCount}
          onResetDemo={onResetDemo}
          isResetting={isResetting}
          onOpenAlertsList={() => setActiveTab('pipeline')}
        />

        {/* View renderizada */}
        <main className="flex-1 overflow-x-hidden">
          {children}
        </main>

      </div>

      {/* 3. Barra de Navegação Inferior Mobile Estilo Instagram */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewPDV={onOpenNewPDV}
        urgentAlertsCount={urgentAlertsCount}
      />

    </div>
  );
};
