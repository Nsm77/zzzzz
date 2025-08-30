// Navigation Mobile Top Simple - Texte Uniquement
(function() {
    'use strict';
    
    let topNav = null;
    let lastScrollY = 0;
    let isScrollingDown = false;
    let isDesktop = false;
    let scrollTimeout = null;
    
    // Vérifier si on est sur desktop
    function checkIfDesktop() {
        return window.innerWidth > 992;
    }
    
    // Créer la navigation mobile UNIQUEMENT sur mobile
    function createMobileNav() {
        // Ne rien faire si on est sur desktop
        if (checkIfDesktop()) {
            return;
        }
        
        if (topNav) return;
        
        const basePath = window.location.pathname.includes('/pages/') ? '../' : './';
        
        topNav = document.createElement('div');
        topNav.className = 'mobile-top-nav';
        topNav.innerHTML = `
            <div class="mobile-nav-container">
                <a href="${basePath}index.html" class="mobile-nav-logo">Assurance Santé</a>
                <div class="mobile-nav-menu">
                    <a href="${basePath}index.html" class="mobile-nav-link">Accueil</a>
                    <a href="${basePath}pages/services.html" class="mobile-nav-link">Services</a>
                    <a href="${basePath}pages/faq.html" class="mobile-nav-link">FAQ</a>
                    <a href="${basePath}pages/contact.html" class="mobile-nav-link">Contact</a>
                </div>
                <div class="mobile-nav-actions">
                    <a href="${basePath}pages/devis.html" class="mobile-nav-cta">Devis</a>
                    <a href="tel:0982444148" class="mobile-nav-phone">Appel</a>
                </div>
            </div>
        `;
        
        document.body.appendChild(topNav);
        setActiveLink();
    }
    
    // Supprimer la navigation mobile
    function removeMobileNav() {
        if (topNav) {
            topNav.remove();
            topNav = null;
        }
    }
    
    // Définir le lien actif
    function setActiveLink() {
        if (!topNav || checkIfDesktop()) return;
        
        const currentPath = window.location.pathname;
        const links = topNav.querySelectorAll('.mobile-nav-link');
        
        links.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            const fileName = href.split('/').pop();
            const currentFileName = currentPath.split('/').pop() || 'index.html';
            
            if (fileName === currentFileName || 
                (currentFileName === '' && fileName === 'index.html')) {
                link.classList.add('active');
            }
        });
    }
    
    // Gérer le scroll UNIQUEMENT sur mobile avec debouncing
    function handleScroll() {
        // Ne rien faire si on est sur desktop
        if (checkIfDesktop() || !topNav) return;
        
        const currentScrollY = window.pageYOffset;
        
        // Seuil minimal pour éviter les micro-mouvements
        if (Math.abs(currentScrollY - lastScrollY) < 5) return;
        
        const scrollingDown = currentScrollY > lastScrollY;
        const isNearTop = currentScrollY < 50;
        
        // Toujours afficher si près du haut
        if (isNearTop) {
            topNav.classList.remove('hidden');
            isScrollingDown = false;
        } else {
            // Gérer l'affichage/masquage basé sur la direction
            if (scrollingDown !== isScrollingDown) {
                isScrollingDown = scrollingDown;
                
                if (scrollingDown) {
                    topNav.classList.add('hidden');
                } else {
                    topNav.classList.remove('hidden');
                }
            }
        }
        
        lastScrollY = currentScrollY;
        
        // Réafficher après un délai d'inactivité
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            if (topNav && !checkIfDesktop()) {
                topNav.classList.remove('hidden');
            }
        }, 1500);
    }
    
    // Initialiser UNIQUEMENT sur mobile
    function init() {
        isDesktop = checkIfDesktop();
        
        if (!isDesktop) {
            createMobileNav();
            
            // Écouter le scroll UNIQUEMENT sur mobile avec throttling
            let ticking = false;
            window.addEventListener('scroll', function() {
                if (checkIfDesktop()) return; // Double vérification
                
                if (!ticking) {
                    requestAnimationFrame(function() {
                        handleScroll();
                        ticking = false;
                    });
                    ticking = true;
                }
            }, { passive: true });
        }
    }
    
    // Gérer le redimensionnement
    function handleResize() {
        const wasDesktop = isDesktop;
        isDesktop = checkIfDesktop();
        
        if (isDesktop && !wasDesktop) {
            // Passage de mobile à desktop - supprimer la nav mobile
            removeMobileNav();
            clearTimeout(scrollTimeout);
        } else if (!isDesktop && wasDesktop) {
            // Passage de desktop à mobile - créer la nav mobile
            createMobileNav();
        }
    }
    
    // Gérer la visibilité de la page
    function handleVisibilityChange() {
        if (document.hidden || checkIfDesktop()) return;
        
        // Réafficher la navigation quand la page redevient visible
        if (topNav) {
            topNav.classList.remove('hidden');
        }
    }
    
    // Démarrer quand le DOM est prêt
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Écouter les événements
    window.addEventListener('resize', handleResize, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Nettoyage au déchargement de la page
    window.addEventListener('beforeunload', function() {
        clearTimeout(scrollTimeout);
    });
    
})();

