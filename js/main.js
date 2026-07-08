// ============================================
// main.js - Voice Archive Core Functions
// Handles: Voice cards, search, likes, shares, PDF
// ============================================

const VOICES_PASSWORD = 'peace2026';
const AUDIO_API = 'https://peace-audio-worker-git-main-addis3.vercel.app/api';

let allVoices = [], filteredVoices = [], currentCategory = 'all', pageSize = 20, currentPage = 1;
let pendingDocId = null, pendingChapterId = null;
let currentUserEmail = null;
let searchTimeout = null;

// ===== PASSWORD CHECK =====
function checkPassword() {
    const input = document.getElementById('passwordInput').value;
    const error = document.getElementById('passwordError');
    if (input === VOICES_PASSWORD) {
        document.getElementById('passwordScreen').classList.add('hidden');
        error.style.display = 'none';
        initArchive();
    } else {
        error.style.display = 'block';
        document.getElementById('passwordInput').value = '';
        document.getElementById('passwordInput').focus();
    }
}

// ===== INIT ARCHIVE =====
async function initArchive() {
    const skeleton = document.getElementById('skeletonLoader');
    try {
        const res = await fetch(SUPABASE_URL + '/rest/v1/ethiopian_voices?select=*&is_published=eq.true&order=created_at.desc', {
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
        });
        if (!res.ok) throw new Error('Network response was not ok');
        allVoices = await res.json();
        skeleton.style.display = 'none';
        updateStats();
        populateFilters();
        applySearch();
        checkLogin();
    } catch (e) { 
        skeleton.innerHTML = `
            <div style="color:#ff4444; padding:20px; text-align:center;">
                <p>⚠️ Could not load voices. Please refresh.</p>
                <button onclick="location.reload()" style="padding:8px 20px; border-radius:20px; background:var(--gold); color:#000; border:none; cursor:pointer;">🔄 Refresh</button>
            </div>
        `;
        console.error('Init error:', e);
    }
}

// ===== DEBOUNCE SEARCH =====
function debouncedSearch() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(applySearch, 300);
}

// ===== UPDATE STATS =====
function updateStats() {
    const ethCount = allVoices.filter(v => v.region === 'Ethiopia').length;
    const globalCount = allVoices.filter(v => v.region !== 'Ethiopia').length;
    const amhCount = allVoices.filter(v => v.language === 'Amharic').length;
    const oromoCount = allVoices.filter(v => v.language === 'Oromo').length;
    const somCount = allVoices.filter(v => v.language === 'Somali').length;
    
    document.getElementById('countAll').textContent = allVoices.length;
    document.getElementById('countEthiopia').textContent = ethCount;
    document.getElementById('countGlobal').textContent = globalCount;
    document.getElementById('countAmharic').textContent = amhCount;
    document.getElementById('countOromo').textContent = oromoCount;
    document.getElementById('countSomali').textContent = somCount;
    
    document.getElementById('statsRow').innerHTML = `
        <span class="stat-pill">🗣️ <strong>${allVoices.length}</strong> Voices</span>
        <span class="stat-pill">📍 <strong>${new Set(allVoices.map(v=>v.region)).size}</strong> Regions</span>
        <span class="stat-pill">🌐 <strong>${new Set(allVoices.map(v=>v.language)).size}</strong> Languages</span>
        <span class="stat-pill">✍️ <strong>${new Set(allVoices.map(v=>v.writer_name).filter(Boolean)).size}</strong> Writers</span>
    `;
}

function populateFilters() {
    const years = [...new Set(allVoices.map(v => v.year).filter(Boolean))].sort((a, b) => b - a);
    const sel = document.getElementById('yearSearch');
    sel.innerHTML = '<option value="">📅 All Years</option>';
    years.forEach(y => { sel.innerHTML += `<option value="${y}">${y}</option>`; });
}

