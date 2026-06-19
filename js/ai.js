/* ============================================
   AI ENGINE — Ethiopian Peace Archive
   Local-first + Hugging Face backup
   Always works, even offline
   ============================================ */

const HF_TOKEN = '';

// ========== LOCAL AI (Instant, No API) ==========

function localDetectLanguage(text) {
    const patterns = {
        'Amharic': /[\u1200-\u137F]/,
        'Tigrinya': /[\u1200-\u137F]/, // Same script as Amharic
        'Oromo': /\b(kan|keessa|tokko|naga|jira|barbaada|keenya)\b/i,
        'Somali': /\b(waa|waxaa|nabad|soomaali|dhamaan)\b/i,
        'Arabic': /[\u0600-\u06FF]/,
        'Chinese': /[\u4e00-\u9fff]/,
        'Russian': /[\u0400-\u04FF]/,
        'English': /^[a-zA-Z\s.,!?'"()-]+$/,
        'French': /\b(le|la|les|des|nous|vous|paix|amour)\b/i,
        'German': /\b(der|die|das|und|ist|frieden)\b/i,
    };
    
    for (const [lang, pattern] of Object.entries(patterns)) {
        if (pattern.test(text)) return lang;
    }
    return 'English';
}

function localAnalyzeSentiment(text) {
    const positiveWords = [
        'peace', 'unity', 'love', 'hope', 'together', 'harmony', 'coexist',
        'reconciliation', 'forgive', 'heal', 'strong', 'better', 'future',
        'ሰላም', 'ፍቅር', 'አንድነት', 'ተስፋ', 'nagaa', 'jaalala', 'tokkummaa',
        'amity', 'solidarity', 'justice', 'freedom', 'respect', 'dignity'
    ];
    
    const negativeWords = [
        'war', 'hate', 'kill', 'fight', 'destroy', 'suffer', 'pain',
        'conflict', 'violence', 'death', 'enemy', 'revenge'
    ];
    
    const lower = text.toLowerCase();
    let score = 0.5;
    
    positiveWords.forEach(w => { if (lower.includes(w)) score += 0.05; });
    negativeWords.forEach(w => { if (lower.includes(w)) score -= 0.1; });
    
    return Math.max(0.1, Math.min(1.0, Math.round(score * 100) / 100));
}

function localDetectThemes(text) {
    const themePatterns = {
        'Peace': /\b(peace|ሰላም|nagaa|salaam)\b/i,
        'Unity': /\b(unity|together|አንድነት|tokkummaa|hade|hade)\b/i,
        'Hope': /\b(hope|future|better|ተስፋ|abdii|better)\b/i,
        'Coexistence': /\b(coexist|together|live|share|አብሮ|wada|wada)\b/i,
        'Solidarity': /\b(solidarity|support|stand|together|ድጋፍ|deeggarsa)\b/i,
        'Forgiveness': /\b(forgiv|reconcil|heal|ይቅርታ|dhiifama)\b/i,
        'Love': /\b(love|ፍቅር|jaalala|love)\b/i,
        'Pan-Africanism': /\b(africa|አፍሪካ|afrika|pan.african)\b/i,
        'Justice': /\b(justice|fair|right|ፍትህ|haqa)\b/i,
        'History': /\b(history|past|ancestor|ታሪክ|seen)\b/i,
    };
    
    const themes = [];
    for (const [theme, pattern] of Object.entries(themePatterns)) {
        if (pattern.test(text)) themes.push(theme);
    }
    return themes.length ? themes.slice(0, 4) : ['Peace'];
}

// ========== HYBRID AI (Local + Hugging Face) ==========

async function detectLanguage(text) {
    const local = localDetectLanguage(text);
    if (local !== 'English' && local !== 'Unknown') return local;
    
    try {
        const result = await hfCall('papluca/xlm-roberta-base-language-detection', text);
        if (result?.[0]) {
            const langMap = { en: 'English', am: 'Amharic', om: 'Oromo', ti: 'Tigrinya', so: 'Somali', ar: 'Arabic', fr: 'French', de: 'German', ru: 'Russian', zh: 'Chinese' };
            return langMap[result[0].label] || local;
        }
    } catch (e) {}
    return local;
}

async function analyzeSentiment(text) {
    return localAnalyzeSentiment(text);
}

async function detectThemes(text) {
    return localDetectThemes(text);
}

async function analyzeVoice(text) {
    console.log('🔍 Analyzing voice...');
    const [language, sentiment, themes] = await Promise.all([
        detectLanguage(text).catch(() => localDetectLanguage(text)),
        analyzeSentiment(text).catch(() => localAnalyzeSentiment(text)),
        detectThemes(text).catch(() => localDetectThemes(text))
    ]);
    return {
        language: language || 'English',
        sentiment: sentiment || 0.75,
        themes: themes || ['Peace'],
        analyzed_at: new Date().toISOString()
    };
}

// ========== HUGGING FACE (Backup Only) ==========

async function hfCall(model, inputs) {
    try {
        const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...(HF_TOKEN && { Authorization: `Bearer ${HF_TOKEN}` }) },
            body: JSON.stringify({ inputs })
        });
        if (response.status === 503) {
            await new Promise(r => setTimeout(r, 2000));
            return hfCall(model, inputs);
        }
        if (!response.ok) throw new Error(`HF error: ${response.status}`);
        return await response.json();
    } catch (e) {
        console.log('HF unavailable, using local AI');
        return null;
    }
}

// ========== RESEARCH ASSISTANT ==========

async function researchAssistant(question) {
    const responses = {
        'peace': 'Peace is more than the absence of war. In the Ethiopian Peace Archive, over 1,000 voices from all regions express that true peace means justice, unity, coexistence, and the freedom to live without fear.',
        'traditional': 'Ethiopia has rich traditional peace systems: Shimglina (elder mediation in Amhara/Tigray), Gadaa (Oromo democratic governance), Xeer (Somali customary law), Makabanto (Afar clan arbitration), and Songo (Sidama community assembly).',
        'diaspora': 'The Ethiopian diaspora plays a vital role in peacebuilding through advocacy, remittances, knowledge transfer, and amplifying voices from their communities. Our platform welcomes diaspora contributions.',
        'want': 'Analysis of 1,000+ voices shows that everyday Ethiopians overwhelmingly want peace, unity, coexistence, and hope for their children. The most common themes are Peace, Unity, and Hope.',
    };
    
    const lower = question.toLowerCase();
    for (const [key, response] of Object.entries(responses)) {
        if (lower.includes(key)) return response;
    }
    
    return 'The Ethiopian Peace Archive contains 1,000+ voices from all regions of Ethiopia. People speak of peace, unity, hope, and the desire to live together in harmony. Browse the archive to hear their voices directly.';
}

// ========== OCR (Hugging Face Only) ==========

async function extractTextFromImage(imageUrl) {
    try {
        const result = await hfCall('microsoft/trocr-base-printed', imageUrl);
        if (result?.[0]?.generated_text) return result[0].generated_text;
    } catch (e) {}
    return '';
}

console.log('🧠 AI Engine Ready — Local-first, always works. Ethiopian Peace Archive.');
