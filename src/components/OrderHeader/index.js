import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

export default function OrderHeader({ app, desc }) {
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">Order</Heading>
        <p className="hero__subtitle">You are buying <u>{app}</u></p>
        {desc}
      </div>
    </header>
  );
}
