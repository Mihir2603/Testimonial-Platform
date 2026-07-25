const POSITIVE = ['love', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'recommend', 'best', 'happy', 'helpful', 'outstanding', 'perfect', 'awesome', ' impressed'];
const NEGATIVE = ['bad', 'terrible', 'awful', 'hate', 'worst', 'disappointed', 'poor', 'slow', 'rude', 'never', 'broken', 'useless', 'frustrating'];

function heuristicSentiment(text, rating) {
  const lower = text.toLowerCase();
  const pos = POSITIVE.filter((w) => lower.includes(w)).length;
  const neg = NEGATIVE.filter((w) => lower.includes(w)).length;

  let sentiment = 'neutral';
  if (rating >= 4 && pos >= neg) sentiment = 'positive';
  else if (rating <= 2 || neg > pos) sentiment = 'negative';
  else if (rating >= 4) sentiment = 'positive';

  const summary =
    sentiment === 'positive'
      ? 'Customer expresses strong satisfaction.'
      : sentiment === 'negative'
        ? 'Customer raises concerns or dissatisfaction.'
        : 'Mixed or moderate feedback.';

  return { sentiment, summary, source: 'heuristic' };
}

export async function analyzeSentiment(text, rating) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return heuristicSentiment(text, rating);
  }

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              'Analyze customer testimonials. Reply with JSON only: {"sentiment":"positive"|"neutral"|"negative","summary":"one short sentence"}',
          },
          { role: 'user', content: `Rating: ${rating}/5\n\n"${text}"` },
        ],
      }),
    });

    if (!res.ok) throw new Error(`Groq API ${res.status}`);

    const payload = await res.json();
    const content = payload.choices?.[0]?.message?.content;
    const parsed = JSON.parse(content);

    if (!['positive', 'neutral', 'negative'].includes(parsed.sentiment)) {
      throw new Error('Invalid sentiment from model');
    }

    return {
      sentiment: parsed.sentiment,
      summary: parsed.summary || 'AI summary unavailable.',
      source: 'groq',
    };
  } catch {
    return heuristicSentiment(text, rating);
  }
}
