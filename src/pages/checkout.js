import CardCheckout from '@site/src/components/CardCheckout';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`Checkout`}
      description="Description will go into a meta tag in <head />">
      <main>
        <CardCheckout />
      </main>
    </Layout>
  );
}
