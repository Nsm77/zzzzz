document.addEventListener("DOMContentLoaded", function() {
    // Preloader
    const preloader = document.getElementById("preloader");
    if (preloader) {
        setTimeout(() => {
            preloader.style.opacity = "0";
            setTimeout(() => preloader.style.display = "none", 500);
        }, 1000);
    }

    // Header Scroll Effect
    const header = document.querySelector(".header");
    if (header) {
        window.addEventListener("scroll", () => {
            if (window.scrollY > 50) {
                header.classList.add("scrolled");
            } else {
                header.classList.remove("scrolled");
            }
        });
    }



    // AOS Initialization
    if (typeof AOS !== "undefined") {
        AOS.init({
            duration: 1000,
            easing: "ease-in-out",
            once: true,
            mirror: false,
        });
    }



    // Cookie Consent
    const cookieBanner = document.getElementById("cookie-banner");
    const acceptCookies = document.getElementById("accept-cookies");
    const customizeCookies = document.getElementById("customize-cookies");

    if (cookieBanner && acceptCookies && customizeCookies) {
        if (!localStorage.getItem("cookieConsent")) {
            cookieBanner.style.display = "flex";
        }

        acceptCookies.addEventListener("click", () => {
            localStorage.setItem("cookieConsent", "accepted");
            cookieBanner.style.display = "none";
        });

        customizeCookies.addEventListener("click", () => {
            alert("Fonctionnalité de personnalisation des cookies à implémenter.");
            // For now, just accept them for demo purposes
            localStorage.setItem("cookieConsent", "accepted");
            cookieBanner.style.display = "none";
        });
    }
});
