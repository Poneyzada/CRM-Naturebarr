import React, { useState, useEffect } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { CockpitView } from './components/CockpitView';
import { DashboardView } from './components/DashboardView';
import { KanbanView } from './components/KanbanView';
import { PDVTableView } from './components/PDVTableView';
import { PDVDetailModal } from './components/PDVDetailModal';
import { NewOrderModal } from './components/NewOrderModal';
import { NewPDVModal } from './components/NewPDVModal';
import { ImportCSVModal } from './components/ImportCSVModal';
import { MetaWebhookTester } from './components/MetaWebhookTester';
import { getMetrics, getPDVs, updatePDVStatus, deletePDV, resetDatabaseSeed } from './api';
import { PDV, DashboardMetrics, PipelineStatus } from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<'cockpit' | 'dashboard' | 'pipeline' | 'pdvs' | 'importar' | 'webhook'>('cockpit');
  const [selectedRegion, setSelectedRegion] = useState<string>('Todas');
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [pdvs, setPdvs] = useState<PDV[]>([]);
  const [loading, setLoading] = useState(true);

  // Modais
  const [selectedPDV, setSelectedPDV] = useState<PDV | null>(null);
  const [newOrderPDV, setNewOrderPDV] = useState<PDV | null>(null);
  const [isNewPDVOpen, setIsNewPDVOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Carregar dados
  const refreshData = async () => {
    try {
      const [m, p] = await Promise.all([
        getMetrics(),
        getPDVs()
      ]);
      setMetrics(m);
      setPdvs(p);
      
      if (selectedPDV) {
        const updated = p.find(item => item.id === selectedPDV.id);
        if (updated) setSelectedPDV(updated);
      }
    } catch (err) {
      console.error('Erro ao buscar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Atualizar etapa no Kanban
  const handleUpdateStatus = async (id: string, newStatus: PipelineStatus) => {
    try {
      await updatePDVStatus(id, newStatus);
      await refreshData();
    } catch (err) {
      alert('Erro ao atualizar status do PDV');
    }
  };

  // Excluir PDV
  const handleDeletePDV = async (id: string) => {
    try {
      await deletePDV(id);
      if (selectedPDV?.id === id) setSelectedPDV(null);
      await refreshData();
    } catch (err) {
      alert('Erro ao excluir PDV');
    }
  };

  // Resetar demonstração
  const handleResetDemo = async () => {
    if (!confirm('Deseja recarregar os dados de demonstração da Naturebarr (Salvador, SP e SC)?')) return;
    setIsResetting(true);
    try {
      await resetDatabaseSeed();
      await refreshData();
      alert('Dados de demonstração reinicializados com sucesso!');
    } catch (err) {
      alert('Erro ao reinicializar demonstração');
    } finally {
      setIsResetting(false);
    }
  };

  const urgentAlertsCount = metrics?.alertas_reposicao_urgente || 0;

  return (
    <AppLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      selectedRegion={selectedRegion}
      setSelectedRegion={setSelectedRegion}
      urgentAlertsCount={urgentAlertsCount}
      onOpenNewPDV={() => setIsNewPDVOpen(true)}
      onResetDemo={handleResetDemo}
      isResetting={isResetting}
    >
      {/* 1. Cockpit 360° / Sales Accelerator (Inspirado no Sales Hub da Imagem) */}
      {activeTab === 'cockpit' && (
        <CockpitView
          pdvs={pdvs}
          selectedPDV={selectedPDV}
          onSelectPDV={(pdv) => setSelectedPDV(pdv)}
          onOpenNewOrder={(pdv) => setNewOrderPDV(pdv)}
          onRefreshData={refreshData}
        />
      )}

      {/* 2. Dashboard Executivo com Layout Estilo Nexora */}
      {activeTab === 'dashboard' && (
        <DashboardView
          metrics={metrics}
          onSelectPDV={(pdv) => {
            setSelectedPDV(pdv);
            setActiveTab('cockpit');
          }}
          onOpenPipeline={() => setActiveTab('pipeline')}
          onOpenPDVs={() => setActiveTab('pdvs')}
        />
      )}

      {/* 3. Pipeline Kanban de Recompra */}
      {activeTab === 'pipeline' && (
        <KanbanView
          pdvs={pdvs}
          onSelectPDV={(pdv) => {
            setSelectedPDV(pdv);
            setActiveTab('cockpit');
          }}
          onUpdateStatus={handleUpdateStatus}
          onOpenNewPDV={() => setIsNewPDVOpen(true)}
          selectedRegion={selectedRegion}
          setSelectedRegion={setSelectedRegion}
        />
      )}

      {/* 4. Carteira de PDVs */}
      {activeTab === 'pdvs' && (
        <PDVTableView
          pdvs={pdvs}
          onSelectPDV={(pdv) => {
            setSelectedPDV(pdv);
            setActiveTab('cockpit');
          }}
          onOpenNewOrder={(pdv) => setNewOrderPDV(pdv)}
          onDeletePDV={handleDeletePDV}
          onOpenNewPDV={() => setIsNewPDVOpen(true)}
          selectedRegion={selectedRegion}
          setSelectedRegion={setSelectedRegion}
        />
      )}

      {/* 5. Importador CSV */}
      {activeTab === 'importar' && (
        <div className="py-8">
          <ImportCSVModal
            onClose={() => setActiveTab('pdvs')}
            onImportSuccess={() => {
              refreshData();
              setActiveTab('pdvs');
            }}
          />
        </div>
      )}

      {/* 6. Simulador Webhook Meta Ads */}
      {activeTab === 'webhook' && (
        <MetaWebhookTester
          onLeadReceived={refreshData}
          onOpenPipeline={() => setActiveTab('pipeline')}
        />
      )}

      {/* Modais Globais */}
      {selectedPDV && activeTab !== 'cockpit' && (
        <PDVDetailModal
          pdv={selectedPDV}
          onClose={() => setSelectedPDV(null)}
          onOpenNewOrder={(pdv) => {
            setNewOrderPDV(pdv);
          }}
          onRefreshPDV={refreshData}
        />
      )}

      {newOrderPDV && (
        <NewOrderModal
          pdv={newOrderPDV}
          onClose={() => setNewOrderPDV(null)}
          onOrderCreated={() => {
            refreshData();
          }}
        />
      )}

      {isNewPDVOpen && (
        <NewPDVModal
          onClose={() => setIsNewPDVOpen(false)}
          onPDVCreated={refreshData}
          defaultRegion={selectedRegion}
        />
      )}
    </AppLayout>
  );
}

export default App;
