/* ============================================
   SHARE FUNCTIONS — Ethiopian Peace Archive
   X (Twitter), Facebook, WhatsApp, Telegram, LinkedIn, Copy
   ============================================ */

/**
 * Share on X (Twitter)
 */
function shareOnX(text, url) {
    const shareUrl = url || window.location.href;
    const shareText = text.length > 240 ? text.substring(0, 237) + '...' : text;
    window.open(
        `https://x.com/intent/post?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}&hashtags=EthiopianPeaceArchive,VoicesForPeace`,
        '_blank',
        'width=600,height=400'
    );
}

/**
 * Share on Facebook
 */
function shareOnFacebook(text, url) {
    const shareUrl = url || window.location.href;
    window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(text)}`,
        '_blank',
        'width=600,height=400'
    );
}

/**
 * Share on WhatsApp
 */
function shareOnWhatsApp(text, url) {
    const shareUrl = url || window.location.href;
    window.open(
        `https://wa.me/?text=${encodeURIComponent(text + ' ' + shareUrl)}`,
        '_blank'
    );
}

/**
 * Share on Telegram
 */
function shareOnTelegram(text, url) {
    const shareUrl = url || window.location.href;
    window.open(
        `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`,
        '_blank'
    );
}

/**
 * Share on LinkedIn
 */
function shareOnLinkedIn(text, url) {
    const shareUrl = url || window.location.href;
    window.open(
        `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
        '_blank',
        'width=600,height=500'
    );
}

/**
 * Copy text to clipboard
 */
function copyToClipboard(text, button) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showCopiedFeedback(button);
        }).catch(() => {
            fallbackCopy(text, button);
        });
    } else {
        fallbackCopy(text, button);
    }
}

function fallbackCopy(text, button) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
        document.execCommand('copy');
        showCopiedFeedback(button);
    } catch (e) {
        button.textContent = '❌ Failed';
    }
    document.body.removeChild(textarea);
}

function showCopiedFeedback(button) {
    const originalText = button.textContent;
    button.textContent = '✅ Copied!';
    button.classList.add('copied');
    setTimeout(() => {
        button.textContent = originalText;
        button.classList.remove('copied');
    }, 2000);
}

/**
 * Create share buttons HTML for a voice quote
 */
function createShareButtons(quoteText, location, year) {
    const shareText = `"${quoteText}" — ${location}, ${year}`;
    const escaped = escapeForJS(shareText);
    
    return `
        <div class="share-btns">
            <button class="share-btn share-x" onclick="shareOnX('${escaped}')" title="Share on X">𝕏 Post</button>
            <button class="share-btn share-fb" onclick="shareOnFacebook('${escaped}')" title="Share on Facebook">📘 Share</button>
            <button class="share-btn share-wa" onclick="shareOnWhatsApp('${escaped}')" title="Share on WhatsApp">💬 WhatsApp</button>
            <button class="share-btn share-tg" onclick="shareOnTelegram('${escaped}')" title="Share on Telegram">✈️ Telegram</button>
            <button class="share-btn share-copy" onclick="copyToClipboard('${escaped}', this)" title="Copy to clipboard">📋 Copy</button>
        </div>
    `;
}

/**
 * Escape string for safe use in JavaScript
 */
function escapeForJS(str) {
    return str
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/"/g, '\\"')
        .replace(/\n/g, ' ')
        .replace(/\r/g, '');
}

/**
 * Share current page
 */
function sharePage(title, text) {
    const shareData = {
        title: title || document.title,
        text: text || 'Voices for peace from Ethiopia and the world.',
        url: window.location.href
    };

    if (navigator.share) {
        navigator.share(shareData).catch(() => {});
    } else {
        // Fallback: open WhatsApp share
        shareOnWhatsApp(shareData.text, shareData.url);
    }
}
