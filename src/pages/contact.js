import clsx from 'clsx';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import styles from './index.module.css';

function ContactHeader() {
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">Contact</Heading>
      </div>
    </header>
  );
}

export default function Home() {
  return (
    <Layout
      title={`Contact`}
      description="Description will go into a meta tag in <head />">
      <ContactHeader />
      <main>
        <br />
        <div className={styles.contact}>
            Email: <img src="/img/contact-email.png" />
        </div>
      </main>
    </Layout>
  );
}
