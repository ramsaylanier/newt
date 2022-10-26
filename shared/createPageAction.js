import React from 'react'
import useCreatePage from './hooks/useCreatePage'

import {
  useDisclosure,
  Input,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Switch,
} from '@chakra-ui/react'
import { SmallAddIcon } from '@chakra-ui/icons'

const CreatePageAction = ({ buttonColor }) => {
  const [isPrivate, setIsPrivate] = React.useState(true)
  const [title, setTitle] = React.useState('')
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { createPage } = useCreatePage()

  const handleCreate = (e) => {
    e.preventDefault()
    createPage({
      variables: { title, private: isPrivate },
    })
    onClose()
    setTitle('')
  }

  const handleChange = (e) => {
    setTitle(e.target.value)
  }

  const handleSetPrivate = (e) => {
    setIsPrivate(e.target.checked)
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
              <FormControl>
                <Input
                  value={title}
                  onChange={handleChange}
                  placeholder="Page Title"
                  bg="gray.100"
                />
              </FormControl>

              <FormControl mt="5">
                <Flex>
                  <FormLabel htmlFor="page-privacy">Private?</FormLabel>
                  <Switch
                    id="page-privacy"
                    color="green"
                    onChange={handleSetPrivate}
                    isChecked={isPrivate}
                  />
                </Flex>
              </FormControl>
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