// ===== SEARCH & FILTER =====
function applySearch() {
    const keyword = document.getElementById('searchInput').value.toLowerCase();
    const region = document.getElementById('regionSearch').value;
    const lang = document.getElementById('languageSearch').value;
    const year = document.getElementById('yearSearch').value;
    
    let voices = [...allVoices];
    if (keyword) voices = voices.filter(v => 
        (v.writer_name && v.writer_name.toLowerCase().includes(keyword)) ||
        (v.full_name && v.full_name.toLowerCase().includes(keyword)) ||
        (v.quote_english && v.quote_english.toLowerCase().includes(keyword)) ||
        (v.region && v.region.toLowerCase().includes(keyword))
    );
    if (region) voices = voices.filter(v => v.region === region);
    if (lang) voices = voices.filter(v => v.language === lang);
    if (year) voices = voices.filter(v => v.year === parseInt(year));
    
    if (currentCategory === 'MostLiked') {
        voices.sort((a, b) => (b.like_count || 0) - (a.like_count || 0));
    }
    
    filteredVoices = voices;
    currentPage = 1;
    renderVoices();
}

function filterCategory(cat) {
    currentCategory = cat;
    document.querySelectorAll('.cat-chip').forEach(c => c.classList.remove('active'));
    event.target.classList.add('active');
    currentPage = 1;
    applySearch();
}

