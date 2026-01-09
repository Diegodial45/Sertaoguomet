
import React, { useState } from 'react';
import { MenuItem } from '../types';

interface StockManagementProps {
  menu: MenuItem[];
  onUpdateStock: (id: string, amount: number) => void;
  onAddItem: (item: Omit<MenuItem, 'id'>) => void;
  onRemoveItem: (id: string) => void;
  onBack: () => void;
}

const StockManagement: React.FC<StockManagementProps> = ({ menu, onUpdateStock, onAddItem, onRemoveItem, onBack }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newItem, setNewItem] = useState<Omit<MenuItem, 'id'>>({
    name: '',
    description: '',
    price: 0,
    category: 'pratos',
    image: 'https://picsum.photos/seed/new/400/300',
    stock: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || newItem.price <= 0) return;
    onAddItem(newItem);
    setIsAddModalOpen(false);
    setNewItem({
      name: '',
      description: '',
      price: 0,
      category: 'pratos',
      image: 'https://picsum.photos/seed/new/400/300',
      stock: 0
    });
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 rounded-full hover:bg-orange-100 text-orange-600 transition-colors"
            title="Voltar ao Início"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h2 className="text-3xl font-bold text-orange-800">Controle de Estoque</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-orange-100 text-orange-700 px-4 py-2 rounded-lg text-sm font-bold border border-orange-200">
            {menu.length} Itens no Catálogo
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-bold shadow-md transition-colors flex items-center gap-2"
          >
            <span>➕</span> Novo Item
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-orange-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-orange-50 border-b border-orange-100">
              <tr>
                <th className="px-6 py-4 font-bold text-orange-900 uppercase text-xs tracking-wider">Item</th>
                <th className="px-6 py-4 font-bold text-orange-900 uppercase text-xs tracking-wider">Categoria</th>
                <th className="px-6 py-4 font-bold text-orange-900 uppercase text-xs tracking-wider text-center">Em Estoque</th>
                <th className="px-6 py-4 font-bold text-orange-900 uppercase text-xs tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {menu.map(item => (
                <tr key={item.id} className="hover:bg-orange-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <img src={item.image} className="w-10 h-10 rounded-lg object-cover" />
                      <div>
                        <span className="font-semibold text-gray-800 block">{item.name}</span>
                        <span className="text-xs text-orange-600 font-bold">R$ {item.price.toFixed(2)}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-[10px] uppercase font-bold">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`font-bold text-lg ${item.stock < 10 ? 'text-red-500' : 'text-gray-700'}`}>
                      {item.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end items-center space-x-2">
                      <div className="flex space-x-1 border-r pr-2 mr-2 border-gray-200">
                        <button 
                          onClick={() => onUpdateStock(item.id, -1)}
                          className="w-8 h-8 rounded bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200"
                        >
                          -1
                        </button>
                        <button 
                          onClick={() => onUpdateStock(item.id, 1)}
                          className="w-8 h-8 rounded bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200"
                        >
                          +1
                        </button>
                      </div>
                      <button 
                        onClick={() => {
                          if (confirm(`Tem certeza que deseja remover "${item.name}" do cardápio?`)) {
                            onRemoveItem(item.id);
                          }
                        }}
                        className="w-8 h-8 rounded bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                        title="Remover Item"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Item Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-orange-100 animate-in fade-in zoom-in duration-200">
            <div className="bg-orange-600 p-6 text-white flex justify-between items-center">
              <h3 className="text-xl font-bold">Adicionar Novo Item ao Cardápio</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-white hover:rotate-90 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome do Prato</label>
                  <input 
                    required
                    type="text" 
                    value={newItem.name}
                    onChange={e => setNewItem({...newItem, name: e.target.value})}
                    placeholder="Ex: Buchada de Bode Especial"
                    className="w-full px-4 py-2 rounded-xl border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Preço (R$)</label>
                  <input 
                    required
                    type="number" 
                    step="0.01"
                    value={newItem.price}
                    onChange={e => setNewItem({...newItem, price: parseFloat(e.target.value)})}
                    className="w-full px-4 py-2 rounded-xl border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Estoque Inicial</label>
                  <input 
                    required
                    type="number" 
                    value={newItem.stock}
                    onChange={e => setNewItem({...newItem, stock: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 rounded-xl border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Categoria</label>
                  <select 
                    value={newItem.category}
                    onChange={e => setNewItem({...newItem, category: e.target.value as any})}
                    className="w-full px-4 py-2 rounded-xl border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                  >
                    <option value="entradas">Entradas</option>
                    <option value="pratos">Pratos Principais</option>
                    <option value="sobremesas">Sobremesas</option>
                    <option value="bebidas">Bebidas</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Descrição</label>
                  <textarea 
                    value={newItem.description}
                    onChange={e => setNewItem({...newItem, description: e.target.value})}
                    rows={2}
                    className="w-full px-4 py-2 rounded-xl border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">URL da Imagem</label>
                  <input 
                    type="url" 
                    value={newItem.image}
                    onChange={e => setNewItem({...newItem, image: e.target.value})}
                    className="w-full px-4 py-2 rounded-xl border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button 
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-gray-300 font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-orange-600 text-white font-bold shadow-lg hover:bg-orange-700 transition-colors"
                >
                  Criar Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockManagement;
