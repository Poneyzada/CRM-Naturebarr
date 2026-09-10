import React, { useState, useEffect } from 'react';
import { 
  X, 
  MessageSquare, 
  PlusCircle, 
  Calendar, 
  Package, 
  Clock, 
  AlertTriangle, 
  MapPin, 
  FileText, 
  Phone, 
  Building2, 
  Send,
  Trash2,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';
import { PDV, Pedido, HistoricoVisita } from '../types';
import { getPDVPedidos, getPDVVisitas, createPDVVisita, updatePDVStatus } from '../api';

interface PDVDetailModalProps {
  pdv: PDV;
  onClose: () => void;
  onOpenNewOrder: (pdv: PDV) => void;
  onRefreshPDV: () => void;
}

export const PDVDetailModal: React.FC<PDVDetailModalProps> = ({
  pdv,
  onClose,
  onOpenNewOrder,
  onRefreshPDV
}) => {
  const [activeTab, setActiveTab] = useState<'geral' | 'recompra' | 'pedidos' | 'visitas'>('recompra');
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [visitas, setVisitas] = useState<HistoricoVisita[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Formulário de nova visita / contato
  const [tipoContato, setTipoContato] = useState('WhatsApp');
  const [anotacoes, setAnotacoes] = useState('');
  const [proximaAcao, setProximaAcao] = useState('');
  const [dataProximaAcao, setDataProximaAcao] = useState('');
  const [savingVisita, setSavingVisita] = useState(false);

  // Carregar pedidos e histórico de contatos
  useEffect(() => {
    const loadData = async () => {
      setLoadingHistory(true);
      try {
        const [peds, vists] = await Promise.all([
          getPDVPedidos(pdv.id),
          getPDVVisitas(pdv.id)
        ]);
        setPedidos(peds);
        setVisitas(vists);
      } catch (err) {
        console.error('Erro ao carregar dados do PDV:', err);
      } finally {
        setLoadingHistory(false);
      }
    };
    loadData();
  }, [pdv.id]);

  const handleSalvarVisita = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!anotacoes.trim()) return;

    setSavingVisita(true);
    try {
      await createPDVVisita(pdv.id, {
        vendedor_nome: 'Gemima',
        tipo_contato: tipoContato,
        anotacoes,
        proxima_acao: proximaAcao || undefined,
        data_proxima_acao: dataProximaAcao || undefined
      });
      setAnotacoes('');
      setProximaAcao('');
      setDataProximaAcao('');
      // Recarregar visitas
      const vists = await getPDVVisitas(pdv.id);
      setVisitas(vists);
      onRefreshPDV();
    } catch (err) {
      alert('Erro ao salvar contato comercial');
    } finally {
      setSavingVisita(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  // Gerador de mensagem rápida para WhatsApp
  const openWhatsAppWithTemplate = (template: 'reposicao' | 'apresentacao' | 'amostra' | 'reativacao') => {
    const resp = pdv.responsavel || 'amigo(a)';
    const loja = pdv.nome_fantasia;
    let msg = '';

    if (template === 'reposicao') {
      msg = `Olá ${resp}, tudo bem? Aqui é a Gemima da Naturebarr! Notei aqui pelo nosso controle que o estoque de barras da ${loja} deve estar acabando esta semana. Quer que eu já separe a sua reposição para chegar antes do fim de semana?`;
    } else if (template === 'apresentacao') {
      msg = `Olá ${resp}, tudo bem? Sou a Gemima da Naturebarr (barras de proteína saudáveis). Gostaria de lhe apresentar nossa linha comercial e condições especiais para revenda na ${loja}!`;
    } else if (template === 'amostra') {
      msg = `Olá ${resp}! Aqui é a Gemima da Naturebarr. As amostras dos nossos sabores mais vendidos estão a caminho da ${loja}. Quando receber, me avise para alinharmos os feedbacks!`;
    } else if (template === 'reativacao') {
      msg = `Olá ${resp}! Gemima da Naturebarr por aqui. Faz um tempinho que não repomos a ${loja}. Estamos com uma condição exclusiva de bonificação para o polo de ${pdv.regiao} essa semana. Podemos conversar 2 minutos?`;
    }

    const phone = pdv.telefone_whatsapp.replace(/\D/g, '');
    const cleanPhone = phone.startsWith('55') ? phone : `55${phone}`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header do Modal */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#afcb48] text-slate-950 flex items-center justify-center font-black text-lg shadow-xs">
              {pdv.nome_fantasia.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">{pdv.nome_fantasia}</h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#f7faeb] text-[#4a5b1c] font-bold border border-[#cfdf9b]">
                  {pdv.regiao}
                </span>
                {pdv.alerta_reposicao && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-50 text-red-600 font-black border border-red-200 flex items-center gap-1 animate-pulse">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                    <span>Reposição Imediata</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {pdv.razao_social} • {pdv.cidade} - {pdv.estado}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenNewOrder(pdv)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#afcb48] hover:bg-[#a0bc3d] text-slate-950 rounded-full text-xs font-bold shadow-xs transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Novo Pedido</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Barra de Ações Rápidas WhatsApp */}
        <div className="px-6 py-2.5 bg-[#f7faeb] border-b border-[#e1ecc0] flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <MessageSquare className="w-4 h-4 text-[#5a6d1f]" />
            <span>Templates WhatsApp da Gemima:</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => openWhatsAppWithTemplate('reposicao')}
              className="px-2.5 py-1 bg-white hover:bg-amber-50 text-amber-800 border border-amber-300 rounded-md font-semibold transition-colors"
            >
              Alerta de Reposição
            </button>
            <button
              onClick={() => openWhatsAppWithTemplate('apresentacao')}
              className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-md font-medium transition-colors"
            >
              1º Contato / Catálogo
            </button>
            <button
              onClick={() => openWhatsAppWithTemplate('amostra')}
              className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-md font-medium transition-colors"
            >
              Amostras
            </button>
            <button
              onClick={() => openWhatsAppWithTemplate('reativacao')}
              className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-md font-medium transition-colors"
            >
              Reativação
            </button>
          </div>
        </div>

        {/* Abas de Navegação Interna */}
        <div className="px-6 border-b border-slate-200 flex items-center gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('recompra')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'recompra'
                ? 'border-[#afcb48] text-slate-950 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Inteligência de Recompra</span>
          </button>

          <button
            onClick={() => setActiveTab('pedidos')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'pedidos'
                ? 'border-[#afcb48] text-slate-950 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Histórico de Pedidos ({pedidos.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('visitas')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'visitas'
                ? 'border-[#afcb48] text-slate-950 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Visitas & Contatos ({visitas.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('geral')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'geral'
                ? 'border-[#afcb48] text-slate-950 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Dados Cadastrais</span>
          </button>
        </div>

        {/* Conteúdo das Abas */}
        <div className="p-6 overflow-y-auto flex-1">
          
          {/* ABA 1: INTELIGÊNCIA DE RECOMPRA */}
          {activeTab === 'recompra' && (
            <div className="space-y-6">
              
              {/* Box de Diagnóstico do Ciclo */}
              <div className={`p-5 rounded-xl border ${
                pdv.alerta_reposicao 
                  ? 'bg-amber-50/70 border-amber-200' 
                  : 'bg-[#f7faeb] border-[#cfdf9b]'
              }`}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      {pdv.alerta_reposicao ? (
                        <>
                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                          <span className="text-amber-900">Alerta de Reposição Preventiva Acionado</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-[#5a6d1f]" />
                          <span className="text-slate-900 font-bold">Ciclo de Estoque Regular</span>
                        </>
                      )}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 max-w-xl">
                      {pdv.alerta_reposicao
                        ? 'O PDV está nos últimos 5 dias do ciclo estimado de reposição. Não espere a barra zerar no ponto de venda para agir!'
                        : 'O PDV está com reposição recente. O ciclo previsto de reposição é recalculado a cada novo pedido registrado.'}
                    </p>
                  </div>

                  <button
                    onClick={() => openWhatsAppWithTemplate('reposicao')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#afcb48] hover:bg-[#a0bc3d] text-slate-950 rounded-full text-xs font-bold shadow-xs"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Chamar no WhatsApp</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-4 border-t border-slate-200/70 text-xs">
                  <div>
                    <span className="text-slate-500 font-medium">Ciclo Médio:</span>
                    <p className="text-base font-bold text-slate-900 mt-0.5">{pdv.media_dias_recompra} dias</p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Última Compra:</span>
                    <p className="text-base font-bold text-slate-900 mt-0.5">
                      {pdv.data_ultima_compra ? new Date(pdv.data_ultima_compra).toLocaleDateString('pt-BR') : 'Sem compra'}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Próxima Compra:</span>
                    <p className={`text-base font-bold mt-0.5 ${
                      pdv.dias_para_recompra !== undefined && pdv.dias_para_recompra <= 1 ? 'text-red-600 font-black animate-pulse' : 'text-slate-900'
                    }`}>
                      {pdv.data_prevista_recompra ? new Date(pdv.data_prevista_recompra).toLocaleDateString('pt-BR') : 'A calcular'}
                      {pdv.dias_para_recompra !== undefined && pdv.dias_para_recompra <= 1 && (
                        <span className="text-xs font-black ml-1 text-red-600">
                          ({pdv.dias_para_recompra <= 0 ? '0d' : '1d'})
                        </span>
                      )}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Faturamento Total:</span>
                    <p className="text-base font-extrabold text-slate-900 mt-0.5">{formatCurrency(pdv.faturamento_acumulado)}</p>
                  </div>
                </div>
              </div>

              {/* Dicas de Abordagem para a Gemima */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 text-xs space-y-3">
                <h4 className="font-bold text-slate-900">Script Recomendado para {pdv.responsavel || 'o Comprador'}:</h4>
                <div className="p-3 bg-slate-50 rounded-lg text-slate-700 italic border border-slate-200">
                  "Olá {pdv.responsavel || 'amigo'}, aqui é a Gemima da Naturebarr! Notei aqui pelo nosso controle que o lote de barras da {pdv.nome_fantasia} deve estar acabando esta semana. Temos os sabores Chocolate e Amendoim frescos saindo para entrega em {pdv.cidade}. Quer que eu já reserve as caixas da sua reposição para chegar antes do fim de semana?"
                </div>
              </div>

            </div>
          )}

          {/* ABA 2: HISTÓRICO DE PEDIDOS */}
          {activeTab === 'pedidos' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Pedidos Faturados Naturebarr</h3>
                <button
                  onClick={() => onOpenNewOrder(pdv)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#afcb48] hover:bg-[#a0bc3d] text-slate-950 rounded-full text-xs font-bold shadow-xs"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Novo Pedido</span>
                </button>
              </div>

              {pedidos.length > 0 ? (
                <div className="space-y-3">
                  {pedidos.map((ped) => (
                    <div key={ped.id} className="bg-white p-4 rounded-xl border border-slate-200 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">
                          Data: {new Date(ped.data_pedido).toLocaleDateString('pt-BR')}
                        </span>
                        <span className="text-sm font-extrabold text-slate-900">
                          {formatCurrency(ped.valor_total)}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-slate-500">
                        <span>Total de caixas: <strong className="text-slate-800">{ped.total_caixas} cx</strong> ({ped.total_caixas * 12} barras)</span>
                        <span>•</span>
                        <span>Pagamento: <strong className="text-slate-800">{ped.forma_pagamento}</strong></span>
                        <span>•</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium">
                          {ped.status_entrega}
                        </span>
                      </div>

                      {/* Itens do Pedido */}
                      {ped.itens && ped.itens.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-slate-100 flex flex-wrap gap-2">
                          {ped.itens.map((item, i) => (
                            <span key={i} className="px-2 py-1 bg-slate-100 rounded-md text-slate-700 text-[11px]">
                              {item.quantidade_caixas}cx {item.sabor}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl">
                  Nenhum pedido registrado para este PDV ainda.
                </div>
              )}
            </div>
          )}

          {/* ABA 3: HISTÓRICO DE VISITAS E CONTATOS */}
          {activeTab === 'visitas' && (
            <div className="space-y-6">
              
              {/* Formulário de Registro de Contato */}
              <form onSubmit={handleSalvarVisita} className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-3">
                <h4 className="font-bold text-slate-900">Registrar Novo Contato Comercial (Gemima)</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-500 mb-1">Tipo de Contato</label>
                    <select
                      value={tipoContato}
                      onChange={(e) => setTipoContato(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-800 focus:ring-2 focus:ring-[#afcb48]"
                    >
                      <option value="WhatsApp">WhatsApp</option>
                      <option value="Ligacao">Ligação</option>
                      <option value="Visita Presencial">Visita Presencial</option>
                      <option value="Envio de Amostra">Envio de Amostra</option>
                      <option value="Reuniao">Reunião Comercial</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-500 mb-1">Próxima Ação</label>
                    <input
                      type="text"
                      placeholder="Ex: Ligar para confirmar reposição"
                      value={proximaAcao}
                      onChange={(e) => setProximaAcao(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-800 focus:ring-2 focus:ring-[#afcb48]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 mb-1">Data da Próxima Ação</label>
                    <input
                      type="date"
                      value={dataProximaAcao}
                      onChange={(e) => setDataProximaAcao(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-800 focus:ring-2 focus:ring-[#afcb48]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-500 mb-1">Anotações do Contato *</label>
                  <textarea
                    rows={2}
                    placeholder="Descreva o que foi conversado, retorno do cliente ou feedback sobre o sabor..."
                    value={anotacoes}
                    onChange={(e) => setAnotacoes(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-800 focus:ring-2 focus:ring-[#afcb48]"
                    required
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={savingVisita}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#afcb48] hover:bg-[#a0bc3d] text-slate-950 rounded-full font-bold shadow-xs transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Salvar Contato</span>
                  </button>
                </div>
              </form>

              {/* Timeline de Contatos Anteriores */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Histórico de Interações</h4>
                {visitas.map((v) => (
                  <div key={v.id} className="p-3.5 bg-white rounded-xl border border-slate-200 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium text-[10px]">
                          {v.tipo_contato}
                        </span>
                        <span>{v.vendedor_nome}</span>
                      </span>
                      <span className="text-slate-400">
                        {new Date(v.data_contato).toLocaleDateString('pt-BR')} às {new Date(v.data_contato).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-slate-700 mt-1">{v.anotacoes}</p>

                    {v.proxima_acao && (
                      <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-700 font-medium flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#5a6d1f]" />
                        <span>Próxima ação: {v.proxima_acao} {v.data_proxima_acao ? `em ${new Date(v.data_proxima_acao).toLocaleDateString('pt-BR')}` : ''}</span>
                      </div>
                    )}
                  </div>
                ))}

                {visitas.length === 0 && (
                  <div className="p-6 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl text-xs">
                    Nenhum contato registrado ainda.
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ABA 4: DADOS CADASTRAIS */}
          {activeTab === 'geral' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-500">Razão Social</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{pdv.razao_social}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-500">Nome Fantasia</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{pdv.nome_fantasia}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-500">CNPJ / CPF</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{pdv.cnpj_cpf || 'Não informado'}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-500">Comprador / Responsável</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{pdv.responsavel || 'Não informado'}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-500">Telefone / WhatsApp</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{pdv.telefone_whatsapp}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-500">E-mail</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{pdv.email || 'Não informado'}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-500">Cidade / Estado / Polo</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{pdv.cidade} - {pdv.estado} ({pdv.regiao})</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-500">Endereço / Bairro</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{pdv.endereco || ''} {pdv.bairro ? `• ${pdv.bairro}` : ''}</p>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