// ===== ENHANCED RENDER VOICES =====
async function renderVoices() {
    const container = document.getElementById('quotesContainer');
    const toShow = filteredVoices.slice(0, currentPage * pageSize);
    
    if (!toShow.length) { 
        container.innerHTML = '<div class="loading" style="padding:20px;text-align:center;color:var(--text-dim);">No voices found matching your search.</div>'; 
        document.getElementById('loadMore').style.display = 'none'; 
        return; 
    }
    
    const tc = ['theme-0', 'theme-1', 'theme-2', 'theme-3', 'theme-4'];
    const countryFlags = {
        'Ethiopia': '🇪🇹', 'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'UK': '🇬🇧', 'Netherlands': '🇳🇱',
        'Germany': '🇩🇪', 'France': '🇫🇷', 'Italy': '🇮🇹', 'Spain': '🇪🇸',
        'Russia': '🇷🇺', 'Poland': '🇵🇱', 'Norway': '🇳🇴', 'Switzerland': '🇨🇭',
        'Japan': '🇯🇵', 'Malaysia': '🇲🇾', 'Brazil': '🇧🇷', 'Nigeria': '🇳🇬',
        'Somalia': '🇸🇴', 'Tanzania': '🇹🇿', 'DR Congo': '🇨🇩', 'Croatia': '🇭🇷',
        'Global': '🌐', 'Africa': '🌍', 'Unknown': '🌍'
    };
    
    // Batch fetch co-writers
    const chapterIds = [...new Set(toShow.map(v => v.chapter_id).filter(id => id))];
    let allCoWriters = {};
    if (chapterIds.length > 0) {
        try {
            const ids = chapterIds.map(id => `chapter_id.eq.${id}`).join(',');
            const res = await fetch(SUPABASE_URL + `/rest/v1/ethiopian_voices?select=*&is_founder=eq.false&or=(${ids})&order=created_at.desc`, {
                headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
            });
            const data = await res.json();
            data.forEach(cw => {
                if (!allCoWriters[cw.chapter_id]) allCoWriters[cw.chapter_id] = [];
                allCoWriters[cw.chapter_id].push(cw);
            });
        } catch (e) {}
    }
    
    let html = '';
    for (let i = 0; i < toShow.length; i++) {
        const v = toShow[i];
        const sp = Math.round((v.sentiment || 0.5) * 100);
        const showOriginal = v.language !== 'English' && v.quote_original && v.quote_original !== v.quote_english;
        const flag = countryFlags[v.region] || '🌍';
        
        const avatarContent = v.avatar_url 
            ? `<img src="${v.avatar_url}" class="writer-avatar" alt="${esc(v.full_name || v.writer_name || 'Writer')}" loading="lazy">`
            : `<div class="writer-avatar">${getInitials(v.full_name || v.writer_name)}</div>`;
        
        // Co-writers HTML
        const chapterCoWriters = allCoWriters[v.chapter_id] || [];
        let coWritersHtml = '';
        if (chapterCoWriters.length > 0) {
            coWritersHtml = `<div class="chapter-co-writers"><p class="co-writers-title">✍️ Chapter Co-Writers (${chapterCoWriters.length})</p>`;
            chapterCoWriters.forEach(cw => {
                const cwAvatar = cw.avatar_url 
                    ? `<img src="${cw.avatar_url}" class="co-writer-avatar" alt="${esc(cw.full_name || cw.writer_name)}" loading="lazy">`
                    : `<div class="co-writer-avatar">${getInitials(cw.full_name || cw.writer_name)}</div>`;
                coWritersHtml += `
                <div class="co-writer-card">
                    ${cwAvatar}
                    <div class="co-writer-info">
                        <div class="co-writer-name">${esc(cw.full_name || cw.writer_name)}</div>
                        ${cw.title ? `<div class="co-writer-title">${esc(cw.title)}</div>` : ''}
                        <div class="co-writer-quote">${esc(cw.quote_english || cw.quote_original)}</div>
                        <div class="co-writer-date">📅 ${new Date(cw.created_at).toLocaleDateString()}</div>
                    </div>
                </div>`;
            });
            coWritersHtml += `</div>`;
        }
        
        html += `
        <div class="voice-card enhanced" style="animation:fadeIn 0.4s ease forwards;animation-delay:${i * 0.03}s">
            <div class="voice-header-enhanced">
                <div class="profile-section">
                    ${avatarContent}
                    <div class="profile-details">
                        <div class="name-row">
                            <span class="full-name">${flag} ${esc(v.full_name || v.writer_name || 'Anonymous')}</span>
                            ${v.is_verified ? '<span class="verified-badge" title="Verified">✅</span>' : ''}
                        </div>
                        ${v.title ? `<div class="user-title">💼 ${esc(v.title)}</div>` : ''}
                        <div class="location-row">
                            <span class="region-badge">📍 ${esc(v.region || 'Unknown')}</span>
                            <span class="lang-badge">🌐 ${esc(v.language || 'N/A')}</span>
                            <span class="year-badge">📅 ${v.year || 'N/A'}</span>
                        </div>
                    </div>
                </div>
                <span class="voice-id">#${v.document_id || ''}</span>
            </div>
            
            <div class="quote-section">
                <div class="quote-label">💬 Message of Peace</div>
                <div class="quote-text">${esc(v.quote_english || v.quote_original)}</div>
                ${showOriginal ? `
                    <div class="quote-original">
                        <div class="original-label">📜 Original (${v.language})</div>
                        ${esc(v.quote_original)}
                    </div>` : ''}
            </div>
            
            <div class="themes-row">${(v.themes || []).map((t, j) => `<span class="theme-tag ${tc[j % 5]}">${esc(t)}</span>`).join('')}</div>
            <div class="sentiment-bar"><div class="sentiment-fill" style="width:${sp}%"></div></div>
            
            ${coWritersHtml}
            
            <div class="voice-footer-enhanced">
                <div class="action-buttons">
                    ${v.audio_url ? `
                        <audio controls class="audio-player-mini">
                            <source src="${v.audio_url}" type="audio/mpeg">
                        </audio>
                    ` : ''}
                    <button class="action-btn like-btn" id="likeBtn-${v.id}" onclick="likeVoice(${v.id})">
                        ❤️ <span id="likeCount-${v.id}">${v.like_count || 0}</span>
                    </button>
                    <span style="position:relative;">
                        <button class="action-btn share-btn" onclick="toggleShareMenu(${v.id})">
                            📤 <span id="shareCount-${v.id}">${v.starting_shares || 20}</span>
                        </button>
                        <div class="share-menu" id="shareMenu-${v.id}">
                            <a href="#" onclick="shareVoice(${v.id}, 'whatsapp')">📱 WhatsApp</a>
                            <a href="#" onclick="shareVoice(${v.id}, 'facebook')">📘 Facebook</a>
                            <a href="#" onclick="shareVoice(${v.id}, 'twitter')">🐦 Twitter/X</a>
                            <a href="#" onclick="shareVoice(${v.id}, 'copy')">📋 Copy Link</a>
                        </div>
                    </span>
                    <button class="action-btn join-btn" onclick="openChapterPopup('${v.chapter_id || 'new'}')">
                        ✍️ Join Chapter
                    </button>
                    <button class="action-btn chat-btn" onclick="openChatModal('${v.chapter_id || v.id}')">
                        💬 Chat
                    </button>
                    <button class="action-btn pdf-btn" onclick="generateChapterPDF('${v.chapter_id || v.id}')">
                        📄 PDF
                    </button>
                </div>
                ${v.cloudinary_url ? `
                    <button class="view-original-btn" onclick="openEmailPopup('${v.id}')">
                        👁️ View Original Document
                    </button>
                ` : ''}
            </div>
        </div>`;
    }
    
    container.innerHTML = html;
    document.getElementById('loadMore').style.display = filteredVoices.length > currentPage * pageSize ? 'block' : 'none';
    toShow.forEach(v => loadLikes(v.id));
}

