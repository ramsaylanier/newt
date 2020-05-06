import React from 'react'
import { useRouter } from 'next/router'
import { useQuery } from '@apollo/react-hooks'
import {
  Input,
  InputGroup,
  InputLeftElement,
  Icon,
  Box,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalOverlay,
  ModalHeader,
  ModalContent,
  ModalFooter,
  Button,
} from '@chakra-ui/core'
import CreatePageAction from './createPageAction'
import { query } from './pageList'

export default function PageFinder({ isOpen, onClose, onSave }) {
  const router = useRouter()
  const { _key } = router.query
  const skip = !isOpen
  const [value, setValue] = React.useState('')
  const filters = value
    ? [{ filter: `LIKE(page.title, "%${value}%", true)` }]
    : []
  const { data } = useQuery(query, { variables: { filters }, skip })

  const pages = data?.pages?.filter((page) => page._key !== _key) || []

  const handleClick = (page) => {
    onSave(page)
    onClose()
  }

  const handleChange = (e) => {
    setValue(e.target.value)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent bg="white">
        <ModalHeader>Insert A Page Link</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box display="flex" flexDir="column" alignItems="flex-start" mb="4">
            <CreatePageAction buttonColor="green" />

            <InputGroup mb="2">
              <InputLeftElement>
                <Icon name="search" />
              </InputLeftElement>
              <Input
                variant="filled"
                bg="gray.200"
                value={value}
                onChange={handleChange}
              />
            </InputGroup>
            {pages.map((page) => {
              return (
                <Button
                  key={page._key}
                  variant="outline"
                  variantColor="black"
                  onClick={() => handleClick(page)}
                  size="sm"
                  mb="2"
                >
                  {page.title}
                </Button>
              )
            })}
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
