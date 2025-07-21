require("dotenv").config();
const { ApolloServer } = require("apollo-server");
const typeDefs = require("./schema/typeDefs");
const resolvers = require("./schema/resolvers");
const { AuthDirective } = require("./schema/directives");
const { getUserFromToken } = require("./auth/utils");

const server = new ApolloServer({
  typeDefs,
  resolvers,
  schemaDirectives: {
    auth: AuthDirective,
  },
  context: ({ req }) => {
    const token = req.headers.authorization?.replace("Bearer", "");
    const user = getUserFromToken(token);
    return user;
  },
});

server.listen().then(({ url }) => {
  console.log(`server is running at ${url}`);
});
