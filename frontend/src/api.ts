import { PDV, Pedido, HistoricoVisita, DashboardMetrics } from './types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function getMetrics(): Promise<DashboardMetrics> {
  const res = await fetch(`${API_BASE_URL}/api/v1/metrics/dashboard`);
  if (!res.ok) throw new Error('Erro ao carregar métricas');
  return res.json();
}

export async function getPDVs(params?: {
  regiao?: string;
  status?: string;
  alerta_reposicao?: boolean;
  categoria?: string;
  search?: string;
}): Promise<PDV[]> {
  const query = new URLSearchParams();
  if (params?.regiao && params.regiao !== 'Todas') query.append('regiao', params.regiao);
  if (params?.status && params.status !== 'Todos') query.append('status', params.status);
  if (params?.alerta_reposicao !== undefined) query.append('alerta_reposicao', String(params.alerta_reposicao));
  if (params?.categoria && params.categoria !== 'Todas') query.append('categoria', params.categoria);
  if (params?.search) query.append('search', params.search);

  const res = await fetch(`${API_BASE_URL}/api/v1/pdvs?${query.toString()}`);
  if (!res.ok) throw new Error('Erro ao carregar PDVs');
  return res.json();
}

export async function getPDV(id: string): Promise<PDV> {
  const res = await fetch(`${API_BASE_URL}/api/v1/pdvs/${id}`);
  if (!res.ok) throw new Error('Erro ao carregar PDV');
  return res.json();
}

export async function createPDV(data: Partial<PDV>): Promise<PDV> {
  const res = await fetch(`${API_BASE_URL}/api/v1/pdvs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Erro ao criar PDV');
  return res.json();
}

export async function updatePDV(id: string, data: Partial<PDV>): Promise<PDV> {
  const res = await fetch(`${API_BASE_URL}/api/v1/pdvs/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Erro ao atualizar PDV');
  return res.json();
}

export async function updatePDVStatus(id: string, status: string, motivo_perda?: string): Promise<PDV> {
  const query = new URLSearchParams({ status_pipeline: status });
  if (motivo_perda) query.append('motivo_perda', motivo_perda);

  const res = await fetch(`${API_BASE_URL}/api/v1/pdvs/${id}/status?${query.toString()}`, {
    method: 'PATCH',
  });
  if (!res.ok) throw new Error('Erro ao atualizar status do PDV');
  return res.json();
}

export async function deletePDV(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/v1/pdvs/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Erro ao excluir PDV');
}

export async function getPDVPedidos(pdvId: string): Promise<Pedido[]> {
  const res = await fetch(`${API_BASE_URL}/api/v1/pdvs/${pdvId}/pedidos`);
  if (!res.ok) throw new Error('Erro ao carregar pedidos');
  return res.json();
}

export async function createPDVPedido(pdvId: string, pedido: any): Promise<Pedido> {
  const res = await fetch(`${API_BASE_URL}/api/v1/pdvs/${pdvId}/pedidos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pedido),
  });
  if (!res.ok) throw new Error('Erro ao registrar pedido');
  return res.json();
}

export async function getPDVVisitas(pdvId: string): Promise<HistoricoVisita[]> {
  const res = await fetch(`${API_BASE_URL}/api/v1/pdvs/${pdvId}/visitas`);
  if (!res.ok) throw new Error('Erro ao carregar histórico de contatos');
  return res.json();
}

export async function createPDVVisita(pdvId: string, visita: Partial<HistoricoVisita>): Promise<HistoricoVisita> {
  const res = await fetch(`${API_BASE_URL}/api/v1/pdvs/${pdvId}/visitas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(visita),
  });
  if (!res.ok) throw new Error('Erro ao salvar contato');
  return res.json();
}

export async function importCSV(file: File): Promise<any> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE_URL}/api/v1/pdvs/import-csv`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Erro ao importar planilha');
  }
  return res.json();
}

export async function triggerMetaLeadWebhook(payload: any): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/api/v1/webhooks/meta-leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Erro ao disparar webhook do Meta Ads');
  return res.json();
}

export async function resetDatabaseSeed(): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/api/v1/reset-seed`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Erro ao reinicializar banco de dados');
  return res.json();
}
