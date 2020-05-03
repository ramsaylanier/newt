const gql = require('graphql-tag')

const typeDefs = gql`
  scalar GenericScalar

  input FilterInput {
    fiter: String!
  }

  type Page {
    _id: ID!
    _key: String
    title: String
    edges: [PageEdge]
    content: GenericScalar
  }

  type PageEdge {
    _id: ID!
    _key: String
    from: Page
    to: Page
    blockKeys: [String]
    excerpt: [String]
  }

  type Query {
    pages(filters: [FilterInput]): [Page]
    page(id: String!): Page
  }

  type Mutation {
    createPage(title: String!): Page
    deletePage(id: String!): Page
    updatePageTitle(id: String!, title: String!): Page
    updatePageContent(id: String, content: GenericScalar): Page
    createPageEdge(
      source: String!
      target: String!
      blockKey: String!
    ): [PageEdge]
  }

  type Subscription {
    pageAdded: Page
    pageDeleted: Page
  }
`

module.exports = typeDefs
