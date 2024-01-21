import styles from './styles.module.css';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

export default function Download({ url }) {
  const {
    siteConfig: {customFields},
  } = useDocusaurusContext();
  return (
    <div className={styles.center}>
      <a href={customFields.products[url]}>Download now</a>
    </div>
  );
}
