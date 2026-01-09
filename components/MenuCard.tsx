
import React, { useRef } from 'react';
import { MenuItem } from '../types';

interface MenuCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem) => void;
  onUpdateImage?: (id: string, newImage: string) => void;
}

const MenuCard: React.FC<MenuCardProps> = ({ item, onAddToCart, onUpdateImage }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUpdateImage) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateImage(item.id, reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow flex flex-col group">
      <div className="relative h-48 w-full overflow-hidden">
        <img src={item.image} alt={item.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
        
        {/* Update Image Button */}
        {onUpdateImage && (
          <>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange}
            />
            <button 
              onClick={handleImageClick}
              className="absolute top-2 right-2 bg-orange-600/80 hover:bg-orange-600 text-white p-2 rounded-full shadow-lg backdrop-blur-sm transition-all transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
              title="Inserir/Trocar Imagem"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </>
        )}

        <div className="absolute bottom-0 left-0 bg-gradient-to-t from-black/60 to-transparent w-full p-4">
           <span className="text-white text-xs font-bold bg-orange-500 px-2 py-0.5 rounded uppercase">
            {item.category}
          </span>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-lg text-gray-800 mb-1">{item.name}</h3>
          <p className="text-gray-600 text-sm line-clamp-2 mb-2">{item.description}</p>
          <p className="text-xs text-gray-400">Estoque: {item.stock} un.</p>
        </div>
        <div className="flex items-center justify-between mt-4">
          <span className="text-orange-600 font-bold text-xl">
            R$ {item.price.toFixed(2)}
          </span>
          <button 
            onClick={() => onAddToCart(item)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors text-sm font-semibold flex items-center gap-2"
          >
            <span>🛒</span> Adicionar
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuCard;
