const express = require('express');
const cors = require('cors');
const http = require('http');
const {
  ApolloServer
} = require('@apollo/server');
const {
  expressMiddleware
} = require('@as-integrations/express4');
const {
  ApolloServerPluginDrainHttpServer
} = require('@apollo/server/plugin/drainHttpServer');
const {
  PubSub
} = require('graphql-subscriptions');
const {
  makeExecutableSchema
} = require('@graphql-tools/schema');
const {
  WebSocketServer
} = require('ws');
const {
  useServer
} = require('graphql-ws/use/ws');

const typeDefs = `
  type Message {
    id: ID!
    from: String!
    content: String!
  }

  type Query {
    messages: [Message!]!
  }

  type Mutation {
    sendMessage(from: String!, content: String!): Message!
  }

  type Subscription {
    messageAdded: Message!
  }
`;

let messages = [];

const resolvers = {
  Query: {
    messages: () => messages,
  },
  Mutation: {
    sendMessage: (_, { from, content }) => {
      const message = { id: String(messages.length + 1), from, content };
      messages.push(message);
      // ✅ Correct variable used here
      pubsub.publish(MESSAGE_ADDED, { messageAdded: message });
      return message;
    },
  },
  Subscription: {
    messageAdded: {
      subscribe: () =>pubsub.asyncIterableIterator(MESSAGE_ADDED),
    },
  },
};
const pubsub = new PubSub();
const MESSAGE_ADDED = 'MESSAGE_ADDED';

const schema = makeExecutableSchema({
  typeDefs,
  resolvers
});

const app = express();
app.use(cors());
app.use(express.json());  // ⚠️ Essential for parsing POST JSON

const httpServer = http.createServer(app);

const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/graphql'
});

const serverCleanup = useServer({
  schema
}, wsServer);

const server = new ApolloServer({
  schema,
  plugins: [
    ApolloServerPluginDrainHttpServer({
      httpServer
    }),
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose();
          }
        };
      }
    }
  ]
});

async function start() {
  await server.start();

  app.use('/graphql', express.json(), expressMiddleware(server));

  httpServer.listen(4000, () => {
    console.log('HTTP at http://localhost:4000/graphql');
    console.log('WS at ws://localhost:4000/graphql');
  });
}

start();
