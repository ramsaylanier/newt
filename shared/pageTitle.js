import React from 'react'
import { useRouter } from 'next/router'
import {
  Flex,
  Text,
  Input,
  InputGroup,
  InputRightElement,
  IconButton,
} from '@chakra-ui/react'
import { EditIcon, CheckIcon, SmallCloseIcon } from '@chakra-ui/icons'
import { useMutation, gql } from '@apollo/client'

const mutation = gql`
  mutation UpdatePageTitle($id: String!, $title: String!) {
    updatePageTitle(id: $id, title: $title) {
      _id
      _key
      title
    }
  }
`

export default function PageTitle({ title, isOwner }) {
  const router = useRouter()
  const { _key } = router.query
  const [isEditing, setIsEditing] = React.useState(false)
  const [value, setValue] = React.useState(title)
  const inputRef = React.useRef()

  const [updatePageTitle] = useMutation(mutation)

  React.useEffect(() => {
    setValue(title)
    if (isEditing) {
      inputRef.current.focus()
    }
  }, [isEditing])

  React.useEffect(() => {
    setIsEditing(false)
  }, [title])

  const handleClick = () => {
    setIsEditing(!isEditing)
  }

  const handleChange = (e) => {
    setValue(e.target.value)
  }

  const handleCancel = () => {
    setIsEditing(false)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    updatePageTitle({ variables: { id: _key, title: value } })
    setIsEditing(false)
  }

  return (
    <React.Fragment>
      {isEditing ? (
        <form onSubmit={handleSubmit}>
          <InputGroup size="md">
            <Input
              pr="9rem"
              value={value}
              onChange={handleChange}
              ref={inputRef}
            />
            <InputRightElement width="5rem">
              <IconButton
                icon={<CheckIcon />}
                h="1.75rem"
                size="sm"
                onClick={handleSubmit}
              />
              <IconButton
                icon={<SmallCloseIcon />}
                h="1.75rem"
                size="sm"
                onClick={handleCancel}
              />
            </InputRightElement>
          </InputGroup>
        </form>
      ) : (
        <Flex alignItems="center" width="100%">
          <Text
            fontSize={{ base: 'xl', md: '3xl' }}
            mb="0"
            display="flex"
            alignItems="center"
          >
            {title}
            {isOwner && (
              <IconButton
                icon={<EditIcon />}
                onClick={handleClick}
                variant="ghost"
              />
            )}
          </Text>
        </Flex>
      )}
    </React.Fragment>
  )
}
