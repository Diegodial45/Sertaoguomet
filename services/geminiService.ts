
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getDishRecommendation(userPreference: string, menuItems: any[]) {
  const menuStr = menuItems.map(item => `${item.name}: ${item.description} (R$ ${item.price})`).join('\n');
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Com base no seguinte menu do restaurante "Sertão Gourmet":\n${menuStr}\n\nO cliente diz: "${userPreference}". Recomende 2 ou 3 pratos e explique o porquê de forma atraente e curta.`,
    config: {
      temperature: 0.7,
      systemInstruction: "Você é um garçom digital simpático e especialista na culinária do sertão brasileiro. Fale de forma acolhedora."
    }
  });

  return response.text;
}
