/* ============================================
   ETHIOPIAN PEACE ARCHIVE — PRODUCTION AI
   Render Backend (Permanent)
   ============================================ */

const BACKEND_URL = 'https://peace-audio-worker.onrender.com';

async function fetchVoices() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/voices`);
    if (!res.ok) throw new Error('Failed to fetch voices');
    const voices = await res.json();
    return voices;
  } catch (e) {
    console.error('Voice fetch error:', e);
    return [];
  }
}

async function generateAudio(voiceId, text) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/generate-audio`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voiceId, text })
    });
    if (!res.ok) throw new Error('Generation failed');
    const data = await res.json();
    return data;
  } catch (e) {
    console.error('Generation error:', e);
    return { success: false, error: e.message };
  }
}

// ========== UPDATED PREMIUM CONTENT GENERATOR ==========
const EPA = {
  async generate(type, topic, tone) {
    try {
      const res = await fetch(`${BACKEND_URL}/api/generate-text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, topic, tone })
      });
      const data = await res.json();
      return data.content || 'Generation failed. Please try again.';
    } catch (e) {
      return 'Error connecting to text generation backend.';
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

// ========== VOICE ANALYSIS ==========
async function analyzeVoice(text) {
  return { language: 'Unknown', sentiment: 0.75, themes: ['Peace', 'Hope'] };
}

async function detectLanguage(text) { return (await analyzeVoice(text)).language; }
async function analyzeSentiment(text) { return (await analyzeVoice(text)).sentiment; }
async function detectThemes(text) { return (await analyzeVoice(text)).themes; }

async function researchAssistant(question) {
  return 'Browse the Ethiopian Peace Archive to explore 1,000+ voices.';
}

function moderateContent(text) {
  const blocked = ['kill', 'murder', 'hate', 'violence', 'destroy'];
  const found = blocked.filter(w => text.toLowerCase().includes(w));
  return found.length ? { approved: false, reason: `Blocked: ${found.join(', ')}` } : { approved: true };
}

async function uploadImage(file) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'peace_archive');
    const res = await fetch('https://api.cloudinary.com/v1_1/djb3falqu/image/upload', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    return { url: data.secure_url, public_id: data.public_id };
  } catch (e) {
    return null;
  }
}

async function extractTextFromImage(url) { return ''; }
async function translateText(text, lang) { return text; }

console.log('🧠 Ethiopian Peace Archive AI — Connected to Render Backend');
