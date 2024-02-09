import { router, setupNavigationListeners } from "./router.js";
import { checkSession, setupAuthListeners } from "./auth.js";
import { setupMobileMenuToggle } from './mobile.js';
import { setupContactFormListener } from './contact.js';

document.addEventListener("DOMContentLoaded", () => {
  checkSession();
  router();
  setupNavigationListeners();
  setupAuthListeners();
  setupMobileMenuToggle();
  setupContactFormListener();
});

window.addEventListener("popstate", router);
