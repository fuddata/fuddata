import Layout from '@theme/Layout';
import OrderHeader from '@site/src/components/OrderHeader';

export default function Home() {
  return (
    <Layout
      title={`Order`}
      description="Hello World Order">
      <OrderHeader 
        app={"Hello World for Windows"}
        desc={"The easy & secure way to test licensing functionality."}
      />
      <main>
        <br />
      </main>
    </Layout>
  );
}
