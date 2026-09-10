import React, { useState } from 'react';
import { X, Plus, AlertCircle, Building2 } from 'lucide-react';
import { createPDV } from '../api';
import { Region, Category, PipelineStatus } from '../types';

interface NewPDVModalProps {
  onClose: () => void;
  onPDVCreated: () => void;
  defaultRegion?: string;
}

export const NewPDVModal: React.FC<NewPDVModalProps> = ({
  onClose,
  onPDVCreated,
  defaultRegion = 'Salvador'
}) => {
  const [razaoSocial, setRazaoSocial] = useState('');
  const [nomeFantasia, setNomeFantasia] = useState('');
  const [cnpjCpf, setCnpjCpf] = useState('');
  const [responsavel, setResponsavel] = useState('');
  const [telefoneWhatsapp, setTelefoneWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [cidade, setCidade] = useState(defaultRegion === 'Sao Paulo' ? 'São Paulo' : defaultRegion === 'Santa Catarina' ? 'Florianópolis' : 'Salvador');
  const [estado, setEstado] = useState(defaultRegion === 'Sao Paulo' ? 'SP' : defaultRegion === 'Santa Catarina' ? 'SC' : 'BA');
  const [regiao, setRegiao] = useState<Region>(defaultRegion === 'Todas' ? 'Salvador' : (defaultRegion as Region));
  const [bairro, setBairro] = useState('');
  const [endereco, setEndereco] = useState('');
  const [categoria, setCategoria] = useState<Category>('Emporio');
  const [origem, setOrigem] = useState('Trafego Pago');
  const [statusPipeline, setStatusPipeline] = useState<PipelineStatus>('Novo Lead');
  const [mediaDias, setMediaDias] = useState<number>(21);
  const [observacoes, setObservacoes] = useState('');

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  const handleRegiaoChange = (r: Region) => {
    setRegiao(r);
    if (r === 'Salvador') {
      setCidade('Salvador');
      setEstado('BA');
    } else if (r === 'Sao Paulo') {
      setCidade('São Paulo');
      setEstado('SP');
    } else if (r === 'Santa Catarina') {
      setCidade('Florianópolis');
      setEstado('SC');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeFantasia.trim() || !telefoneWhatsapp.trim() || !cidade.trim()) {
      setErro('Preencha pelo menos Nome Fantasia, Telefone/WhatsApp e Cidade.');
      return;
    }

    setLoading(true);
    setErro('');

    try {
      await createPDV({
        razao_social: razaoSocial.trim() || nomeFantasia.trim(),
        nome_fantasia: nomeFantasia.trim(),
        cnpj_cpf: cnpjCpf.trim() || undefined,
        responsavel: responsavel.trim() || undefined,
        telefone_whatsapp: telefoneWhatsapp.trim(),
        email: email.trim() || undefined,
        cidade: cidade.trim(),
        estado: estado.trim().toUpperCase(),
        regiao,
        bairro: bairro.trim() || undefined,
        endereco: endereco.trim() || undefined,
        categoria,
        origem,
        status_pipeline: statusPipeline,
        media_dias_recompra: mediaDias || 21,
        observacoes_gerais: observacoes.trim() || undefined
      });

      onPDVCreated();
      onClose();
    } catch (err: any) {
      setErro(err.message || 'Erro ao criar PDV');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#5a6d1f]" />
            <h2 className="text-base font-bold text-slate-900">Cadastrar Novo Ponto de Venda (PDV)</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          
          {erro && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{erro}</span>
            </div>
          )}

          {/* Nome Fantasia e Razão Social */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Nome Fantasia (Loja) *</label>
              <input
                type="text"
                placeholder="Ex: Empório Verde Barra"
                value={nomeFantasia}
                onChange={(e) => setNomeFantasia(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#afcb48] font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Razão Social</label>
              <input
                type="text"
                placeholder="Ex: Comercial de Alimentos Ltda"
                value={razaoSocial}
                onChange={(e) => setRazaoSocial(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#afcb48]"
              />
            </div>
          </div>

          {/* Polo Regional, Cidade e Estado */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Polo Regional *</label>
              <select
                value={regiao}
                onChange={(e) => handleRegiaoChange(e.target.value as Region)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#afcb48] font-semibold"
              >
                <option value="Salvador">Salvador (BA)</option>
                <option value="Sao Paulo">São Paulo (SP)</option>
                <option value="Santa Catarina">Santa Catarina (SC)</option>
                <option value="Outro">Outro</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Cidade *</label>
              <input
                type="text"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#afcb48]"
                required
              />
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Estado (UF)</label>
              <input
                type="text"
                maxLength={2}
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#afcb48] uppercase"
              />
            </div>
          </div>

          {/* Contato do Responsável e WhatsApp */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Comprador / Responsável</label>
              <input
                type="text"
                placeholder="Ex: Carlos Oliveira"
                value={responsavel}
                onChange={(e) => setResponsavel(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#afcb48]"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">WhatsApp / Telefone *</label>
              <input
                type="text"
                placeholder="Ex: 71999998888"
                value={telefoneWhatsapp}
                onChange={(e) => setTelefoneWhatsapp(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#afcb48] font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">E-mail</label>
              <input
                type="email"
                placeholder="contato@loja.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#afcb48]"
              />
            </div>
          </div>

          {/* Segmentação: Categoria, Origem e Etapa Inicial */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Categoria</label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value as Category)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#afcb48]"
              >
                <option value="Emporio">Empório</option>
                <option value="Academia">Academia</option>
                <option value="Box Crossfit">Box CrossFit</option>
                <option value="Farmacia">Farmácia</option>
                <option value="Suplementos">Suplementos</option>
                <option value="Cafeteria">Cafeteria</option>
                <option value="Mercado Saudavel">Mercado Saudável</option>
                <option value="Outro">Outro</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Origem do Lead</label>
              <select
                value={origem}
                onChange={(e) => setOrigem(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#afcb48]"
              >
                <option value="Trafego Pago">Tráfego Pago (Meta Ads)</option>
                <option value="Prospeccao Ativa">Prospecção Ativa (Gemima)</option>
                <option value="Indicacao">Indicação</option>
                <option value="Evento">Evento / Ativação</option>
                <option value="Organico">Orgânico / Redes Sociais</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Etapa no Kanban</label>
              <select
                value={statusPipeline}
                onChange={(e) => setStatusPipeline(e.target.value as PipelineStatus)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#afcb48] font-medium"
              >
                <option value="Novo Lead">1. Novo Lead</option>
                <option value="Contato Feito">2. Contato Feito</option>
                <option value="Amostra Enviada">3. Amostra Enviada</option>
                <option value="PDV Ativo">4. PDV Ativo</option>
                <option value="Alerta de Reposicao">5. Alerta de Reposição</option>
              </select>
            </div>
          </div>

          {/* Endereço e Observações */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Bairro / Endereço</label>
              <input
                type="text"
                placeholder="Ex: Barra - Av. Oceânica, 120"
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#afcb48]"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Ciclo Médio Estimado (Dias)</label>
              <input
                type="number"
                value={mediaDias}
                onChange={(e) => setMediaDias(parseInt(e.target.value) || 21)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#afcb48]"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Observações Comerciais</label>
            <textarea
              rows={2}
              placeholder="Preferências de sabor, horário para entrega, perfil dos frequentadores..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#afcb48]"
            />
          </div>

          {/* Ações */}
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
              disabled={loading}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-[#afcb48] hover:bg-[#a0bc3d] text-slate-950 rounded-full font-extrabold shadow-sm hover:shadow-[#afcb48]/30 transition-all disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{loading ? 'Cadastrando...' : 'Cadastrar PDV'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
