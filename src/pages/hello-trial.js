import Layout from '@theme/Layout';
import TrialHeader from '@site/src/components/TrialHeader';

export default function Home() {
  return (
    <Layout
      title={`Trial`}
      description="Hello World Trial">
      <TrialHeader app={"Hello World for Windows"} />
      <main>
        <br />
      </main>
    </Layout>
  );
}
