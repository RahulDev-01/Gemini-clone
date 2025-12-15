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

  const ai = new GoogleGenAI({ apiKey });

  try {
    // Use gemini-1.5-flash model (most stable and widely available for Google AI Studio)
    // Generate content via v1 SDK (@google/genai)
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt
    });
    const text = response.text;

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
