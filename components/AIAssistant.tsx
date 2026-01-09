
import React, { useState } from 'react';
import { getDishRecommendation } from '../services/geminiService';
import { MenuItem } from '../types';

interface AIAssistantProps {
  menuItems: MenuItem[];
}

const AIAssistant: React.FC<AIAssistantProps> = ({ menuItems }) => {
  const [query, setQuery] = useState('');
  const [recommendation, setRecommendation] = useState<string | undefined>('');
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const rec = await getDishRecommendation(query, menuItems);
      setRecommendation(rec);
    } catch (error) {
      console.error(error);
      setRecommendation("Desculpe, meu 'oxente' falhou. Tente novamente mais tarde!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-orange-100 p-6 rounded-2xl shadow-inner mb-8 border border-orange-200">
      <h3 className="text-xl font-bold text-orange-800 mb-2 flex items-center">
        <span className="mr-2">🌵</span> Assistente do Sertão
      </h3>
      <p className="text-orange-700 mb-4 text-sm">Me diga o que você está com vontade de comer hoje!</p>
      
      <div className="flex gap-2 mb-4">
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ex: Quero algo leve com peixe ou queijo..."
          className="flex-1 px-4 py-2 rounded-lg border border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <button 
          onClick={handleAsk}
          disabled={loading}
          className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors disabled:bg-orange-400"
        >
          {loading ? 'Pensando...' : 'Pedir Dica'}
        </button>
      </div>

      {recommendation && (
        <div className="bg-white p-4 rounded-lg border border-orange-200 text-orange-900 whitespace-pre-wrap italic">
          {recommendation}
        </div>
      )}
    </div>
  );
};

export default AIAssistant;
