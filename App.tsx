
import React, { useState, useEffect } from 'react';
import { MenuItem, CartItem, Order, ViewState, PaymentMethod, CashierSession, User, FooterConfig } from './types';
import { INITIAL_MENU } from './constants';
import MenuCard from './components/MenuCard';
import AdminPanel from './components/AdminPanel';
import AIAssistant from './components/AIAssistant';
import QuickSell from './components/QuickSell';
import StockManagement from './components/StockManagement';
import CashierManagement from './components/CashierManagement';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('home');
  const [menu, setMenu] = useState<MenuItem[]>(INITIAL_MENU);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeCategory, setActiveCategory] = useState<MenuItem['category'] | 'todos'>('todos');
  
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

  const openCashier = (initialBalance: number) => {
    const newSession: CashierSession = {
      id: Math.random().toString(36).substr(2, 9),
      openedAt: Date.now(),
      initialBalance,
      sales: { dinheiro: 0, pix: 0, cartão: 0 },
      isOpen: true
    };
    setCurrentSession(newSession);
    alert('Caixa aberto com sucesso! Boas vendas. 🌵');
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
        if (existing.quantity >= item.stock) return prev;
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
      id: Math.random().toString(36).substr(2, 9),
      items: [...cart],
      total: cart.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0),
      status: 'pending',
      customerName: 'Cliente ' + Math.floor(Math.random() * 100),
      tableNumber: '08',
      timestamp: Date.now(),
      type: 'table'
    };
    updateGlobalStock(cart);
    setOrders([newOrder, ...orders]);
    setCart([]);
    setView('menu');
    alert('Pedido enviado! 🌵');
  };

  const handleQuickSale = (items: CartItem[], total: number, method: PaymentMethod) => {
    if (!currentSession) {
      alert('Abra o caixa primeiro.');
      setView('caixa');
      return;
    }
    const newOrder: Order = {
      id: Math.random().toString(36).substr(2, 9),
      items: [...items],
      total: total,
      status: 'delivered', 
      customerName: 'Venda Rápida',
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

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-orange-600 text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setView('home')}>
            <span className="text-3xl">🌵</span>
            <h1 className="text-2xl font-bold tracking-tight">{footerConfig.brandName}</h1>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <button onClick={() => setView('menu')} className="text-sm">Cardápio</button>
            <button onClick={() => setView('quick-sell')} className="text-sm bg-orange-500 px-3 py-1 rounded-lg">Venda Rápida</button>
            <button onClick={() => setView('caixa')} className="text-sm flex items-center gap-1">💰 Caixa {currentSession && <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>}</button>
            <button onClick={() => setView('stock')} className="text-sm">Estoque</button>
            <button onClick={() => setView('admin')} className="text-sm">Admin</button>
          </nav>
          <button onClick={() => setView('cart')} className="relative bg-orange-700 p-2 rounded-full">
            🛒 {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-white text-orange-600 text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">{cart.reduce((a, b) => a + b.quantity, 0)}</span>}
          </button>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        {view === 'home' && (
          <div className="text-center py-12">
            <h2 className="text-5xl font-extrabold text-orange-900 mb-6 leading-tight">O melhor tempero do sertão na sua mesa.</h2>
            <p className="text-xl text-orange-800 mb-10 leading-relaxed">{footerConfig.description}</p>
            <div className="flex flex-wrap justify-center gap-4">
              <button onClick={() => setView('menu')} className="bg-orange-600 text-white font-bold py-4 px-12 rounded-full shadow-lg">Cardápio Digital</button>
              <button onClick={() => setView('quick-sell')} className="bg-white text-orange-600 border-2 border-orange-600 font-bold py-4 px-12 rounded-full shadow-lg">PDV</button>
            </div>
          </div>
        )}

        {view === 'menu' && (
          <div>
            <h2 className="text-3xl font-bold text-orange-800 mb-8">Cardápio</h2>
            <div className="flex space-x-2 mb-8 overflow-x-auto">
              {['todos', 'entradas', 'pratos', 'sobremesas', 'bebidas'].map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat as any)} className={`px-6 py-2 rounded-full font-semibold ${activeCategory === cat ? 'bg-orange-600 text-white' : 'bg-white border border-orange-200 text-orange-700'}`}>{cat}</button>
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
        {view === 'admin' && <AdminPanel orders={orders} onUpdateStatus={handleUpdateStatus} onBack={() => setView('home')} users={users} onAddUser={addUser} onRemoveUser={removeUser} footerConfig={footerConfig} onUpdateFooter={setFooterConfig} />}
        
        {view === 'cart' && (
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-bold mb-8">Seu Carrinho</h2>
            {cart.map(item => (
              <div key={item.id} className="flex justify-between py-2 border-b">
                <span>{item.quantity}x {item.name}</span>
                <div className="flex gap-2">
                  <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 border rounded">-</button>
                  <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 border rounded">+</button>
                  <button onClick={() => removeFromCart(item.id)} className="text-red-500 ml-4">🗑️</button>
                </div>
              </div>
            ))}
            <div className="mt-8 text-2xl font-bold flex justify-between">
              <span>Total:</span>
              <span className="text-orange-600">R$ {cart.reduce((a, b) => a + (b.price * b.quantity), 0).toFixed(2)}</span>
            </div>
            <button onClick={placeOrder} className="w-full bg-orange-600 text-white font-bold py-4 rounded-xl mt-6">Finalizar</button>
          </div>
        )}
      </main>

      <footer className="bg-orange-900 text-orange-200 py-12">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white text-xl font-bold mb-4 flex items-center">
              <span className="mr-2">🌵</span> {footerConfig.brandName}
            </h3>
            <p className="text-sm">{footerConfig.description}</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4 text-orange-500 uppercase tracking-wider text-sm">Horário</h4>
            <ul className="text-sm space-y-2">
              <li>{footerConfig.hoursWeek}</li>
              <li>{footerConfig.hoursWeekend}</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4 text-orange-500 uppercase tracking-wider text-sm">Contatos</h4>
            <ul className="text-sm space-y-2">
              <li>{footerConfig.phone}</li>
              <li>{footerConfig.email}</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4 text-orange-500 uppercase tracking-wider text-sm">Local</h4>
            <p className="text-sm">{footerConfig.address}</p>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-8 pt-8 border-t border-orange-800 text-center text-xs opacity-60">
          {footerConfig.copyright}
        </div>
      </footer>
    </div>
  );
};

export default App;
