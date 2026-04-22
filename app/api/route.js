import { createSchema, createYoga } from 'graphql-yoga';

// const animeDefs = `#graphql
// type Anime {
//   id: ID!
//   title: String!
//   description: String
//   episodes: Int
//   rating: Float
//   }
//   extend type Query {
//     anime(id: ID!): Anime
//     animes: [Anime]
//     }
//     `;

const testAPIDef = `#graphql
      type Query {
        greetings: String!
        }
        `;

const resolvers = {
  Query: {
    greetings: () => 'Hello from Next.js GraphQL!'
  }
};

const typeDefs = [testAPIDef];

const { handleRequest } = createYoga({
  schema: createSchema({ typeDefs, resolvers }),
  graphqlEndpoint: '/api'
});

export { handleRequest as GET, handleRequest as POST };
