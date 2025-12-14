import { GoogleGenerativeAI } from '@google/generative-ai';

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

  const genAI = new GoogleGenerativeAI(apiKey);

  try {
    // Use gemini-1.5-flash model (most stable and widely available for Google AI Studio)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log(text);
    return text || 'No content generated.';

  } catch (error) {
    console.error('Error during content generation:', error);
    
    // Provide user-friendly error messages
    if (error.message?.includes('API key')) {
      return 'Invalid API key. Please check your VITE_API_KEY in the .env file.';
    } else if (error.message?.includes('quota')) {
      return 'API quota exceeded. Please check your Google AI Studio quota and try again later.';
    } else if (error.message?.includes('not found')) {
      return 'Model not found. The gemini-pro model may not be available for your API key. Please check Google AI Studio.';
    }
    
    return 'An error occurred while generating content. Please try again.';
  }
}
