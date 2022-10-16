import React from 'react'
import { useMutation, gql } from '@apollo/client'
import {
  useDisclosure,
  Input,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react'
import { SmallAddIcon } from '@chakra-ui/icons'

const addMutation = gql`
  mutation CreatePage($title: String!) {
    createPage(title: $title) {
      _id
      _key
      title
      lastEdited
    }
  }
`

const CreatePageAction = ({ buttonColor, onCreate }) => {
  const [title, setTitle] = React.useState('')
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [createPage, { data }] = useMutation(addMutation)

  React.useEffect(() => {
    if (data && onCreate) {
      onCreate(data.createPage)
    }
  }, [data])

  const handleCreate = (e) => {
    e.preventDefault()
    createPage({
      variables: { title },
      refetchQueries: ['AllPages'],
    })
    onClose()
    setTitle('')
  }

  const handleChange = (e) => {
    setTitle(e.target.value)
  }
  return (
    <React.Fragment>
      <Button
        onClick={onOpen}
        colorScheme={buttonColor}
        variant="solid"
        rightIcon={<SmallAddIcon />}
        fontSize="1em"
      >
        Create Page
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent bg="white">
          <ModalHeader>Create Page</ModalHeader>
          <ModalCloseButton />
          <ModalBody mt="2" mb="4">
            <form onSubmit={handleCreate}>
              <Input
                value={title}
                onChange={handleChange}
                placeholder="Page Title"
                bg="gray.100"
              />
            </form>
          </ModalBody>

          <ModalFooter bg="green.200">
            <Button colorScheme="green" mr={3} onClick={handleCreate}>
              Create
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </React.Fragment>
  )
}

export default CreatePageAction
