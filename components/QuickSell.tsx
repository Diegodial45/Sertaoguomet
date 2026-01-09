
import React, { useState, useMemo } from 'react';
import { MenuItem, CartItem, PaymentMethod } from '../types';

interface QuickSellProps {
  menu: MenuItem[];
  onCompleteSale: (items: CartItem[], total: number, method: PaymentMethod) => void;
  onBack: () => void;
}

const QuickSell: React.FC<QuickSellProps> = ({ menu, onCompleteSale, onBack }) => {
  const [currentSale, setCurrentSale] = useState<CartItem[]>([]);
  const [isCalcOpen, setIsCalcOpen] = useState(false);
  const [receivedAmount, setReceivedAmount] = useState('');

  const addToSale = (item: MenuItem) => {
    if (item.stock <= 0) {
      alert('Produto sem estoque!');
      return;
    }
    
    setCurrentSale(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        if (existing.quantity >= item.stock) {
          alert('Estoque insuficiente!');
          return prev;
        }
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromSale = (id: string) => {
    setCurrentSale(prev => prev.filter(i => i.id !== id));
  };

  const total = useMemo(() => currentSale.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0), [currentSale]);

  const change = useMemo(() => {
    const received = parseFloat(receivedAmount) || 0;
    return Math.max(0, received - total);
  }, [receivedAmount, total]);

  const handlePayment = (method: PaymentMethod) => {
    if (currentSale.length === 0) return;
    onCompleteSale(currentSale, total, method);
    setCurrentSale([]);
    setIsCalcOpen(false);
    setReceivedAmount('');
    alert(`Venda finalizada com ${method.toUpperCase()}!`);
  };

  const appendDigit = (digit: string) => {
    setReceivedAmount(prev => prev + digit);
  };

  const clearCalc = () => {
    setReceivedAmount('');
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full min-h-[600px] relative">
      {/* Products Grid */}
      <div className="flex-1">
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={onBack}
            className="p-2 rounded-full hover:bg-orange-100 text-orange-600 transition-colors"
            title="Voltar ao Início"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h2 className="text-2xl font-bold text-orange-800">Venda Rápida</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {menu.map(item => (
            <button
              key={item.id}
              onClick={() => addToSale(item)}
              disabled={item.stock <= 0}
              className={`p-4 rounded-xl border-2 transition-all text-left flex flex-col justify-between h-32 ${
                item.stock > 0 
                ? 'border-orange-200 bg-white hover:border-orange-500 hover:shadow-md' 
                : 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
              }`}
            >
              <div>
                <span className="font-bold text-gray-800 block text-sm sm:text-base leading-tight">{item.name}</span>
                <span className="text-xs text-gray-500">Stock: {item.stock}</span>
              </div>
              <span className="text-orange-600 font-bold">R$ {item.price.toFixed(2)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Checkout Sidebar */}
      <div className="w-full lg:w-96 bg-white rounded-2xl shadow-xl p-6 border border-orange-100 flex flex-col">
        <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Ticket Atual</h3>
        
        <div className="flex-1 overflow-y-auto space-y-3 mb-6 min-h-[200px]">
          {currentSale.length === 0 ? (
            <p className="text-gray-400 text-center mt-10 italic">Nenhum item selecionado</p>
          ) : (
            currentSale.map(item => (
              <div key={item.id} className="flex justify-between items-center text-sm">
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{item.quantity}x {item.name}</p>
                  <p className="text-gray-500 text-xs">R$ {(item.price * item.quantity).toFixed(2)}</p>
                </div>
                <button 
                  onClick={() => removeFromSale(item.id)}
                  className="text-red-400 hover:text-red-600 p-1"
                >
                  &times;
                </button>
              </div>
            ))
          )}
        </div>

        <div className="border-t pt-4 mb-6">
          <div className="flex justify-between items-center text-2xl font-black text-gray-900">
            <span>TOTAL</span>
            <span className="text-orange-600">R$ {total.toFixed(2)}</span>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest text-center">Pagamento</p>
          <div className="grid grid-cols-1 gap-2">
            <div className="flex gap-2">
              <button 
                onClick={() => handlePayment('dinheiro')}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                💵 Dinheiro
              </button>
              <button 
                onClick={() => setIsCalcOpen(true)}
                className="bg-orange-100 hover:bg-orange-200 text-orange-700 font-bold px-4 rounded-xl transition-colors flex items-center justify-center"
                title="Calculadora de Troco"
              >
                🧮 Troco
              </button>
            </div>
            <button 
              onClick={() => handlePayment('pix')}
              className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              📱 Pix
            </button>
            <button 
              onClick={() => handlePayment('cartão')}
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              💳 Cartão
            </button>
          </div>
        </div>
      </div>

      {/* Troco Calculator Modal */}
      {isCalcOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border border-orange-100 animate-in fade-in zoom-in duration-200">
            <div className="bg-orange-600 p-6 text-white text-center">
              <h4 className="text-lg font-bold opacity-80 uppercase tracking-widest mb-1">Calculadora de Troco</h4>
              <div className="text-4xl font-black">R$ {total.toFixed(2)}</div>
              <p className="text-xs opacity-75 mt-1 text-orange-100">Valor total da compra</p>
            </div>
            
            <div className="p-6 bg-orange-50">
              <div className="bg-white rounded-2xl p-4 shadow-inner border border-orange-200 mb-6">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-gray-400 uppercase">Recebido</span>
                  <button onClick={clearCalc} className="text-xs text-orange-600 font-bold hover:underline">Limpar</button>
                </div>
                <div className="text-3xl font-bold text-gray-800 text-right">
                  R$ {receivedAmount || '0.00'}
                </div>
                <div className="mt-4 pt-4 border-t border-dashed border-orange-200 flex justify-between items-center">
                  <span className="text-sm font-bold text-orange-800">Troco:</span>
                  <span className="text-2xl font-black text-green-600">R$ {change.toFixed(2)}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-6">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '.', '00'].map(d => (
                  <button
                    key={d}
                    onClick={() => appendDigit(d)}
                    className="h-12 rounded-xl bg-white border border-orange-200 text-xl font-bold text-gray-700 hover:bg-orange-100 hover:border-orange-300 transition-all active:scale-95"
                  >
                    {d}
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setIsCalcOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-gray-300 font-bold text-gray-500 hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => handlePayment('dinheiro')}
                  disabled={currentSale.length === 0 || (parseFloat(receivedAmount) || 0) < total}
                  className="flex-[2] py-3 rounded-xl bg-green-600 text-white font-bold shadow-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirmar Recebimento
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickSell;
