/* ============================================
   NAVIGATION — Ethiopian Peace Archive
   Slide menu, hamburger, overlay for all pages.
   ============================================ */

/**
 * Toggle the mobile slide menu
 */
function toggleMenu() {
    const hamburger = document.getElementById('hamburger');
    const slideMenu = document.getElementById('slideMenu');
    const slideOverlay = document.getElementById('slideOverlay');

    if (!hamburger || !slideMenu || !slideOverlay) return;

    hamburger.classList.toggle('open');
    slideMenu.classList.toggle('open');
    slideOverlay.classList.toggle('open');

    // Prevent body scroll when menu is open
    document.body.style.overflow = 
        slideMenu.classList.contains('open') ? 'hidden' : '';
}

/**
 * Close the menu (called from overlay click)
 */
function closeMenu() {
    const hamburger = document.getElementById('hamburger');
    const slideMenu = document.getElementById('slideMenu');
    const slideOverlay = document.getElementById('slideOverlay');

    if (!hamburger || !slideMenu || !slideOverlay) return;

    hamburger.classList.remove('open');
    slideMenu.classList.remove('open');
    slideOverlay.classList.remove('open');
    document.body.style.overflow = '';
}

// Auto-close menu when clicking any link inside it
document.addEventListener('DOMContentLoaded', () => {
    const menuLinks = document.querySelectorAll('#slideMenu a');
    menuLinks.forEach(link => {
        link.addEventListener('click', () => {
            closeMenu();
        });
    });

    // Close on overlay click
    const overlay = document.getElementById('slideOverlay');
    if (overlay) {
        overlay.addEventListener('click', closeMenu);
    }

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeMenu();
        }
    });
});
