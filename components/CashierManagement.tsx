
import React, { useState } from 'react';
import { CashierSession, Order } from '../types';

interface CashierManagementProps {
  currentSession: CashierSession | null;
  sessionHistory: CashierSession[];
  orders: Order[];
  onOpen: (initialBalance: number) => void;
  onClose: (finalBalance: number) => void;
  onBack: () => void;
}

const CashierManagement: React.FC<CashierManagementProps> = ({ 
  currentSession, 
  sessionHistory, 
  orders, 
  onOpen, 
  onClose, 
  onBack 
}) => {
  const [initialAmount, setInitialAmount] = useState<string>('');
  
  // Calculate current session sales from orders if session is open
  const currentSales = currentSession ? orders
    .filter(o => o.timestamp >= currentSession.openedAt && o.status === 'delivered' && o.paymentMethod)
    .reduce((acc, order) => {
      const method = order.paymentMethod as keyof CashierSession['sales'];
      acc[method] = (acc[method] || 0) + order.total;
      return acc;
    }, { dinheiro: 0, pix: 0, cartão: 0 }) : { dinheiro: 0, pix: 0, cartão: 0 };

  const handleOpen = () => {
    const val = parseFloat(initialAmount) || 0;
    onOpen(val);
    setInitialAmount('');
  };

  const handleClose = () => {
    const totalCash = currentSales.dinheiro + (currentSession?.initialBalance || 0);
    if (confirm(`Deseja realmente fechar o caixa?\nTotal em Dinheiro esperado: R$ ${totalCash.toFixed(2)}`)) {
      onClose(totalCash);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={onBack}
          className="p-2 rounded-full hover:bg-orange-100 text-orange-600 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h2 className="text-3xl font-bold text-orange-800">Controle de Caixa</h2>
      </div>

      {!currentSession ? (
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-orange-100 text-center max-w-md mx-auto">
          <div className="bg-orange-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
            🔓
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Caixa Fechado</h3>
          <p className="text-gray-500 mb-8">Abra o caixa para iniciar as vendas do dia.</p>
          
          <div className="space-y-4">
            <div className="text-left">
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Saldo Inicial (Dinheiro)</label>
              <input 
                type="number" 
                value={initialAmount}
                onChange={(e) => setInitialAmount(e.target.value)}
                placeholder="Ex: 100.00"
                className="w-full px-4 py-3 rounded-xl border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <button 
              onClick={handleOpen}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all"
            >
              Abrir Caixa Agora
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Session Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-orange-100">
              <div className="bg-green-600 p-6 text-white flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg opacity-80 uppercase tracking-widest">Caixa Aberto</h3>
                  <p className="text-xs opacity-75">Desde {new Date(currentSession.openedAt).toLocaleString()}</p>
                </div>
                <div className="text-3xl">💹</div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100">
                    <span className="text-xs font-bold text-orange-800 uppercase block mb-1">Fundo Inicial</span>
                    <span className="text-xl font-bold text-gray-800">R$ {currentSession.initialBalance.toFixed(2)}</span>
                  </div>
                  <div className="bg-green-50 p-4 rounded-2xl border border-green-100">
                    <span className="text-xs font-bold text-green-800 uppercase block mb-1">Vendas Totais</span>
                    <span className="text-xl font-bold text-gray-800">
                      R$ {(currentSales.dinheiro + currentSales.pix + currentSales.cartão).toFixed(2)}
                    </span>
                  </div>
                </div>

                <h4 className="font-bold text-gray-700 mb-4 border-b pb-2">Resumo por Pagamento</h4>
                <div className="space-y-3 mb-8">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">💵 Dinheiro</span>
                    <span className="font-bold">R$ {currentSales.dinheiro.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">📱 Pix</span>
                    <span className="font-bold">R$ {currentSales.pix.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">💳 Cartão</span>
                    <span className="font-bold">R$ {currentSales.cartão.toFixed(2)}</span>
                  </div>
                </div>

                <button 
                  onClick={handleClose}
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-xl transition-all shadow-md"
                >
                  Fechar Caixa
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar / History Summary */}
          <div className="space-y-6">
            <h3 className="font-bold text-xl text-orange-900">Histórico Recente</h3>
            <div className="space-y-4">
              {sessionHistory.length === 0 ? (
                <p className="text-gray-400 italic text-sm">Nenhum registro anterior.</p>
              ) : (
                sessionHistory.slice(0, 5).map(session => (
                  <div key={session.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded uppercase">
                        {new Date(session.openedAt).toLocaleDateString()}
                      </span>
                      <span className="text-xs font-bold text-orange-600">
                        R$ {(session.finalBalance || 0).toFixed(2)}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-400">
                      {new Date(session.openedAt).toLocaleTimeString()} - {session.closedAt ? new Date(session.closedAt).toLocaleTimeString() : '...'}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashierManagement;
