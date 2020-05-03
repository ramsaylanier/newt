import React from 'react'
import { Box, Button, IconButton, useDisclosure } from '@chakra-ui/core'
import PageFinder from './pageFinder'
import { Modifier, EditorState, SelectionState } from 'draft-js'

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
  const { isOpen, onClose, onOpen } = useDisclosure()
  const { editorState, onToggle, onToggleStyles } = props
  const selection = editorState.getSelection()
  const contentState = editorState.getCurrentContent()
  const blockType = contentState
    .getBlockForKey(selection.getStartKey())
    .getType()
  const currentStyle = editorState.getCurrentInlineStyle()

  const handleSave = (page) => {
    let entityKey
    let updatedSelectionState
    let updatedContentState

    // reset selection end of focus
    let updatedEditorState = EditorState.forceSelection(
      editorState,
      new SelectionState({
        anchorKey: selection.anchorKey,
        anchorOffset: selection.focusOffset,
        focusKey: selection.anchorKey,
        focusOffset: selection.focusOffset,
        isBackward: false,
      })
    )

    updatedSelectionState = updatedEditorState.getSelection()
    entityKey = contentState.getLastCreatedEntityKey()

    // const contentWithNewText = Modifier.insertText(
    //   contentState,
    //   updatedSelectionState,
    //   ` ${page.title} `
    // )

    updatedSelectionState = new SelectionState({
      anchorKey: selection.anchorKey,
      anchorOffset: selection.focusOffset,
      focusKey: selection.anchorKey,
      focusOffset: selection.focusOffset + page.title.length,
      isBackward: false,
    })

    updatedEditorState = EditorState.forceSelection(
      updatedEditorState,
      updatedSelectionState
    )

    updatedContentState = updatedEditorState.getCurrentContent()

    updatedContentState = updatedContentState.createEntity(
      'PAGELINK',
      'MUTABLE',
      {
        pageKey: page._key,
      }
    )

    entityKey = updatedContentState.getLastCreatedEntityKey()

    updatedContentState = Modifier.applyEntity(
      updatedContentState,
      updatedSelectionState,
      entityKey
    )

    updatedEditorState = EditorState.push(
      updatedEditorState,
      updatedContentState
    )

    props.setEditorState(
      updatedEditorState,
      updatedEditorState.getSelection(),
      entityKey
    )
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

      <PageFinder isOpen={isOpen} onClose={onClose} onSave={handleSave} />
    </Box>
  )
}
