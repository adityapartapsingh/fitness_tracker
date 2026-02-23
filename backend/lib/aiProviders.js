
async function getFetch() {
  let fetchFn = globalThis.fetch;
  if (!fetchFn) {
    try {
      // eslint-disable-next-line global-require
      fetchFn = require('node-fetch');
    } catch (e) {
      throw new Error('fetch is not available and node-fetch is not installed');
    }
  }
  return fetchFn;
}


async function requestAI(options = {}) {
  const { model, systemMessage, userMessage, apiKey, apiUrl } = options;
  const fetchFn = await getFetch();

  const endpoint = apiUrl || process.env.GEMINI_API_URL;
  const key = apiKey || process.env.GEMINI_API_KEY;

  if (!endpoint) return { error: 'Gemini API URL not configured', status: 500, message: 'Missing GEMINI_API_URL' };
  if (!key) return { error: 'Gemini API key not configured', status: 500, message: 'Missing GEMINI_API_KEY' };

  const usedModel = model || process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  
  const payload = {
    ...(systemMessage ? {
      system_instruction: {
        parts: [{ text: systemMessage }]
      }
    } : {}),
    contents: [
      { role: 'user', parts: [{ text: userMessage }] }
    ]
  };

  const resp = await fetchFn(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-goog-api-key': key
    },
    body: JSON.stringify(payload),
    timeout: 30_000
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    return { error: text || 'Gemini API error', status: resp.status, message: 'Gemini API error', errorBody: text };
  }

  const result = await resp.json();

  let assistantText = '';

  if (result.candidates && result.candidates[0]?.content?.parts?.[0]?.text) {
    assistantText = result.candidates[0].content.parts[0].text;
  }
  else {
     assistantText = result.output?.[0]?.content?.[0]?.text || 
                     result.choices?.[0]?.message?.content || 
                     result.choices?.[0]?.text || 
                     JSON.stringify(result); 
  }

  return { assistantText, raw: result };
}

function providerConfigured() {
  return !!process.env.GEMINI_API_KEY && !!process.env.GEMINI_API_URL;
}

module.exports = { requestAI, providerConfigured };