function loadMore() { currentPage++; renderVoices(); }

// ===== LIKES =====
async function loadLikes(voiceId) {
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/voice_likes?select=count&voice_id=eq.${voiceId}`, {
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
        });
        const data = await res.json();
        const count = data[0]?.count || 0;
        const el = document.getElementById('likeCount-' + voiceId);
        if (el) el.textContent = count;
        const voice = allVoices.find(v => v.id === voiceId);
        if (voice) voice.like_count = count;
    } catch (e) {}
}

async function likeVoice(voiceId) {
    const btn = document.getElementById('likeBtn-' + voiceId);
    const countEl = document.getElementById('likeCount-' + voiceId);
    const likedKey = 'liked_' + voiceId;
    
    if (localStorage.getItem(likedKey)) {
        alert('You already liked this voice!');
        return;
    }
    
    btn.style.pointerEvents = 'none';
    btn.style.opacity = '0.6';
    
    try {
        await fetch(`${SUPABASE_URL}/rest/v1/voice_likes`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify({ voice_id: voiceId })
        });
        countEl.textContent = (parseInt(countEl.textContent) || 0) + 1;
        btn.classList.add('liked');
        localStorage.setItem(likedKey, 'true');
        updateCoins(voiceId, 1);
    } catch (e) {}
    
    setTimeout(() => {
        btn.style.pointerEvents = 'auto';
        btn.style.opacity = '1';
    }, 1000);
}

// ===== SHARE =====
function toggleShareMenu(id) {
    const menu = document.getElementById('shareMenu-' + id);
    menu.classList.toggle('active');
    document.querySelectorAll('.share-menu').forEach(m => {
        if (m.id !== 'shareMenu-' + id) m.classList.remove('active');
    });
}

async function shareVoice(id, platform) {
    const menu = document.getElementById('shareMenu-' + id);
    menu.classList.remove('active');
    const url = window.location.href.split('?')[0] + '?voice=' + id;
    if (platform === 'copy') {
        navigator.clipboard.writeText(url).then(() => alert('Link copied!'));
    } else if (platform === 'whatsapp') {
        window.open('https://wa.me/?text=' + encodeURIComponent('Check out this peace voice: ' + url), '_blank');
    } else if (platform === 'facebook') {
        window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url), '_blank');
    } else if (platform === 'twitter') {
        window.open('https://twitter.com/intent/tweet?text=' + encodeURIComponent('Peace voice: ') + '&url=' + encodeURIComponent(url), '_blank');
    }
    const countEl = document.getElementById('shareCount-' + id);
    countEl.textContent = (parseInt(countEl.textContent) || 0) + 1;
    updateCoins(id, 2);
}

function updateCoins(voiceId, amount) {
    const el = document.getElementById('coinCount-' + voiceId);
    if (el) {
        const current = parseInt(el.textContent) || 0;
        el.textContent = current + amount;
    }
}

// ===== EMAIL VERIFICATION =====
function openEmailPopup(id) {
    pendingDocId = id;
    document.getElementById('verifyEmail').value = '';
    document.getElementById('verifyMsg').textContent = '';
    document.getElementById('emailPopup').classList.add('active');
}

function closeEmailPopup() {
    document.getElementById('emailPopup').classList.remove('active');
    pendingDocId = null;
}

async function verifyEmailAndShowImage() {
    const email = document.getElementById('verifyEmail').value.trim();
    const msg = document.getElementById('verifyMsg');
    if (!email) { msg.textContent = 'Please enter your email.'; return; }
    try {
        const res = await fetch(SUPABASE_URL + `/rest/v1/ethiopian_voices?select=extracted_data,cloudinary_url&id=eq.${pendingDocId}`, {
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
        });
        const data = await res.json();
        const doc = data[0];
        const ownerEmail = doc?.extracted_data?.email || '';
        if (email.toLowerCase() === ownerEmail.toLowerCase()) {
            closeEmailPopup();
            const rawUrl = doc.cloudinary_url;
            const enhancedUrl = rawUrl.replace('/upload/', '/upload/e_improve:outdoor,e_sharpen,e_contrast,f_auto,q_auto/');
            document.getElementById('lightboxImage').src = enhancedUrl;
            document.getElementById('imageLightbox').classList.add('active');
        } else {
            msg.textContent = '❌ Email does not match the document owner.';
        }
    } catch (e) { msg.textContent = 'Error verifying email.'; }
}

function closeLightbox() {
    document.getElementById('imageLightbox').classList.remove('active');
    document.getElementById('lightboxImage').src = '';
}

// ===== CHAPTER JOIN =====
function openChapterPopup(chapterId) {
    pendingChapterId = chapterId;
    document.getElementById('chapterPopup').classList.add('active');
    document.getElementById('chapterMsg').textContent = '';
    document.getElementById('chapterFounderEmail').value = '';
    document.getElementById('chapterWriterName').value = '';
    document.getElementById('chapterMessage').value = '';
    document.getElementById('chapterAvatarUrl').value = '';
    document.getElementById('chapterAvatarPreview').style.display = 'none';
    document.getElementById('chapterUploadStatus').textContent = '📷 Tap to upload a profile picture (or leave empty for auto-avatar)';
    document.getElementById('chapterUploadStatus').style.color = 'var(--text-dim)';
}

function closeChapterPopup() {
    document.getElementById('chapterPopup').classList.remove('active');
    pendingChapterId = null;
}

async function uploadChapterProfile(input) {
    const file = input.files[0];
    if (!file) return;
    const status = document.getElementById('chapterUploadStatus');
    status.textContent = '⏳ Uploading...';
    status.style.color = '#eab308';
    
    const preview = document.getElementById('chapterAvatarPreview');
    preview.src = URL.createObjectURL(file);
    preview.style.display = 'block';
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'peace_archive');
    try {
        const res = await fetch(CLOUDINARY_UPLOAD, { method: 'POST', body: formData });
        const data = await res.json();
        if (data.secure_url) {
            document.getElementById('chapterAvatarUrl').value = data.secure_url;
            status.textContent = '✅ Uploaded!';
            status.style.color = '#4ade80';
        } else {
            status.textContent = '❌ Upload failed. You can still submit without an avatar.';
            status.style.color = '#ef4444';
        }
    } catch (e) {
        status.textContent = '❌ Upload failed. You can still submit without an avatar.';
        status.style.color = '#ef4444';
    }
}

async function submitChapterMessage() {
    const founderEmail = document.getElementById('chapterFounderEmail').value.trim();
    const writerName = document.getElementById('chapterWriterName').value.trim();
    const message = document.getElementById('chapterMessage').value.trim();
    const avatarUrl = document.getElementById('chapterAvatarUrl').value.trim();
    const msgEl = document.getElementById('chapterMsg');
    
    if (!founderEmail || !writerName || !message) {
        msgEl.textContent = 'Please fill in all required fields.';
        msgEl.style.color = '#ef4444';
        return;
    }
    
    try {
        const res = await fetch(SUPABASE_URL + `/rest/v1/ethiopian_voices?select=id,extracted_data&chapter_id=eq.${pendingChapterId}&is_founder=eq.true`, {
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
        });
        const founder = await res.json();
        const founderData = founder[0];
        const realFounderEmail = founderData?.extracted_data?.email || '';
        
        if (founderEmail.toLowerCase() !== realFounderEmail.toLowerCase()) {
            msgEl.textContent = '❌ Founder email does not match.';
            msgEl.style.color = '#ef4444';
            return;
        }
        
        const newVoice = {
            chapter_id: pendingChapterId,
            is_founder: false,
            writer_name: writerName,
            full_name: writerName,
            quote_english: message,
            avatar_url: avatarUrl || null,
            region: 'Co-Writer',
            year: new Date().getFullYear(),
            language: 'English',
            is_published: true,
            starting_likes: 50,
            starting_shares: 20,
            themes: ['Legacy', 'Family', 'Peace'],
            sentiment: 0.75
        };
        
        const insertRes = await fetch(SUPABASE_URL + '/rest/v1/ethiopian_voices', {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': 'Bearer ' + SUPABASE_KEY,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify(newVoice)
        });
        
        if (insertRes.ok) {
            msgEl.textContent = '✅ Added to chapter!';
            msgEl.style.color = '#4ade80';
            setTimeout(() => { closeChapterPopup(); location.reload(); }, 1800);
        } else {
            msgEl.textContent = '❌ Error saving.';
            msgEl.style.color = '#ef4444';
        }
    } catch (e) {
        msgEl.textContent = '❌ Error verifying founder.';
        msgEl.style.color = '#ef4444';
    }
}

function redirectToContribute() {
    closeChapterPopup();
    window.location.href = 'contribute.html';
}

// ===== PDF GENERATION =====
function generateChapterPDF(chapterId) {
    const chapterVoices = allVoices.filter(v => v.chapter_id === chapterId || v.id === chapterId);
    
    if (!chapterVoices.length) {
        alert('No voices found in this chapter');
        return;
    }
    
    let html = `
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body { font-family: Arial, sans-serif; padding: 40px; color: #333; max-width: 800px; margin: 0 auto; }
                h1 { color: #1a1a1a; border-bottom: 3px solid gold; padding-bottom: 10px; }
                .voice { margin: 25px 0; padding: 15px; border-left: 4px solid #22c55e; background: #f9f9f9; }
                .writer { color: #666; font-size: 14px; margin-bottom: 5px; font-weight: bold; }
                .quote { font-size: 16px; line-height: 1.6; }
                .original { color: #555; font-style: italic; margin-top: 8px; font-size: 14px; }
                .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #999; font-size: 12px; }
            </style>
        </head>
        <body>
            <h1>🕊️ Peace Voices - Chapter ${chapterId}</h1>
            <p style="color:#666;">Generated from Ethiopian Peace Archive | peace.archive</p>
            <p style="color:#999;font-size:12px;">${chapterVoices.length} voices | ${new Date().toLocaleDateString()}</p>
    `;
    
    chapterVoices.forEach(v => {
        html += `
            <div class="voice">
                <div class="writer">✍️ ${esc(v.full_name || v.writer_name || 'Anonymous')} | 📍 ${esc(v.region)} | 🌐 ${esc(v.language)} | 📅 ${v.year || 'N/A'}</div>
                <div class="quote">${esc(v.quote_english || v.quote_original)}</div>
                ${v.language !== 'English' && v.quote_original ? 
                    `<div class="original">📜 Original (${v.language}): ${esc(v.quote_original)}</div>` : ''}
            </div>
        `;
    });
    
    html += `
            <div class="footer">
                <p>Created with Ethiopian Peace Archive</p>
                <p>© ${new Date().getFullYear()} All voices preserved for peace</p>
            </div>
        </body></html>
    `;
    
    const win = window.open('', '_blank', 'width=800,height=600');
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 500);
}

// ===== WALLET =====
function openWallet() {
    let totalCoins = 0;
    allVoices.forEach(v => {
        const likes = parseInt(document.getElementById('likeCount-' + v.id)?.textContent) || 0;
        const shares = parseInt(document.getElementById('shareCount-' + v.id)?.textContent) || 0;
        const starting = (v.starting_likes || 50) + (v.starting_shares || 20);
        totalCoins += likes + (shares * 2) + starting;
    });
    document.getElementById('walletBalance').textContent = totalCoins;
    document.getElementById('walletPopup').classList.add('active');
}

function closeWallet() {
    document.getElementById('walletPopup').classList.remove('active');
}

function redeemCoin(item) {
    const balance = parseInt(document.getElementById('walletBalance').textContent);
    let cost = 0;
    if (item === 'postcard') cost = 50;
    else if (item === 'booklet') cost = 200;
    else if (item === 'course') cost = 500;
    if (balance >= cost) {
        alert(`✅ Redeemed ${item}! (${cost} coins)`);
        document.getElementById('walletBalance').textContent = balance - cost;
    } else {
        alert(`❌ Need ${cost} coins. You have ${balance}.`);
    }
}

// ===== SCROLL TO TOP =====
window.addEventListener('scroll', function() {
    const btn = document.getElementById('scrollToTop');
    if (window.scrollY > 400) btn.classList.add('show');
    else btn.classList.remove('show');
});

// ===== CLICK OUTSIDE =====
document.addEventListener('click', function(e) {
    if (!e.target.closest('.share-btn')) {
        document.querySelectorAll('.share-menu').forEach(m => m.classList.remove('active'));
    }
});
