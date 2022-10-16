import React from 'react'
import {
  Box,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalOverlay,
  ModalHeader,
  ModalContent,
  ModalFooter,
  Button,
  Input,
  FormControl,
  FormLabel,
} from '@chakra-ui/react'

export default function CreateHttpLinkAction({ isOpen, onClose, onSave }) {
  const [urlValue, setUrlValue] = React.useState('')

  const handleChange = (e) => {
    setUrlValue(e.target.value)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(urlValue)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent bg="white">
        <ModalHeader>Insert A URL</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box display="flex" flexDir="column" alignItems="flex-start" mb="4">
            <Box as="form" width="100%" onSubmit={handleSubmit}>
              <FormControl>
                <FormLabel htmlFor="email">URL</FormLabel>
                <Input
                  bg="gray.100"
                  type="text"
                  width="100%"
                  value={urlValue}
                  onChange={handleChange}
                  placeholder="Enter a URL..."
                />
              </FormControl>
            </Box>
          </Box>
        </ModalBody>

        <ModalFooter bg="green.200">
          <Button mr={3} onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
