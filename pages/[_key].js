import Head from "next/head";
import { useRouter } from "next/router";
import Layout from "../shared/layout";

const Page = () => {
  const router = useRouter();
  const { _key } = router.query;

  return (
    <div className="container">
      <Head>
        <title>Create</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout>
        <p>Page: {_key}</p>
      </Layout>
    </div>
  );
};

export default Page;
