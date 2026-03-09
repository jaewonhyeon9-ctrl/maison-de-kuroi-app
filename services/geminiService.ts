
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { PLEntry } from "../types";

let aiClient: GoogleGenAI | null = null;

const getAI = () => {
  if (!aiClient) {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("API 키를 설정해주세요 (VITE_GEMINI_API_KEY).");
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
};

// Using gemini-3.1-pro-preview for complex financial reasoning tasks
export const analyzeFinancials = async (entries: PLEntry[]) => {
  if (!entries || entries.length === 0) return null;
  
  const summaryString = entries.map(e => 
    `${e.date}: [${e.type}] ${e.category} - ${e.amount.toLocaleString()}원 (${e.description})`
  ).join('\n');

  const prompt = `
    당신은 대한민국 최고의 식당 경영 컨설턴트입니다. 다음은 어느 식당의 최근 손익 데이터입니다:
    
    ${summaryString}
    
    이 데이터를 바탕으로 식당 사장님께 드릴 전문적인 분석 보고서를 JSON 형식으로 작성하세요. 
    응답 형식(JSON):
    1. executiveSummary: 전반적인 재무 상태 요약.
    2. keyInsights: 주요 특징 3가지 (문자열 배열).
    3. optimizationTips: 수익성 향상 팁 3가지 (문자열 배열).
    4. riskFactors: 잠재적 위험 요소 (문자열 배열).
  `;

  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            executiveSummary: { type: Type.STRING },
            keyInsights: { type: Type.ARRAY, items: { type: Type.STRING } },
            optimizationTips: { type: Type.ARRAY, items: { type: Type.STRING } },
            riskFactors: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["executiveSummary", "keyInsights", "optimizationTips", "riskFactors"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("AI response is empty");
    
    // Clean up markdown formatting if present
    const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};

// Using gemini-3-flash-preview for OCR and image analysis
export const analyzeReceipt = async (base64Image: string, mimeType: string) => {
  const prompt = `
    이 영수증/거래명세서 이미지에서 다음 정보를 추출하여 JSON 형식으로 응답하세요:
    1. amount: 합계 금액 (숫자만)
    2. date: 결제일 또는 발행일 (YYYY-MM-DD 형식)
    3. category: 다음 중 가장 적절한 카테고리 하나 선택 ['식자재', '인건비', '월세', '관리비', '비고정지출', '판매수수료', '기타매출']
    4. description: 가맹점명 및 주요 품목 요약
    5. type: '지출' (기본값)
    6. vendorName: 거래처명/가맹점명 (문자열, 파악 불가시 빈 문자열)
    7. products: 영수증에 기재된 구매 품목들을 배열로 추출하세요. (최대 10개)
       - name: 품목명 (예: 양파, 삼겹살)
       - quantity: 수량 (숫자, 파악 불가시 1)
       - totalPrice: 해당 품목의 총 결제 금액 (숫자)
       - weightInGrams: 품목명이나 규격에 중량이 표시된 경우, 이를 그램(g) 단위 숫자로 변환 (예: '삼겹살 500g' -> 500, '양파 1kg' -> 1000). 파악 불가시 생략.
  `;

  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType
            }
          },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            amount: { type: Type.NUMBER },
            date: { type: Type.STRING },
            category: { type: Type.STRING },
            description: { type: Type.STRING },
            type: { type: Type.STRING },
            vendorName: { type: Type.STRING },
            products: { 
              type: Type.ARRAY, 
              items: { 
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  quantity: { type: Type.NUMBER },
                  totalPrice: { type: Type.NUMBER },
                  weightInGrams: { type: Type.NUMBER }
                },
                required: ["name", "quantity", "totalPrice"]
              } 
            }
          },
          required: ["amount", "date", "category", "description", "type", "vendorName", "products"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Receipt analysis response is empty");
    
    // Clean up markdown formatting if present
    const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Receipt Analysis Error:", error);
    throw error;
  }
};
