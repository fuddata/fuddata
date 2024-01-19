import Layout from '@theme/Layout';
import TrialHeader from '@site/src/components/TrialHeader';
import Download from '@site/src/components/Download';

export default function Home() {
  return (
    <Layout
      title={`Trial`}
      description="Hello World Trial">
      <TrialHeader app={"Hello World for Windows"} />
      <main>
        <br />
        <Download 
          url={"https://github.com/fuddata/hello/releases/download/v1.0/hello_signed.exe"}
        />
      </main>
    </Layout>
  );
}
