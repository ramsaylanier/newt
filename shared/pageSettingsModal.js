import React from 'react'

import {
  Switch,
  Flex,
  FormLabel,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react'
import useUpdatePageSettings from './hooks/useUpdatePageSettings'

const PageSettingsModal = ({ isOpen, onClose, page }) => {
  const [isPrivate, setIsPrivate] = React.useState(page.private)
  const { updatePageSettings } = useUpdatePageSettings()

  const handleChange = () => {
    setIsPrivate(!isPrivate)
  }

  const handleSave = () => {
    updatePageSettings({
      variables: { id: page._id, update: { private: isPrivate } },
    })
    onClose()
  }
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent bg="white">
        <ModalHeader>Page Settings</ModalHeader>
        <ModalCloseButton />
        <ModalBody mt="2" mb="4">
          <Flex justify="center" align="center">
            <FormLabel htmlFor="page-privacy">Private?</FormLabel>
            <Switch
              id="page-privacy"
              color="green"
              onChange={handleChange}
              isChecked={isPrivate}
            />
          </Flex>
        </ModalBody>

        <ModalFooter bg="green.200">
          <Button colorScheme="green" mr={3} onClick={handleSave}>
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default PageSettingsModal
