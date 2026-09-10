import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileSpreadsheet, 
  Check, 
  AlertCircle, 
  Download, 
  X,
  FileText
} from 'lucide-react';
import { importCSV } from '../api';

interface ImportCSVModalProps {
  onClose: () => void;
  onImportSuccess: () => void;
}

export const ImportCSVModal: React.FC<ImportCSVModalProps> = ({
  onClose,
  onImportSuccess
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await importCSV(file);
      setResult(res);
      onImportSuccess();
    } catch (err: any) {
      setError(err.message || 'Erro ao importar planilha');
    } finally {
      setLoading(false);
    }
  };

  const downloadSampleCSV = () => {
    const csvContent = 
      "Razão Social;Nome Fantasia;CNPJ;Responsável;WhatsApp;E-mail;Cidade;Estado;Região;Bairro;Categoria;Comprando\n" +
      "Emporio Grao Real Ltda;Grao Real Barra;14.288.910/0001-33;Rodrigo Matos;71991234567;contato@graoreal.com.br;Salvador;BA;Salvador;Barra;Emporio;sim\n" +
      "Academia BioFit Jardins;BioFit Jardins;19.882.123/0001-99;Camila Duarte;11987654321;camila@biofit.com.br;São Paulo;SP;Sao Paulo;Jardins;Academia;sim\n" +
      "CrossFit Ilha Campeche;CrossFit Campeche;45.123.789/0001-44;Felipe Koerich;48999887766;felipe@cfcampeche.com;Florianópolis;SC;Santa Catarina;Campeche;Box Crossfit;nao\n";

    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'modelo_importacao_pdvs_naturebarr.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-[#5a6d1f]" />
            <h2 className="text-base font-bold text-slate-900">Importador de Planilhas B2B</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          
          <div className="flex items-center justify-between p-3 bg-[#f7faeb] border border-[#cfdf9b] rounded-xl">
            <div>
              <p className="font-black text-slate-900">Suba sua lista atual de PDVs</p>
              <p className="text-slate-600 mt-0.5">Suporta arquivos .CSV e planilhas .XLSX com mapeamento automático.</p>
            </div>
            <button
              onClick={downloadSampleCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#cfdf9b] text-slate-900 rounded-full font-bold hover:bg-[#f7faeb] transition-colors shrink-0 shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar Modelo CSV</span>
            </button>
          </div>

          {/* Área de Drag and Drop */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
              dragActive 
                ? 'border-[#afcb48] bg-[#f7faeb]' 
                : file 
                ? 'border-[#afcb48] bg-[#f7faeb]/40' 
                : 'border-slate-300 hover:border-[#afcb48] hover:bg-slate-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv, .xlsx, .xls"
              onChange={handleChange}
              className="hidden"
            />

            <div className="flex flex-col items-center">
              <div className="p-4 bg-[#f7faeb] text-[#5a6d1f] rounded-full mb-3 border border-[#cfdf9b]">
                <UploadCloud className="w-8 h-8" />
              </div>

              {file ? (
                <div>
                  <p className="font-bold text-slate-900 text-sm">{file.name}</p>
                  <p className="text-slate-500 mt-1">{(file.size / 1024).toFixed(1)} KB • Pronto para importar</p>
                </div>
              ) : (
                <div>
                  <p className="font-bold text-slate-800 text-sm">
                    Arraste sua planilha aqui ou clique para selecionar
                  </p>
                  <p className="text-slate-400 mt-1">
                    Formato .CSV, .XLSX ou .XLS
                  </p>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {result && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl space-y-1">
              <div className="flex items-center gap-2 font-bold">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>{result.message}</span>
              </div>
              <p className="text-emerald-700 text-[11px]">
                {result.total_importados} novos clientes inseridos na carteira!
              </p>
            </div>
          )}

          {/* Colunas Suportadas */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <h4 className="font-bold text-slate-800">Colunas reconhecidas automaticamente:</h4>
            <div className="grid grid-cols-2 gap-2 text-slate-600 text-[11px]">
              <div>• Razão Social / Nome da Empresa</div>
              <div>• Nome Fantasia / Loja</div>
              <div>• CNPJ / CPF</div>
              <div>• Responsável / Comprador</div>
              <div>• Telefone / WhatsApp</div>
              <div>• E-mail</div>
              <div>• Cidade e Estado (Salvador, SP, SC)</div>
              <div>• Categoria (Empório, Academia, etc.)</div>
            </div>
          </div>

          {/* Ações */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium transition-colors"
            >
              {result ? 'Fechar' : 'Cancelar'}
            </button>

            {file && !result && (
              <button
                type="button"
                onClick={handleUpload}
                disabled={loading}
                className="flex items-center gap-1.5 px-5 py-2 bg-[#afcb48] hover:bg-[#a0bc3d] text-slate-950 rounded-full font-extrabold shadow-sm hover:shadow-[#afcb48]/30 transition-all disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>{loading ? 'Processando...' : 'Iniciar Importação'}</span>
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
