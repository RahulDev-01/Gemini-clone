import { GoogleGenAI } from '@google/genai';
import mime from 'mime';  // Import mime to handle file type detection

// Access the API key using import.meta.env (Vite handles this at build time)
const apiKey = import.meta.env.VITE_API_KEY;

// Helper function to save binary data (for browser-based file download)
function saveBinaryFile(fileName, content) {
  const blob = new Blob([content], { type: 'application/octet-stream' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  link.click();
}

// Main function to generate content using the Gemini model
export default async function main(prompt, downloadImage = false) {
  const ai = new GoogleGenAI({ apiKey });

  const config = {
    responseModalities: ['IMAGE', 'TEXT'],
  };

  const model = 'gemini-2.5-flash-image-preview';

  const contents = [
    {
      role: 'user',
      parts: [{ text: prompt }],
    },
  ];

  let fullText = '';
  let binaryData = [];

  try {
    const response = await ai.models.generateContentStream({
      model,
      config,
      contents,
    });

    for await (const chunk of response) {
      try {
        if (!chunk.candidates || !chunk.candidates[0].content || !chunk.candidates[0].content.parts) {
          continue;
        }

        if (chunk.candidates[0].content.parts[0]?.inlineData) {
          const inlineData = chunk.candidates[0].content.parts[0].inlineData;
          const decodedData = atob(inlineData.data || '');
          const byteArray = new Uint8Array(decodedData.length);

          for (let i = 0; i < decodedData.length; i++) {
            byteArray[i] = decodedData.charCodeAt(i);
          }

          binaryData.push(byteArray);
        } else if (chunk.text) {
          fullText += chunk.text || '';
        }
      } catch (err) {
        console.error('Error processing chunk:', err);
      }
    }

    if (fullText) {
      console.log(fullText);
    }

    if (binaryData.length > 0 && downloadImage) {
      const finalBinary = new Uint8Array(binaryData.reduce((acc, arr) => acc.concat(Array.from(arr)), []));
      const fileExtension = mime.getExtension('image/png');
      saveBinaryFile(`generated_image.${fileExtension}`, finalBinary);
    }

    return fullText;

  } catch (error) {
    console.error('Error during content generation:', error);
    return null;
  }
}
