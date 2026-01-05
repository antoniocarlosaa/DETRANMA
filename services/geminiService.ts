
import { GoogleGenAI, Type } from "@google/genai";
import { GeminiParsingResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function parseDetranText(apiRawResult: string): Promise<GeminiParsingResult> {
  if (!apiRawResult || apiRawResult.trim() === "") {
    return {
      success: false,
      error: "Nenhum dado foi fornecido para análise."
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Você recebeu um retorno (bruto ou texto copiado) de uma consulta de débitos do DETRAN Maranhão. Sua missão é estruturar esses dados.
      
      REGRAS:
      1. Identifique o Proprietário e o Modelo do Veículo.
      2. Liste TODOS os débitos (IPVA, Multas, Licenciamento, Taxas).
      3. Extraia o valor numérico exato de cada um (remova 'R$', use ponto para decimais).
      4. Formate as datas como DD/MM/AAAA.
      5. Se for uma lista vazia ou "Nada Consta", retorne itens vazios.
      
      CONTEÚDO PARA ANÁLISE:
      ${apiRawResult}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            ownerName: { type: Type.STRING },
            vehicleModel: { type: Type.STRING },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  description: { type: Type.STRING },
                  category: { type: Type.STRING },
                  value: { type: Type.NUMBER },
                  dueDate: { type: Type.STRING }
                },
                required: ["description", "category", "value"]
              }
            }
          },
          required: ["ownerName", "vehicleModel", "items"]
        }
      }
    });

    return {
      success: true,
      data: JSON.parse(response.text)
    };
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      success: false,
      error: "A IA não conseguiu ler esses dados. Verifique se copiou o conteúdo corretamente."
    };
  }
}
