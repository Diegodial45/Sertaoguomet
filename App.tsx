
import React, { useState, useEffect } from 'react';
import { MenuItem, CartItem, Order, ViewState, PaymentMethod, CashierSession, User, FooterConfig, AdminTab } from './types';
import { INITIAL_MENU } from './constants';
import MenuCard from './components/MenuCard';
import AdminPanel from './components/AdminPanel';
import AIAssistant from './components/AIAssistant';
import QuickSell from './components/QuickSell';
import StockManagement from './components/StockManagement';
import CashierManagement from './components/CashierManagement';

const App: React.FC = () => {
  // Persistence Loading
  const [isLoaded, setIsLoaded] = useState(false);
  const [view, setView] = useState<ViewState>('home');
  const [adminTab, setAdminTab] = useState<AdminTab>('orders');
  const [menu, setMenu] = useState<MenuItem[]>(INITIAL_MENU);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeCategory, setActiveCategory] = useState<MenuItem['category'] | 'todos'>('todos');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loginError, setLoginError] = useState('');
  
  // Cashier State
  const [currentSession, setCurrentSession] = useState<CashierSession | null>(null);
  const [sessionHistory, setSessionHistory] = useState<CashierSession[]>([]);

  // Users State
  const [users, setUsers] = useState<User[]>([
    { id: 'admin-1', login: 'admin', password: '123', role: 'admin' }
  ]);

  // Footer Settings State
  const [footerConfig, setFooterConfig] = useState<FooterConfig>({
    brandName: 'Sertão Gourmet',
    description: 'Tradição, sabor e hospitalidade em cada prato servido.',
    hoursWeek: 'Seg - Sex: 11h às 22h',
    hoursWeekend: 'Sáb - Dom: 11h às 23h',
    phone: '(81) 98888-7777',
    email: 'contato@sertaogourmet.com',
    address: 'Av. do Sol, 1234 - Recife, PE',
    copyright: '© 2024 Sertão Gourmet. Feito com paixão pelo sertão.'
  });

  // Effect: Load Data
  useEffect(() => {
    const savedMenu = localStorage.getItem('sertao_menu');
    const savedOrders = localStorage.getItem('sertao_orders');
    const savedUsers = localStorage.getItem('sertao_users');
    const savedFooter = localStorage.getItem('sertao_footer');
    const savedHistory = localStorage.getItem('sertao_history');
    const savedSession = localStorage.getItem('sertao_session');

    if (savedMenu) setMenu(JSON.parse(savedMenu));
    if (savedOrders) setOrders(JSON.parse(savedOrders));
    if (savedUsers) setUsers(JSON.parse(savedUsers));
    if (savedFooter) setFooterConfig(JSON.parse(savedFooter));
    if (savedHistory) setSessionHistory(JSON.parse(savedHistory));
    if (savedSession) setCurrentSession(JSON.parse(savedSession));
    
    setIsLoaded(true);
  }, []);

  // Effect: Save Data
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('sertao_menu', JSON.stringify(menu));
    localStorage.setItem('sertao_orders', JSON.stringify(orders));
    localStorage.setItem('sertao_users', JSON.stringify(users));
    localStorage.setItem('sertao_footer', JSON.stringify(footerConfig));
    localStorage.setItem('sertao_history', JSON.stringify(sessionHistory));
    localStorage.setItem('sertao_session', JSON.stringify(currentSession));
  }, [menu, orders, users, footerConfig, sessionHistory, currentSession, isLoaded]);

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const login = formData.get('login') as string;
    const password = formData.get('password') as string;

    const user = users.find(u => u.login === login && u.password === password);
    if (user) {
      setCurrentUser(user);
      setLoginError('');
      // Navigate to the view that was intended if possible, otherwise home
      setView('home');
    } else {
      setLoginError('Login ou senha incorretos.');
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setView('home');
  };

  const checkAuth = (targetView: ViewState, tab: AdminTab = 'orders') => {
    if (!currentUser) {
      setView('login');
      return;
    }
    setAdminTab(tab);
    setView(targetView);
  };

  const openCashier = (initialBalance: number) => {
    const newSession: CashierSession = {
      id: Math.random().toString(36).substr(2, 9),
      openedAt: Date.now(),
      initialBalance,
      sales: { dinheiro: 0, pix: 0, cartão: 0 },
      isOpen: true
    };
    setCurrentSession(newSession);
    alert('Caixa aberto com sucesso! 🌵');
  };

  const closeCashier = (finalBalance: number) => {
    if (!currentSession) return;
    const sessionSales = orders
      .filter(o => o.timestamp >= currentSession.openedAt && o.status === 'delivered' && o.paymentMethod)
      .reduce((acc, order) => {
        const method = order.paymentMethod as keyof CashierSession['sales'];
        acc[method] = (acc[method] || 0) + order.total;
        return acc;
      }, { dinheiro: 0, pix: 0, cartão: 0 });
    const closedSession: CashierSession = {
      ...currentSession,
      closedAt: Date.now(),
      finalBalance,
      sales: sessionSales,
      isOpen: false
    };
    setSessionHistory([closedSession, ...sessionHistory]);
    setCurrentSession(null);
    alert('Caixa fechado com sucesso!');
  };

  const updateGlobalStock = (items: CartItem[]) => {
    setMenu(prevMenu => prevMenu.map(menuItem => {
      const soldItem = items.find(i => i.id === menuItem.id);
      if (soldItem) return { ...menuItem, stock: Math.max(0, menuItem.stock - soldItem.quantity) };
      return menuItem;
    }));
  };

  const manualStockUpdate = (id: string, amount: number) => {
    setMenu(prev => prev.map(item => item.id === id ? { ...item, stock: Math.max(0, item.stock + amount) } : item));
  };

  const updateMenuItemImage = (id: string, newImage: string) => {
    setMenu(prev => prev.map(item => item.id === id ? { ...item, image: newImage } : item));
  };

  const addMenuItem = (item: Omit<MenuItem, 'id'>) => {
    const newItem: MenuItem = { ...item, id: Math.random().toString(36).substr(2, 9) };
    setMenu(prev => [...prev, newItem]);
  };

  const removeMenuItem = (id: string) => {
    setMenu(prev => prev.filter(item => item.id !== id));
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const addUser = (userData: Omit<User, 'id'>) => {
    const newUser: User = { ...userData, id: Math.random().toString(36).substr(2, 9) };
    setUsers(prev => [...prev, newUser]);
  };

  const removeUser = (id: string) => setUsers(prev => prev.filter(u => u.id !== id));

  const addToCart = (item: MenuItem) => {
    if (item.stock <= 0) return alert('Produto esgotado!');
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        if (existing.quantity >= item.stock) {
          alert('Estoque insuficiente para adicionar mais.');
          return prev;
        }
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => setCart(prev => prev.filter(i => i.id !== id));

  const updateQuantity = (id: string, delta: number) => {
    const menuItem = menu.find(m => m.id === id);
    setCart(prev => prev.map(i => {
      if (i.id === id) {
        let nextQty = i.quantity + delta;
        if (nextQty > (menuItem?.stock || 0)) nextQty = menuItem?.stock || 0;
        return { ...i, quantity: Math.max(1, nextQty) };
      }
      return i;
    }));
  };

  const placeOrder = () => {
    if (cart.length === 0) return;
    const newOrder: Order = {
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      items: [...cart],
      total: cart.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0),
      status: 'pending',
      customerName: 'Cliente ' + Math.floor(Math.random() * 100),
      tableNumber: (Math.floor(Math.random() * 20) + 1).toString().padStart(2, '0'),
      timestamp: Date.now(),
      type: 'table'
    };
    updateGlobalStock(cart);
    setOrders([newOrder, ...orders]);
    setCart([]);
    setView('menu');
    alert('Pedido enviado com sucesso! 🌵');
  };

  const handleQuickSale = (items: CartItem[], total: number, method: PaymentMethod) => {
    if (!currentSession) {
      alert('Abra o caixa antes de realizar vendas.');
      setView('caixa');
      return;
    }
    const newOrder: Order = {
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      items: [...items],
      total: total,
      status: 'delivered', 
      customerName: 'Venda Direta',
      tableNumber: 'Balcão',
      timestamp: Date.now(),
      paymentMethod: method,
      type: 'quick'
    };
    updateGlobalStock(items);
    setOrders([newOrder, ...orders]);
  };

  const handleUpdateStatus = (id: string, status: Order['status']) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  const filteredMenu = activeCategory === 'todos' ? menu : menu.filter(m => m.category === activeCategory);

  if (!isLoaded) return <div className="min-h-screen bg-orange-50 flex items-center justify-center font-bold text-orange-600">Carregando sistema...</div>;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-orange-600 text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setView('home')}>
            <span className="text-3xl">🌵</span>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">{footerConfig.brandName}</h1>
          </div>
          <nav className="hidden lg:flex items-center gap-6">
            <button onClick={() => setView('menu')} className={`text-sm ${view === 'menu' ? 'border-b-2 border-white font-bold' : ''}`}>Cardápio</button>
            <button onClick={() => checkAuth('quick-sell')} className={`text-sm px-3 py-1 bg-orange-500 rounded-lg hover:bg-orange-400 ${view === 'quick-sell' ? 'ring-2 ring-white font-bold' : ''}`}>Venda Rápida</button>
            <button onClick={() => checkAuth('caixa')} className={`text-sm flex items-center gap-1 ${view === 'caixa' ? 'font-bold underline' : ''}`}>💰 Caixa {currentSession && <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>}</button>
            <button onClick={() => checkAuth('stock')} className={`text-sm ${view === 'stock' ? 'font-bold underline' : ''}`}>Estoque</button>
            <button onClick={() => checkAuth('admin')} className={`text-sm ${view === 'admin' ? 'font-bold underline' : ''}`}>Admin</button>
          </nav>
          
          <div className="flex items-center gap-4">
            {currentUser && (
              <button onClick={logout} className="text-xs bg-orange-700 hover:bg-orange-800 px-3 py-1 rounded-full font-bold">Sair ({currentUser.login})</button>
            )}
            <button onClick={() => setView('cart')} className="relative bg-orange-700 p-2 rounded-full hover:bg-orange-800 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-white text-orange-600 text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">{cart.reduce((a, b) => a + b.quantity, 0)}</span>}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        {view === 'login' && (
          <div className="max-w-md mx-auto bg-white rounded-3xl shadow-xl p-8 border border-orange-100 animate-in fade-in zoom-in duration-300">
            <h2 className="text-2xl font-bold text-center text-orange-900 mb-6 uppercase tracking-wider">Acesso Restrito</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Usuário</label>
                <input name="login" type="text" className="w-full px-4 py-3 rounded-xl border border-orange-200 focus:ring-2 focus:ring-orange-500 outline-none" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Senha</label>
                <input name="password" type="password" className="w-full px-4 py-3 rounded-xl border border-orange-200 focus:ring-2 focus:ring-orange-500 outline-none" required />
              </div>
              {loginError && <p className="text-red-500 text-xs font-bold text-center">{loginError}</p>}
              <button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95">Entrar</button>
            </form>
          </div>
        )}

        {view === 'home' && (
          <div className="text-center py-12 animate-in fade-in duration-500">
            <h2 className="text-4xl md:text-5xl font-extrabold text-orange-900 mb-6 leading-tight">O melhor tempero do sertão na sua mesa.</h2>
            <p className="text-lg md:text-xl text-orange-800 mb-10 max-w-2xl mx-auto leading-relaxed">{footerConfig.description}</p>
            <div className="flex flex-wrap justify-center gap-4">
              <button onClick={() => setView('menu')} className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 px-12 rounded-full shadow-lg transform hover:-translate-y-1 transition-all">Cardápio Digital</button>
              <button onClick={() => checkAuth('quick-sell')} className="bg-white text-orange-600 border-2 border-orange-600 font-bold py-4 px-12 rounded-full shadow-lg transform hover:-translate-y-1 transition-all">Ponto de Venda</button>
            </div>
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto opacity-80">
              <div className="p-4 bg-white rounded-2xl shadow-sm border border-orange-100 flex flex-col items-center gap-2">
                <span className="text-3xl">🥘</span>
                <span className="text-xs font-bold text-orange-900 uppercase">Qualidade</span>
              </div>
              <div className="p-4 bg-white rounded-2xl shadow-sm border border-orange-100 flex flex-col items-center gap-2">
                <span className="text-3xl">🌿</span>
                <span className="text-xs font-bold text-orange-900 uppercase">Orgânico</span>
              </div>
              <div className="p-4 bg-white rounded-2xl shadow-sm border border-orange-100 flex flex-col items-center gap-2">
                <span className="text-3xl">🚛</span>
                <span className="text-xs font-bold text-orange-900 uppercase">Entrega</span>
              </div>
              <div className="p-4 bg-white rounded-2xl shadow-sm border border-orange-100 flex flex-col items-center gap-2">
                <span className="text-3xl">⭐</span>
                <span className="text-xs font-bold text-orange-900 uppercase">Destaque</span>
              </div>
            </div>
          </div>
        )}

        {view === 'menu' && (
          <div className="animate-in fade-in duration-300">
            <h2 className="text-3xl font-bold text-orange-800 mb-8 border-l-4 border-orange-600 pl-4">Cardápio do Sertão</h2>
            <div className="flex space-x-2 mb-8 overflow-x-auto pb-2">
              {['todos', 'entradas', 'pratos', 'sobremesas', 'bebidas'].map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat as any)} className={`px-6 py-2 rounded-full font-semibold transition-all whitespace-nowrap ${activeCategory === cat ? 'bg-orange-600 text-white shadow-md' : 'bg-white border border-orange-200 text-orange-700 hover:bg-orange-50'}`}>{cat.toUpperCase()}</button>
              ))}
            </div>
            <AIAssistant menuItems={menu} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredMenu.map(item => <MenuCard key={item.id} item={item} onAddToCart={addToCart} onUpdateImage={updateMenuItemImage} />)}
            </div>
          </div>
        )}

        {view === 'quick-sell' && <QuickSell menu={menu} onCompleteSale={handleQuickSale} onBack={() => setView('home')} />}
        {view === 'stock' && <StockManagement menu={menu} onUpdateStock={manualStockUpdate} onAddItem={addMenuItem} onRemoveItem={removeMenuItem} onBack={() => setView('home')} />}
        {view === 'caixa' && <CashierManagement currentSession={currentSession} sessionHistory={sessionHistory} orders={orders} onOpen={openCashier} onClose={closeCashier} onBack={() => setView('home')} />}
        {view === 'admin' && <AdminPanel orders={orders} onUpdateStatus={handleUpdateStatus} onBack={() => setView('home')} users={users} onAddUser={addUser} onRemoveUser={removeUser} footerConfig={footerConfig} onUpdateFooter={setFooterConfig} initialTab={adminTab} />}
        
        {view === 'cart' && (
          <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl p-8 border border-orange-100 animate-in slide-in-from-right-8 duration-300">
            <h2 className="text-3xl font-bold mb-8 text-gray-800">Cesta de Pedidos</h2>
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 italic mb-6">Sua cesta está vazia no momento.</p>
                <button onClick={() => setView('menu')} className="text-orange-600 font-bold hover:underline">Ir para o cardápio</button>
              </div>
            ) : (
              <>
                <div className="space-y-4 mb-8">
                  {cart.map(item => (
                    <div key={item.id} className="flex justify-between items-center py-3 border-b border-orange-50">
                      <div className="flex items-center gap-4">
                        <img src={item.image} className="w-12 h-12 rounded-lg object-cover" />
                        <div>
                          <p className="font-bold text-gray-800">{item.name}</p>
                          <p className="text-xs text-orange-600 font-bold">R$ {item.price.toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center border border-orange-200 rounded-lg bg-orange-50">
                          <button onClick={() => updateQuantity(item.id, -1)} className="px-2 py-1 hover:bg-orange-100">-</button>
                          <span className="px-3 font-bold text-sm">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="px-2 py-1 hover:bg-orange-100">+</button>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600 transition-colors">🗑️</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-orange-50 p-6 rounded-2xl mb-8">
                  <div className="text-2xl font-black flex justify-between text-gray-900 uppercase">
                    <span>Total do Pedido</span>
                    <span className="text-orange-600">R$ {cart.reduce((a, b) => a + (b.price * b.quantity), 0).toFixed(2)}</span>
                  </div>
                </div>
                <button onClick={placeOrder} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-extrabold py-5 rounded-2xl shadow-lg transition-all active:scale-95 text-xl uppercase tracking-widest">Confirmar Pedido 🌵</button>
              </>
            )}
          </div>
        )}
      </main>

      <footer className="bg-orange-900 text-orange-200 py-12 relative group mt-12">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="relative">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white text-xl font-bold flex items-center">
                <span className="mr-2">🌵</span> {footerConfig.brandName}
              </h3>
              <button onClick={() => checkAuth('admin', 'settings')} className="opacity-0 group-hover:opacity-100 p-1 text-[10px] bg-orange-800 rounded hover:bg-orange-700 transition-opacity uppercase font-bold">Editar</button>
            </div>
            <p className="text-xs leading-relaxed opacity-80">{footerConfig.description}</p>
          </div>
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-white font-semibold text-orange-500 uppercase tracking-wider text-[10px]">Funcionamento</h4>
              <button onClick={() => checkAuth('admin', 'settings')} className="opacity-0 group-hover:opacity-100 p-1 text-[10px] bg-orange-800 rounded hover:bg-orange-700 transition-opacity uppercase font-bold">Editar</button>
            </div>
            <ul className="text-xs space-y-2 opacity-80">
              <li>{footerConfig.hoursWeek}</li>
              <li>{footerConfig.hoursWeekend}</li>
            </ul>
          </div>
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-white font-semibold text-orange-500 uppercase tracking-wider text-[10px]">Contatos</h4>
              <button onClick={() => checkAuth('admin', 'settings')} className="opacity-0 group-hover:opacity-100 p-1 text-[10px] bg-orange-800 rounded hover:bg-orange-700 transition-opacity uppercase font-bold">Editar</button>
            </div>
            <ul className="text-xs space-y-2 opacity-80">
              <li>{footerConfig.phone}</li>
              <li>{footerConfig.email}</li>
            </ul>
          </div>
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-white font-semibold text-orange-500 uppercase tracking-wider text-[10px]">Localização</h4>
              <button onClick={() => checkAuth('admin', 'settings')} className="opacity-0 group-hover:opacity-100 p-1 text-[10px] bg-orange-800 rounded hover:bg-orange-700 transition-opacity uppercase font-bold">Editar</button>
            </div>
            <p className="text-xs leading-relaxed opacity-80">{footerConfig.address}</p>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-8 pt-8 border-t border-orange-800 text-center text-[10px] opacity-40 uppercase font-bold tracking-widest">
          {footerConfig.copyright}
        </div>
        
        <button onClick={() => checkAuth('admin', 'settings')} className="absolute bottom-4 right-4 bg-orange-600 hover:bg-orange-500 text-white p-3 rounded-full shadow-2xl transition-all transform hover:scale-110 active:scale-90 opacity-0 group-hover:opacity-100">
          <span>⚙️</span>
        </button>
      </footer>
    </div>
  );
};

export default App;
