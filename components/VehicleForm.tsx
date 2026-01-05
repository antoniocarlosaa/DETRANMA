
import React, { useState } from 'react';
import { VehicleHistoryItem } from '../types';

interface VehicleFormProps {
  onConsult: (plate: string, renavam: string) => void;
  isLoading: boolean;
  history: VehicleHistoryItem[];
  onSelectFromHistory: (item: VehicleHistoryItem) => void;
  onDeleteHistory: (plate: string) => void;
}

const VehicleForm: React.FC<VehicleFormProps> = ({ 
  onConsult, 
  isLoading, 
  history, 
  onSelectFromHistory,
  onDeleteHistory
}) => {
  const [plate, setPlate] = useState('');
  const [renavam, setRenavam] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConsult(plate.toUpperCase(), renavam);
  };

  const fillForm = (item: VehicleHistoryItem) => {
    setPlate(item.plate);
    setRenavam(item.renavam);
    onSelectFromHistory(item);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Placa do Veículo</label>
              <input
                type="text"
                required
                maxLength={7}
                placeholder="ABC1D23"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono text-lg uppercase"
                value={plate}
                onChange={(e) => setPlate(e.target.value.toUpperCase())}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Número do Renavam</label>
              <input
                type="text"
                required
                placeholder="00000000000"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono text-lg"
                value={renavam}
                onChange={(e) => setRenavam(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-4 rounded-xl font-black text-white transition-all flex items-center justify-center space-x-2 ${
              isLoading ? 'bg-slate-400' : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100'
            }`}
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <span>VERIFICAR NO DETRAN-MA</span>
            )}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Meus Veículos</h3>
        {history.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center py-8 opacity-20">
            <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-[10px] font-bold">Vazio</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
            {history.map((item) => (
              <div 
                key={item.plate} 
                className="group flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-blue-50 cursor-pointer transition-colors"
                onClick={() => fillForm(item)}
              >
                <div>
                  <div className="text-sm font-black text-slate-800">{item.plate}</div>
                  <div className="text-[9px] text-slate-400 uppercase font-bold truncate max-w-[80px]">{item.vehicleModel || 'VEÍCULO'}</div>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); onDeleteHistory(item.plate); }}
                  className="p-1 text-slate-300 hover:text-red-500"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleForm;
