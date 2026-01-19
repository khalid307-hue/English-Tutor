
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { ProficiencyLevel, Topic } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getTeacherResponse = async (
  message: string,
  history: { role: 'user' | 'assistant', content: string }[],
  level: ProficiencyLevel,
  topic: Topic
) => {
  const model = 'gemini-3-flash-preview';
  
  const systemInstruction = `
    You are Khalid, an expert, friendly, and patient English Teacher. 
    User's Current Level: ${level}
    Current Topic: ${topic}

    Your primary goals:
    1. Correct any grammar, spelling, or natural phrasing mistakes in the user's input.
    2. Provide a brief, simple explanation of the correction appropriate for their level.
    3. Respond to the conversation naturally to keep it going.
    4. Match your vocabulary and complexity to their level (${level}).
    
    Response Format (Strict JSON):
    {
      "correction": "The corrected sentence (leave null if perfect)",
      "explanation": "Brief explanation of changes (leave null if perfect)",
      "response": "Your natural conversational response as a teacher"
    }
    
    Always return valid JSON. Do not include extra text outside the JSON.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: [
      ...history.map(h => ({ role: h.role === 'assistant' ? 'model' : 'user', parts: [{ text: h.content }] })),
      { role: 'user', parts: [{ text: message }] }
    ],
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          correction: { type: Type.STRING, nullable: true },
          explanation: { type: Type.STRING, nullable: true },
          response: { type: Type.STRING }
        },
        required: ["response"]
      }
    }
  });

  return JSON.parse(response.text);
};

export const generateSpeech = async (text: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          // 'Charon' is a professional and clear male voice
          prebuiltVoiceConfig: { voiceName: 'Charon' },
        },
      },
    },
  });

  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
};

// Audio Decoding Helpers
export const decodeBase64Audio = async (base64: string, ctx: AudioContext): Promise<AudioBuffer> => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  const dataInt16 = new Int16Array(bytes.buffer);
  const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
  const channelData = buffer.getChannelData(0);
  for (let i = 0; i < dataInt16.length; i++) {
    channelData[i] = dataInt16[i] / 32768.0;
  }
  return buffer;
};
