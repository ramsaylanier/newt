const gql = require("graphql-tag");

const typeDefs = gql`
  input FilterInput {
    fiter: String!
  }

  type Page {
    _id: ID!
    _key: String
    title: String
    edges: [PageEdge]
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
  }

  type Subscription {
    pageAdded: Page
    pageDeleted: Page
  }
`;

module.exports = typeDefs;
