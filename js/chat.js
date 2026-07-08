// ============================================
// chat.js - Group Chat Functions
// Handles: Chat messages, real-time polling
// ============================================

let currentChapterChat = null;
let chatPollingInterval = null;

// Open chat modal
function openChatModal(chapterId) {
    if (!currentUser) {
        alert('Please sign in to use chat');
        openAuthModal();
        return;
    }
    
    if (!chapterId) {
        chapterId = prompt('Enter Chapter ID to join chat (from voice card):');
        if (!chapterId) return;
    }
    
    currentChapterChat = chapterId;
    document.getElementById('chatModal').classList.add('active');
    document.getElementById('chatChapterTitle').textContent = '💬 Chat: ' + chapterId;
    document.getElementById('chatMessages').innerHTML = '<p style="color:var(--text-dim);text-align:center;padding:20px;">Loading messages...</p>';
    
    loadChatMessages(chapterId);
    startChatPolling(chapterId);
}

// Close chat modal
function closeChatModal() {
    document.getElementById('chatModal').classList.remove('active');
    stopChatPolling();
    currentChapterChat = null;
}

// Load messages from Supabase
async function loadChatMessages(chapterId) {
    try {
        const res = await fetch(
            SUPABASE_URL + `/rest/v1/chat_messages?chapter_id=eq.${chapterId}&order=created_at.asc&limit=100`,
            { headers: { 'apikey': SUPABASE_KEY } }
        );
        const messages = await res.json();
        displayChatMessages(messages);
    } catch (e) {
        console.error('Load chat error:', e);
        document.getElementById('chatMessages').innerHTML = '<p style="color:#ef4444;text-align:center;">Error loading messages</p>';
    }
}

// Display messages in chat window
function displayChatMessages(messages) {
    const container = document.getElementById('chatMessages');
    
    if (!messages || !messages.length) {
        container.innerHTML = '<p style="color:var(--text-dim);text-align:center;padding:20px;">No messages yet. Start the conversation!</p>';
        return;
    }
    
    container.innerHTML = '';
    
    messages.forEach(msg => {
        const isMine = currentUser && msg.user_email === currentUser.email;
        const bubble = document.createElement('div');
        bubble.className = 'chat-bubble ' + (isMine ? 'mine' : 'other');
        
        const time = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        if (isMine) {
            bubble.innerHTML = `${esc(msg.message)}<span class="chat-time">${time}</span>`;
        } else {
            bubble.innerHTML = `
                <div class="chat-sender">${esc(msg.user_name || 'User')}</div>
                ${esc(msg.message)}
                <span class="chat-time">${time}</span>
            `;
        }
        
        container.appendChild(bubble);
    });
    
    container.scrollTop = container.scrollHeight;
}

// Send a message
async function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message || !currentUser || !currentChapterChat) return;
    
    const sendBtn = document.getElementById('chatSendBtn');
    sendBtn.disabled = true;
    sendBtn.textContent = '...';
    
    try {
        await fetch(SUPABASE_URL + '/rest/v1/chat_messages', {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_KEY,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
                chapter_id: currentChapterChat,
                user_email: currentUser.email,
                user_name: currentUser.user_metadata?.display_name || 'User',
                message: message
            })
        });
        
        input.value = '';
        input.focus();
        loadChatMessages(currentChapterChat);
    } catch (e) {
        console.error('Send error:', e);
        alert('Failed to send message');
    }
    
    sendBtn.disabled = false;
    sendBtn.textContent = 'Send';
}

// Polling for new messages (every 3 seconds)
function startChatPolling(chapterId) {
    stopChatPolling();
    chatPollingInterval = setInterval(() => {
        loadChatMessages(chapterId);
    }, 3000);
}

function stopChatPolling() {
    if (chatPollingInterval) {
        clearInterval(chatPollingInterval);
        chatPollingInterval = null;
    }
}

// Enter key to send message
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && document.activeElement.id === 'chatInput') {
        e.preventDefault();
        sendChatMessage();
    }
});
