// ============================================
// notifications.js - Real-time Notifications
// ============================================

var SUPABASE_URL_NOTIF = 'https://rnafjznurgnrdonyxfgs.supabase.co';
var SUPABASE_KEY_NOTIF = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuYWZqem51cmducmRvbnl4ZmdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3NzA1OTEsImV4cCI6MjA5NzM0NjU5MX0.lfJYkGg37CdOwsrvcgvD7I4T054yrPQj-ztfsSo2S0s';

async function sendNotification(userEmail, type, message, link) {
    try {
        await fetch(SUPABASE_URL_NOTIF + '/rest/v1/notifications', {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_KEY_NOTIF,
                'Authorization': 'Bearer ' + SUPABASE_KEY_NOTIF,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
                user_email: userEmail,
                type: type,
                message: message,
                link: link || '',
                is_read: false
            })
        });
    } catch(e) {
        console.error('Notification error:', e);
    }
}

function notifyLike(voiceOwnerEmail, likerName, voiceId) {
    sendNotification(voiceOwnerEmail, 'like', '❤️ ' + likerName + ' liked your voice', 'voices.html?voice=' + voiceId);
}

function notifyShare(voiceOwnerEmail, sharerName, voiceId) {
    sendNotification(voiceOwnerEmail, 'share', '📤 ' + sharerName + ' shared your voice', 'voices.html?voice=' + voiceId);
}

function notifyChapterJoin(founderEmail, joinerName, chapterId) {
    sendNotification(founderEmail, 'chapter_join', '✍️ ' + joinerName + ' joined your chapter', 'voices.html?chapter=' + chapterId);
}

function notifyChatMessage(userEmail, senderName, chapterId) {
    sendNotification(userEmail, 'chat_message', '💬 ' + senderName + ' sent a message', 'voices.html?chat=' + chapterId);
}

function notifyWelcome(userEmail, userName) {
    sendNotification(userEmail, 'welcome', '🕊️ Welcome, ' + userName + '! Your account is pending approval.', 'voices.html');
}

async function getNotifications(userEmail, limit) {
    limit = limit || 20;
    try {
        var res = await fetch(
            SUPABASE_URL_NOTIF + '/rest/v1/notifications?select=*&user_email=eq.' + encodeURIComponent(userEmail) + '&order=created_at.desc&limit=' + limit,
            { headers: { 'apikey': SUPABASE_KEY_NOTIF, 'Authorization': 'Bearer ' + SUPABASE_KEY_NOTIF } }
        );
        return await res.json();
    } catch(e) {
        return [];
    }
}

async function getUnreadCount(userEmail) {
    try {
        var res = await fetch(
            SUPABASE_URL_NOTIF + '/rest/v1/notifications?select=count&user_email=eq.' + encodeURIComponent(userEmail) + '&is_read=eq.false',
            { headers: { 'apikey': SUPABASE_KEY_NOTIF, 'Authorization': 'Bearer ' + SUPABASE_KEY_NOTIF } }
        );
        var data = await res.json();
        return data[0] ? data[0].count : 0;
    } catch(e) {
        return 0;
    }
}

