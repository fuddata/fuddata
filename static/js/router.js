import Dashboard from "./views/Dashboard.js";
import Contact from "./views/Contact.js";
import Privacy from "./views/Privacy.js";
import Terms from "./views/Terms.js";

export const navigateTo = url => {
  history.pushState(null, null, url);
  router();
};

const routes = [
  { path: "/", view: Dashboard },
  { path: "/contact", view: Contact },
  { path: "/privacy", view: Privacy },
  { path: "/terms", view: Terms }
];

export const router = async () => {
  const potentialMatches = routes.map(route => ({
    route,
    result: location.pathname.match(pathToRegex(route.path))
  }));

  let match = potentialMatches.find(potentialMatch => potentialMatch.result !== null) || {
    route: routes[0],
    result: [location.pathname]
  };

  const view = new match.route.view(getParams(match));
  document.querySelector("#content").innerHTML = await view.getHtml();
};

export const setupNavigationListeners = () => {
  document.body.addEventListener("click", e => {
    if (e.target.matches("[data-link]")) {
      e.preventDefault();
      navigateTo(e.target.href);
      window.scrollTo(0, 0);
    }
  });
};

export const pathToRegex = path => new RegExp("^" + path.replace(/\//g, "\\/").replace(/:\w+/g, "(.+)") + "$");

export const getParams = match => {
  const values = match.result.slice(1);
  const keys = Array.from(match.route.path.matchAll(/:(\w+)/g)).map(result => result[1]);
  return Object.fromEntries(keys.map((key, i) => [key, values[i]]));
};
