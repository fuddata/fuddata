import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';

import Heading from '@theme/Heading';
import styles from './index.module.css';

function HomepageHeader() {
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">Fuddata Example Product</Heading>
        <p className="hero__subtitle">The ultimate solution to all the security vulnerabilities</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg button-trial"
            to="/hello-trial">
            Free Trial
          </Link>
          <Link
            className="button button--secondary button--lg button-buy"
            to="/hello-order">
            Buy Now
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  return (
    <Layout
      title={`Home`}
      description="Description will go into a meta tag in <head />">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
