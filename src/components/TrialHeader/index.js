import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

export default function TrialHeader({ app }) {
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">Trial</Heading>
        <p className="hero__subtitle">Thank you downloading <u>{app}</u></p>
        If your download does not start after 30 second, click the link below to download manually!
      </div>
    </header>
  );
}
