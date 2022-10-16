import React from 'react'
import RouteLink from 'next/link'
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Badge,
  ListItem,
  Button,
  Link,
  Icon,
  useDisclosure,
} from '@chakra-ui/react'
import { useMutation, gql } from '@apollo/client'
import { useDrag } from 'react-dnd'
import { useAuth } from '../utils/authClient'

const deleteMutation = gql`
  mutation DeletePage($id: String!) {
    deletePage(id: $id) {
      _id
      ownerId
    }
  }
`
export default function PageListItem({ page }) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const btnRef = React.useRef()
  const cancelRef = React.useRef()
  const { user } = useAuth()
  const [, drag] = useDrag({
    item: { page, type: 'Page' },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  })
  const [deletePage] = useMutation(deleteMutation)
  const handleDelete = () => {
    onClose()
    deletePage({ variables: { id: page._id } })
  }
  const isOwner = page.owner ? page.owner.id === user?.sub : false

  return (
    <React.Fragment>
      <ListItem
        key={page._key}
        p="2"
        mb="1"
        mr="0"
        backgroundColor="green.400"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        overflow="hidden"
        whiteSpace="nowrap"
        ref={drag}
      >
        <RouteLink href={'/[_key]'} as={`/${page._key}`}>
          <Link
            overflow="hidden"
            textOverflow="ellipsis"
            flex="1"
            textDecoration="underline"
          >
            {page.title}
          </Link>
        </RouteLink>
        {page.private && (
          <Badge colorScheme="orange" mr="2">
            private
          </Badge>
        )}
        {isOwner && (
          <Button ref={btnRef} size="xs" onClick={onOpen}>
            <Icon name="delete" size="12px" />
          </Button>
        )}
      </ListItem>

      {isOwner && (
        <AlertDialog
          isOpen={isOpen}
          leastDestructiveRef={cancelRef}
          onClose={onClose}
        >
          <AlertDialogOverlay />
          <AlertDialogContent bg="white">
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Page
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure? You can't undo this action afterwards.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </React.Fragment>
  )
}
