import gql from "graphql-tag";
import { useQuery, useMutation, useSubscription } from "@apollo/react-hooks";
import RouteLink from "next/link";
import PageList from "./pageList";
import {
  useDisclosure,
  Box,
  Input,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Link,
  Icon,
} from "@chakra-ui/core";

const query = gql`
  query AllPages {
    pages {
      _id
      title
    }
  }
`;

const subscription = gql`
  subscription onPageAdded {
    pageAdded {
      _id
      title
    }
  }
`;

const addMutation = gql`
  mutation CreatePage($title: String!) {
    createPage(title: $title) {
      _id
      title
    }
  }
`;

const deleteMutation = gql`
  mutation DeletePage($id: String!) {
    deletePage(id: $id) {
      _id
      title
    }
  }
`;

export default function Sidebar(props) {
  const [title, setTitle] = React.useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { data, loading, error } = useQuery(query);
  const [createPage] = useMutation(addMutation);

  const pages = data?.pages || [];

  const handleCreate = (e) => {
    createPage({ variables: { title } });
    onClose();
  };

  const handleChange = (e) => {
    setTitle(e.target.value);
  };

  return (
    <Box
      position="relative"
      height="100%"
      backgroundColor="green.300"
      overflow="auto"
      p="4"
      maxW={250}
    >
      <Button onClick={onOpen}>Create Page</Button>
      <PageList />

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Page</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              value={title}
              onChange={handleChange}
              placeholder="Page Title"
              size="sm"
            />
          </ModalBody>

          <ModalFooter>
            <Button variantColor="blue" mr={3} onClick={handleCreate}>
              Create
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
