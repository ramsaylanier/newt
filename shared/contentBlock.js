import React from 'react'
import { useRouter } from 'next/router'
import { useMutation } from '@apollo/react-hooks'
import { Box } from '@chakra-ui/core'
import {
  Editor,
  EditorState,
  RichUtils,
  convertToRaw,
  convertFromRaw,
  getDefaultKeyBinding,
} from 'draft-js'
import { addPageLink, decorator, blockRendererFn } from '../utils/draftUtil'
import ContentBlockControls from './contentBlockControls'
import SuggestedPageLinks from './suggestedPageLinks'
import debounce from 'lodash/debounce'
import isEqual from 'lodash/isEqual'
import { useDrop } from 'react-dnd'
import { getEntitiesFromText } from '../utils/adaptApi'
import { updatePageMutation } from '../graphql/mutations'
import { useAuth } from '../utils/auth'

const enableAdaptApi = process.env.NEXT_LOCAL_ENABLE_ADAPT_API

export default function ContentBlock({ page, editorState, setEditorState }) {
  const contentRef = React.useRef(null)
  const router = useRouter()
  const { user } = useAuth()
  const { _key } = router.query
  const [updatePageContent] = useMutation(updatePageMutation)
  const [suggestedPageLinks, setSuggestedPageLinks] = React.useState([])
  const editorRef = React.useRef(null)
  const isOwner = user && page.ownerId === user?.sub

  const [{ dropResult }, drop] = useDrop({
    accept: 'Page',
    drop: (item) => {
      return item
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
      dropResult: monitor.getDropResult(),
    }),
  })

  React.useEffect(() => {
    if (dropResult) {
      const { page } = dropResult
      const { updatedEditorState, entityKey } = addPageLink(editorState, page)
      const selection = updatedEditorState.getSelection()
      setEditorState(updatedEditorState, selection, entityKey)
    }
  }, [dropResult])

  // hydrate editor state from store
  React.useEffect(() => {
    if (page?.content) {
      const content = convertFromRaw(page.content)
      setEditorState(EditorState.createWithContent(content, decorator))

      if (enableAdaptApi) {
        getPageLinkSuggestions(content)
      }
    } else {
      setEditorState(EditorState.createEmpty(decorator))
    }
  }, [])

  React.useEffect(() => {
    if (editorState) {
      delayedSave(editorState, contentRef.current)
      contentRef.current = convertToRaw(editorState.getCurrentContent())
    }
  }, [editorState])

  const delayedSave = React.useRef(
    debounce(async (editorState, previousContent) => {
      let updatedContentState = editorState.getCurrentContent()
      const content = convertToRaw(updatedContentState)

      if (!isEqual(content, previousContent)) {
        updatePageContent({
          variables: { id: _key, content },
        })

        if (enableAdaptApi) {
          getPageLinkSuggestions(updatedContentState)
        }
      }
    }, 1000)
  ).current

  const getPageLinkSuggestions = async (contentState) => {
    const blocks = contentState.getBlockMap()
    let entities = []
    let promises = []

    blocks.forEach((block) => {
      const text = block.getText()
      const response = getEntitiesFromText(text, block.getKey())
      promises.push(response)
    })

    const results = await Promise.all(promises)
    results.forEach((result) => {
      const { blockKey, data } = result
      if (data && data[0]) {
        data[0].entities.forEach((e) => {
          entities.push({ blockKey, entityData: e })
        })
      }
    })
    setSuggestedPageLinks(entities)
  }

  const handleChange = (state) => {
    setEditorState(state)
  }

  const handleToggle = (blockType) => {
    setEditorState(RichUtils.toggleBlockType(editorState, blockType))
  }

  const handleToggleStyles = (inlineStyle) => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, inlineStyle))
  }

  const keyBindingFn = (e) => {
    return getDefaultKeyBinding(e)
  }

  const handleKeyCommand = (command, editorState) => {
    const updatedEditorState = RichUtils.handleKeyCommand(editorState, command)
    if (updatedEditorState) {
      handleChange(updatedEditorState)
    }
  }

  if (isOwner) {
    return (
      <Box fontSize=".9rem" ref={drop}>
        <Box bg="gray.100" position="relative" zIndex="2">
          <ContentBlockControls
            editorState={editorState}
            setEditorState={setEditorState}
            onToggle={handleToggle}
            onToggleStyles={handleToggleStyles}
          />
        </Box>

        <Box px="4" py="8" bg="gray.100" position="relative" zIndex="1">
          <Editor
            ref={editorRef}
            keyBindingFn={keyBindingFn}
            handleKeyCommand={handleKeyCommand}
            blockRendererFn={blockRendererFn}
            editorState={editorState}
            onChange={handleChange}
            placeholder="Enter some content..."
            spellCheck={true}
          />
        </Box>

        <SuggestedPageLinks
          suggestedPageLinks={suggestedPageLinks}
          editorState={editorState}
          setEditorState={setEditorState}
        />
      </Box>
    )
  } else {
    return (
      <Box fontSize=".9rem" ref={drop}>
        <Box px="4" py="8" bg="gray.100" position="relative" zIndex="1">
          <Editor
            ref={editorRef}
            keyBindingFn={keyBindingFn}
            handleKeyCommand={handleKeyCommand}
            blockRendererFn={blockRendererFn}
            editorState={editorState}
            placeholder="Enter some content..."
            spellCheck={true}
            readOnly={true}
          />
        </Box>
      </Box>
    )
  }
}
