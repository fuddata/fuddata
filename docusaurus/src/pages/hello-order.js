import Layout from '@theme/Layout';
import OrderHeader from '@site/src/components/OrderHeader';
import styles from './index.module.css';

function Form() {
  return (
    <form onSubmit="">
      <input type="radio" name="ctype" checked="checked" />Business Customer&ensp;&ensp;&ensp;<input type="radio" name="ctype" />Private Customer<br />
      <input type="text" name="fname" /><br />
      <input type="text" name="sname" /><br />
      <input type="text" name="fname" /><br />
      <input type="submit" />
    </form>
  );
}

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
        <div className={styles.center}>
          <Form />
        </div>
      </main>
    </Layout>
  );
}
