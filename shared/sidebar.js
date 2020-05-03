import React from 'react'
import { useRouter } from 'next/router'
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
      _key
      title
    }
  }
`

export default function Sidebar() {
  const router = useRouter()
  const [title, setTitle] = React.useState('')
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [createPage, { data }] = useMutation(addMutation)

  React.useEffect(() => {
    if (data) {
      router.push('/[_key]', `/${data.createPage._key}`)
    }
  }, [data])

  const handleCreate = (e) => {
    e.preventDefault()
    createPage({ variables: { title } })
    onClose()
    setTitle('')
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
    </Box>
  )
}
