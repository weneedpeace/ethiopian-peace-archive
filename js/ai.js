// ========== PREMIUM CONTENT GENERATOR ==========
const EPA = {
  async generate(type, topic, tone) {
    try {
      const res = await fetch('https://peace-audio-worker.onrender.com/api/generate-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, topic, tone })
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Server replied with ${res.status}: ${errorText}`);
      }

      const data = await res.json();
      return data.content || 'Generation succeeded but no content was returned.';
    } catch (e) {
      console.error('Generation error:', e);
      return `Generation failed: ${e.message}`;
    }
  },
  article: (t, o) => EPA.generate('article', t, o),
  lesson: (t, o) => EPA.generate('lesson', t, o),
  essay: (t, o) => EPA.generate('essay', t, o),
  analysis: (t, o) => EPA.generate('analysis', t, o),
  report: (t, o) => EPA.generate('report', t, o),
  speech: (t, o) => EPA.generate('speech', t, o),
  proposal: (t, o) => EPA.generate('proposal', t, o),
  social: (t, o) => EPA.generate('social', t, o)
};
