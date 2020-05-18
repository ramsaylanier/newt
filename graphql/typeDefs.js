const gql = require('graphql-tag')

const typeDefs = gql`
  scalar GenericScalar

  input FilterInput {
    filter: String!
  }

  type Page {
    _id: ID!
    _key: String
    title: String
    edges: [PageEdge]
    content: GenericScalar
    lastEdited: String
  }

  type PageEdge {
    _id: ID!
    _key: String
    from: Page
    to: Page
    blockKeys: [String]
    excerpt: [String]
  }

  type Graph {
    name: String
    nodes: [Page]
    edges: [PageEdge]
  }

  type Query {
    pages(filters: [FilterInput], count: Int, offset: Int): [Page]
    page(filter: String!): Page
    graph(name: String!): Graph
  }

  type Mutation {
    createPage(title: String!): Page
    deletePage(id: String!): Page
    updatePageTitle(id: String!, title: String!): Page
    updatePageContent(id: String, content: GenericScalar): Page
    addSelectionToPageContent(
      pageId: String!
      selection: String!
      source: String!
    ): Page
    createPageEdge(
      source: String!
      target: String!
      blockKey: String!
    ): [PageEdge]
  }
`

export default typeDefs
