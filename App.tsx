
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import VehicleForm from './components/VehicleForm';
import DebtDashboard from './components/DebtDashboard';
import { VehicleConsultation, VehicleHistoryItem } from './types';
import { parseDetranText } from './services/geminiService';

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [currentConsultation, setCurrentConsultation] = useState<VehicleConsultation | null>(null);
  const [error, setError] = useState<{message: string, type: 'cors' | 'generic', url?: string} | null>(null);
  const [history, setHistory] = useState<VehicleHistoryItem[]>([]);
  const [manualData, setManualData] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('detran_ma_history');
    if (saved) {
      try { setHistory(JSON.parse(saved)); } catch (e) { console.error(e); }
    }
  }, []);

  const saveToHistory = (plate: string, renavam: string, model?: string) => {
    const newItem: VehicleHistoryItem = {
      plate,
      renavam,
      vehicleModel: model,
      lastConsulted: new Date().toISOString()
    };
    const updated = [newItem, ...history.filter(item => item.plate !== plate)].slice(0, 15);
    setHistory(updated);
    localStorage.setItem('detran_ma_history', JSON.stringify(updated));
  };

  const processData = async (text: string, plate: string, renavam: string) => {
    setLoading(true);
    try {
      const result = await parseDetranText(text);
      if (result.success && result.data) {
        const total = result.data.items.reduce((sum, item) => sum + item.value, 0);
        const consultation: VehicleConsultation = {
          plate, renavam,
          ownerName: result.data.ownerName,
          vehicleModel: result.data.vehicleModel,
          totalDebts: total,
          items: result.data.items,
          consultedAt: new Date().toISOString()
        };
        setCurrentConsultation(consultation);
        saveToHistory(plate, renavam, result.data.vehicleModel);
        setError(null);
        setManualData('');
      } else {
        setError({ message: result.error || "A IA não identificou débitos nesse texto.", type: 'generic' });
      }
    } catch (err) {
      setError({ message: "Falha ao processar os dados.", type: 'generic' });
    } finally {
      setLoading(false);
    }
  };

  const handleConsult = async (plate: string, renavam: string) => {
    setLoading(true);
    setError(null);
    
    const apiUrl = `https://api.detrannet.detran.ma.gov.br/api/Veiculo/ConsultarDebitos?placa=${plate}&renavam=${renavam}`;
    
    try {
      const response = await fetch(apiUrl, { method: 'GET' });
      if (response.ok) {
        const text = await response.text();
        await processData(text, plate, renavam);
      } else {
        throw new Error("Erro na API");
      }
    } catch (err) {
      setError({
        message: "O navegador bloqueou a conexão automática (CORS). Siga os passos abaixo.",
        type: 'cors',
        url: apiUrl
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <main className="flex-grow max-w-5xl mx-auto w-full px-4 py-8">
        {!currentConsultation ? (
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h1 className="text-4xl font-black text-slate-900 tracking-tighter">
                DETRAN-MA <span className="text-blue-600">PLUS</span>
              </h1>
              <p className="text-slate-500 font-medium">Consulte e some seus débitos de forma inteligente.</p>
            </div>

            <VehicleForm 
              onConsult={handleConsult} 
              isLoading={loading} 
              history={history}
              onSelectFromHistory={() => setError(null)}
              onDeleteHistory={(plate) => {
                const updated = history.filter(h => h.plate !== plate);
                setHistory(updated);
                localStorage.setItem('detran_ma_history', JSON.stringify(updated));
              }}
            />

            {error?.type === 'cors' && (
              <div className="bg-white border-2 border-blue-100 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4">
                <div className="bg-blue-600 p-4 text-white flex items-center space-x-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="font-bold">Assistente de Conexão Necessário</h3>
                </div>
                <div className="p-6 space-y-6">
                  <p className="text-sm text-slate-600">Por segurança, o DETRAN exige que você abra os dados manualmente uma vez:</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mx-auto mb-2">1</div>
                      <a href={error.url} target="_blank" rel="noopener" className="text-xs font-black text-blue-700 underline">ABRIR SITE DO DETRAN</a>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="w-8 h-8 bg-slate-400 text-white rounded-full flex items-center justify-center font-bold mx-auto mb-2">2</div>
                      <p className="text-[10px] font-bold text-slate-600">COPIE TUDO (CTRL+A, CTRL+C)</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="w-8 h-8 bg-slate-400 text-white rounded-full flex items-center justify-center font-bold mx-auto mb-2">3</div>
                      <p className="text-[10px] font-bold text-slate-600">COLE NO CAMPO ABAIXO</p>
                    </div>
                  </div>

                  <textarea
                    value={manualData}
                    onChange={(e) => setManualData(e.target.value)}
                    placeholder="Cole aqui o conteúdo da página que abriu..."
                    className="w-full h-32 p-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl outline-none focus:border-blue-500 font-mono text-xs"
                  />
                  
                  <button
                    onClick={() => {
                      const urlParams = new URL(error.url!).searchParams;
                      processData(manualData, urlParams.get('placa') || '', urlParams.get('renavam') || '');
                    }}
                    disabled={!manualData.trim() || loading}
                    className="w-full py-4 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 disabled:bg-slate-300 transition-all"
                  >
                    {loading ? 'PROCESSANDO...' : 'SOMAR DADOS COPIADOS'}
                  </button>
                </div>
              </div>
            )}

            {error?.type === 'generic' && (
              <div className="bg-red-50 border border-red-100 p-4 rounded-xl text-red-700 text-sm font-bold text-center">
                {error.message}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <button 
              onClick={() => setCurrentConsultation(null)}
              className="flex items-center text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              FAZER OUTRA CONSULTA
            </button>
            <DebtDashboard consultation={currentConsultation} />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
