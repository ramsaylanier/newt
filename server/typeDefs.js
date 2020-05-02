const gql = require("graphql-tag");

const typeDefs = gql`
  input FilterInput {
    fiter: String!
  }

  type Page {
    _id: ID!
    _key: String
    title: String
    blocks: [Block]
    edges: [PageEdge]
  }

  type Block {
    id: ID!
    content: String!
    pages: [Page]
  }

  type PageEdge {
    _id: ID!
    _key: String
    from: Page
    to: Page
  }

  type Query {
    pages(filters: [FilterInput]): [Page]
    page(id: String!): Page
  }

  type Mutation {
    createPage(title: String!): Page
    deletePage(id: String!): Page
    updatePageTitle(id: String!, title: String!): Page
    createPageEdges(source: String, targets: [String]): [PageEdge]
    createPageBlock(id: String!): Page
    deletePageBlock(pageId: String!, blockId: String!): Page
  }

  type Subscription {
    pageAdded: Page
    pageDeleted: Page
  }
`;

module.exports = typeDefs;
