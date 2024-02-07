import Dashboard from "./views/Dashboard.js";
import Privacy from "./views/Privacy.js";
import Terms from "./views/Terms.js";


// Handle situation where user has already logged in on this browser session
var serverToken = "";
var sessionId = sessionStorage.getItem('sessionId');
if (sessionId != null ) {
  document.getElementById('login_btn').classList.toggle('hidden');
  document.getElementById('logout_btn').classList.toggle('hidden');
}

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
    { path: "/privacy", view: Privacy },
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


document.addEventListener('DOMContentLoaded', function() {
  const toggleMenu = function() {
	  var x = document.getElementsByClassName("navbar_links")[0];
	  if (x.className === "navbar_links") {
        x.className += " block";
      } else {
        x.className = "navbar_links";
      }
    };
    const menuToggleBtn = document.getElementById('navbar_buttons');
    if (menuToggleBtn) {
        menuToggleBtn.addEventListener('click', toggleMenu);
    }

  // Handle login/logout
  var loginBtn = document.getElementById("login_btn");
  loginBtn.addEventListener("click", function(event){
    document.getElementById('login_form_container_email').classList.toggle('hidden')
  });

  var logoutBtn = document.getElementById("logout_btn");
  logoutBtn.addEventListener("click", function(event){
    document.getElementById('logout_btn').classList.toggle('hidden');
    document.getElementById('login_btn').classList.toggle('hidden');
    sessionStorage.removeItem('sessionId');
  });

  const eForm = document.querySelector('#login_form_container_email .login_form_email');
  eForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const email = document.getElementById('login_form_email').value;
    const apiUrl = `/api/login/?action=create&email=${encodeURIComponent(email)}&turnstile=${turnstile.getResponse()}`;
    fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
        if (data.status == 0) {
          serverToken = data.message;
          document.getElementById('login_form_container_email').classList.toggle('hidden');
          document.getElementById('login_form_container_otp').classList.toggle('hidden');
        } else {
          document.querySelector("#otperror").innerHTML = "Sending of email failed";
        }
      })
      .catch((error) => {
        document.querySelector("#otperror").innerHTML = "Sending of email failed";
      });
  });

  const oform = document.querySelector('#login_form_container_otp .login_form');
  oform.addEventListener('submit', function(event) {
    event.preventDefault();
    const email = document.getElementById('login_form_email').value;
    const userToken = document.getElementById('login_form_otp').value;
    const authToken = serverToken + userToken;
    const apiUrl = `/api/login/?action=validate&email=${encodeURIComponent(email)}&token=${encodeURIComponent(authToken)}&turnstile=${turnstile.getResponse()}`;
    fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
        if (data.status == 0) {
          document.getElementById('login_form_container_otp').classList.toggle('hidden');
          document.getElementById('login_btn').classList.toggle('hidden');
          document.getElementById('logout_btn').classList.toggle('hidden');

          // Make sure that browser refresh does not lost sessionId
          sessionStorage.setItem('sessionId', authToken);
          serverToken = "";
        } else {
          document.querySelector("#otperror").innerHTML = "Invalid token";
        }
      })
      .catch((error) => {
        document.querySelector("#otperror").innerHTML = "Sending token failed";
    });

  });
});
