import React, { useState } from 'react';
import { 
  Webhook, 
  Send, 
  Check, 
  AlertCircle, 
  Copy, 
  Sparkles,
  ArrowRight,
  Code2
} from 'lucide-react';
import { triggerMetaLeadWebhook } from '../api';

interface MetaWebhookTesterProps {
  onLeadReceived: () => void;
  onOpenPipeline: () => void;
}

export const MetaWebhookTester: React.FC<MetaWebhookTesterProps> = ({
  onLeadReceived,
  onOpenPipeline
}) => {
  const [poloSimulado, setPoloSimulado] = useState<'Salvador' | 'Sao Paulo' | 'Santa Catarina'>('Salvador');
  const [empresa, setEmpresa] = useState('Academia Fit Premium Barra');
  const [responsavel, setResponsavel] = useState('Mariana Castro');
  const [telefone, setTelefone] = useState('71999881122');
  const [categoria, setCategoria] = useState('Academia');
  const [campanha, setCampanha] = useState('Meta Ads - Expansão B2B Nordeste');

  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<any>(null);
  const [erro, setErro] = useState('');
  const [copied, setCopied] = useState(false);

  const webhookEndpoint = `${window.location.protocol}//${window.location.hostname}:8000/api/v1/webhooks/meta-leads`;

  const handlePoloChange = (polo: 'Salvador' | 'Sao Paulo' | 'Santa Catarina') => {
    setPoloSimulado(polo);
    if (polo === 'Salvador') {
      setEmpresa('Empório do Farol Saudável');
      setResponsavel('Eduardo Bahia');
      setTelefone('71991238899');
      setCampanha('Meta Ads - Expansão B2B Salvador');
    } else if (polo === 'Sao Paulo') {
      setEmpresa('CrossFit Pinheiros Sp');
      setResponsavel('Luciana Siqueira');
      setTelefone('11988776655');
      setCampanha('Meta Ads - Expansão B2B SP Capital');
    } else {
      setEmpresa('Mundo Natural Beira-Mar');
      setResponsavel('Thiago Schmidt');
      setTelefone('48991122334');
      setCampanha('Meta Ads - Expansão B2B Santa Catarina');
    }
  };

  const handleDisparar = async () => {
    setLoading(true);
    setErro('');
    setResultado(null);

    const cidade = poloSimulado === 'Salvador' ? 'Salvador' : poloSimulado === 'Sao Paulo' ? 'São Paulo' : 'Florianópolis';
    const estado = poloSimulado === 'Salvador' ? 'BA' : poloSimulado === 'Sao Paulo' ? 'SP' : 'SC';

    const payload = {
      ad_id: `ad_${Math.floor(Math.random() * 1000000)}`,
      form_id: `form_naturebarr_b2b`,
      campaign_name: campanha,
      nome: responsavel,
      empresa: empresa,
      telefone: telefone,
      email: `${responsavel.toLowerCase().replace(/\s+/g, '.')}@${empresa.toLowerCase().replace(/\s+/g, '')}.com.br`,
      cidade: cidade,
      estado: estado,
      regiao: poloSimulado,
      categoria: categoria,
      mensagem: "Quero receber a tabela de atacado e provar amostras das barras Naturebarr no meu estabelecimento."
    };

    try {
      const res = await triggerMetaLeadWebhook(payload);
      setResultado(res);
      onLeadReceived();
    } catch (err: any) {
      setErro(err.message || 'Erro ao disparar webhook');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyEndpoint = () => {
    navigator.clipboard.writeText(webhookEndpoint);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Cabeçalho */}
      <div>
        <div className="flex items-center gap-2">
          <div className="p-2 bg-[#f7faeb] text-[#5a6d1f] rounded-xl border border-[#cfdf9b]">
            <Webhook className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">
            Integração de Tráfego Pago & Webhooks (Meta Ads)
          </h1>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Receba leads gerados em anúncios do Instagram e Facebook Ads automaticamente no CRM, caindo direto na coluna "Novo Lead" para a Gemima atender.
        </p>
      </div>

      {/* URL do Endpoint Webhook */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          Endpoint do Webhook Dedicado
        </h2>
        
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-slate-900 text-[#afcb48] font-mono text-xs px-4 py-2.5 rounded-lg overflow-x-auto select-all">
            POST {webhookEndpoint}
          </div>
          <button
            onClick={handleCopyEndpoint}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors shrink-0"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copiado!' : 'Copiar URL'}</span>
          </button>
        </div>

        <p className="text-[11px] text-slate-500">
          Você pode cadastrar esta URL no Meta Ads Manager (Webhooks), Zapier, Make ou em formulários de Landing Pages da Naturebarr.
        </p>
      </div>

      {/* Simulador de Disparo em Tempo Real */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-5">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#5a6d1f]" />
            <span>Simulador de Lead de Tráfego Pago (1-Clique)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Dispare um lead teste para verificar o lead aparecendo em tempo real no pipeline.
          </p>
        </div>

        {/* Escolha do Polo Regional */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600">Simular lead de:</span>
          {(['Salvador', 'Sao Paulo', 'Santa Catarina'] as const).map((polo) => (
            <button
              key={polo}
              type="button"
              onClick={() => handlePoloChange(polo)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                poloSimulado === polo
                  ? 'bg-[#afcb48] text-slate-950 font-black shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {polo === 'Sao Paulo' ? 'São Paulo' : polo}
            </button>
          ))}
        </div>

        {/* Dados do Formulário Meta */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block text-slate-600 font-semibold mb-1">Nome do Estabelecimento / Loja</label>
            <input
              type="text"
              value={empresa}
              onChange={(e) => setEmpresa(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#afcb48] font-medium"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Nome do Responsável / Comprador</label>
            <input
              type="text"
              value={responsavel}
              onChange={(e) => setResponsavel(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#afcb48]"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">WhatsApp de Contato</label>
            <input
              type="text"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#afcb48]"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Campanha Meta Ads</label>
            <input
              type="text"
              value={campanha}
              onChange={(e) => setCampanha(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#afcb48]"
            />
          </div>
        </div>

        {erro && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{erro}</span>
          </div>
        )}

        {resultado && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{resultado.message}</span>
            </div>
            <p className="text-emerald-700">
              O lead <strong>{resultado.empresa}</strong> foi criado em <strong>{resultado.regiao}</strong> na etapa <strong>{resultado.status}</strong>!
            </p>
            <button
              onClick={onOpenPipeline}
              className="inline-flex items-center gap-1 font-bold text-slate-900 hover:underline pt-1"
            >
              <span>Visualizar no Kanban agora</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <button
            onClick={handleDisparar}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#afcb48] hover:bg-[#a0bc3d] text-slate-950 rounded-full text-xs font-extrabold shadow-sm hover:shadow-[#afcb48]/30 transition-all disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{loading ? 'Disparando Webhook...' : 'Simular Recebimento do Lead'}</span>
          </button>
        </div>

      </div>

    </div>
  );
};
