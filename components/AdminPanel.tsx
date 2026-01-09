
import React, { useState } from 'react';
import { Order, User, FooterConfig } from '../types';

interface AdminPanelProps {
  orders: Order[];
  onUpdateStatus: (orderId: string, newStatus: Order['status']) => void;
  onBack: () => void;
  users: User[];
  onAddUser: (user: Omit<User, 'id'>) => void;
  onRemoveUser: (id: string) => void;
  footerConfig: FooterConfig;
  onUpdateFooter: (config: FooterConfig) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  orders, 
  onUpdateStatus, 
  onBack, 
  users, 
  onAddUser, 
  onRemoveUser,
  footerConfig,
  onUpdateFooter
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'users' | 'settings'>('orders');
  
  // User states
  const [newLogin, setNewLogin] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<User['role']>('atendente');

  // Settings states
  const [tempFooter, setTempFooter] = useState<FooterConfig>({ ...footerConfig });

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLogin || !newPassword) return;
    onAddUser({
      login: newLogin,
      password: newPassword,
      role: newRole
    });
    setNewLogin('');
    setNewPassword('');
    alert('Usuário criado com sucesso!');
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateFooter(tempFooter);
    alert('Informações do rodapé atualizadas com sucesso!');
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
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
          <h2 className="text-3xl font-bold text-orange-800">Painel Administrativo</h2>
        </div>

        <div className="flex bg-orange-100 p-1 rounded-xl overflow-x-auto max-w-full">
          <button 
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'orders' ? 'bg-orange-600 text-white shadow' : 'text-orange-700 hover:bg-orange-200'}`}
          >
            Pedidos
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'users' ? 'bg-orange-600 text-white shadow' : 'text-orange-700 hover:bg-orange-200'}`}
          >
            Usuários
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'settings' ? 'bg-orange-600 text-white shadow' : 'text-orange-700 hover:bg-orange-200'}`}
          >
            ⚙️ Letreiros & Rodapé
          </button>
        </div>
      </div>
      
      {activeTab === 'orders' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-orange-500">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg">
                    {order.type === 'quick' ? 'Venda Direta' : `Mesa ${order.tableNumber}`}
                  </h3>
                  <p className="text-gray-500 text-sm">{new Date(order.timestamp).toLocaleTimeString()}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                  order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  order.status === 'preparing' ? 'bg-blue-100 text-blue-700' :
                  order.status === 'ready' ? 'bg-green-100 text-green-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {order.status === 'pending' ? 'Pendente' :
                   order.status === 'preparing' ? 'Preparando' :
                   order.status === 'ready' ? 'Pronto' : 'Entregue'}
                </span>
              </div>
              
              <div className="space-y-2 mb-4">
                {order.items.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-700">{item.quantity}x {item.name}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 flex justify-between items-center mb-4 font-bold text-orange-600">
                <span>Total: R$ {order.total.toFixed(2)}</span>
              </div>

              <div className="flex flex-wrap gap-2">
                <button onClick={() => onUpdateStatus(order.id, 'preparing')} className="text-[10px] bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded">Preparar</button>
                <button onClick={() => onUpdateStatus(order.id, 'ready')} className="text-[10px] bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded">Pronto</button>
                <button onClick={() => onUpdateStatus(order.id, 'delivered')} className="text-[10px] bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded">Entregue</button>
              </div>
            </div>
          ))}
          {orders.length === 0 && <div className="col-span-full text-center py-20 text-gray-500 bg-white rounded-3xl border border-dashed border-gray-300">Nenhum pedido recebido ainda.</div>}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-3xl shadow-lg p-8 border border-orange-100 h-fit">
            <h3 className="text-xl font-bold text-gray-800 mb-6">👤 Novo Usuário</h3>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <input type="text" value={newLogin} onChange={e => setNewLogin(e.target.value)} placeholder="Login" className="w-full px-4 py-2 rounded-xl border border-orange-200" required />
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Senha" className="w-full px-4 py-2 rounded-xl border border-orange-200" required />
              <select value={newRole} onChange={e => setNewRole(e.target.value as any)} className="w-full px-4 py-2 rounded-xl border border-orange-200 bg-white">
                <option value="atendente">Atendente</option>
                <option value="cozinha">Cozinha</option>
                <option value="admin">Administrador</option>
              </select>
              <button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl">Cadastrar</button>
            </form>
          </div>
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xl font-bold text-orange-900 mb-4">Usuários Cadastrados</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {users.map(user => (
                <div key={user.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
                  <div><h4 className="font-bold">{user.login}</h4><span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded uppercase">{user.role}</span></div>
                  <button onClick={() => onRemoveUser(user.id)} className="text-red-400 p-2">🗑️</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="bg-white rounded-3xl shadow-lg p-8 border border-orange-100">
          <h3 className="text-2xl font-bold text-orange-900 mb-8 border-b pb-4">⚙️ Configurações de Letreiros e Informações</h3>
          
          <form onSubmit={handleSaveSettings} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              
              {/* Group 1: Identidade */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <span className="bg-orange-100 p-1 rounded">🏷️</span> Identidade e Slogan
                </h4>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 ml-1">Nome do Restaurante</label>
                  <input type="text" value={tempFooter.brandName} onChange={e => setTempFooter({...tempFooter, brandName: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-orange-200 focus:ring-2 focus:ring-orange-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 ml-1">Descrição / Slogan</label>
                  <textarea value={tempFooter.description} onChange={e => setTempFooter({...tempFooter, description: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-orange-200 focus:ring-2 focus:ring-orange-500 outline-none" rows={3} />
                </div>
              </div>

              {/* Group 2: Horário (Hora) */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <span className="bg-orange-100 p-1 rounded">⏰</span> Funcionamento (Horários)
                </h4>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 ml-1">Dias de Semana</label>
                  <input type="text" value={tempFooter.hoursWeek} onChange={e => setTempFooter({...tempFooter, hoursWeek: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-orange-200 focus:ring-2 focus:ring-orange-500 outline-none" placeholder="Ex: Seg - Sex: 11h às 22h" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 ml-1">Finais de Semana</label>
                  <input type="text" value={tempFooter.hoursWeekend} onChange={e => setTempFooter({...tempFooter, hoursWeekend: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-orange-200 focus:ring-2 focus:ring-orange-500 outline-none" placeholder="Ex: Sáb - Dom: 11h às 23h" />
                </div>
              </div>

              {/* Group 3: Contato */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <span className="bg-orange-100 p-1 rounded">📞</span> Contatos
                </h4>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 ml-1">Telefone / WhatsApp</label>
                  <input type="text" value={tempFooter.phone} onChange={e => setTempFooter({...tempFooter, phone: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-orange-200 focus:ring-2 focus:ring-orange-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 ml-1">E-mail de Suporte</label>
                  <input type="email" value={tempFooter.email} onChange={e => setTempFooter({...tempFooter, email: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-orange-200 focus:ring-2 focus:ring-orange-500 outline-none" />
                </div>
              </div>

              {/* Group 4: Localização */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <span className="bg-orange-100 p-1 rounded">📍</span> Localização
                </h4>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 ml-1">Endereço Completo</label>
                  <input type="text" value={tempFooter.address} onChange={e => setTempFooter({...tempFooter, address: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-orange-200 focus:ring-2 focus:ring-orange-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 ml-1">Direitos Autorais (Copyright)</label>
                  <input type="text" value={tempFooter.copyright} onChange={e => setTempFooter({...tempFooter, copyright: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-orange-200 focus:ring-2 focus:ring-orange-500 outline-none" />
                </div>
              </div>

            </div>

            <div className="pt-8 border-t border-gray-100">
              <button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white font-extrabold py-5 rounded-2xl shadow-xl transition-all transform hover:-translate-y-1 active:scale-95 text-lg">
                Atualizar Letreiros e Rodapé 🚀
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
