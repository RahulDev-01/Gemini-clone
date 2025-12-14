import { GoogleGenAI } from '@google/genai';  // Import the GoogleGenAI API client

// Access the API key from environment variables (Vite will inject it during the build)
const apiKey = import.meta.env.VITE_API_KEY;

// Small utility to pause execution for a given number of milliseconds
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Parse the API error thrown by the GoogleGenAI client to extract details like retry-after
function parseApiError(error) {
  // The SDK often throws an Error whose message contains a JSON string. Try to parse it.
  try {
    const msg = typeof error?.message === 'string' ? error.message : '';
    const jsonStart = msg.indexOf('{');
    const jsonEnd = msg.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      const parsed = JSON.parse(msg.slice(jsonStart, jsonEnd + 1));
      const err = parsed?.error || {};
      // Extract retry delay if present
      let retryAfterSeconds = undefined;
      const details = Array.isArray(err.details) ? err.details : [];
      for (const d of details) {
        if (d['@type'] === 'type.googleapis.com/google.rpc.RetryInfo' && d.retryDelay) {
          // retryDelay can be like "14s" or "14.5s"
          const m = /([0-9]+)(?:\.[0-9]+)?s/.exec(d.retryDelay);
          if (m) retryAfterSeconds = parseInt(m[1], 10);
        }
      }
      return {
        code: err.code,
        status: err.status,
        message: err.message,
        retryAfterSeconds,
      };
    }
  } catch (_) {
    // ignore parse errors
  }
  return { code: undefined, status: undefined, message: error?.message || String(error) };
}

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
  // Validate API key early to avoid confusing downstream errors
  if (!apiKey) {
    const msg = 'Gemini API key is missing. Set VITE_API_KEY in your environment (e.g., .env file) and restart the dev server.';
    console.error(msg);
    return msg;
  }

  const ai = new GoogleGenAI({ apiKey });  // Instantiate the GoogleGenAI API client with the API key

  const baseConfig = {
    responseModalities: ['TEXT'],  // Focus on text for faster responses
    temperature: 0.7,  // Balanced creativity and speed
    maxOutputTokens: 2048,  // Limit response length for speed
  };

  const imageConfig = {
    responseModalities: ['IMAGE', 'TEXT'],  // Enable image generation
    temperature: 0.8,  // Higher creativity for images
    maxOutputTokens: 1024,  // Shorter text for image prompts
  };

  // Candidate models to try in order. Some models may not be available to your project/region or API version.
  // We'll fall back gracefully if a model is NOT_FOUND or not supported for generateContent.
  const candidateModels = [
    // Prefer stable, widely available models with specific versions
    'gemini-1.5-flash-001',
    'gemini-1.5-pro-001',
  ];

  // Models that support image generation
  const imageModels = [
    'gemini-1.5-flash-001', 
    'gemini-1.5-pro-001',
  ];

  // Structure the contents for the API request
  const contents = [
    {
      role: 'user',
      parts: [{ text: prompt }],  // Pass the user prompt as the input text
    },
  ];

  // Infer if the user wants an image: explicit flag OR prompt contains image-intent keywords
  const imageIntent = downloadImage || /\b(image|picture|photo|draw|sketch|generate\s+an?\s+image|create\s+an?\s+image)\b/i.test(String(prompt || ''));

  // Choose models based on whether we want image generation
  let modelsToTry = imageIntent ? imageModels : candidateModels;
  
  // We'll try each model with a single retry on 429 before moving to the next model
  const tried = [];
  // Use a classic for loop so we can modify modelsToTry length mostly if we were pushing, 
  // but better to just iterate carefully.
  for (let mIdx = 0; mIdx < modelsToTry.length; mIdx++) {
    const model = modelsToTry[mIdx];
    let attempt = 0;
    const maxAttempts = 2;
    tried.push(model);
    // Per-model config: start TEXT-only unless we detect image intent
    let useTextOnly = !imageIntent;
    // Reset accumulators per model so we don't leak partial results between models
    let fullText = '';
    let binaryData = [];
    while (attempt < maxAttempts) {
      try {
        // Make an API request to generate content using the Gemini model
        const response = await ai.models.generateContentStream({
          model,
          config: useTextOnly ? { responseModalities: ['TEXT'] } : (imageIntent ? imageConfig : baseConfig),
          contents,
        });

      // Iterate over each chunk of the response stream
      for await (const chunk of response) {
        try {
          // Some chunks may only contain text; handle that first
          if (typeof chunk.text === 'string' && chunk.text) {
            fullText += chunk.text;
          }
          // Then handle image parts if present and we requested images
          const parts = chunk?.candidates?.[0]?.content?.parts;
          if (Array.isArray(parts) && parts[0]?.inlineData && !useTextOnly) {
            const inlineData = parts[0].inlineData;
            const decodedData = atob(inlineData.data || '');
            const byteArray = new Uint8Array(decodedData.length);
            for (let i = 0; i < decodedData.length; i++) {
              byteArray[i] = decodedData.charCodeAt(i);
            }
            binaryData.push(byteArray);
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

      // If binary data is collected, return it as base64 for preview
      if (binaryData.length > 0) {
        // Combine all binary data efficiently without repeated concatenations
        const totalLen = binaryData.reduce((acc, arr) => acc + arr.length, 0);
        const finalBinary = new Uint8Array(totalLen);
        let offset = 0;
        for (const arr of binaryData) {
          finalBinary.set(arr, offset);
          offset += arr.length;
        }
          // Convert to base64 for preview using chunked approach for large data
          try {
            const chunkSize = 8192; // Process in chunks to avoid call stack overflow
            let result = '';
            for (let i = 0; i < finalBinary.length; i += chunkSize) {
              const chunk = finalBinary.slice(i, i + chunkSize);
              result += String.fromCharCode(...chunk);
            }
            const base64String = btoa(result);
            console.log('Base64 conversion successful, length:', base64String.length);
            return base64String;
        } catch (error) {
          console.error('Base64 conversion failed:', error);
          // Alternative approach using TextDecoder
          try {
            const decoder = new TextDecoder('latin1');
            const text = decoder.decode(finalBinary);
            const base64String = btoa(text);
            console.log('Alternative base64 conversion successful, length:', base64String.length);
            return base64String;
          } catch (altError) {
            console.error('Alternative base64 conversion also failed:', altError);
            return 'Error: Could not convert image data to base64';
          }
        }
      } else {
        // Only return text if no binary data was collected
        return fullText || 'No content generated.';
      }

      } catch (error) {
        const parsed = parseApiError(error);
        // Handle 400: model supports only TEXT output. Retry once with TEXT-only config for this model
        const isTextOnlyMsg = /only\s+supports\s+text\s+output/i.test(parsed.message || '');
        if (parsed.code === 400 && isTextOnlyMsg && !useTextOnly) {
          console.warn(`Model ${model} indicates TEXT-only output. Retrying with TEXT-only modalities...`);
          useTextOnly = true;
          // Do not count against attempts; immediately retry
          continue;
        }
        // Handle 404/NOT_FOUND -> try next model, OR try to discover valid models dynamically
        const isNotFound = parsed.code === 404 || parsed.status === 'NOT_FOUND' || /not\s*found|not\s*supported/i.test(parsed.message || '');
        if (isNotFound) {
          console.warn(`Model ${model} not found (404). Attempting to discover available models...`);
          
          // Try to list models dynamically to find a valid one
          try {
            const listResp = await ai.models.list();
            if (listResp && listResp.models) {
              const availableModels = listResp.models.map(m => m.name.replace('models/', ''));
              console.log('Available models:', availableModels);
              
              // Find a suitable fallback that hasn't been tried yet
              const fallback = availableModels.find(m => 
                (m.includes('gemini-1.5') || m.includes('gemini-pro')) && 
                !tried.includes(m) &&
                (!imageIntent || (m.includes('flash') || m.includes('pro') || m.includes('vision')))
              );

              if (fallback) {
                console.log(`Found valid fallback model: ${fallback}. Adding to candidate list.`);
                 if (!modelsToTry.includes(fallback)) {
                     modelsToTry.push(fallback);
                 }
              }
            }
          } catch (listErr) {
             console.warn('Failed to list models:', listErr);
          }

          console.warn(`Attempting non-streaming generateContent as last resort for ${model}...`);
          try {
            const nonStreamResp = await ai.models.generateContent({ model, config: useTextOnly ? { responseModalities: ['TEXT'] } : baseConfig, contents });
             // ... existing non-streaming logic ...
            const candidates = nonStreamResp?.candidates || [];
            for (const c of candidates) {
              const parts = c?.content?.parts || [];
              for (const p of parts) {
                if (typeof p.text === 'string' && p.text) {
                  fullText += p.text;
                } else if (p?.inlineData?.data) {
                  const decodedData = atob(p.inlineData.data || '');
                  const byteArray = new Uint8Array(decodedData.length);
                  for (let i = 0; i < decodedData.length; i++) {
                    byteArray[i] = decodedData.charCodeAt(i);
                  }
                  binaryData.push(byteArray);
                }
              }
            }

            if (binaryData.length > 0) {
              const totalLen = binaryData.reduce((acc, arr) => acc + arr.length, 0);
              const finalBinary = new Uint8Array(totalLen);
              let offset = 0;
              for (const arr of binaryData) {
                finalBinary.set(arr, offset);
                offset += arr.length;
              }
              // ... existing base64 logic ...
               try {
                const chunkSize = 8192;
                let result = '';
                for (let i = 0; i < finalBinary.length; i += chunkSize) {
                  const chunk = finalBinary.slice(i, i + chunkSize);
                  result += String.fromCharCode(...chunk);
                }
                const base64String = btoa(result);
                return base64String;
              } catch (error) {
                 // ...
                 return 'Error: Could not convert image data to base64';
              }
            } else {
              return fullText || 'No text content returned.';
            }
          } catch (nsErr) {
            console.warn(`Non-streaming generateContent also failed for ${model}. Trying next model...`, nsErr);
            // intentionally empty to loop to next model
          }
        }

        // Handle 429 with an optional short retry
        if (parsed.code === 429 && attempt + 1 < maxAttempts) {
          const waitSeconds = typeof parsed.retryAfterSeconds === 'number' && parsed.retryAfterSeconds > 0 && parsed.retryAfterSeconds <= 30
            ? parsed.retryAfterSeconds
            : 5; // default short backoff
          console.warn(`429 received on model ${model}. Retrying in ${waitSeconds}s... (attempt ${attempt + 2}/${maxAttempts})`);
          await sleep(waitSeconds * 1000);
          attempt++;
          continue;
        }

        // For other errors, return a user-friendly message
        let userMessage = 'An unexpected error occurred while generating content. Please try again later.';
        if (parsed.code === 429) {
          userMessage = parsed.message || 'Rate limit exceeded for the Gemini API. Please wait and try again.';
          if (parsed.retryAfterSeconds) {
            userMessage += ` You may retry in approximately ${parsed.retryAfterSeconds} seconds.`;
          }
        } else if (parsed.message) {
          userMessage = parsed.message;
        }
        console.error('Error during content generation:', error);
        return userMessage;  // Return a readable string to avoid downstream format errors
      }
    }
  }

  // If we reached here, all models failed due to NOT_FOUND or other issues handled above without returns
  return `No compatible Gemini model was found for generateContent in this project/API version. Tried: ${tried.join(', ')}. Please check your plan, region, and available models in Google AI Studio (ListModels) and update the model name.`;
}
