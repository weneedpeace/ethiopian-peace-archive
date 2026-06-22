async function generate() {
    const topic = document.getElementById('topicInput').value.trim();
    if (!topic) return alert('Enter a topic.');
    
    const tone = document.getElementById('toneInput').value;
    const out = document.getElementById('outputBox');
    const loader = document.getElementById('loadingBar');
    
    out.innerHTML = '<p style="text-align:center;color:var(--text-dim)">🧠 Generating content...</p>';
    loader.classList.add('on');
    
    // Use the new EPA generator
    const result = await EPA.generate(currentType, topic, tone);
    
    loader.classList.remove('on');
    
    if (result) {
        outputText = result;
        out.innerHTML = result.replace(/\n/g, '<br>')
            .replace(/## (.+)/g, '<h2>$1</h2>')
            .replace(/### (.+)/g, '<h3>$1</h3>')
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/- (.+)/g, '<li>$1</li>');
        document.getElementById('copyBtn').style.display = 'inline-block';
        document.getElementById('downloadBtn').style.display = 'inline-block';
        document.getElementById('clearBtn').style.display = 'inline-block';
    } else {
        out.innerHTML = '<p style="color:var(--red);text-align:center">Generation failed. Try again.</p>';
    }
}
