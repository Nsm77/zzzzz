/**
 * a11y.js
 * Manages accessibility enhancements for the site.
 */

/**
 * Handles the "skip to main content" link functionality.
 * When the link is activated, it sets focus on the main content area.
 */
function handleSkipLink() {
    const skipLink = document.querySelector('a[href="#main"]');
    const mainContent = document.getElementById('main');

    if (!skipLink || !mainContent) {
        console.warn('Skip link or main content target not found.');
        return;
    }

    skipLink.addEventListener('click', (e) => {
        e.preventDefault();

        // Make the main content element focusable programmatically
        mainContent.setAttribute('tabindex', -1);
        mainContent.focus({ preventScroll: true }); // preventScroll might be useful depending on browser behavior

        // Visually scroll to the element
        mainContent.scrollIntoView({ behavior: 'smooth' });

        // Remove the tabindex after the element loses focus
        // to avoid polluting the tab order.
        mainContent.addEventListener('blur', () => {
            mainContent.removeAttribute('tabindex');
        }, { once: true });
    });
}

/**
 * Initializes all accessibility features.
 * This is the main exported function.
 */
export function initA11y() {
    try {
        handleSkipLink();
        // More a11y features can be added here in the future
        // e.g., prefers-reduced-motion class on body
    } catch (error) {
        console.error('Error initializing a11y module:', error);
    }
}
