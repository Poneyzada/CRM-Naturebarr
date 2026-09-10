import React, { useState } from 'react';
import { X, Package, DollarSign, Calendar, Check, AlertCircle } from 'lucide-react';
import { PDV } from '../types';
import { createPDVPedido } from '../api';

interface NewOrderModalProps {
  pdv: PDV;
  onClose: () => void;
  onOrderCreated: () => void;
}

const SABORES_PADRAO = [
  { sabor: 'Cacau & Avela', nome: 'Cacau & Avelã 50g' },
  { sabor: 'Pasta de Amendoim', nome: 'Pasta de Amendoim 50g' },
  { sabor: 'Banana & Canela', nome: 'Banana, Canela & Aveia 50g' },
  { sabor: 'Coco & Castanhas', nome: 'Coco & Castanhas 50g' },
  { sabor: 'Frutas Vermelhas & Chia', nome: 'Frutas Vermelhas & Chia 50g' },
];

export const NewOrderModal: React.FC<NewOrderModalProps> = ({
  pdv,
  onClose,
  onOrderCreated
}) => {
  const [dataPedido, setDataPedido] = useState(new Date().toISOString().split('T')[0]);
  const [formaPagamento, setFormaPagamento] = useState('Boleto 30d');
  const [statusFaturamento, setStatusFaturamento] = useState('Faturado');
  const [statusEntrega, setStatusEntrega] = useState('Entregue');
  const [observacoes, setObservacoes] = useState('');
  const [precoCaixa, setPrecoCaixa] = useState<number>(96.00); // R$ 8,00/barra * 12

  // Quantidades por sabor (caixas)
  const [quantidades, setQuantidades] = useState<{ [key: string]: number }>({
    'Cacau & Avela': 2,
    'Pasta de Amendoim': 2,
    'Banana & Canela': 1,
    'Coco & Castanhas': 1,
    'Frutas Vermelhas & Chia': 0,
  });

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  const totalCaixas = Object.values(quantidades).reduce((a, b) => a + b, 0);
  const valorTotal = totalCaixas * precoCaixa;

  const handleQtdChange = (sabor: string, val: number) => {
    setQuantidades(prev => ({
      ...prev,
      [sabor]: Math.max(0, val)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totalCaixas === 0) {
      setErro('Selecione pelo menos 1 caixa de qualquer sabor da Naturebarr.');
      return;
    }

    setLoading(true);
    setErro('');

    try {
      const itens = Object.entries(quantidades)
        .filter(([_, qtd]) => qtd > 0)
        .map(([sabor, qtd]) => ({
          sabor,
          quantidade_caixas: qtd,
          unidades_por_caixa: 12,
          preco_caixa: precoCaixa,
          subtotal: qtd * precoCaixa
        }));

      await createPDVPedido(pdv.id, {
        data_pedido: dataPedido,
        forma_pagamento: formaPagamento,
        status_faturamento: statusFaturamento,
        status_entrega: statusEntrega,
        observacoes: observacoes || undefined,
        itens
      });

      onOrderCreated();
      onClose();
    } catch (err: any) {
      setErro(err.message || 'Erro ao registrar pedido');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Lançar Novo Pedido B2B Naturebarr</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Cliente: <strong>{pdv.nome_fantasia}</strong> ({pdv.cidade} - {pdv.regiao})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs">
          
          {erro && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{erro}</span>
            </div>
          )}

          {/* Dados Gerais do Pedido */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Data do Pedido</label>
              <input
                type="date"
                value={dataPedido}
                onChange={(e) => setDataPedido(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#afcb48]"
                required
              />
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Forma de Pagamento</label>
              <select
                value={formaPagamento}
                onChange={(e) => setFormaPagamento(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#afcb48]"
              >
                <option value="Boleto 30d">Boleto 30 dias</option>
                <option value="Boleto 15d">Boleto 15 dias</option>
                <option value="Boleto 45d">Boleto 45 dias</option>
                <option value="PIX">PIX à Vista</option>
                <option value="Cartao de Credito">Cartão de Crédito</option>
                <option value="Transferencia">Transferência Bancária</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Preço por Caixa (R$)</label>
              <input
                type="number"
                step="0.50"
                value={precoCaixa}
                onChange={(e) => setPrecoCaixa(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#afcb48] font-semibold"
                required
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">12 barras por caixa (R$ 8,00/un)</span>
            </div>
          </div>

          {/* Seleção de Sabores por Caixas */}
          <div className="space-y-2">
            <label className="block text-slate-700 font-bold">
              Distribuição dos Sabores (Caixas Fechadas):
            </label>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
              {SABORES_PADRAO.map((item) => (
                <div key={item.sabor} className="p-3 flex items-center justify-between hover:bg-white transition-colors">
                  <div>
                    <span className="font-semibold text-slate-900 text-xs block">{item.nome}</span>
                    <span className="text-[11px] text-slate-400">12 unidades/cx</span>
                  </div>

                  {/* Controle de Quantidade de Caixas */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleQtdChange(item.sabor, Math.max(0, (quantidades[item.sabor] || 0) - 1))}
                      className="w-7 h-7 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold flex items-center justify-center transition-colors"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="0"
                      value={quantidades[item.sabor] || 0}
                      onChange={(e) => handleQtdChange(item.sabor, parseInt(e.target.value) || 0)}
                      className="w-12 text-center py-1 bg-white border border-slate-300 rounded-lg font-bold text-slate-900 focus:ring-2 focus:ring-[#afcb48]"
                    />
                    <button
                      type="button"
                      onClick={() => handleQtdChange(item.sabor, (quantidades[item.sabor] || 0) + 1)}
                      className="w-7 h-7 rounded-lg bg-[#f7faeb] hover:bg-[#e1ecc0] text-slate-900 font-black flex items-center justify-center transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resumo do Pedido */}
          <div className="p-4 bg-[#f7faeb] rounded-xl border border-[#cfdf9b] flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-600 font-semibold">Volume Total:</span>
              <p className="text-base font-black text-slate-950">
                {totalCaixas} caixas <span className="text-xs font-normal text-slate-600">({totalCaixas * 12} barras)</span>
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-600 font-semibold">Valor Total do Pedido:</span>
              <p className="text-xl font-black text-slate-950">
                {formatCurrency(valorTotal)}
              </p>
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-slate-600 font-semibold mb-1">Observações do Pedido (opcional)</label>
            <input
              type="text"
              placeholder="Ex: Entregar pela manhã, negociado frete grátis..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#afcb48]"
            />
          </div>

          {/* Botões */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium transition-colors"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading || totalCaixas === 0}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-[#afcb48] hover:bg-[#a0bc3d] text-slate-950 rounded-full font-extrabold shadow-sm hover:shadow-[#afcb48]/30 transition-all disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{loading ? 'Gravando Pedido...' : 'Confirmar e Recalcular Recompra'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
