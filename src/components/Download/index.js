import styles from './styles.module.css';

export default function Download({ url }) {
  return (
    <div className={styles.center}>
      <a href={url}>Download now</a>
    </div>
  );
}
