import clsx from 'clsx';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Heading from '@theme/Heading';
import styles from './index.module.css';
import RevolutCheckout from '@revolut/checkout'

function CheckoutHeader() {
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">Checkout</Heading>
      </div>
    </header>
  );
}

async function CreateOrder(productid) {
  const {
    siteConfig: {customFields},
  } = useDocusaurusContext();
  const tokenResponse = await fetch(customFields.checkoutApi + "/?productid=" + productid);
  const token = await tokenResponse.text();
  return token;
}

export default function CardCheckout({ productid }) {
  CreateOrder(productid).then(token => {
    if (token != "") {
      RevolutCheckout(token, "sandbox").then((instance) => {
        instance.payWithPopup({
          onCancel: function() {
            window.location.href = '/';
          }
        })
      })
    }
  });
}
