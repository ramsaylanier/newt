import React from 'react'
import { useMutation } from '@apollo/client'
import { createPageMutation } from '../graphql/mutations'

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

const CreatePageAction = ({ buttonColor }) => {
  const [title, setTitle] = React.useState('')
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [createPage] = useMutation(createPageMutation)

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
