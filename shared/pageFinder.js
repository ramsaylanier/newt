import React from 'react'
import gql from 'graphql-tag'
import { useRouter } from 'next/router'
import { useQuery } from '@apollo/react-hooks'
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
} from '@chakra-ui/core'

const query = gql`
  query PageQuery {
    pages {
      _id
      _key
      title
      edges {
        _id
        to {
          _id
          title
        }
        from {
          _id
          title
        }
      }
    }
  }
`

// const mutation = gql`
//   mutation CreatePageEdges($source: String!, $targets: [String]!) {
//     createPageEdges(source: $source, targets: $targets) {
//       _id
//       _key
//       from {
//         _id
//         title
//       }
//       to {
//         _id
//         title
//       }
//     }
//   }
// `;

export default function PageFinder({ isOpen, onClose, onSave }) {
  const router = useRouter()
  const { _key } = router.query
  const filters = {}
  const skip = !isOpen

  const { data } = useQuery(query, {
    variables: { filters },
    skip,
  })

  // const [createPageEdges] = useMutation(mutation);

  const pages = data?.pages?.filter((page) => page._key !== _key) || []

  const handleClick = (page) => {
    // createPageEdges({
    //   variables: {
    //     source: _key,
    //     targets: selection,
    //   },
    // });
    onSave(page)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent bg="white">
        <ModalHeader>Link A Page</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box display="flex" flexDir="column" alignItems="flex-start">
            {pages.map((page) => {
              return (
                <Button key={page._key} onClick={() => handleClick(page)}>
                  {page.title}
                </Button>
              )
            })}
          </Box>
        </ModalBody>

        <ModalFooter>
          <Button mr={3} onClick={onClose}>
            Close
          </Button>
          <Button onClick={handleClick}>Add Links</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
