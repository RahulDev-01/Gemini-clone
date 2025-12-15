import { GoogleGenAI } from '@google/genai';

// Access the API key from environment variables
const apiKey = import.meta.env.VITE_API_KEY;

// Main function to generate content using the Gemini model
export default async function main(prompt, downloadImage = false) {
  // Validate API key
  if (!apiKey) {
    const msg = 'Gemini API key is missing. Set VITE_API_KEY in your .env file and restart the dev server.';
    console.error(msg);
    return msg;
  }

  const ai = new GoogleGenAI({ apiKey, apiVersion: 'v1' });

  try {
    // Use gemini-1.5-flash model (most stable and widely available for Google AI Studio)
    // Generate content via v1 SDK (@google/genai)
    const candidates = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-flash-8b'];
    let text = '';
    let ok = false;
    for (const modelId of candidates) {
      try {
        const response = await ai.models.generateContent({ model: modelId, contents: prompt });
        text = response.text;
        ok = true;
        break;
      } catch (e) {
        const m = String(e?.message || '');
        if (m.includes('NOT_FOUND') || m.includes('not found') || m.includes('404')) {
          continue;
        }
        throw e;
      }
    }
    if (!ok) {
      throw new Error('Model not found for your API key on the selected API version.');
    }

    console.log(text);
    return text || 'No content generated.';

  } catch (error) {
    console.error('Error during content generation:', error);
    
    // Provide user-friendly error messages
    if (error.message?.includes('API key')) {
      return 'Invalid API key. Please check your VITE_API_KEY in the .env file.';
    } else if (error.message?.includes('quota')) {
      return 'API quota exceeded. Please check your Google AI Studio quota and try again later.';
    } else if (error.message?.includes('not found') || error.message?.includes('404')) {
      return 'Model not found. Ensure your key has access to gemini-1.5-flash and that you are using the @google/genai SDK (v1).';
    }
    
    return 'An error occurred while generating content. Please try again.';
  }
}
