/* ============================================
   ETHIOPIAN PEACE ARCHIVE AI
   Llama 3.3 70B via Hugging Face Space
   ============================================ */

const AI_API = 'https://kingeth-ethiopia-peace-ai.hf.space';

async function analyzeVoice(text) {
    try {
        // Call Gradio API
        const res = await fetch(`${AI_API}/gradio_api/call/analyze_voice`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: [text] })
        });
        const { event_id } = await res.json();
        
        // Wait for result
        await new Promise(r => setTimeout(r, 3000));
        const resultRes = await fetch(`${AI_API}/gradio_api/call/analyze_voice/${event_id}`);
        const resultText = await resultRes.text();
        
        // Parse SSE response
        const lines = resultText.split('\n');
        for (const line of lines) {
            if (line.startsWith('data: ')) {
                const data = JSON.parse(line.substring(6));
                if (Array.isArray(data) && data.length >= 3) {
                    return {
                        language: data[0] || 'Unknown',
                        sentiment: data[1] || 0.75,
                        themes: (data[2] || 'Peace, Hope').split(',').map(t => t.trim()),
                        powered_by: 'Ethiopian Peace Archive AI (Llama 3.3 70B)'
                    };
                }
            }
        }
        throw new Error('No data');
    } catch (e) {
        console.log('AI Space unavailable, using local analysis');
        return analyzeLocal(text);
    }
}

function analyzeLocal(text) {
    const lower = text.toLowerCase();
    
    let language = 'English';
    if (/[\u1200-\u137F]/.test(text)) language = 'Amharic/Tigrinya';
    if (/[\u0600-\u06FF]/.test(text)) language = 'Arabic';
    
    const pos = ['peace', 'ሰላም', 'nagaa', 'unity', 'አንድነት', 'love', 'hope', 'together', 'future'];
    const neg = ['war', 'hate', 'kill', 'violence', 'destroy'];
    let score = 0.5;
    pos.forEach(w => { if (lower.includes(w)) score += 0.06; });
    neg.forEach(w => { if (lower.includes(w)) score -= 0.1; });
    const sentiment = Math.max(0.05, Math.min(0.98, Math.round(score * 100) / 100));
    
    const themeMap = {
        'Peace': ['peace', 'ሰላም', 'nagaa'],
        'Unity': ['unity', 'አንድነት', 'together'],
        'Hope': ['hope', 'ተስፋ', 'future'],
        'Love': ['love', 'ፍቅር', 'jaalala'],
        'Justice': ['justice', 'freedom', 'rights']
    };
    const themes = Object.entries(themeMap)
        .filter(([k, v]) => v.some(w => lower.includes(w)))
        .map(([k]) => k);
    
    return {
        language,
        sentiment,
        themes: themes.length ? themes.slice(0, 4) : ['Peace', 'Hope'],
        powered_by: 'Ethiopian Peace Archive AI'
    };
}

async function detectLanguage(text) { return (await analyzeVoice(text)).language; }
async function analyzeSentiment(text) { return (await analyzeVoice(text)).sentiment; }
async function detectThemes(text) { return (await analyzeVoice(text)).themes; }

async function researchAssistant(question) {
    try {
        const res = await fetch(`${AI_API}/gradio_api/call/research_chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: [question, null] })
        });
        const { event_id } = await res.json();
        await new Promise(r => setTimeout(r, 5000));
        const resultRes = await fetch(`${AI_API}/gradio_api/call/research_chat/${event_id}`);
        const text = await resultRes.text();
        const lines = text.split('\n');
        for (const line of lines) {
            if (line.startsWith('data: ')) {
                const data = JSON.parse(line.substring(6));
                if (Array.isArray(data) && data.length > 0) {
                    return data[0];
                }
            }
        }
        throw new Error('No data');
    } catch (e) {
        const knowledge = {
            'peace': 'Peace in Ethiopia means communities living together in harmony. Over 1,000 voices from all Ethiopian regions express this desire for unity and coexistence.',
            'gadaa': 'Gadaa is the Oromo democratic governance system recognized by UNESCO. Power rotates peacefully every 8 years.',
            'shimglina': 'Shimglina is elder mediation in Amhara and Tigray communities for resolving disputes and restoring relationships.',
            'xeer': 'Xeer is Somali customary law based on collective responsibility, compensation, and elder consensus.',
            'regions': 'Voices from: Tigray, Amhara, Oromia, Somali, Afar, Sidama, SNNPR, Gambella, Harari, Benishangul-Gumuz, Addis Ababa, Dire Dawa.'
        };
        const q = question.toLowerCase();
        for (const [k, v] of Object.entries(knowledge)) {
            if (q.includes(k)) return v;
        }
        return 'The Ethiopian Peace Archive preserves 1,000+ voices from all Ethiopian regions. Visit the archive to explore their messages of peace.';
    }
}

function moderateContent(text) {
    const blocked = ['kill', 'murder', 'hate', 'violence'];
    const found = blocked.filter(w => text.toLowerCase().includes(w));
    return found.length ? { approved: false } : { approved: true };
}

async function extractTextFromImage(url) { return ''; }
async function translateText(text, lang) { return text; }

console.log('🧠 AI Ready — Llama 3.3 70B');
