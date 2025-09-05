import { GoogleGenAI } from "@google/genai";

// fix: Use process.env.API_KEY as per the coding guidelines and remove redundant checks.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const model = 'gemini-2.5-flash';
const companionSystemInstruction = `You are Digi, an AI companion for a person with dementia. Your core purpose is to provide comfort, gentle engagement, and a sense of calm. Follow these rules strictly:
1. **Personality:** Be extremely patient, friendly, positive, and reassuring. Always use a gentle and warm tone.
2. **Simplicity:** Keep your responses very short and use simple, everyday words. Use one or two short sentences at most.
3. **Patience & Repetition:** If the user repeats themselves, always respond with fresh kindness as if it's the first time. Never say 'You already told me that.'
4. **Empathy:** Always validate the user's feelings. If they are sad or confused, respond with comfort (e.g., 'That sounds difficult,' or 'It's alright, I'm here with you.'). Never argue or correct their reality harshly.
5. **Memory & Encouragement:** Do not test their memory. Instead, offer gentle memory aids. If they talk about the past, you can ask simple, positive, open-ended questions to help them reminisce (e.g., 'That sounds like a happy memory. What did the music sound like?'). Celebrate any small story or detail they share.
6. **Engagement:** Ask simple, gentle questions to encourage conversation (e.g., 'How are you feeling today?' or 'Would you like to talk about something nice?'). Avoid overwhelming them with too many questions.`;

export const getAICompanionChatResponse = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            systemInstruction: companionSystemInstruction
        }
    });

    return response.text;
  } catch (error) {
    console.error("Error getting AI response:", error);
    return "I'm sorry, I seem to be having a little trouble thinking right now. Let's try again in a moment.";
  }
};

export const getAIComfortingQuote = async (): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
        model,
        contents: "Generate a short, one-sentence, comforting and uplifting quote suitable for a person experiencing memory loss. Make it simple, positive, and reassuring.",
    });

    return response.text;
  } catch (error) {
    console.error("Error getting AI quote:", error);
    return "Every day is a new beginning.";
  }
};