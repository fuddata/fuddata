import CardCheckout from '@site/src/components/CardCheckout';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './index.module.css';

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`Checkout`}
      description="Description will go into a meta tag in <head />">
      <main>
        <br />
        <div className={styles.center}>

        <form>
    <div>
    <label>Full name</label>
    <input name="full_name" placeholder="John Doe" />
  </div>
  <div>
    <label>Email</label>
    <input name="email" placeholder="customer@example.com" />
  </div>
  <div>
    <label>Card</label>
    <div name="card"></div>
  </div>
  <button>Submit</button>
</form>

          <CardCheckout />
        </div>
      </main>
    </Layout>
  );
}
