import {
  Modifier,
  EditorState,
  CompositeDecorator,
  SelectionState,
} from 'draft-js'
import ContentBlockPageLink from '../shared/contentBlockPageLink'
import ContentBlockHttpLink from '../shared/contentBlockHttpLink'
import ContentBlockExtensionLink from '../shared/contentBlockExtensionLink'

export const blockRendererFn = (block) => {
  const type = block.getType()
  if (type === 'fromExtension') {
    return {
      component: ContentBlockExtensionLink,
      editable: true,
    }
  }
}

export const getPageLink = (contentBlock, callback, contentState) => {
  contentBlock.findEntityRanges((character) => {
    const entityKey = character.getEntity()
    if (entityKey === null) {
      return false
    }
    const entity = contentState.getEntity(entityKey)
    return entity.type === 'PAGELINK'
  }, callback)
}

export const getHttpLink = (contentBlock, callback, contentState) => {
  contentBlock.findEntityRanges((character) => {
    const entityKey = character.getEntity()
    if (entityKey === null) {
      return false
    }
    const entity = contentState.getEntity(entityKey)
    return entity.type === 'LINK'
  }, callback)
}

export const decorator = new CompositeDecorator([
  {
    strategy: getPageLink,
    component: ContentBlockPageLink,
  },
  {
    strategy: getHttpLink,
    component: ContentBlockHttpLink,
  },
])

export const addPageLink = (editorState, page) => {
  let entityKey, updatedSelectionState, updatedContentState
  const selection = editorState.getSelection()
  const contentState = editorState.getCurrentContent()

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

  const contentWithNewText = Modifier.insertText(
    contentState,
    updatedSelectionState,
    `${page.title}`
  )

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

  updatedContentState = contentWithNewText.createEntity('PAGELINK', 'MUTABLE', {
    pageKey: page._key,
  })

  entityKey = updatedContentState.getLastCreatedEntityKey()

  updatedContentState = Modifier.applyEntity(
    updatedContentState,
    updatedSelectionState,
    entityKey
  )

  updatedEditorState = EditorState.push(updatedEditorState, updatedContentState)

  return { updatedEditorState, entityKey }
}

export const addHttpLink = (editorState, urlValue) => {
  const selection = editorState.getSelection()
  const contentState = editorState.getCurrentContent()
  let updatedContentState = contentState.createEntity('LINK', 'MUTABLE', {
    url: urlValue,
  })
  const entityKey = updatedContentState.getLastCreatedEntityKey()

  updatedContentState = Modifier.applyEntity(
    updatedContentState,
    selection,
    entityKey
  )

  const updatedEditorState = EditorState.push(editorState, updatedContentState)

  return { updatedEditorState, entityKey }
}
