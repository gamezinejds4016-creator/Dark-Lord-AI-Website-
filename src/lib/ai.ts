export type Provider = 'mock' | 'groq'

export async function sendPrompt(prompt: string, subject = '', provider: Provider = 'mock') {
  // Provide a clear tutor-style response from mock provider
  if (provider === 'mock') {
    // Simple deterministic mock response — helpful for dev without keys
    const subjectNote = subject ? ` (Subject: ${subject})` : ''
    const explanation = `Sure — here's a simple explanation${subjectNote}:

` +
      `1) Short explanation: ${shortExplanation(prompt)}

` +
      `2) Step-by-step idea: ${stepByStep(prompt)}

` +
      `3) Example: ${exampleFor(prompt)}

` +
      `If you'd like, ask me for a simpler version, more examples, or practice questions.`

    return { ok: true, text: explanation }
  }

  // For Groq provider, forward to serverless proxy which will read GROQ_API_KEY from env
  try {
    const res = await fetch('/api/ai-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider: 'groq', prompt, subject })
    })
    if (!res.ok) {
      const txt = await res.text()
      return { ok: false, error: `Proxy error: ${res.status} ${txt}` }
    }
    const data = await res.json()
    // Try common fields
    const text = data?.output || data?.text || (typeof data === 'string' ? data : JSON.stringify(data))
    return { ok: true, text }
  } catch (err:any) {
    return { ok: false, error: String(err) }
  }
}

function shortExplanation(prompt: string) {
  // Very naive short explanation generator based on keywords
  if (/pythagor/i.test(prompt)) return 'In a right triangle, the square of the hypotenuse equals the sum of the squares of the other two sides (a² + b² = c²).'
  if (/photosynth/i.test(prompt)) return 'Plants turn sunlight into food by combining carbon dioxide and water to make sugars and oxygen.'
  if (/cell/i.test(prompt) && /mitoc/i.test(prompt)) return 'Mitochondria are the powerhouses of cells; they make energy from nutrients.'
  return 'This is a clear, short explanation of the topic.'
}

function stepByStep(prompt: string) {
  return '1) Identify the problem or concept. 2) Break it into smaller parts. 3) Explain each part simply. 4) Put the parts back together with an example.'
}

function exampleFor(prompt: string) {
  if (/pythagor/i.test(prompt)) return 'If one side is 3 and the other is 4, the hypotenuse squared is 3² + 4² = 9 + 16 = 25, so hypotenuse is 5.'
  if (/photosynth/i.test(prompt)) return 'Think of leaves as tiny kitchens using sunlight to make sugar; oxygen comes out as a waste product.'
  return 'Imagine a simple numeric example that illustrates the idea.'
}
