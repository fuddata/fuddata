import { router, setupNavigationListeners } from "./router.js";
import { checkSession, setupAuthListeners } from "./auth.js";
import { setupContactFormListener } from './contact.js';

document.addEventListener("DOMContentLoaded", () => {
  checkSession();
  router();
  setupNavigationListeners();
  setupAuthListeners();
  setupContactFormListener();
});

window.addEventListener("popstate", router);
