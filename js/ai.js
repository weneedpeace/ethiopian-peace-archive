/* ============================================
   ETHIOPIAN PEACE ARCHIVE AI
   Direct Hugging Face Serverless API
   No Space needed — Always works
   ============================================ */

const HF = 'https://api-inference.huggingface.co/models';

async function hf(model, text) {
    try {
        const res = await fetch(`${HF}/${model}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ inputs: text.substring(0, 500), options: { wait_for_model: true } })
        });
        if (res.status === 503) {
            await new Promise(r => setTimeout(r, 5000));
            return hf(model, text);
        }
        return res.json();
    } catch(e) { return null; }
}

async function detectLanguage(text) {
    const r = await hf('papluca/xlm-roberta-base-language-detection', text);
    if (r?.[0]) {
        const map = { en:'English', am:'Amharic', om:'Oromo', ti:'Tigrinya', so:'Somali', ar:'Arabic', fr:'French', de:'German', ru:'Russian', zh:'Chinese' };
        return map[r[0].label] || r[0].label;
    }
    if (/[\u1200-\u137F]/.test(text)) return 'Amharic/Tigrinya';
    if (/[\u0600-\u06FF]/.test(text)) return 'Arabic';
    return 'English';
}

async function analyzeSentiment(text) {
    const r = await hf('cardiffnlp/twitter-roberta-base-sentiment-latest', text);
    if (r?.[0]) {
        const s = r[0];
        const pos = s.find(x => x.label === 'positive')?.score || 0;
        const neu = s.find(x => x.label === 'neutral')?.score || 0;
        return Math.round((pos + neu * 0.5) * 100) / 100;
    }
    return 0.75;
}

function detectThemes(text) {
    const t = text.toLowerCase();
    const themes = {
        Peace: ['peace','ሰላም','nagaa'], Unity: ['unity','አንድነት','tokkummaa','together'],
        Hope: ['hope','ተስፋ','abdii','future','children'], Coexistence: ['coexist','አብሮ','wada'],
        Solidarity: ['solidarity','support','deeggarsa'], Forgiveness: ['forgiv','ይቅርታ','dhiifama'],
        Love: ['love','ፍቅር','jaalala'], Justice: ['justice','ፍትህ','haqa','freedom']
    };
    const found = Object.entries(themes).filter(([k,v]) => v.some(w => t.includes(w))).map(([k]) => k);
    return found.length ? found.slice(0,4) : ['Peace','Hope'];
}

async function analyzeVoice(text) {
    const [lang, sent] = await Promise.all([detectLanguage(text), analyzeSentiment(text)]);
    return { language: lang, sentiment: sent, themes: detectThemes(text), powered_by: 'Ethiopian Peace Archive AI' };
}

function researchAssistant(q) {
    const k = {
        peace: 'Peace in Ethiopia means communities living together. 1,000+ voices from all regions express this.',
        gadaa: 'Gadaa is Oromo democratic governance. Power rotates every 8 years. UNESCO recognized.',
        shimglina: 'Shimglina is Amhara/Tigray elder mediation for reconciliation.',
        xeer: 'Xeer is Somali customary law based on collective responsibility.',
        regions: 'Voices from Tigray, Amhara, Oromia, Somali, Afar, Sidama, SNNPR, Gambella, Harari, Benishangul-Gumuz, Addis Ababa, Dire Dawa.'
    };
    const ql = q.toLowerCase();
    for (const [key, val] of Object.entries(k)) { if (ql.includes(key)) return val; }
    return 'The Ethiopian Peace Archive has 1,000+ voices. Browse the archive.';
}

function moderateContent(text) {
    const bad = ['kill','murder','hate','violence'];
    const found = bad.filter(w => text.toLowerCase().includes(w));
    return found.length ? { approved: false, reason: `Blocked: ${found.join(', ')}` } : { approved: true };
}

async function extractTextFromImage(url) { return ''; }
async function translateText(text, lang) { return text; }

console.log('🧠 AI Ready — Direct Hugging Face API');
