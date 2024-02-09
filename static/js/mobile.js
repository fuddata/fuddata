export const setupMobileMenuToggle = () => {
  const toggleMenu = () => {
    const navbarLinks = document.querySelector(".navbar_links");
    if (navbarLinks) {
      navbarLinks.classList.toggle("block");
    }
  };

  const menuToggleBtn = document.getElementById('navbar_buttons');
  if (menuToggleBtn) {
    menuToggleBtn.addEventListener('click', toggleMenu);
  }
};
