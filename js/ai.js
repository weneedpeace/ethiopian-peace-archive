// ============================================
// AI ENGINE - FRONTEND CLIENT
// ============================================

const AI_API = 'https://peace-audio-worker.vercel.app/api';

// ============================================
// 1. GENERATE TEXT
// ============================================

async function generateText(prompt) {
    try {
        const response = await fetch(`${AI_API}/generate-text`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to generate text');
        }
        
        const data = await response.json();
        return data.text;
    } catch (error) {
        console.error('Text generation error:', error);
        throw error;
    }
}

// ============================================
// 2. GENERATE AUDIO
// ============================================

async function generateAudio(text, voice_id = '21m00Tcm4TlvDq8ikWAM') {
    try {
        const response = await fetch(`${AI_API}/generate-audio`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, voice_id })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to generate audio');
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Audio generation error:', error);
        throw error;
    }
}

// ============================================
// 3. SAVE VOICE TO ARCHIVE
// ============================================

async function saveVoice(voiceData) {
    try {
        const response = await fetch(`${AI_API}/save-voice`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(voiceData)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to save voice');
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Save voice error:', error);
        throw error;
    }
}

// ============================================
// 4. FETCH ALL VOICES
// ============================================

async function fetchVoices() {
    try {
        const response = await fetch(`${AI_API}/voices`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch voices');
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Fetch voices error:', error);
        throw error;
    }
}

// ============================================
// 5. EXAMPLE: COMPLETE AI WORKFLOW
// ============================================

async function createAIVoice(prompt, region, year, language) {
    try {
        // Step 1: Generate text
        const generatedText = await generateText(prompt);
        console.log('Generated text:', generatedText);

        // Step 2: Generate audio
        const audioResult = await generateAudio(generatedText);
        console.log('Audio generated:', audioResult.audio_url);

        // Step 3: Save to archive
        const voiceData = {
            document_id: `ETH-${Date.now()}`,
            region: region,
            year: parseInt(year),
            language: language,
            quote_original: generatedText,
            quote_english: generatedText,
            themes: ['Peace', 'Unity'],
            sentiment: 0.85,
            audio_url: audioResult.audio_url
        };

        const saved = await saveVoice(voiceData);
        console.log('Voice saved:', saved);

        return { text: generatedText, audio: audioResult, saved };
    } catch (error) {
        console.error('AI workflow error:', error);
        throw error;
    }
}

// ============================================
// 6. EXPOSE TO WINDOW FOR ADMIN PANEL
// ============================================

window.AI = {
    generateText,
    generateAudio,
    saveVoice,
    fetchVoices,
    createAIVoice
};
