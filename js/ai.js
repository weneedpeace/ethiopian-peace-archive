/* ============================================
   ETHIOPIAN PEACE ARCHIVE AI
   Powered by Cloudflare Workers AI + Llama 3
   ============================================ */

const AI_API = 'https://peace-api.peace-01d.workers.dev/api/ai';

async function analyzeVoice(text) {
    console.log('🧠 AI analyzing...');
    try {
        const res = await fetch(`${AI_API}/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });
        if (!res.ok) throw new Error('AI failed');
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        return data;
    } catch (e) {
        console.error('AI error:', e);
        return { language: 'Unknown', sentiment: 0.75, themes: ['Peace'] };
    }
}

async function detectLanguage(text) {
    try {
        const res = await fetch(`${AI_API}/detect-language`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });
        const data = await res.json();
        return data.language || 'Unknown';
    } catch (e) { return 'Unknown'; }
}

async function analyzeSentiment(text) {
    try {
        const res = await fetch(`${AI_API}/sentiment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });
        const data = await res.json();
        return data.sentiment || 0.75;
    } catch (e) { return 0.75; }
}

async function detectThemes(text) {
    try {
        const res = await fetch(`${AI_API}/themes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });
        const data = await res.json();
        return data.themes || ['Peace'];
    } catch (e) { return ['Peace']; }
}

async function researchAssistant(question) {
    try {
        const res = await fetch(`${AI_API}/research`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question })
        });
        const data = await res.json();
        return data.response || 'Please try again.';
    } catch (e) { return 'The AI assistant is currently unavailable. Browse the archive to explore peace voices.'; }
}

async function extractTextFromImage(imageUrl) {
    try {
        const res = await fetch(`${AI_API}/ocr`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image_url: imageUrl })
        });
        const data = await res.json();
        return data.text || '';
    } catch (e) { return ''; }
}

console.log('🧠 Cloudflare AI Ready — Llama 3 powered');
