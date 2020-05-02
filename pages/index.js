import Head from "next/head";
import Layout from "../shared/layout";

export default function Home() {
  return (
    <div className="container">
      <Head>
        <title>Create</title>
        <link rel="icon" href="/favicon.ico" />
        <meta charset="utf-8" />
      </Head>

      <Layout></Layout>
    </div>
  );
}
