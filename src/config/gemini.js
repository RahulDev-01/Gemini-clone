import { GoogleGenAI } from '@google/genai';  // Import the Google GenAI client for interacting with Gemini API
import mime from 'mime';  // Import mime to handle file type detection based on MIME type

// The API key to authenticate with the Google GenAI API
const apiKey = "AIzaSyApWeNMkNg1q6KriaTQcfykwZq090JURbA";

// Helper function to save binary data (for browser-based file download)
function saveBinaryFile(fileName, content) {
  // Create a Blob from the binary content for browser-based downloading
  const blob = new Blob([content], { type: 'application/octet-stream' });
  
  // Create a temporary link element to trigger file download
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);  // Create a URL for the Blob object
  link.download = fileName;  // Set the default file name for the download
  link.click();  // Trigger a click on the link to start the download
}

// Main function to generate content using the Gemini model
export default async function main(prompt, downloadImage = false) {
  // Create an instance of the GoogleGenAI client with the provided API key
  const ai = new GoogleGenAI({
    apiKey: apiKey,
  });

  // Configuration for the request: specify that we want both text and image responses
  const config = {
    responseModalities: ['IMAGE', 'TEXT'],  // Request both image and text content
  };

  // Specify the model to use for content generation (in this case, the image preview model)
  const model = 'gemini-2.5-flash-image-preview';

  // Structure the contents for the request: this is the prompt the user is providing
  const contents = [
    {
      role: 'user',  // Specify the role as 'user'
      parts: [
        {
          text: prompt,  // The prompt string sent for generating content
        },
      ],
    },
  ];

  // Variables to store the full response
  let fullText = '';  // Store the full text content that we generate
  let binaryData = [];  // Store binary data (e.g., image content)

  try {
    // Send the request to generate content, stream the response
    const response = await ai.models.generateContentStream({
      model,
      config,
      contents,
    });

    // Loop through each chunk of the streamed response
    for await (const chunk of response) {
      try {
        // Ensure the chunk has valid content to process
        if (!chunk.candidates || !chunk.candidates[0].content || !chunk.candidates[0].content.parts) {
          continue;  // Skip invalid or empty chunks
        }

        // Check if the chunk contains binary data (e.g., image)
        if (chunk.candidates[0].content.parts[0]?.inlineData) {
          const inlineData = chunk.candidates[0].content.parts[0].inlineData;

          // Decode the base64-encoded binary data into a binary string
          const decodedData = atob(inlineData.data || '');  // atob decodes base64 to a binary string
          const byteArray = new Uint8Array(decodedData.length);  // Create a byte array to hold the decoded data

          // Convert the decoded binary string into a byte array (Uint8Array)
          for (let i = 0; i < decodedData.length; i++) {
            byteArray[i] = decodedData.charCodeAt(i);  // Populate the byte array with the decoded data
          }

          binaryData.push(byteArray);  // Accumulate the binary data chunks
        } else if (chunk.text) {
          // If the chunk contains text, accumulate it in the fullText variable
          fullText += chunk.text || '';  // Append text to fullText
        }
      } catch (err) {
        // Log and skip any chunk that causes an error during processing
        console.error('Error processing chunk:', err);
      }
    }

    // After accumulating all chunks, check if there is any text content
    if (fullText) {
      console.log(fullText);  // Log the full text content (you can process it further as needed)
    }

    // If binary data (such as an image) was generated and the downloadImage flag is true
    if (binaryData.length > 0 && downloadImage) {
      // Combine all binary data chunks into a single Uint8Array (a single byte array)
      const finalBinary = new Uint8Array(binaryData.reduce((acc, arr) => acc.concat(Array.from(arr)), []));
      
      // Use mime to determine the file extension based on the MIME type of the binary data
      const fileExtension = mime.getExtension('image/png');  // Assume 'image/png' as the MIME type for images (you can adjust as needed)
      
      // Save the combined binary data as a file, triggering a download in the browser
      saveBinaryFile(`generated_image.${fileExtension}`, finalBinary);
    }

    // Return the full text content if it exists, otherwise return null if there's an error
    return fullText;

  } catch (error) {
    // Log any errors encountered during the API request or processing
    console.error('Error during content generation:', error);
    return null;  // Return null if there was an error during content generation
  }
}
