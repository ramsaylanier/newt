import React from 'react'
import gql from 'graphql-tag'
import { useMutation } from '@apollo/react-hooks'
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
  Text,
} from '@chakra-ui/core'

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
        variantColor={buttonColor}
        variant="solid"
        rightIcon="small-add"
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
            <Button variantColor="green" mr={3} onClick={handleCreate}>
              Create
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </React.Fragment>
  )
}

export default CreatePageAction
