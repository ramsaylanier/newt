import gql from "graphql-tag";
import { useRouter } from "next/router";
import { useQuery, useMutation, useSubscription } from "@apollo/react-hooks";
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalOverlay,
  ModalHeader,
  ModalContent,
  ModalFooter,
  Button,
  List,
  ListItem,
  Checkbox,
  CheckboxGroup,
} from "@chakra-ui/core";

const query = gql`
  query PageQuery {
    pages {
      _id
      _key
      title
      edges {
        _id
        to {
          _id
          title
        }
        from {
          _id
          title
        }
      }
    }
  }
`;

const mutation = gql`
  mutation CreatePageEdges($source: String!, $targets: [String]!) {
    createPageEdges(source: $source, targets: $targets) {
      _id
      _key
      from {
        _id
        title
      }
      to {
        _id
        title
      }
    }
  }
`;

export default function PageFinder({ isOpen, onClose }) {
  const router = useRouter();
  const { _key } = router.query;
  const [selection, setSelection] = React.useState([]);
  const filters = {};
  const skip = !isOpen;

  const { data, loading, error } = useQuery(query, {
    variables: { filters },
    skip,
  });

  const [createPageEdges] = useMutation(mutation);

  const pages = data?.pages?.filter((page) => page._key !== _key) || [];

  const handleClick = () => {
    createPageEdges({
      variables: {
        source: _key,
        targets: selection,
      },
    });
  };

  const handleChange = (selection) => {
    setSelection(selection);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent bg="white">
        <ModalHeader>Link Pages</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <CheckboxGroup
            variantColor="green"
            defaultValue={[]}
            onChange={handleChange}
          >
            {pages.map((page) => {
              return (
                <Checkbox key={page._key} value={page._key}>
                  {page.title}
                </Checkbox>
              );
            })}
          </CheckboxGroup>
          {}
        </ModalBody>

        <ModalFooter>
          <Button mr={3} onClick={onClose}>
            Close
          </Button>
          <Button onClick={handleClick}>Add Links</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
