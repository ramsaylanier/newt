import { useRouter } from "next/router";
import {
  Box,
  ButtonGroup,
  IconButton,
  Textarea,
  InputGroup,
  InputRightElement,
} from "@chakra-ui/core";

import gql from "graphql-tag";
import { useMutation } from "@apollo/react-hooks";

const mutation = gql`
  mutation DeletePageBlock($pageId: String!, $blockId: String!) {
    deletePageBlock(pageId: $pageId, blockId: $blockId) {
      _id
      blocks {
        id
        content
      }
    }
  }
`;

export default function ContentBlock({ block }) {
  const router = useRouter();
  const { _key } = router.query;
  const [value, setValue] = React.useState(block.title);
  const [deletePageBlock] = useMutation(mutation);

  const handleDelete = () => {
    deletePageBlock({
      variables: { pageId: `Pages/${_key}`, blockId: block.id },
    });
  };

  return (
    <Box display="flex">
      <InputGroup width="100%">
        <Textarea value={value} backgroundColor="gray.100" mb="1" pr="2rem" />
        <InputRightElement width="2rem">
          <IconButton icon="small-close" onClick={handleDelete} />
        </InputRightElement>
      </InputGroup>
    </Box>
  );
}
