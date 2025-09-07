import { GoogleGenAI } from '@google/genai';  // Import the GoogleGenAI API client
import mime from 'mime';  // Import mime to handle file type detection

// Access the API key from environment variables (Vite will inject it during the build)
const apiKey = import.meta.env.VITE_API_KEY;

// Helper function to save binary data as a downloadable file (for browser-based download)
function saveBinaryFile(fileName, content) {
  // Create a Blob object from the content with the specified mime type (octet-stream for binary files)
  const blob = new Blob([content], { type: 'application/octet-stream' });
  
  // Create a download link for the Blob
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);  // Create an object URL for the Blob
  link.download = fileName;  // Set the file name for the download
  link.click();  // Trigger the download by clicking the link
}

// Main function to generate content using the Gemini model
export default async function main(prompt, downloadImage = false) {
  const ai = new GoogleGenAI({ apiKey });  // Instantiate the GoogleGenAI API client with the API key

  const config = {
    responseModalities: ['IMAGE', 'TEXT'],  // Set the response modalities to receive both image and text content
  };

  const model = 'gemini-2.5-flash-image-preview';  // Set the model version to use for content generation

  // Structure the contents for the API request
  const contents = [
    {
      role: 'user',
      parts: [{ text: prompt }],  // Pass the user prompt as the input text
    },
  ];

  let fullText = '';  // Initialize an empty string to store the text result
  let binaryData = [];  // Initialize an array to store binary data (e.g., images)

  try {
    // Make an API request to generate content using the Gemini model
    const response = await ai.models.generateContentStream({
      model,
      config,
      contents,
    });

    // Iterate over each chunk of the response stream
    for await (const chunk of response) {
      try {
        // Check if the chunk contains valid data (either image or text content)
        if (!chunk.candidates || !chunk.candidates[0].content || !chunk.candidates[0].content.parts) {
          continue;  // If invalid data, skip to the next chunk
        }

        // Check if the chunk contains inline image data (base64-encoded)
        if (chunk.candidates[0].content.parts[0]?.inlineData) {
          const inlineData = chunk.candidates[0].content.parts[0].inlineData;
          
          // Decode the base64-encoded image data into binary
          const decodedData = atob(inlineData.data || '');
          const byteArray = new Uint8Array(decodedData.length);

          // Convert the decoded data into a Uint8Array (binary format)
          for (let i = 0; i < decodedData.length; i++) {
            byteArray[i] = decodedData.charCodeAt(i);
          }

          binaryData.push(byteArray);  // Store the binary data for further processing
        } else if (chunk.text) {
          // If the chunk contains text, append it to the fullText variable
          fullText += chunk.text || '';
        }
      } catch (err) {
        // Log any error that occurs while processing each chunk
        console.error('Error processing chunk:', err);
      }
    }

    // If the fullText has content, log it to the console (optional for debugging)
    if (fullText) {
      console.log(fullText);
    }

    // If binary data is collected and the downloadImage flag is true, handle the download
    if (binaryData.length > 0 && downloadImage) {
      // Combine all binary data into a single Uint8Array
      const finalBinary = new Uint8Array(binaryData.reduce((acc, arr) => acc.concat(Array.from(arr)), []));
      
      // Determine the file extension for the image (in this case, assuming PNG format)
      const fileExtension = mime.getExtension('image/png');
      
      // Call the helper function to download the generated image as a file
      saveBinaryFile(`generated_image.${fileExtension}`, finalBinary);
    }

    return fullText;  // Return the text content if available

  } catch (error) {
    // Log any errors that occur during the API call or content generation process
    console.error('Error during content generation:', error);
    return null;  // Return null in case of any errors
  }
}
