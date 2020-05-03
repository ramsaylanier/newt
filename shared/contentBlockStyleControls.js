import React from 'react'
import { Box, Button, IconButton, useDisclosure } from '@chakra-ui/core'
import PageFinder from './pageFinder'
import { addPageLink } from '../utils/draftUtil'
import gql from 'graphql-tag'
import { useMutation } from '@apollo/react-hooks'
import { useRouter } from 'next/router'
import { convertToRaw } from 'draft-js'

const BLOCK_TYPES = [
  { label: 'H1', style: 'header-one' },
  { label: 'H2', style: 'header-two' },
  { label: 'H3', style: 'header-three' },
  { label: 'H4', style: 'header-four' },
  { label: 'H5', style: 'header-five' },
  { label: 'H6', style: 'header-six' },
  { label: 'Blockquote', style: 'blockquote' },
  { label: 'UL', style: 'unordered-list-item' },
  { label: 'OL', style: 'ordered-list-item' },
  { label: 'Code Block', style: 'code-block' },
  { label: 'Page Link', style: 'page-link' },
]

const INLINE_STYLES = [
  { label: 'Bold', style: 'BOLD' },
  { label: 'Italic', style: 'ITALIC' },
  { label: 'Underline', style: 'UNDERLINE' },
  { label: 'Monospace', style: 'CODE' },
]

const mutation = gql`
  mutation CreatePageEdges(
    $source: String!
    $targets: [String]!
    $blockKey: String!
  ) {
    createPageEdges(source: $source, targets: $targets, blockKey: $blockKey) {
      _id
      _key
      from {
        _id
        title
      }
      to {
        _id
        title
      }
    }
  }
`

const StyleButton = (props) => {
  const onToggle = () => {
    props.onToggle(props.style)
  }

  const color = props.active ? 'green.200' : 'ghost'

  return (
    <Button bg={color} onMouseDown={onToggle}>
      {props.label}
    </Button>
  )
}

export default function BlockStyleControls(props) {
  const router = useRouter()
  const { _key } = router.query
  const { isOpen, onClose, onOpen } = useDisclosure()
  const { editorState, onToggle, onToggleStyles } = props
  const [createPageEdges] = useMutation(mutation)
  const selection = editorState.getSelection()
  const contentState = editorState.getCurrentContent()
  const blockType = contentState
    .getBlockForKey(selection.getStartKey())
    .getType()
  const currentStyle = editorState.getCurrentInlineStyle()

  const handleAddPageLink = (page) => {
    const { updatedEditorState, entityKey } = addPageLink(editorState, page)
    const source = _key
    const targets = [page._key]

    const selection = updatedEditorState.getSelection()
    const blockKey = selection.focusKey

    createPageEdges({ variables: { source, targets, blockKey } })

    props.setEditorState(updatedEditorState, selection, entityKey)
  }

  return (
    <Box className="RichEditor-controls">
      <Box>
        {BLOCK_TYPES.map((type) => (
          <StyleButton
            key={type.label}
            active={type.style === blockType}
            label={type.label}
            onToggle={onToggle}
            style={type.style}
          />
        ))}
      </Box>
      <Box>
        {INLINE_STYLES.map((type) => (
          <StyleButton
            key={type.label}
            active={currentStyle.has(type.style)}
            label={type.label}
            onToggle={onToggleStyles}
            style={type.style}
          />
        ))}
        <IconButton icon="link" onClick={onOpen} />
      </Box>

      <PageFinder
        isOpen={isOpen}
        onClose={onClose}
        onSave={handleAddPageLink}
      />
    </Box>
  )
}
