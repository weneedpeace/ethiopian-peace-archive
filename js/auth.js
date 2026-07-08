// ============================================
// auth.js - Authentication Functions
// Handles: Login, Signup, User State Management
// ============================================

const SUPABASE_URL = 'https://rnafjznurgnrdonyxfgs.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuYWZqem51cmducmRvbnl4ZmdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3NzA1OTEsImV4cCI6MjA5NzM0NjU5MX0.lfJYkGg37CdOwsrvcgvD7I4T054yrPQj-ztfsSo2S0s';
const CLOUDINARY_UPLOAD = 'https://api.cloudinary.com/v1_1/djb3falqu/image/upload';

let currentUser = null;

// Check if user is already logged in
function checkLogin() {
    const saved = localStorage.getItem('peace_user');
    if (saved) {
        try {
            currentUser = JSON.parse(saved);
            updateUIForLoggedInUser();
        } catch (e) {
            localStorage.removeItem('peace_user');
        }
    }
}

// Auth Modal Controls
function openAuthModal() {
    document.getElementById('authModal').style.display = 'flex';
}

function closeAuthModal() {
    document.getElementById('authModal').style.display = 'none';
}

function showSignUp() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('signUpForm').style.display = 'block';
    document.getElementById('signUpMsg').textContent = '';
}

function showLogin() {
    document.getElementById('signUpForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('loginMsg').textContent = '';
}

// Handle Sign Up
async function handleSignUp() {
    const name = document.getElementById('signUpName').value.trim();
    const email = document.getElementById('signUpEmail').value.trim();
    const password = document.getElementById('signUpPassword').value;
    const msg = document.getElementById('signUpMsg');
    
    if (!name || !email || !password) {
        msg.textContent = '❌ All fields are required';
        msg.style.color = '#ef4444';
        return;
    }
    
    if (password.length < 6) {
        msg.textContent = '❌ Password must be 6+ characters';
        msg.style.color = '#ef4444';
        return;
    }
    
    try {
        const res = await fetch(SUPABASE_URL + '/auth/v1/signup', {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password,
                data: { display_name: name }
            })
        });
        
        if (res.ok) {
            msg.textContent = '✅ Account created! Check your email to confirm.';
            msg.style.color = '#4ade80';
            setTimeout(() => {
                showLogin();
                document.getElementById('loginEmail').value = email;
            }, 2000);
        } else {
            const err = await res.json();
            msg.textContent = '❌ ' + (err.msg || 'Signup failed');
            msg.style.color = '#ef4444';
        }
    } catch (e) {
        msg.textContent = '❌ Connection error. Try again.';
        msg.style.color = '#ef4444';
    }
}

// Handle Login
async function handleLogin() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const msg = document.getElementById('loginMsg');
    
    if (!email || !password) {
        msg.textContent = '❌ Enter email and password';
        return;
    }
    
    try {
        const res = await fetch(SUPABASE_URL + '/auth/v1/token?grant_type=password', {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        if (res.ok) {
            const data = await res.json();
            currentUser = data.user;
            localStorage.setItem('peace_user', JSON.stringify(currentUser));
            closeAuthModal();
            updateUIForLoggedInUser();
        } else {
            msg.textContent = '❌ Invalid email or password';
        }
    } catch (e) {
        msg.textContent = '❌ Connection error. Try again.';
    }
}

// Update UI after login
function updateUIForLoggedInUser() {
    if (!currentUser) return;
    
    const userBtn = document.getElementById('userBtn');
    const chatBtn = document.getElementById('chatBtn');
    
    const displayName = currentUser.user_metadata?.display_name || currentUser.email;
    userBtn.textContent = '👤 ' + displayName;
    userBtn.onclick = () => {
        if (confirm('Sign out from ' + displayName + '?')) {
            currentUser = null;
            localStorage.removeItem('peace_user');
            userBtn.textContent = '👤 Sign In';
            userBtn.onclick = openAuthModal;
            chatBtn.style.display = 'none';
            closeChatModal();
        }
    };
    
    chatBtn.style.display = 'inline-block';
}

// Get initials for avatar
function getInitials(name) {
    if (!name) return '👤';
    const parts = name.split(' ');
    if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length-1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}

// Escape HTML
function esc(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
