import gql from "graphql-tag";
import { useQuery, useMutation } from "@apollo/react-hooks";
import Link from "next/link";
import {
  useDisclosure,
  Box,
  List,
  ListItem,
  Input,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/core";

const query = gql`
  query Page {
    pages {
      _key
      title
    }
  }
`;

const mutation = gql`
  mutation CreatePage($title: String!) {
    createPage(title: $title) {
      _key
      title
    }
  }
`;

export default function Sidebar(props) {
  const [title, setTitle] = React.useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { data, loading, error } = useQuery(query);
  const [createPage, { data: newPageData }] = useMutation(mutation);

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
    >
      <Button onClick={onOpen}>Create Page</Button>
      <List>
        {pages.map((page) => {
          return (
            <ListItem key={page._key}>
              <Link href={"[_key]"} as={page.title}>
                <a>{page.title}</a>
              </Link>
            </ListItem>
          );
        })}
      </List>

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
