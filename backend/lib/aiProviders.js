// lib/aiProviders.js

// Simple AI provider adapter
// Exports a single `requestAI` helper that normalizes calls to different providers.

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

/**
 * Request AI from configured provider.
 * options: { provider, model, systemMessage, userMessage, apiKey, apiUrl }
 * Returns: { assistantText, raw }
 */
async function requestAI(options = {}) {
  const { provider = 'openai', model, systemMessage, userMessage, apiKey, apiUrl } = options;
  const fetchFn = await getFetch();

  // --- OpenAI Provider Logic ---
  if (provider === 'openai') {
    if (!apiKey) {
      return { error: 'OPENAI_API_KEY not provided', status: 500 };
    }

    const payload = {
      model: model || process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.7,
      max_tokens: 700
    };

    const resp = await fetchFn('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload),
      timeout: 30_000
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => '');
      return { error: text || 'OpenAI error', status: resp.status, message: 'OpenAI API error', errorBody: text };
    }

    const result = await resp.json();
    const assistantText = (result.choices && result.choices[0] && result.choices[0].message && result.choices[0].message.content) || (result.choices && result.choices[0] && result.choices[0].text) || '';
    return { assistantText, raw: result };
  }

  // --- Gemini / Generic Provider Logic ---
  
  const endpoint = apiUrl || process.env.GEMINI_API_URL;
  const key = apiKey || process.env.GEMINI_API_KEY;

  if (!endpoint) return { error: 'Provider API URL not configured', status: 500, message: 'Missing provider API URL' };
  if (!key) return { error: 'Provider API key not configured', status: 500, message: 'Missing provider API key (GEMINI_API_KEY)' };

  // Default to Gemini 2.0 Flash if not specified
  const usedModel = model || process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  
  // Gemini v1beta/v1 payload structure
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
    return { error: text || `${provider} API error`, status: resp.status, message: `${provider} API error`, errorBody: text };
  }

  const result = await resp.json();

  // --- FIXED PARSING LOGIC BELOW ---
  let assistantText = '';

  // 1. Check for standard Gemini "candidates" structure
  if (result.candidates && result.candidates[0]?.content?.parts?.[0]?.text) {
    assistantText = result.candidates[0].content.parts[0].text;
  }
  // 2. Fallback: Check for "output" (sometimes used in vertex) or "choices"
  else {
     assistantText = result.output?.[0]?.content?.[0]?.text || 
                     result.choices?.[0]?.message?.content || 
                     result.choices?.[0]?.text || 
                     JSON.stringify(result); // Only stringify if nothing else matches
  }

  return { assistantText, raw: result };
}

function providerConfigured(provider = (process.env.AI_PROVIDER || 'openai')) {
  const p = provider.toLowerCase();
  if (p === 'openai') return !!process.env.OPENAI_API_KEY;
  return !!process.env.GEMINI_API_KEY || !!process.env.GEMINI_API_URL;
}

module.exports = { requestAI, providerConfigured };