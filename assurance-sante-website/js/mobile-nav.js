// Navigation mobile améliorée
document.addEventListener('DOMContentLoaded', function() {
    // Éléments du DOM
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    const navOverlay = document.getElementById('nav-overlay');
    const navLinks = document.querySelectorAll('.nav-link');
    const header = document.querySelector('.header');
    
    // Fonction pour ouvrir le menu
    function openMenu() {
        if (hamburger && navMenu && navOverlay) {
            hamburger.classList.add('active');
            navMenu.classList.add('active');
            navOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Accessibilité
            hamburger.setAttribute('aria-expanded', 'true');
            navMenu.setAttribute('aria-hidden', 'false');
        }
    }
    
    // Fonction pour fermer le menu
    function closeMenu() {
        if (hamburger && navMenu && navOverlay) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            navOverlay.classList.remove('active');
            document.body.style.overflow = '';
            
            // Accessibilité
            hamburger.setAttribute('aria-expanded', 'false');
            navMenu.setAttribute('aria-hidden', 'true');
        }
    }
    
    // Fonction pour basculer le menu
    function toggleMenu() {
        if (navMenu && navMenu.classList.contains('active')) {
            closeMenu();
        } else {
            openMenu();
        }
    }
    
    // Event listeners
    if (hamburger) {
        hamburger.addEventListener('click', toggleMenu);
        
        // Accessibilité - navigation au clavier
        hamburger.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleMenu();
            }
        });
    }
    
    // Fermer le menu en cliquant sur l'overlay
    if (navOverlay) {
        navOverlay.addEventListener('click', closeMenu);
    }
    
    // Fermer le menu en cliquant sur un lien
    navLinks.forEach(link => {
        link.addEventListener('click', closeMenu);
    });
    
    // Fermer le menu en cliquant sur les boutons d'action mobile
    const mobileActionButtons = document.querySelectorAll('.mobile-nav-actions .btn');
    mobileActionButtons.forEach(button => {
        button.addEventListener('click', closeMenu);
    });
    
    // Fermer le menu avec la touche Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && navMenu && navMenu.classList.contains('active')) {
            closeMenu();
        }
    });
    
    // Gérer le redimensionnement de la fenêtre
    window.addEventListener('resize', function() {
        if (window.innerWidth > 992) {
            closeMenu();
        }
    });
    
    // Navigation sticky avec masquage au scroll (seulement sur mobile)
    let lastScrollTop = 0;
    let ticking = false;
    
    function updateHeader() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Seulement sur mobile (max-width: 992px)
        if (window.innerWidth <= 992 && header) {
            if (scrollTop > lastScrollTop && scrollTop > 100) {
                // Scroll vers le bas - masquer la navigation
                header.style.transform = 'translateY(-100%)';
                header.style.transition = 'transform 0.3s ease';
            } else {
                // Scroll vers le haut - afficher la navigation
                header.style.transform = 'translateY(0)';
                header.style.transition = 'transform 0.3s ease';
            }
        } else if (header) {
            // Sur desktop, toujours visible
            header.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = scrollTop;
        ticking = false;
    }
    
    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateHeader);
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', requestTick);
    
    // Amélioration de l'accessibilité
    if (hamburger) {
        hamburger.setAttribute('aria-label', 'Menu de navigation');
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.setAttribute('aria-controls', 'nav-menu');
    }
    
    if (navMenu) {
        navMenu.setAttribute('aria-hidden', 'true');
    }
    
    // Animation fluide pour les appareils à faible performance
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    if (prefersReducedMotion.matches) {
        document.documentElement.style.setProperty('--transition-duration', '0s');
    }
});

// Fonction utilitaire pour détecter les appareils tactiles
function isTouchDevice() {
    return (('ontouchstart' in window) ||
           (navigator.maxTouchPoints > 0) ||
           (navigator.msMaxTouchPoints > 0));
}

// Ajouter une classe pour les appareils tactiles
if (isTouchDevice()) {
    document.documentElement.classList.add('touch-device');
} else {
    document.documentElement.classList.add('no-touch');
}

