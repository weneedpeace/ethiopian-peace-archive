// ============================================
// SHARE FUNCTIONS — Ethiopian Peace Archive
// ============================================

function shareOnX(text, url) {
    const shareUrl = url || window.location.href;
    window.open(
        `https://x.com/intent/post?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}&hashtags=EthiopianPeaceArchive,VoicesForPeace`,
        '_blank'
    );
}

function shareOnFacebook(text, url) {
    const shareUrl = url || window.location.href;
    window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(text)}`,
        '_blank'
    );
}

function shareOnWhatsApp(text, url) {
    const shareUrl = url || window.location.href;
    window.open(
        `https://wa.me/?text=${encodeURIComponent(text + ' ' + shareUrl)}`,
        '_blank'
    );
}

function shareOnTelegram(text, url) {
    const shareUrl = url || window.location.href;
    window.open(
        `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`,
        '_blank'
    );
}

function shareOnLinkedIn(text, url) {
    const shareUrl = url || window.location.href;
    window.open(
        `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
        '_blank'
    );
}

function copyToClipboard(text, button) {
    navigator.clipboard.writeText(text).then(() => {
        const originalText = button.textContent;
        button.textContent = '✅ Copied!';
        button.classList.add('copied');
        setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('copied');
        }, 2000);
    });
}

function createShareButtons(quoteText, location, year) {
    const shareText = `"${quoteText}" — ${location}, ${year} #EthiopianPeaceArchive #VoicesForPeace`;
    return `
        <div class="share-btns">
            <button class="share-btn share-x" onclick="shareOnX('${escapeJS(shareText)}')" title="Share on X">𝕏 Post</button>
            <button class="share-btn share-fb" onclick="shareOnFacebook('${escapeJS(shareText)}')" title="Share on Facebook">📘 Share</button>
            <button class="share-btn share-wa" onclick="shareOnWhatsApp('${escapeJS(shareText)}')" title="Share on WhatsApp">💬 WhatsApp</button>
            <button class="share-btn share-tg" onclick="shareOnTelegram('${escapeJS(shareText)}')" title="Share on Telegram">✈️ Telegram</button>
            <button class="share-btn share-copy" onclick="copyToClipboard('${escapeJS(shareText)}', this)" title="Copy to clipboard">📋 Copy</button>
        </div>
    `;
}

function escapeJS(str) {
    return str.replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/\n/g, ' ');
}
