import clsx from 'clsx';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

import Heading from '@theme/Heading';
import styles from './index.module.css';

function CheckoutHeader() {
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">Checkout</Heading>
      </div>
    </header>
  );
}

/*
// Revolut Checkout Widget embed script​ without immediately invoked function expression (IIFE)
// !function(e,o,t){var n={sandbox:"https://sandbox-merchant.revolut.com/embed.js",prod:"https://merchant.revolut.com/embed.js",dev:"https://merchant.revolut.codes/embed.js"},r={sandbox:"https://sandbox-merchant.revolut.com/upsell/embed.js",prod:"https://merchant.revolut.com/upsell/embed.js",dev:"https://merchant.revolut.codes/upsell/embed.js"},l=function(e){var n=function(e){var t=o.createElement("script");return t.id="revolut-checkout",t.src=e,t.async=!0,o.head.appendChild(t),t}(e);return new Promise((function(e,r){n.onload=function(){return e()},n.onerror=function(){o.head.removeChild(n),r(new Error(t+" failed to load"))}}))},u=function(){if(window.RevolutCheckout===i||!window.RevolutCheckout)throw new Error(t+" failed to load")},c={},d={},i=function o(r,d){return c[d=d||"prod"]?Promise.resolve(c[d](r)):l(n[d]).then((function(){return u(),c[d]=window.RevolutCheckout,e[t]=o,c[d](r)}))};i.payments=function(o){var r=o.mode||"prod",d={locale:o.locale||"auto",publicToken:o.publicToken||null};return c[r]?Promise.resolve(c[r].payments(d)):l(n[r]).then((function(){return u(),c[r]=window.RevolutCheckout,e[t]=i,c[r].payments(d)}))},i.upsell=function(e){var o=e.mode||"prod",n={locale:e.locale||"auto",publicToken:e.publicToken||null};return d[o]?Promise.resolve(d[o](n)):l(r[o]).then((function(){if(!window.RevolutUpsell)throw new Error(t+" failed to load");return d[o]=window.RevolutUpsell,delete window.RevolutUpsell,d[o](n)}))},e[t]=i}(window,document,"RevolutCheckout");
// function RevolutCheckout(e,o,t){var n={sandbox:"https://sandbox-merchant.revolut.com/embed.js",prod:"https://merchant.revolut.com/embed.js",dev:"https://merchant.revolut.codes/embed.js"},r={sandbox:"https://sandbox-merchant.revolut.com/upsell/embed.js",prod:"https://merchant.revolut.com/upsell/embed.js",dev:"https://merchant.revolut.codes/upsell/embed.js"},l=function(e){var n=function(e){var t=o.createElement("script");return t.id="revolut-checkout",t.src=e,t.async=!0,o.head.appendChild(t),t}(e);return new Promise((function(e,r){n.onload=function(){return e()},n.onerror=function(){o.head.removeChild(n),r(new Error(t+" failed to load"))}}))},u=function(){if(window.RevolutCheckout===i||!window.RevolutCheckout)throw new Error(t+" failed to load")},c={},d={},i=function o(r,d){return c[d=d||"prod"]?Promise.resolve(c[d](r)):l(n[d]).then((function(){return u(),c[d]=window.RevolutCheckout,e[t]=o,c[d](r)}))};i.payments=function(o){var r=o.mode||"prod",d={locale:o.locale||"auto",publicToken:o.publicToken||null};return c[r]?Promise.resolve(c[r].payments(d)):l(n[r]).then((function(){return u(),c[r]=window.RevolutCheckout,e[t]=i,c[r].payments(d)}))},i.upsell=function(e){var o=e.mode||"prod",n={locale:e.locale||"auto",publicToken:e.publicToken||null};return d[o]?Promise.resolve(d[o](n)):l(r[o]).then((function(){if(!window.RevolutUpsell)throw new Error(t+" failed to load");return d[o]=window.RevolutUpsell,delete window.RevolutUpsell,d[o](n)}))},e[t]=i}(window,document,"RevolutCheckout"); 
function loadSandboxScript() {
    return new Promise(function(resolve, reject) {
        var script = document.createElement("script");
        script.src = "https://sandbox-merchant.revolut.com/embed.js";
        script.async = true;
        script.onload = resolve;
        script.onerror = function() { reject(new Error("Sandbox script failed to load")); };
        document.head.appendChild(script);
    });
}

function payWithPopup(config) {
    if (!window.RevolutCheckout) {
        throw new Error("RevolutCheckout is not initialized");
    }
    return window.RevolutCheckout.payWithPopup(config);
}
*/