async function markAsRead(notificationId) {
    try {
        await fetch(SUPABASE_URL_NOTIF + '/rest/v1/notifications?id=eq.' + notificationId, {
            method: 'PATCH',
            headers: {
                'apikey': SUPABASE_KEY_NOTIF,
                'Authorization': 'Bearer ' + SUPABASE_KEY_NOTIF,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify({ is_read: true })
        });
    } catch(e) {
        console.error('Mark read error:', e);
    }
}

async function markAllAsRead(userEmail) {
    try {
        await fetch(
            SUPABASE_URL_NOTIF + '/rest/v1/notifications?user_email=eq.' + encodeURIComponent(userEmail) + '&is_read=eq.false',
            {
                method: 'PATCH',
                headers: {
                    'apikey': SUPABASE_KEY_NOTIF,
                    'Authorization': 'Bearer ' + SUPABASE_KEY_NOTIF,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({ is_read: true })
            }
        );
    } catch(e) {
        console.error('Mark all read error:', e);
    }
}

function createNotificationBell() {
    var bell = document.createElement('div');
    bell.id = 'notificationBell';
    bell.style.cssText = 'position:relative;cursor:pointer;display:inline-flex;align-items:center;';
    bell.innerHTML = '<span style="font-size:1.3rem;">🔔</span><span id="notifBadge" style="display:none;position:absolute;top:-6px;right:-6px;background:#ef4444;color:#fff;border-radius:50%;width:18px;height:18px;font-size:0.65rem;font-weight:bold;text-align:center;line-height:18px;font-family:var(--font-ui);">0</span>';
    bell.onclick = toggleNotificationPanel;
    return bell;
}

function createNotificationPanel() {
    var panel = document.createElement('div');
    panel.id = 'notificationPanel';
    panel.style.cssText = 'display:none;position:fixed;top:60px;right:20px;width:360px;max-height:500px;background:#1a1a1a;border:2px solid var(--gold);border-radius:16px;z-index:9999;box-shadow:0 10px 40px rgba(0,0,0,0.5);overflow:hidden;';
    panel.innerHTML = '<div style="background:var(--gold);color:#000;padding:12px 16px;font-weight:bold;display:flex;justify-content:space-between;align-items:center;font-family:var(--font-ui);"><span>🔔 Notifications</span><button onclick="markAllAsRead(window._currentUserEmail);loadNotifications();" style="background:none;border:none;color:#000;cursor:pointer;font-size:0.7rem;font-weight:600;">Mark all read</button></div><div id="notificationList" style="max-height:400px;overflow-y:auto;padding:8px;"><p style="color:var(--text-dim);text-align:center;padding:20px;">Loading...</p></div>';
    return panel;
}

async function loadNotifications() {
    var userEmail = window._currentUserEmail;
    if (!userEmail) return;
    
    var notifs = await getNotifications(userEmail);
    var unread = await getUnreadCount(userEmail);
    var container = document.getElementById('notificationList');
    var badge = document.getElementById('notifBadge');
    
    if (unread > 0) {
        badge.style.display = 'block';
        badge.textContent = unread > 99 ? '99+' : unread;
    } else {
        badge.style.display = 'none';
    }
    
    if (!notifs.length) {
        container.innerHTML = '<p style="color:var(--text-dim);text-align:center;padding:20px;">No notifications yet 🕊️</p>';
        return;
    }
    
    var icons = {
        'like': '❤️',
        'share': '📤',
        'chapter_join': '✍️',
        'chat_message': '💬',
        'welcome': '🕊️'
    };
    
    var html = '';
    for (var i = 0; i < notifs.length; i++) {
        var n = notifs[i];
        var bg = n.is_read ? 'transparent' : 'rgba(251,191,36,0.05)';
        var dot = n.is_read ? '' : '<span style="width:8px;height:8px;background:var(--gold);border-radius:50%;flex-shrink:0;margin-top:6px;"></span>';
        var clickAction = n.link ? "window.location.href='" + n.link + "';" : '';
        html += '<div onclick="' + clickAction + 'markAsRead(' + n.id + ')" style="padding:12px;border-bottom:1px solid rgba(255,255,255,0.05);cursor:pointer;display:flex;gap:10px;align-items:flex-start;background:' + bg + ';" onmouseover="this.style.background=\'rgba(255,255,255,0.03)\'" onmouseout="this.style.background=\'' + bg + '\'">';
        html += '<span style="font-size:1.2rem;flex-shrink:0;">' + (icons[n.type] || '📌') + '</span>';
        html += '<div style="flex:1;"><p style="color:var(--text);font-size:0.85rem;font-family:var(--font-ui);margin:0;">' + n.message + '</p>';
        html += '<p style="color:var(--text-muted);font-size:0.65rem;margin-top:4px;">' + timeAgo(n.created_at) + '</p></div>';
        html += dot + '</div>';
    }
    container.innerHTML = html;
}

function toggleNotificationPanel() {
    var panel = document.getElementById('notificationPanel');
    if (panel.style.display === 'none' || !panel.style.display) {
        panel.style.display = 'block';
        loadNotifications();
    } else {
        panel.style.display = 'none';
    }
}

document.addEventListener('click', function(e) {
    var panel = document.getElementById('notificationPanel');
    var bell = document.getElementById('notificationBell');
    if (panel && bell && !bell.contains(e.target) && !panel.contains(e.target)) {
        panel.style.display = 'none';
    }
});

function timeAgo(dateString) {
    var now = new Date();
    var date = new Date(dateString);
    var seconds = Math.floor((now - date) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return Math.floor(seconds / 60) + 'm ago';
    if (seconds < 86400) return Math.floor(seconds / 3600) + 'h ago';
    if (seconds < 604800) return Math.floor(seconds / 86400) + 'd ago';
    return date.toLocaleDateString();
}

function initNotifications(userEmail) {
    window._currentUserEmail = userEmail;
    var navRight = document.querySelector('nav div[style*="display:flex"]');
    if (navRight && !document.getElementById('notificationBell')) {
        navRight.insertBefore(createNotificationBell(), navRight.firstChild);
    }
    if (!document.getElementById('notificationPanel')) {
        document.body.appendChild(createNotificationPanel());
    }
    if (userEmail) {
        setInterval(function() {
            var panel = document.getElementById('notificationPanel');
            if (panel && panel.style.display === 'block') {
                loadNotifications();
            }
            getUnreadCount(userEmail).then(function(count) {
                var badge = document.getElementById('notifBadge');
                if (badge) {
                    if (count > 0) {
                        badge.style.display = 'block';
                        badge.textContent = count > 99 ? '99+' : count;
                    } else {
                        badge.style.display = 'none';
                    }
                }
            });
        }, 30000);
    }
}
