
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { VehicleConsultation, DebtItem } from '../types';

interface DebtDashboardProps {
  consultation: VehicleConsultation;
}

const COLORS = ['#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6'];

const DebtDashboard: React.FC<DebtDashboardProps> = ({ consultation }) => {
  const categoryData = consultation.items.reduce((acc: any[], item) => {
    const existing = acc.find(a => a.name === item.category);
    if (existing) {
      existing.value += item.value;
    } else {
      acc.push({ name: item.category, value: item.value });
    }
    return acc;
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500 mb-1">Total em Débitos</p>
          <h3 className="text-3xl font-bold text-red-600">{formatCurrency(consultation.totalDebts)}</h3>
          <p className="text-xs text-slate-400 mt-2">Soma de todos os itens em aberto</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500 mb-1">Veículo</p>
          <h3 className="text-xl font-bold text-slate-800 truncate">{consultation.vehicleModel || 'N/A'}</h3>
          <div className="flex items-center mt-2 space-x-2">
            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-mono uppercase font-bold">{consultation.plate}</span>
            <span className="text-xs text-slate-400">Placa</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500 mb-1">Proprietário</p>
          <h3 className="text-xl font-bold text-slate-800 truncate">{consultation.ownerName || 'Não Identificado'}</h3>
          <p className="text-xs text-slate-400 mt-2">Identificado via IA</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Charts */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h4 className="text-lg font-semibold mb-6 text-slate-800">Distribuição por Categoria</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h4 className="text-lg font-semibold mb-6 text-slate-800">Maiores Débitos</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={consultation.items.sort((a,b) => b.value - a.value).slice(0, 5)}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="description" hide />
                <YAxis hide />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Itemized List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
          <h4 className="font-semibold text-slate-800">Detalhamento Completo</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-xs uppercase text-slate-400 bg-slate-50">
              <tr>
                <th className="px-6 py-3 font-medium">Descrição</th>
                <th className="px-6 py-3 font-medium">Categoria</th>
                <th className="px-6 py-3 font-medium">Vencimento</th>
                <th className="px-6 py-3 font-medium text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {consultation.items.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-700 font-medium">{item.description}</td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${
                      item.category === 'Multa' ? 'bg-red-100 text-red-600' :
                      item.category === 'IPVA' ? 'bg-blue-100 text-blue-600' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{item.dueDate || '--/--/----'}</td>
                  <td className="px-6 py-4 text-sm text-slate-900 font-bold text-right">{formatCurrency(item.value)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50 font-bold">
              <tr>
                <td colSpan={3} className="px-6 py-4 text-sm text-slate-900 text-right">TOTAL GERAL</td>
                <td className="px-6 py-4 text-sm text-red-600 text-right">{formatCurrency(consultation.totalDebts)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DebtDashboard;
