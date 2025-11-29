import { GoogleGenAI } from "@google/genai";
import { Platform, Resolution, ThumbnailParams } from "../types";

const MODEL_NAME = 'gemini-3-pro-image-preview';

/**
 * Ensures the user has selected a valid API Key.
 */
export const ensureApiKey = async (): Promise<boolean> => {
  const win = window as any;
  if (win.aistudio) {
    const hasKey = await win.aistudio.hasSelectedApiKey();
    if (!hasKey) {
      try {
        await win.aistudio.openSelectKey();
        return true;
      } catch (e) {
        console.error("User cancelled key selection", e);
        return false;
      }
    }
    return true;
  }
  return !!process.env.API_KEY;
};

const getAspectRatio = (platform: Platform): string => {
  switch (platform) {
    case Platform.YouTube: return '16:9';
    case Platform.TikTok: return '9:16';
    case Platform.Instagram: return '1:1';
    case Platform.Facebook: return '4:5';
    default: return '16:9';
  }
};

/**
 * Generates the thumbnail using Gemini 3 Pro.
 */
export const generateThumbnail = async (params: ThumbnailParams): Promise<string> => {
  const hasKey = await ensureApiKey();
  if (!hasKey) {
    throw new Error("API Key selection is required.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Advanced Prompt Engineering for High CTR
  const viralElements = [
    "Hyper-expressive face in foreground",
    "High contrast saturation",
    "Complimentary color theory (Teal/Orange or Red/Green)",
    "Thick glowing outlines around the subject",
    "3D rendered background elements",
    "Speed lines or motion blur on edges",
    "Depth of field emphasizing the subject"
  ];

  const systemInstruction = `
    You are the world's best YouTube Thumbnail Designer, known for creating viral images for MrBeast, Airrack, and Ryan Trahan.
    Your goal is to create a high-CTR (Click Through Rate) image that stops the scroll immediately.
    
    CRITICAL RULES:
    1. SUBJECT: If a face image is provided, integrate it seamlessly. If not, generate a hyper-realistic, expressive character (shocked, excited, or intense emotion).
    2. LIGHTING: Use professional 3-point lighting with rim lights to separate subject from background.
    3. COLORS: Use the "BananaViral" signature style: Vivid, punchy colors. Avoid dull grays or washed-out tones.
    4. TEXT: If text is needed, keep it under 3 words, massive font, drop shadow, contrasting color.
    5. STYLE: ${params.intensity > 80 ? "EXTREME CHAOS, MAX SATURATION, YELLING FACE" : "Clean, Professional, Intriguing, High-Budget"}.
  `;

  const enhancedPrompt = `
    DESIGN TASK: Create a thumbnail for the video topic: "${params.topic}".
    
    PLATFORM: ${params.platform} (${getAspectRatio(params.platform)} aspect ratio).
    
    VISUAL REQUIREMENTS:
    - ${viralElements.join("\n- ")}
    - Make the image look like it cost $10,000 to produce.
    - Resolution target: ${params.resolution}.
    - Ensure any text generated is spelled correctly in English (or Arabic if the topic is Arabic).
    
    User Intensity Setting: ${params.intensity}% (0=Safe, 100=Viral Clickbait).
  `;

  // Build content parts
  const parts: any[] = [{ text: enhancedPrompt }];
  
  if (params.faceImageBase64) {
    try {
      const base64Data = params.faceImageBase64.split(',')[1];
      const mimeType = params.faceImageBase64.substring(params.faceImageBase64.indexOf(':') + 1, params.faceImageBase64.indexOf(';'));
      
      parts.push({
        inlineData: {
          mimeType: mimeType,
          data: base64Data
        }
      });
    } catch (e) {
      console.error("Error processing image", e);
    }
  }

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: parts.length > 1 ? parts : enhancedPrompt,
      config: {
        systemInstruction: systemInstruction,
        imageConfig: {
          aspectRatio: getAspectRatio(params.platform),
          imageSize: params.resolution
        },
      },
    });

    const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if (part && part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
    
    throw new Error("No image data received from the model.");

  } catch (error: any) {
    console.error("Thumbnail Generation Error:", error);
    if (error.message?.includes("Requested entity was not found")) {
      throw new Error("API Key session expired. Please refresh.");
    }
    throw error;
  }
};
