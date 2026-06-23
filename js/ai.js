// ============================================
// AI ENGINE — Calls your Vercel Backend
// ============================================

const API_URL = 'https://peace-audio-worker-git-main-addis3.vercel.app/api';

// ============================================
// 1. Generate Content via Vercel
// ============================================

async function generateContent(type, topic, tone) {
    try {
        const response = await fetch(`${API_URL}/generate-text`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, topic, tone })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Generation failed');
        }

        const data = await response.json();
        return data.content;
    } catch (error) {
        console.error('AI Generation Error:', error);
        return null;
    }
}

// ============================================
// 2. Export to Window
// ============================================

window.EPA = {
    generate: generateContent
};

console.log('✅ Ethiopian Peace Archive AI Engine (Vercel Backend) loaded.');
