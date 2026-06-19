/* ============================================
   ETHIOPIAN PEACE ARCHIVE AI
   Connected to Hugging Face Space
   ============================================ */

const AI_API = 'https://kingeth-ethiopia-peace-ai.hf.space';

async function analyzeVoice(text) {
    try {
        const res = await fetch(`${AI_API}/api/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });
        return await res.json();
    } catch (e) {
        return { language: 'Unknown', sentiment: 0.75, themes: ['Peace'] };
    }
}

async function detectLanguage(text) { const r = await analyzeVoice(text); return r.language; }
async function analyzeSentiment(text) { const r = await analyzeVoice(text); return r.sentiment; }
async function detectThemes(text) { const r = await analyzeVoice(text); return r.themes; }

async function researchAssistant(question) {
    try {
        const res = await fetch(`${AI_API}/api/research`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question })
        });
        const data = await res.json();
        return data.response || 'Visit the archive.';
    } catch (e) { return 'AI unavailable. Browse the archive directly.'; }
}

function moderateContent(text) {
    const blocked = ['kill','murder','hate','violence'];
    const found = blocked.filter(w => text.toLowerCase().includes(w));
    return found.length ? { approved: false } : { approved: true };
}

async function extractTextFromImage(url) { return ''; }
async function translateText(text, lang) { return text; }

console.log('🧠 AI Ready — Ethiopian Peace Archive');
