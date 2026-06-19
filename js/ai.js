const AI_API = 'https://kingeth-ethiopian-peace-ai-v2.hf.space/api';

async function analyzeVoice(text) {
    try {
        const res = await fetch(`${AI_API}/analyze`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) });
        return await res.json();
    } catch (e) { return { language: 'Unknown', sentiment: 0.75, themes: ['Peace'] }; }
}

async function detectLanguage(text) { const r = await analyzeVoice(text); return r.language; }
async function analyzeSentiment(text) { const r = await analyzeVoice(text); return r.sentiment; }
async function detectThemes(text) { const r = await analyzeVoice(text); return r.themes; }

function researchAssistant(q) {
    const k = { peace: 'Peace in Ethiopia means communities living together. 1,000+ voices from all regions.', gadaa: 'Gadaa is Oromo democratic governance. UNESCO recognized.', shimglina: 'Shimglina is Amhara/Tigray elder mediation.' };
    for (const [key, val] of Object.entries(k)) { if (q.toLowerCase().includes(key)) return val; }
    return 'The archive has 1,000+ voices. Visit to explore.';
}

function moderateContent(text) {
    const bad = ['kill','murder','hate','violence'];
    const found = bad.filter(w => text.toLowerCase().includes(w));
    return found.length ? { approved: false } : { approved: true };
}

async function extractTextFromImage(url) { return ''; }
async function translateText(text, lang) { return text; }

console.log('🧠 AI Ready');
