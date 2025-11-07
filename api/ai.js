// api/ai.js
// Vercel serverless function to proxy requests to Hugging Face Inference API.
// Requires HF_API_KEY env var in Vercel dashboard.

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { prompt, model } = req.body || {};
    if (!prompt) return res.status(400).json({ error: 'Missing prompt' });

    const HF_KEY = process.env.HF_API_KEY;
    if (!HF_KEY) return res.status(500).json({ error: 'HF_API_KEY not configured in environment' });

    // Default model: google/flan-t5-small (small, instruction tuned)
    const modelId = model || 'google/flan-t5-small';

    const hfResp = await fetch(`https://api-inference.huggingface.co/models/${modelId}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${HF_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 256,
          temperature: 0.1
        }
      })
    });

    const raw = await hfResp.text();
    if (!hfResp.ok) {
      return res.status(hfResp.status).json({ error: 'HuggingFace inference error', detail: raw });
    }

    // parse JSON if possible
    try {
      const data = JSON.parse(raw);
      // common return shapes:
      if (Array.isArray(data) && data[0].generated_text) {
        return res.json({ text: data[0].generated_text });
      } else if (data.generated_text) {
        return res.json({ text: data.generated_text });
      } else {
        return res.json({ text: typeof data === 'string' ? data : JSON.stringify(data) });
      }
    } catch (err) {
      // raw text
      return res.json({ text: raw });
    }
  } catch (err) {
    console.error('api/ai error', err);
    return res.status(500).json({ error: 'internal_error', detail: String(err) });
  }
}
