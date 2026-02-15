
import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysisResult, RoleMapping, User } from "../types.ts";
import { TEAM_MEMBERS } from "../constants.ts";

// Basic Text Task - uses gemini-3-flash-preview
export const performPureAnalysis = async (
  input: string,
  image?: { data: string, mimeType: string }
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const parts: any[] = [];
  if (image) {
    parts.push({
      inlineData: { data: image.data, mimeType: image.mimeType },
    });
  }
  parts.push({
    text: `Analyzuj přiložený vstup. Odpovídej v češtině, formátuj jako profesionální Markdown. Vstup: "${input}"`
  });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts },
    config: { temperature: 0.2 }
  });
  return response.text || "Analýza nevrátila žádný výsledek.";
};

// Complex Text Task - uses gemini-3-pro-preview
export const analyzeTaskBreakdown = async (
  input: string, 
  mappings: RoleMapping[], 
  currentUser: User,
  priority: 'NORMAL' | 'URGENT' = 'NORMAL'
): Promise<AIAnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const roleRules = TEAM_MEMBERS.map(tm => `${tm.role_key}:${tm.role}`).join('|');
  const mappingRules = mappings.map(m => {
    const keywords = m.groups.flatMap(g => g.keywords).join(',');
    return `${m.role}:[${keywords}]`;
  }).join('\n');

  const prompt = `
    Jsi AI dispečer pro aplikaci FlowRequest v obchodní firmě (DEK). 
    Zadavatel: ${currentUser.name}, Role: ${currentUser.role_key}.
    
    DETEKCE HROMADNÝCH ÚKOLŮ (targetScope: 'ROLE_ALL'):
    - Pokud uživatel použije slova jako "všem", "všichni", "celý tým", "každý", nastav targetScope na 'ROLE_ALL'.
    - Příklad: "Všem obchodníkům: odevzdejte report" -> targetScope: 'ROLE_ALL', estimatedRoleKey: 'OBCHODNIK_ZDIVO' (nebo jiný relevantní obchodník).
    - Příklad: "Všichni sádrokartonáři: prověřte ceny" -> targetScope: 'ROLE_ALL', estimatedRoleKey: 'PM_SADROKARTON'.
    
    PRAVIDLA DELEGOVÁNÍ:
    1. PROVOZNÍ TECHNIK (role PROVOZNI_TECHNIK): Technické výpočty, výkazy výměr, spotřeba materiálu.
    2. PRODUKT MANAŽEŘI (role PM_*): Nákupní ceny, OBJEKTOVÉ SLEVY, marže, dostupnost, vzorky.
    3. OBCHODNÍCI (role OBCHODNIK_*): Prodej klientovi, finální nabídky, CRM aktivity (štiky, schůzky).
    
    Role: ${roleRules}
    Mapování: ${mappingRules}
    Vstup: "${input}"
    
    Odpověz JSONem.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          suggestedSubTasks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                task_type: { type: Type.STRING },
                estimatedRoleKey: { type: Type.STRING },
                suggestedDeadline: { type: Type.STRING },
                targetScope: { type: Type.STRING, enum: ['INDIVIDUAL', 'ROLE_ALL'] }
              },
              required: ["title", "description", "task_type", "estimatedRoleKey", "suggestedDeadline"]
            }
          }
        },
        required: ["title", "suggestedSubTasks"]
      }
    }
  });

  try {
    const text = response.text || "{}";
    return JSON.parse(text.trim()) as AIAnalysisResult;
  } catch (e) {
    return { title: "Chyba analýzy", suggestedSubTasks: [] };
  }
};

// Complex Vision Task - uses gemini-3-pro-preview
export const analyzeDocumentVision = async (
  base64Image: string, 
  mimeType: string, 
  mappings: RoleMapping[],
  currentUser: User,
  priority: 'NORMAL' | 'URGENT' = 'NORMAL',
  userText: string = ''
): Promise<AIAnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType: mimeType } },
        { text: `Analyzuj dokument a text: "${userText}". Pokud jde o hromadné oslovení celého týmu (všem, všichni), nastav targetScope na 'ROLE_ALL'. Jinak deleguj podle standardních kompetencí (výpočty -> technik, nákupky -> PM, prodej -> obchodník).` }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          suggestedSubTasks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                task_type: { type: Type.STRING },
                estimatedRoleKey: { type: Type.STRING },
                suggestedDeadline: { type: Type.STRING },
                targetScope: { type: Type.STRING, enum: ['INDIVIDUAL', 'ROLE_ALL'] }
              },
              required: ["title", "description", "task_type", "estimatedRoleKey", "suggestedDeadline"]
            }
          }
        },
        required: ["title", "suggestedSubTasks"]
      }
    }
  });

  try {
    const text = response.text || "{}";
    return JSON.parse(text.trim()) as AIAnalysisResult;
  } catch (e) {
    return { title: "Chyba analýzy dokumentu", suggestedSubTasks: [] };
  }
};

export const analyzeReply = async (replyText: string): Promise<{ summary: string, verdict: 'CONFIRMED' | 'REJECTED' | 'UNCLEAR' }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze email reply: "${replyText}". Return JSON {summary, verdict}.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          verdict: { type: Type.STRING, enum: ['CONFIRMED', 'REJECTED', 'UNCLEAR'] }
        },
        required: ["summary", "verdict"]
      }
    }
  });
  try {
    const text = response.text || '{"summary": "Chyba", "verdict": "UNCLEAR"}';
    return JSON.parse(text.trim());
  } catch (e) {
    return { summary: "Chyba zpracování", verdict: "UNCLEAR" };
  }
};
