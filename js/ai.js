/* ============================================
   ETHIOPIAN PEACE ARCHIVE AI
   Powered by Cloudflare Workers AI — Free
   ============================================ */

const API = 'https://peace-api.peace-01d.workers.dev/api/ai';

async function analyzeVoice(text) {
    try {
        const res = await fetch(`${API}/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });
        return await res.json();
    } catch (e) { return { language: 'Unknown', sentiment: 0.75, themes: ['Peace'] }; }
}

async function detectLanguage(text) { return (await analyzeVoice(text)).language; }
async function analyzeSentiment(text) { return (await analyzeVoice(text)).sentiment; }
async function detectThemes(text) { return (await analyzeVoice(text)).themes; }

async function researchAssistant(question) {
    try {
        const res = await fetch(`${API}/research`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question })
        });
        const data = await res.json();
        return data.response || 'Visit the archive.';
    } catch (e) { return 'AI unavailable.'; }
}

function moderateContent(text) {
    const blocked = ['kill', 'murder', 'hate', 'violence'];
    const found = blocked.filter(w => text.toLowerCase().includes(w));
    return found.length ? { approved: false } : { approved: true };
}

// Premium Content Generator
const EPA = {
    async generate(type, topic, tone) {
        try {
            const res = await fetch(`${API}/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, topic, tone })
            });
            const data = await res.json();
            return data.content || null;
        } catch (e) { return null; }
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

async function extractTextFromImage(url) { return ''; }
async function translateText(text, lang) { return text; }

console.log('🧠 Ethiopian Peace Archive AI — Cloudflare Workers');
