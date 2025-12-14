import { GoogleGenAI } from "@google/genai";
import { Platform, Resolution, ThumbnailParams } from "../types";

// STRICTLY ENFORCED: Nano Banana Pro Model
const MODEL_NAME = 'gemini-3-pro-image-preview';

// Helper to safely get the API key from Vite
const getApiKey = (): string | undefined => {
  return import.meta.env.VITE_GOOGLE_API_KEY;
};

export const ensureApiKey = async (): Promise<boolean> => {
  const key = getApiKey();
  return !!(key && key.length > 0);
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
 * Generates the thumbnail using the mandated 'gemini-3-pro-image-preview' model.
 */
export const generateThumbnail = async (params: ThumbnailParams): Promise<string> => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    throw new Error("Missing API Key. Ensure VITE_GOOGLE_API_KEY is set in your .env file.");
  }

  // Initialize the specific GenAI Client
  const ai = new GoogleGenAI({ apiKey });

  // --- 1. THE "BRUTAL FACE SWAP" PROMPT ---
  const promptText = `
    TASK: EXECUTE A FLAWLESS FACE SWAP.
    
    INSTRUCTIONS:
    1.  **BASE IMAGE:** Use the provided "STYLE CLONE" image as the foundation. The composition, body, clothing, background, and lighting MUST be exactly the same.
    2.  **FACE SOURCE:** Take the head/face from the provided "YOUR FACE" image.
    3.  **THE SWAP:** REPLACE the head of the main subject in the BASE IMAGE with the face from the FACE SOURCE.
    4.  **INTEGRATION:** The new face must perfectly match the lighting, shadows, skin tone, and angle of the original body. It must look 100% authentic.
    5.  **TOPIC CONTEXT:** The overall vibe should relate to the topic: "${params.topic}".
    6.  **INTENSITY:** ${params.intensity}% (Add extreme expressions or effects if >80%).

    OUTPUT: A single, photorealistic image. Do not change the base image's style, only the subject's identity.
  `;

  // --- 2. PAYLOAD ASSEMBLY ---
  const contents: any[] = [
    { text: promptText }
  ];

  // Inject Face (Identity) - MUST BE FIRST IMAGE
  if (params.faceImageBase64) {
    try {
      const base64Data = params.faceImageBase64.includes('base64,') 
        ? params.faceImageBase64.split('base64,')[1] 
        : params.faceImageBase64;
        
      contents.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Data,
        },
      });
    } catch (e) {
      console.warn("Face image processing error", e);
    }
  }

  // Inject Style (Reference) - MUST BE SECOND IMAGE
  if (params.styleImageBase64) {
    try {
      const base64Data = params.styleImageBase64.includes('base64,') 
        ? params.styleImageBase64.split('base64,')[1] 
        : params.styleImageBase64;

      contents.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Data,
        },
      });
    } catch (e) {
      console.warn("Style image processing error", e);
    }
  }

  try {
    // --- 3. GENERATION CALL ---
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: contents,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
        imageConfig: {
          aspectRatio: getAspectRatio(params.platform),
          imageSize: params.resolution
        },
      },
    });

    // --- 4. OUTPUT HANDLING ---
    const candidates = response.candidates;
    if (candidates && candidates.length > 0) {
      const parts = candidates[0].content.parts;
      
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }

    throw new Error("Model finished but returned no image data.");

  } catch (error: any) {
    console.error("Gemini 3 Pro Error:", error);
    
    if (error.message?.includes("API key")) {
      throw new Error("Invalid VITE_GOOGLE_API_KEY.");
    }
    if (error.message?.includes("not found")) {
      throw new Error(`Model '${MODEL_NAME}' is not accessible with this API key.`);
    }
    
    throw new Error(error.message || "Generation Failed. Try a different prompt.");
  }
};