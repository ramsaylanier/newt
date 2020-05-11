import React from 'react'
import { useRouter } from 'next/router'
import { useMutation } from '@apollo/react-hooks'
import { Box } from '@chakra-ui/core'
import {
  Editor,
  EditorState,
  RichUtils,
  CompositeDecorator,
  convertToRaw,
  convertFromRaw,
  getDefaultKeyBinding,
} from 'draft-js'
import { addPageLink } from '../utils/draftUtil'
import ContentBlockControls from './contentBlockControls'
import ContentBlockPageLink from './contentBlockPageLink'
import ContentBlockHttpLink from './contentBlockHttpLink'
import SuggestedPageLinks from './suggestedPageLinks'
import debounce from 'lodash/debounce'
import isEqual from 'lodash/isEqual'
import { useDrop } from 'react-dnd'
import { getEntitiesFromText } from '../utils/adaptApi'
import { updatePageMutation } from '../graphql/mutations'

const getPageLink = (contentBlock, callback, contentState) => {
  contentBlock.findEntityRanges((character) => {
    const entityKey = character.getEntity()
    if (entityKey === null) {
      return false
    }
    const entity = contentState.getEntity(entityKey)
    return entity.type === 'PAGELINK'
  }, callback)
}

const getHttpLink = (contentBlock, callback, contentState) => {
  contentBlock.findEntityRanges((character) => {
    const entityKey = character.getEntity()
    if (entityKey === null) {
      return false
    }
    const entity = contentState.getEntity(entityKey)
    return entity.type === 'LINK'
  }, callback)
}

const decorator = new CompositeDecorator([
  {
    strategy: getPageLink,
    component: ContentBlockPageLink,
  },
  {
    strategy: getHttpLink,
    component: ContentBlockHttpLink,
  },
])

export default function ContentBlock({ page }) {
  const contentRef = React.useRef(null)
  const router = useRouter()
  const { _key } = router.query
  const [updatePageContent] = useMutation(updatePageMutation)

  const [editorState, setEditorState] = React.useState(
    EditorState.createEmpty(decorator)
  )
  const [suggestedPageLinks, setSuggestedPageLinks] = React.useState([])
  const editorRef = React.useRef(null)

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
      getPageLinkSuggestions(content)
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
        getPageLinkSuggestions(updatedContentState)
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
}
