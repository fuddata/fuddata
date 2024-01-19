import clsx from 'clsx';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';

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

// Revolut Checkout Widget embed script​
!function(e,o,t){var n={sandbox:"https://sandbox-merchant.revolut.com/embed.js",prod:"https://merchant.revolut.com/embed.js",dev:"https://merchant.revolut.codes/embed.js"},r={sandbox:"https://sandbox-merchant.revolut.com/upsell/embed.js",prod:"https://merchant.revolut.com/upsell/embed.js",dev:"https://merchant.revolut.codes/upsell/embed.js"},l=function(e){var n=function(e){var t=o.createElement("script");return t.id="revolut-checkout",t.src=e,t.async=!0,o.head.appendChild(t),t}(e);return new Promise((function(e,r){n.onload=function(){return e()},n.onerror=function(){o.head.removeChild(n),r(new Error(t+" failed to load"))}}))},u=function(){if(window.RevolutCheckout===i||!window.RevolutCheckout)throw new Error(t+" failed to load")},c={},d={},i=function o(r,d){return c[d=d||"prod"]?Promise.resolve(c[d](r)):l(n[d]).then((function(){return u(),c[d]=window.RevolutCheckout,e[t]=o,c[d](r)}))};i.payments=function(o){var r=o.mode||"prod",d={locale:o.locale||"auto",publicToken:o.publicToken||null};return c[r]?Promise.resolve(c[r].payments(d)):l(n[r]).then((function(){return u(),c[r]=window.RevolutCheckout,e[t]=i,c[r].payments(d)}))},i.upsell=function(e){var o=e.mode||"prod",n={locale:e.locale||"auto",publicToken:e.publicToken||null};return d[o]?Promise.resolve(d[o](n)):l(r[o]).then((function(){if(!window.RevolutUpsell)throw new Error(t+" failed to load");return d[o]=window.RevolutUpsell,delete window.RevolutUpsell,d[o](n)}))},e[t]=i}(window,document,"RevolutCheckout");

async function CreateOrder() {
  const {
    siteConfig: {customFields},
  } = useDocusaurusContext();
  const tokenResponse = await fetch(customFields.checkoutApi);
  const token = await tokenResponse.text();
  return token;
}

function CardCheckout() {
  CreateOrder().then(token => {
    if (token) {
        RevolutCheckout(token, "sandbox").then((instance) => {
        instance.payWithPopup()
        })
    }
  });
}


export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`Checkout`}
      description="Description will go into a meta tag in <head />">
      <CheckoutHeader />
      <main>
        <CardCheckout />
      </main>
    </Layout>
  );
}
