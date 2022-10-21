import React from 'react'
import {
  Box,
  Button,
  Flex,
  Divider,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Text,
  useDisclosure,
} from '@chakra-ui/react'
import { LinkIcon, ChevronDownIcon } from '@chakra-ui/icons'
import { HttpIcon, iconMap } from './icons'
import { RichUtils } from 'draft-js'
import { addPageLink, addHttpLink } from '../utils/draftUtil'
import CreatePageLinkAction from './createPageLinkAction'
import CreateHttpLinkAction from './createHttpLinkAction'

const TEXT_TYPES = [
  { label: 'Heading 1', style: 'header-one', tag: 'h1' },
  { label: 'Heading 2', style: 'header-two', tag: 'h2' },
  { label: 'Heading 3', style: 'header-three', tag: 'h3' },
  { label: 'Heading 4', style: 'header-four', tag: 'h4' },
  { label: 'Heading 5', style: 'header-five', tag: 'h5' },
  { label: 'paragraph', style: 'p', tag: 'p' },
]

const BLOCK_TYPES = [
  { label: 'blockquote', style: 'blockquote' },
  { label: 'unorderedList', style: 'unordered-list-item' },
  { label: 'orderedList', style: 'ordered-list-item' },
  { label: 'code', style: 'code-block' },
]

const INLINE_STYLES = [
  { label: 'bold', style: 'BOLD' },
  { label: 'italic', style: 'ITALIC' },
  { label: 'underline', style: 'UNDERLINE' },
]

const StyleIconButton = (props) => {
  const onToggle = () => {
    props.onToggle(props.style)
  }

  const color = props.active ? 'green.200' : 'ghost'

  return (
    <IconButton
      icon={props.icon}
      bg={color}
      size="md"
      onMouseDown={onToggle}
      fontSize="1.5em"
      mr="2"
    />
  )
}

export default function ContentBlockControls(props) {
  const { isOpen, onClose, onOpen } = useDisclosure()
  const {
    isOpen: isHttpLinkOpen,
    onClose: onHttpLinkClose,
    onOpen: onHttpLinkOpen,
  } = useDisclosure()
  const { editorState, onToggle, onToggleStyles } = props
  const selection = editorState.getSelection()
  const contentState = editorState.getCurrentContent()
  const blockType = contentState
    .getBlockForKey(selection.getStartKey())
    .getType()
  const currentStyle = editorState.getCurrentInlineStyle()

  const currentBlockType = RichUtils.getCurrentBlockType(editorState)
  const currentTextStyle =
    TEXT_TYPES.find((type) => type.style === currentBlockType)?.label ||
    'paragraph'

  const handleAddPageLink = (page) => {
    const { updatedEditorState, entityKey } = addPageLink(editorState, page)
    const selection = updatedEditorState.getSelection()
    props.setEditorState(updatedEditorState, selection, entityKey)
  }

  const handleAddHttpLink = (urlValue) => {
    const { updatedEditorState, entityKey } = addHttpLink(editorState, urlValue)
    const selection = updatedEditorState.getSelection()
    props.setEditorState(
      RichUtils.toggleLink(updatedEditorState, selection, entityKey)
    )
  }

  return (
    <Box className="RichEditor-controls">
      <Flex flexWrap="wrap">
        <Menu>
          <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
            {currentTextStyle}
          </MenuButton>
          <MenuList bg="white" fontSize=".9rem">
            {TEXT_TYPES.map((type) => {
              return (
                <MenuItem key={type.label} onClick={() => onToggle(type.style)}>
                  <Text as={type.tag} mt="0">
                    {type.label}
                  </Text>
                </MenuItem>
              )
            })}
          </MenuList>
        </Menu>

        <Divider orientation="vertical" my="2" color="gray.500" />

        {INLINE_STYLES.map((type) => {
          const Icon = iconMap[type.label]
          return (
            <StyleIconButton
              key={type.label}
              active={currentStyle.has(type.style)}
              icon={<Icon />}
              onToggle={onToggleStyles}
              style={type.style}
            />
          )
        })}

        <Divider orientation="vertical" my="2" color="gray.500" />

        {BLOCK_TYPES.map((type) => {
          const Icon = iconMap[type.label]
          return (
            <StyleIconButton
              key={type.label}
              active={type.style === blockType}
              icon={<Icon />}
              onToggle={onToggle}
              style={type.style}
            />
          )
        })}
        <IconButton icon={<LinkIcon />} onClick={onOpen} />
        <IconButton
          icon={<HttpIcon />}
          fontSize="1.8rem"
          onClick={onHttpLinkOpen}
        />
      </Flex>

      <CreatePageLinkAction
        isOpen={isOpen}
        onClose={onClose}
        onSave={handleAddPageLink}
      />

      <CreateHttpLinkAction
        isOpen={isHttpLinkOpen}
        onClose={onHttpLinkClose}
        onSave={handleAddHttpLink}
        editorState={editorState}
        setEditorState={props.setEditorState}
      />
    </Box>
  )
}
