/* ============================================
   AI ENGINE — Ethiopian Peace Archive
   Hugging Face Integration
   Free tier: ~100 requests/hour
   ============================================ */

const HF_TOKEN = ''; // Optional: add your Hugging Face token for more requests

/**
 * Call Hugging Face API
 * @param {string} model - Hugging Face model name
 * @param {object} inputs - Input data
 * @returns {Promise<object>} - API response
 */
async function hfCall(model, inputs) {
    try {
        const response = await fetch(
            `https://api-inference.huggingface.co/models/${model}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(HF_TOKEN && { 'Authorization': `Bearer ${HF_TOKEN}` })
                },
                body: JSON.stringify({ inputs })
            }
        );
        
        if (!response.ok) {
            // Model may be loading (cold start)
            if (response.status === 503) {
                console.log('Model loading, retrying...');
                await new Promise(r => setTimeout(r, 3000));
                return hfCall(model, inputs);
            }
            throw new Error(`HF API error: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Hugging Face error:', error);
        return null;
    }
}

/**
 * Auto-detect language of text
 * Supports: English, Amharic, Oromo, Tigrinya, Somali, Arabic, French
 */
async function detectLanguage(text) {
    const result = await hfCall('papluca/xlm-roberta-base-language-detection', text);
    
    if (result && result[0]) {
        const langMap = {
            'en': 'English',
            'am': 'Amharic',
            'om': 'Oromo',
            'ti': 'Tigrinya',
            'so': 'Somali',
            'ar': 'Arabic',
            'fr': 'French',
            'de': 'German',
            'ru': 'Russian',
            'zh': 'Chinese'
        };
        return langMap[result[0].label] || result[0].label;
    }
    return 'Unknown';
}

/**
 * Analyze sentiment of text
 * Returns score 0-1 (0=negative, 1=positive)
 */
async function analyzeSentiment(text) {
    const result = await hfCall('cardiffnlp/twitter-roberta-base-sentiment-latest', text);
    
    if (result && result[0]) {
        // Map to 0-1 scale
        const scores = result[0];
        const positive = scores.find(s => s.label === 'positive')?.score || 0;
        const neutral = scores.find(s => s.label === 'neutral')?.score || 0;
        const negative = scores.find(s => s.label === 'negative')?.score || 0;
        
        // Weighted score
        const sentimentScore = (positive * 1 + neutral * 0.5 + negative * 0);
        return Math.round(sentimentScore * 100) / 100;
    }
    return 0.75; // Default slightly positive
}

/**
 * Detect themes in peace-related text
 */
async function detectThemes(text) {
    // Using zero-shot classification to match against peace themes
    const candidateThemes = [
        'Peace', 'Unity', 'Hope', 'Coexistence', 
        'Solidarity', 'Forgiveness', 'Love', 'Reconciliation',
        'Justice', 'Freedom', 'Pan-Africanism', 'History'
    ];
    
    const result = await hfCall(
        'facebook/bart-large-mnli',
        {
            text: text,
            labels: candidateThemes
        }
    );
    
    if (result) {
        // Return themes with confidence > 0.5
        const scores = result.scores || result;
        const labels = result.labels || candidateThemes;
        
        return labels
            .filter((_, i) => scores[i] > 0.5)
            .slice(0, 4); // Max 4 themes
    }
    return ['Peace']; // Default
}

/**
 * Extract text from image (OCR)
 * For your scanned documents
 */
async function extractTextFromImage(imageUrl) {
    // Using a free OCR model
    const result = await hfCall('microsoft/trocr-base-printed', imageUrl);
    
    if (result && result[0]) {
        return result[0].generated_text || '';
    }
    return '';
}

/**
 * AI Research Assistant - Answer questions about peace
 */
async function researchAssistant(question, context = '') {
    const prompt = `You are a peace research assistant for the Ethiopian Peace Archive. 
The archive contains 1,000+ voices from all Ethiopian regions about peace.
Answer the following question helpfully and accurately.
Context: ${context || 'Ethiopian peace voices archive'}

Question: ${question}

Answer:`;

    const result = await hfCall('google/flan-t5-base', prompt);
    
    if (result && result[0]) {
        return result[0].generated_text || 'I cannot answer that right now.';
    }
    return 'The AI assistant is currently unavailable. Please try again.';
}

/**
 * Translate text (for Amharic/Oromo ↔ English)
 */
async function translateText(text, targetLang = 'en') {
    const langMap = {
        'en': 'eng_Latn',
        'am': 'amh_Ethi',
        'om': 'gaz_Latn', // Oromo
        'ti': 'tir_Ethi', // Tigrinya
        'so': 'som_Latn', // Somali
        'ar': 'arb_Arab',
        'fr': 'fra_Latn'
    };
    
    const sourceLang = await detectLanguage(text);
    const sourceCode = Object.keys(langMap).find(k => langMap[k] === sourceLang) || 'en';
    
    // Using NLLB model for translation
    const result = await hfCall('facebook/nllb-200-distilled-600M', {
        text: text,
        src_lang: langMap[sourceCode] || 'eng_Latn',
        tgt_lang: langMap[targetLang] || 'eng_Latn'
    });
    
    if (result && result[0]) {
        return result[0].translation_text || text;
    }
    return text;
}

/**
 * Full analysis pipeline for a submitted voice
 */
async function analyzeVoice(text) {
    console.log('🔍 Analyzing voice with AI...');
    
    const [language, sentiment, themes] = await Promise.all([
        detectLanguage(text),
        analyzeSentiment(text),
        detectThemes(text)
    ]);
    
    return {
        language: language || 'Unknown',
        sentiment: sentiment || 0.75,
        themes: themes || ['Peace'],
        analyzed_at: new Date().toISOString()
    };
}

console.log('🧠 AI Engine loaded. Ethiopian Peace Archive.');
