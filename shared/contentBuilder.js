import { ButtonGroup, Modal, IconButton, useDisclosure } from "@chakra-ui/core";
import PageFinder from "./pageFinder";
import { useRouter } from "next/router";
import gql from "graphql-tag";
import { useMutation } from "@apollo/react-hooks";

const mutation = gql`
  mutation CreatePageBlock($id: String!) {
    createPageBlock(id: $id) {
      _id
      blocks {
        id
        content
      }
    }
  }
`;

export default function ContentBuilder() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [createPageBlock, { data }] = useMutation(mutation);
  const router = useRouter();
  const { _key } = router.query;

  // focus new node
  React.useEffect(() => {
    if (data) {
      const blocks = data?.createPageBlock?.blocks;
      const newBlock = blocks[blocks.length - 1];
      const newBlockNode = document.getElementById(`block-${newBlock.id}`);
      if (newBlockNode) {
        newBlockNode.focus();
      }
    }
  }, [data]);

  const handleAdd = () => {
    createPageBlock({ variables: { id: `Pages/${_key}` } });
  };

  return (
    <React.Fragment>
      <ButtonGroup backgroundColor="green.200" p="2">
        <IconButton icon="add" size="sm" onClick={handleAdd} />
        <IconButton icon="link" size="sm" onClick={onOpen} />
      </ButtonGroup>

      <PageFinder isOpen={isOpen} onClose={onClose} />
    </React.Fragment>
  );
}
