import gql from "graphql-tag";
import { useQuery } from "@apollo/react-hooks";
import Head from "next/head";
import { useRouter } from "next/router";
import Layout from "../shared/layout";
import { Box, Text } from "@chakra-ui/core";
import PageTitle from "../shared/pageTitle";
import ContentBuilder from "../shared/contentBuilder";
import ContentBlock from "../shared/contentBlock";

const query = gql`
  query Page($id: String!) {
    page(id: $id) {
      _id
      _key
      title
      blocks {
        id
        content
      }
      edges {
        _key
        from {
          _id
          _key
          title
        }
        to {
          _id
          _key
          title
        }
      }
    }
  }
`;

const Page = () => {
  const router = useRouter();
  const { _key } = router.query;
  const skip = !_key;
  const { data, loading, error } = useQuery(query, {
    variables: { id: `Pages/${_key}` },
    skip,
  });

  const page = data?.page || null;
  const blocks = page?.blocks || [];

  return (
    <div className="container">
      <Head>
        <title>Create</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout>
        {page && (
          <Box p={4}>
            <PageTitle title={page.title} />

            {blocks.map((block) => {
              return <ContentBlock key={block.id} block={block} />;
            })}

            <ContentBuilder />
          </Box>
        )}
      </Layout>
    </div>
  );
};

export default Page;
