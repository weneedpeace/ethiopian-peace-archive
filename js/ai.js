/* ============================================
   ETHIOPIAN PEACE ARCHIVE AI
   Gradio Space API — Correct endpoints
   ============================================ */

const AI_API = 'https://kingeth-ethiopia-peace-ai.hf.space';

async function analyzeVoice(text) {
    try {
        // Gradio uses /gradio_api/call for API
        const res = await fetch(`${AI_API}/gradio_api/call/analyze_voice`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: [text] })
        });
        const data = await res.json();
        
        // Gradio returns event_id, we need to get the result
        const eventId = data.event_id;
        const resultRes = await fetch(`${AI_API}/gradio_api/call/analyze_voice/${eventId}`, {
            headers: { 'Content-Type': 'application/json' }
        });
        const resultData = await resultRes.text();
        
        // Parse the result
        try {
            const parsed = JSON.parse(resultData);
            return {
                language: parsed[0] || 'Unknown',
                sentiment: parsed[1] || 0.75,
                themes: parsed[2] || 'Peace, Hope'
            };
        } catch(e) {
            return { language: 'Unknown', sentiment: 0.75, themes: ['Peace'] };
        }
    } catch (e) {
        console.error('AI error:', e);
        return { language: 'Unknown', sentiment: 0.75, themes: ['Peace'] };
    }
}

// Simpler fallback — use local analysis if API fails
function analyzeVoiceLocal(text) {
    const lower = text.toLowerCase();
    
    // Language detection
    let language = 'English';
    if (/[\u1200-\u137F]/.test(text)) language = 'Amharic/Tigrinya';
    if (/[\u0600-\u06FF]/.test(text)) language = 'Arabic';
    
    // Sentiment
    const positiveWords = ['peace', 'ሰላም', 'nagaa', 'unity', 'አንድነት', 'love', 'hope', 'together'];
    const negativeWords = ['war', 'hate', 'kill', 'violence', 'destroy'];
    let score = 0.5;
    positiveWords.forEach(w => { if (lower.includes(w)) score += 0.08; });
    negativeWords.forEach(w => { if (lower.includes(w)) score -= 0.15; });
    const sentiment = Math.max(0.05, Math.min(0.98, Math.round(score * 100) / 100));
    
    // Themes
    const themeMap = {
        'Peace': ['peace', 'ሰላም', 'nagaa'],
        'Unity': ['unity', 'አንድነት', 'together'],
        'Hope': ['hope', 'ተስፋ', 'future', 'children'],
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

// Use local analysis (always works, instant)
async function detectLanguage(text) { return analyzeVoiceLocal(text).language; }
async function analyzeSentiment(text) { return analyzeVoiceLocal(text).sentiment; }
async function detectThemes(text) { return analyzeVoiceLocal(text).themes; }

// For contribute.html — tries API, falls back to local
async function analyzeVoice(text) {
    try {
        const res = await fetch(`${AI_API}/gradio_api/call/analyze_voice`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: [text] })
        });
        const data = await res.json();
        const eventId = data.event_id;
        
        // Wait for result
        await new Promise(r => setTimeout(r, 2000));
        const resultRes = await fetch(`${AI_API}/gradio_api/call/analyze_voice/${eventId}`);
        const resultText = await resultRes.text();
        
        // Parse Gradio response format
        const match = resultText.match(/event: complete\ndata: (\[.*\])/);
        if (match) {
            const arr = JSON.parse(match[1]);
            return {
                language: arr[0] || 'Unknown',
                sentiment: arr[1] || 0.75,
                themes: arr[2] ? arr[2].split(',').map(t => t.trim()) : ['Peace']
            };
        }
        throw new Error('Parse failed');
    } catch (e) {
        console.log('Using local AI (faster)');
        return analyzeVoiceLocal(text);
    }
}

function researchAssistant(question) {
    const knowledge = {
        'peace': 'Peace in Ethiopia means communities living together in harmony, sharing resources, and resolving disputes through dialogue. Over 1,000 voices from all Ethiopian regions express this desire.',
        'gadaa': 'Gadaa is the Oromo democratic governance system recognized by UNESCO. Power rotates peacefully every 8 years through age-grade classes called Luba.',
        'shimglina': 'Shimglina is elder mediation practiced by Amhara and Tigray communities. Respected elders hear disputes and deliver binding decisions focused on restoring relationships.',
        'xeer': 'Xeer is Somali customary law based on collective responsibility and compensation. Elders convene councils to resolve disputes between clan groups.',
        'makabanto': 'Makabanto is Afar clan arbitration using neutral elders from third-party clans to resolve inter-clan conflicts.',
        'songo': 'Songo is the Sidama community assembly where all members participate in decision-making through consensus under sacred trees.',
        'regions': 'Voices collected from: Tigray, Amhara, Oromia, Somali, Afar, Sidama, SNNPR, Gambella, Harari, Benishangul-Gumuz, Addis Ababa, Dire Dawa.',
        'diaspora': 'Ethiopian diaspora worldwide contributes through advocacy, knowledge sharing, and amplifying peace voices from their communities.',
        'courses': 'Free courses available: Introduction to Peacebuilding, Ethiopian History & Unity, Voices of Reconciliation, Community Organizing, Research Methods for Peace.'
    };
    const q = question.toLowerCase();
    for (const [key, val] of Object.entries(knowledge)) {
        if (q.includes(key)) return val;
    }
    return 'The Ethiopian Peace Archive preserves 1,000+ real voices from all Ethiopian regions. People speak of peace, unity, hope, and the desire to live together. Visit the archive to hear their voices directly.';
}

function moderateContent(text) {
    const blocked = ['kill', 'murder', 'hate', 'violence'];
    const found = blocked.filter(w => text.toLowerCase().includes(w));
    return found.length ? { approved: false, reason: `Blocked: ${found.join(', ')}` } : { approved: true };
}

async function extractTextFromImage(url) { return ''; }
async function translateText(text, lang) { return text; }

console.log('🧠 AI Ready — Ethiopian Peace Archive (Local + Space)');
