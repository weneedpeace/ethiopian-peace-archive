const AI_API = 'https://kingeth-ethiopia-peace-ai.hf.space/api';

async function analyzeVoice(text) {
    try {
        const res = await fetch(`${AI_API}/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });
        if (!res.ok) throw new Error('API error');
        return await res.json();
    } catch (e) { return { language: 'Unknown', sentiment: 0.75, themes: ['Peace'] }; }
}

async function detectLanguage(text) { return (await analyzeVoice(text)).language; }
async function analyzeSentiment(text) { return (await analyzeVoice(text)).sentiment; }
async function detectThemes(text) { return (await analyzeVoice(text)).themes; }

async function researchAssistant(question) {
    try {
        const res = await fetch(`${AI_API}/research`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question })
        });
        const data = await res.json();
        return data.response || 'Visit the archive.';
    } catch (e) { return 'AI unavailable.'; }
}

function moderateContent(text) {
    const blocked = ['kill','murder','hate','violence'];
    const found = blocked.filter(w => text.toLowerCase().includes(w));
    return found.length ? { approved: false } : { approved: true };
}

async function extractTextFromImage(url) { return ''; }
async function translateText(text, lang) { return text; }

console.log('🧠 AI Ready');