async function CreateOrder() {
  const {
    siteConfig: {customFields},
  } = useDocusaurusContext();
  const tokenResponse = await fetch(customFields.checkoutApi + "/?productid=26384");
  const token = await tokenResponse.text();
  return token;
}

export default function CardCheckout() {
  CreateOrder().then(token => {
    if (token) {

      /*
      // https://developer.revolut.com/docs/sdks/revolut-checkout-js/initialize-widget/instance/instance-create-card-field
      RevolutCheckout(token, "sandbox").then(function(instance) {
        var form = document.querySelector("form");
        var card = instance.createCardField({
          target: document.querySelector("[name=card]"),
          onSuccess() {
            window.alert("Thank you!");
          },
          onError(message) {
            window.alert("Oh no :(");
          },
          locale: "en"
        });

        form.addEventListener("submit", function (event) {
          // Prevent browser form submission.
          // You need to submit card details first.
          event.preventDefault();

          var data = new FormData(form);
          card.submit({
            name: data.get("full_name"),
            email: data.get("email"),
          });
        });
        form.addEventListener("cancel", handleCancel);
      });
      */

      // var myRevolutCheckout = RevolutCheckout(window, document, "RevolutCheckout");
      RevolutCheckout(token, "sandbox").then((instance) => {
        instance.payWithPopup({
        })
      })

      // Initialize the RevolutCheckout
      // loadSandboxScript();

      /*
      var myRevolutCheckout = RevolutCheckout(window, document);
      myRevolutCheckout.initialize().then(function() {
        myRevolutCheckout.payWithPopup({
            publicToken: token, // Replace with your actual token
            // ...other configurations for payWithPopup
        });
      }).catch(function(error) {
          console.error(error);
      });
      */

      // Initialize the RevolutCheckout
      /*
      var myRevolutCheckout = RevolutCheckout(window, document, "RevolutCheckout");

      // Use the initialized checkout function
      myRevolutCheckout("sandbox").then(function(instance) {
        var form = document.querySelector("form");
        var card = instance.createCardField({
          target: document.querySelector("[name=card]"),
          onSuccess() {
            window.alert("Thank you!");
          },
          locale: "en"
        });

        form.addEventListener("submit", function (event) {
          // Prevent browser form submission.
          // You need to submit card details first.
          event.preventDefault();

          var data = new FormData(form);
          card.submit({
            name: data.get("full_name"),
            email: data.get("email"),
          });
        });
      });
      */

      /*
      myRevolutCheckout("sandbox").then((instance) => {
        // Configure the checkout with the necessary options
        var paymentOptions = {
            publicToken: token, // assuming 'token' is defined
            locale: 'auto', // or any specific locale
            // ... other options if required
        };

        // Initialize the payments process
        // instance.payments(paymentOptions);

        // Now call payWithPopup or any other method that's required
        instance.payWithPopup({
            // Configuration for payWithPopup
            // ... add necessary options for payWithPopup
        });

        // If there's a callback or other operations needed after payWithPopup, handle them here
      });
      */


      /*
      RevolutCheckout(token, "sandbox").then(function (instance) {
        const cardField = instance.createCardField({
          target: document.getElementById("card-field"),
          onSuccess() {
            // Do something to handle successful payments
            window.alert("Thank you!")
          },
          onError(error) {
            // Do something to handle payment errors
            window.alert(`Something went wrong. ${error}`)
          }
        })
      
        document.getElementById("button-submit").addEventListener("click", function () {
          cardField.submit()
        })
      })
      */
    }
  });
}
