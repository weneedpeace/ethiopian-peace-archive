/* ============================================
   ETHIOPIAN PEACE ARCHIVE AI
   Llama 3.3 70B via Hugging Face Space
   ============================================ */

const AI_API = 'https://kingeth-ethiopia-peace-ai.hf.space';

async function analyzeVoice(text) {
    try {
        const res = await fetch(`${AI_API}/gradio_api/call/analyze_voice`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: [text] })
        });
        const { event_id } = await res.json();
        
        // Wait up to 15 seconds for result
        let result = null;
        for (let i = 0; i < 5; i++) {
            await new Promise(r => setTimeout(r, 3000));
            const resultRes = await fetch(`${AI_API}/gradio_api/call/analyze_voice/${event_id}`);
            const resultText = await resultRes.text();
            
            const lines = resultText.split('\n');
            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    try {
                        const data = JSON.parse(line.substring(6));
                        if (Array.isArray(data) && data.length >= 3) {
                            return {
                                language: data[0] || 'Unknown',
                                sentiment: data[1] || 0.75,
                                themes: (data[2] || 'Peace, Hope').split(',').map(t => t.trim()),
                                powered_by: 'Ethiopian Peace Archive AI (Llama 3.3 70B)'
                            };
                        }
                    } catch(e) {}
                }
            }
        }
        throw new Error('Timeout');
    } catch (e) {
        console.log('Space unavailable, using local AI');
        return analyzeLocal(text);
    }
}

function analyzeLocal(text) {
    const lower = text.toLowerCase();
    let language = 'English';
    if (/[\u1200-\u137F]/.test(text)) language = 'Amharic/Tigrinya';
    if (/[\u0600-\u06FF]/.test(text)) language = 'Arabic';
    
    const pos = ['peace','ሰላም','nagaa','unity','አንድነት','love','hope','together','future','children'];
    const neg = ['war','hate','kill','violence','destroy'];
    let score = 0.5;
    pos.forEach(w => { if (lower.includes(w)) score += 0.06; });
    neg.forEach(w => { if (lower.includes(w)) score -= 0.1; });
    
    const themeMap = {
        'Peace':['peace','ሰላም','nagaa'],'Unity':['unity','አንድነት','together'],
        'Hope':['hope','ተስፋ','future','children'],'Love':['love','ፍቅር','jaalala'],
        'Coexistence':['coexist','together','share'],'Justice':['justice','freedom','rights'],
        'Forgiveness':['forgiv','ይቅርታ','reconcil'],'Solidarity':['solidarity','support']
    };
    const themes = Object.entries(themeMap).filter(([k,v])=>v.some(w=>lower.includes(w))).map(([k])=>k);
    
    return {
        language,
        sentiment: Math.max(0.05, Math.min(0.98, Math.round(score*100)/100)),
        themes: themes.length ? themes.slice(0,4) : ['Peace','Hope'],
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
        
        for (let i = 0; i < 5; i++) {
            await new Promise(r => setTimeout(r, 3000));
            const resultRes = await fetch(`${AI_API}/gradio_api/call/research_chat/${event_id}`);
            const text = await resultRes.text();
            const lines = text.split('\n');
            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    try {
                        const data = JSON.parse(line.substring(6));
                        if (Array.isArray(data) && data.length > 0 && data[0]) {
                            return data[0];
                        }
                    } catch(e) {}
                }
            }
        }
        throw new Error('Timeout');
    } catch (e) {
        return getLocalKnowledge(question);
    }
}

function getLocalKnowledge(question) {
    const q = question.toLowerCase();
    if (q.includes('mediation') || q.includes('traditional') || q.includes('shimglina')) {
        return 'Ethiopian traditional mediation includes Shimglina (elder mediation in Amhara and Tigray communities), Gadaa (Oromo democratic governance recognized by UNESCO), Xeer (Somali customary law), Makabanto (Afar clan arbitration), and Songo (Sidama community assembly). Elders listen to all sides and deliver binding decisions focused on reconciliation.';
    }
    if (q.includes('gadaa')) return 'Gadaa is the Oromo democratic governance system recognized by UNESCO as an Intangible Cultural Heritage. Power rotates peacefully every 8 years through age-grade classes called Luba.';
    if (q.includes('peace')) return 'Peace in Ethiopia means communities living together in harmony, sharing resources, and resolving disputes through dialogue. Over 1,000 voices from all Ethiopian regions express this desire.';
    if (q.includes('region')) return 'Voices collected from: Tigray, Amhara, Oromia, Somali, Afar, Sidama, SNNPR, Gambella, Harari, Benishangul-Gumuz, Addis Ababa, Dire Dawa.';
    if (q.includes('diaspora')) return 'Ethiopian diaspora worldwide contributes through advocacy, knowledge sharing, and amplifying peace voices.';
    return 'The Ethiopian Peace Archive preserves 1,000+ real voices from all Ethiopian regions. Visit voices.html to explore their messages of peace, unity, and hope.';
}

function moderateContent(text) {
    const blocked = ['kill','murder','hate','violence'];
    const found = blocked.filter(w => text.toLowerCase().includes(w));
    return found.length ? { approved: false } : { approved: true };
}

async function extractTextFromImage(url) { return ''; }
async function translateText(text, lang) { return text; }

console.log('🧠 AI Ready — Llama 3.3 70B + Local Knowledge Base');
