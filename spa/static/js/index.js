import BugBounty from "./views/BugBounty.js";
import Contact from "./views/Contact.js";
import Dashboard from "./views/Dashboard.js";
import Login from "./views/Login.js";
import Privacy from "./views/Privacy.js";
import Roadmap from "./views/Roadmap.js";
import Terms from "./views/Terms.js";

const pathToRegex = path => new RegExp("^" + path.replace(/\//g, "\\/").replace(/:\w+/g, "(.+)") + "$");

const getParams = match => {
  const values = match.result.slice(1);
  const keys = Array.from(match.route.path.matchAll(/:(\w+)/g)).map(result => result[1]);

  return Object.fromEntries(keys.map((key, i) => {
    return [key, values[i]];
  }));
};

const navigateTo = url => {
  history.pushState(null, null, url);
  router();
};

const router = async () => {
  const routes = [
    { path: "/", view: Dashboard },
    { path: "/bug-bounty", view: BugBounty },
    { path: "/contact", view: Contact },
    { path: "/login", view: Login },
    { path: "/privacy", view: Privacy },
    { path: "/roadmap", view: Roadmap },
    { path: "/terms", view: Terms }
  ];

  // Test each route for potential match
  const potentialMatches = routes.map(route => {
    return {
      route: route,
      result: location.pathname.match(pathToRegex(route.path))
    };
  });

  let match = potentialMatches.find(potentialMatch => potentialMatch.result !== null);

  if (!match) {
    match = {
      route: routes[0],
      result: [location.pathname]
    };
  }

  const view = new match.route.view(getParams(match));

  document.querySelector("#content").innerHTML = await view.getHtml();
};

window.addEventListener("popstate", router);

document.addEventListener("DOMContentLoaded", () => {
  document.body.addEventListener("click", e => {
    if (e.target.matches("[data-link]")) {
      e.preventDefault();
      navigateTo(e.target.href);
      window.scrollTo(0, 0);
    }
  });

  router();
});
