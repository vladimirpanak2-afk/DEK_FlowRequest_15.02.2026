
import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysisResult, RoleMapping, User } from "../types.ts";
import { TEAM_MEMBERS } from "../constants.ts";

// Basic Text Task - uses gemini-3-flash-preview
export const performPureAnalysis = async (
  input: string,
  image?: { data: string, mimeType: string }
): Promise<string> => {
  // Fresh instance per call as per guidelines
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
  // response.text is a property, not a method
  return response.text || "Analýza nevrátila žádný výsledek.";
};

// Complex Text Task - uses gemini-3-pro-preview
export const analyzeTaskBreakdown = async (
  input: string, 
  mappings: RoleMapping[], 
  currentUser: User,
  priority: 'NORMAL' | 'URGENT' = 'NORMAL'
): Promise<AIAnalysisResult> => {
  // Fresh instance per call as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const roleRules = TEAM_MEMBERS.map(tm => `${tm.role_key}:${tm.role}`).join('|');
  const mappingRules = mappings.map(m => {
    const keywords = m.groups.flatMap(g => g.keywords).join(',');
    return `${m.role}:[${keywords}]`;
  }).join('\n');

  const prompt = `
    Jsi AI dispečer pro aplikaci FlowRequest v obchodní firmě (DEK). 
    Autorem požadavku je často OZ (Obchodník), který koordinuje zakázku a deleguje úkoly na specialisty.
    Zadavatel: ${currentUser.name}, Role: ${currentUser.role_key}.
    
    PRAVIDLA DELEGOVÁNÍ:
    1. PROVOZNÍ TECHNIK (role PROVOZNI_TECHNIK) řeší: Technické výpočty, výkazy výměr, výpočty spotřeby lepidel/omítek/cihel podle projektové dokumentace.
    2. PRODUKT MANAŽEŘI (role PM_*) řeší: Vyjednávání nákupních cen s výrobci (např. Wienerberger, Knauf), schvalování OBJEKTOVÝCH SLEV, marže, dostupnost zboží u výrobce a logistiku expedice z výrobního závodu. Také řeší zajištění vzorkovníků od výrobců.
    3. OBCHODNÍCI (role OBCHODNIK_*) řeší: Samotný prodej klientovi, tvorbu finálních nabídek, komunikaci se zákazníkem.
    4. HROMADNÉ ÚKOLY (targetScope: 'ROLE_ALL'): Pokud zadavatel (např. Ředitel) žádá o "štiky", "schůzky", "CRM hlášení", vytvoř úkol pro roli OBCHODNIK_ZDIVO s příznakem ROLE_ALL.
    
    Příklad: 
    - "Čestmíre spočítej spotřebu" -> PROVOZNI_TECHNIK
    - "Bořku domluv u Wienerbergeru slevu a prověř expedici" -> PM_ZDIVOBETON
    - "Lucko domluv vzorkovník omítek" -> PM_IZOLACE
    
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
    // response.text is a property, not a method
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
  // Fresh instance per call as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType: mimeType } },
        { text: `Analyzuj dokument a text: "${userText}". Pokud jde o výpočty spotřeby, deleguj na PROVOZNI_TECHNIK. Pokud jde o slevy u výrobců nebo vzorky, deleguj na PM_*. Pokud jde o reporty schůzek/štiky od Ředitele, deleguj na všechny obchodníky (ROLE_ALL).` }
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
    // response.text is a property, not a method
    const text = response.text || "{}";
    return JSON.parse(text.trim()) as AIAnalysisResult;
  } catch (e) {
    return { title: "Chyba analýzy dokumentu", suggestedSubTasks: [] };
  }
};

export const analyzeReply = async (replyText: string): Promise<{ summary: string, verdict: 'CONFIRMED' | 'REJECTED' | 'UNCLEAR' }> => {
  // Fresh instance per call as per guidelines
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
    // response.text is a property, not a method
    const text = response.text || '{"summary": "Chyba", "verdict": "UNCLEAR"}';
    return JSON.parse(text.trim());
  } catch (e) {
    return { summary: "Chyba zpracování", verdict: "UNCLEAR" };
  }
};
