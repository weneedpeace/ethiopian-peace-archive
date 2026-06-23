async function generateAndPlay(text, language) {
  const button = event.currentTarget;
  const originalText = button.innerHTML;
  button.innerHTML = 'Generating...';
  button.disabled = true;

  try {
    const res = await fetch('https://peace-audio-worker.onrender.com/api/generate-audio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, language })
    });

    if (!res.ok) throw new Error('Failed');

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    
    audio.play();
    audio.onended = () => URL.revokeObjectURL(url);
    
  } catch (e) {
    console.error(e);
    alert("ElevenLabs TTS failed. Falling back to browser...");
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = getLangCode(language);
    speechSynthesis.speak(utterance);
  } finally {
    button.innerHTML = originalText;
    button.disabled = false;
  }
}
