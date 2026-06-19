/* ============================================
   IMAGE PROTECTION — Ethiopian Peace Archive
   Right-click disable, drag prevention, keyboard shortcuts
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // Disable right-click on protected images
    document.addEventListener('contextmenu', (e) => {
        if (e.target.classList.contains('protected-img') || 
            e.target.closest('.protected-img') ||
            e.target.closest('.gallery-item') ||
            e.target.closest('.media-card')) {
            e.preventDefault();
            return false;
        }
    });

    // Disable dragging on protected images
    document.addEventListener('dragstart', (e) => {
        if (e.target.tagName === 'IMG') {
            e.preventDefault();
            return false;
        }
    });

    // Keyboard shortcut protection
    document.addEventListener('keydown', (e) => {
        // Disable Ctrl+S (Save), Ctrl+U (View Source), Ctrl+P (Print), F12 (DevTools)
        if ((e.ctrlKey || e.metaKey) && 
            (e.key === 's' || e.key === 'u' || e.key === 'p' || e.key === 'S' || e.key === 'U' || e.key === 'P')) {
            e.preventDefault();
            return false;
        }
        if (e.key === 'F12') {
            e.preventDefault();
            return false;
        }
        // Disable Ctrl+Shift+I (DevTools)
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'i' || e.key === 'I' || e.key === 'j' || e.key === 'J')) {
            e.preventDefault();
            return false;
        }
    });

    // Add protection to all images
    protectAllImages();
});

/**
 * Add protected class and attributes to all gallery and media images
 */
function protectAllImages() {
    const imagesToProtect = document.querySelectorAll(
        '.gallery-item img, .media-card img, .protected-img, img[data-protect]'
    );
    
    imagesToProtect.forEach(img => {
        img.classList.add('protected-img');
        img.setAttribute('draggable', 'false');
        img.setAttribute('data-protect', 'true');
    });
}

/**
 * Protect dynamically added images (call after loading content)
 */
function protectNewImages() {
    protectAllImages();
}

/**
 * Disable right-click on entire page (optional - use sparingly)
 */
function enableFullProtection() {
    document.addEventListener('contextmenu', (e) => e.preventDefault());
}

/**
 * Remove all protection (for debugging)
 */
function disableProtection() {
    document.querySelectorAll('.protected-img').forEach(img => {
        img.classList.remove('protected-img');
        img.removeAttribute('draggable');
        img.removeAttribute('data-protect');
    });
}

// For debugging: type disableProtection() in console to remove protection
console.log('🛡️ Image protection active. Peace Archive.');
