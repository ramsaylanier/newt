import React from 'react'
import gql from 'graphql-tag'
import { useMutation } from '@apollo/react-hooks'
import PageList from './pageList'
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
} from '@chakra-ui/core'

const addMutation = gql`
  mutation CreatePage($title: String!) {
    createPage(title: $title) {
      _id
      title
    }
  }
`

export default function Sidebar() {
  const [title, setTitle] = React.useState('')
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [createPage] = useMutation(addMutation)

  const handleCreate = () => {
    createPage({ variables: { title } })
    onClose()
  }

  const handleChange = (e) => {
    setTitle(e.target.value)
  }

  return (
    <Box
      position="relative"
      height="100%"
      backgroundColor="green.300"
      overflow="auto"
      p="4"
      maxW={250}
    >
      <Button onClick={onOpen} mb="2">
        Create Page
      </Button>

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
  )
}
