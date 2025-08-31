import { initA11y } from './modules/a11y.js';
// Future modules will be imported here:
// import { initNav } from './modules/nav.js';
// import { initAccordions } from './modules/accordion.js';
// import { initCarousels } from './modules/carousel.js';
// import { initConsent } from './modules/consent.js';

/**
 * @description Main application entry point. This function runs when the DOM is fully loaded.
 */
const main = () => {
    console.log("Assurance Santé Premium - Scripts initializing...");

    // Initialize all imported modules
    initA11y();
    // initNav();
    // initAccordions();
    // initCarousels();
    // initConsent();

    console.log("Scripts initialized successfully.");
};

// Ensure the DOM is fully loaded before running the main script
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
} else {
    // If the DOM is already loaded, run main immediately
    main();
}
