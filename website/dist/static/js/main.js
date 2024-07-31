document.addEventListener("DOMContentLoaded", () => {
    const toggleMenu = () => {
        const navbarLinks = document.getElementById('navbar-links');
        if (navbarLinks) {
            navbarLinks.classList.toggle("hidden");
        }
    };

    const menuToggleBtn = document.getElementById('navbar-hamburger');
    if (menuToggleBtn) {
        menuToggleBtn.addEventListener('click', toggleMenu);
    }
});
