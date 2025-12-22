// Helper function for exponential backoff delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Function to get list of available models
async function getAvailableModels(apiKey) {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (!response.ok) {
      console.warn('Failed to fetch models list');
      return [];
    }
    const data = await response.json();
    const models = data.models || [];
    
    // Filter to only models that support generateContent
    const availableModels = models
      .filter(m => m.supportedGenerationMethods?.includes('generateContent'))
      .map(m => m.name.replace('models/', ''));
    
    console.log('📋 Available Gemini models:', availableModels);
    return availableModels;
  } catch (err) {
    console.warn('Error fetching available models:', err.message);
    return [];
  }
}

// Function to try multiple models with retry logic
async function tryMultipleModels(prompt, apiKey) {
  // First, get list of available models
  const availableModels = await getAvailableModels(apiKey);
  
  // Our preferred models in order of preference
  const preferredModels = [
    'gemini-2.5-flash',
    'gemini-2.5-pro',
    'gemini-2.0-flash',
    'gemini-2.0-flash-exp',
    'gemini-exp-1206',
    'gemini-flash-latest',
    'gemini-1.5-flash',
    'gemini-1.5-pro'
  ];
  
  // Filter to only use models that are available
  const modelsToTry = preferredModels.filter(model => 
    availableModels.includes(model) || availableModels.length === 0
  );
  
  if (modelsToTry.length === 0 && availableModels.length > 0) {
    console.log('⚠️ None of preferred models available, using first available model');
    modelsToTry.push(availableModels[0]);
  }
  
  console.log('🎯 Models to try:', modelsToTry);

  for (const modelName of modelsToTry) {
    let retryCount = 0;
    const maxRetries = 1;

    while (retryCount <= maxRetries) {
      try {
        if (retryCount === 0) {
          console.log(`Trying model: ${modelName}`);
        } else {
          console.log(`Retry ${retryCount}/${maxRetries} for ${modelName}...`);
        }

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }]
          })
        });

        if (response.ok) {
          const data = await response.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            console.log(`✅ Successfully used model: ${modelName}`);
            return text;
          }
        } else {
          const errorData = await response.json();
          const status = response.status;
          
          if (status === 429) {
            // Rate limit - retry with exponential backoff
            if (retryCount < maxRetries) {
              const waitTime = Math.pow(2, retryCount + 1) * 1000;
              console.log(`Rate limit hit for ${modelName}. Waiting ${waitTime / 1000}s before retry...`);
              await delay(waitTime);
              retryCount++;
              continue;
            } else {
              console.warn(`Model ${modelName} rate limited after ${maxRetries} retries`);
              break;
            }
          } else if (status === 503) {
            // Service overloaded - try next model immediately
            console.warn(`Model ${modelName} is overloaded (503), trying next model...`);
            break;
          } else if (status === 404) {
            console.warn(`Model ${modelName} not found (404), trying next model...`);
            break;
          } else {
            console.warn(`Model ${modelName} failed with status: ${status}`, errorData);
            break;
          }
        }
      } catch (err) {
        console.warn(`Model ${modelName} failed:`, err.message);
        break;
      }
    }
    
    // Add a small delay before trying the next model
    if (modelName !== modelsToTry[modelsToTry.length - 1]) {
      console.log('Waiting 2s before trying next model...');
      await delay(2000);
    }
  }
  
  return null;
}

export default async function geminiGenerate(prompt) {
  const apiKey = (import.meta.env.VITE_API_KEY || import.meta.env.VITE_GOOGLE_AI_API_KEY || '').trim();

  if (!apiKey) {
    return 'Missing API key. Please set VITE_API_KEY or VITE_GOOGLE_AI_API_KEY in your .env file.';
  }

  try {
    console.log('🤖 Generating content with Gemini...');
    const text = await tryMultipleModels(prompt, apiKey);
    
    if (text) {
      return text;
    }
    
    return 'All models failed. This could be due to rate limits (429) or unavailable models (503). Please wait a few minutes and try again.';
  } catch (error) {
    console.error('Error during content generation:', error);
    return 'Model not found. Ensure your key has access to gemini-1.5-flash and that you are using the @google/genai SDK (v1).';
  }
}
