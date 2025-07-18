const { ApolloServer, gql } = require("apollo-server");
const { v4: uuid } = require("uuid");

const users = [];
const posts = [];
const comments = [];
const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
  }

  type Comment {
    id: ID!
    content: String
    postId: String!
    userId: String!
  }

  type Post {
    id: ID!
    body: String!
    userId: String!
  }

  type Query {
    comments: [Comment!]!
    posts: [Post!]!
    users: [User!]!
    user(id: ID!): User
    comment(id: ID!): Comment
    post(id: ID!): Post!
  }

  input CreateUserInput {
    name: String!
    email: String!
  }

  input CreatePostInput {
    body: String!
    userId: String!
  }

  input AddCommentInput {
    content: String!
    postId: String!
    userId: String!
  }

  type Mutation {
    user(input: CreateUserInput!): User!
    post(input: CreatePostInput!): Post!
    comment(input: AddCommentInput!): Comment!
  }
`;

const resolvers = {
  Query: {
    comments: () => comments,
    posts: () => posts,
    users: () => users,
    user: (_, { id }) => {
      return users.find((user) => user.id);
    },
    comment: (_, { id }) => {
      return comments.find((comment) => comment.id === id);
    },
    post: (_, { id }) => {
      return posts.find((posts) => post.id === post.id);
    },
  },
  Mutation: {
    post: (_, { input }) => {
      const post = { id: uuid(), body: input.body, userId: input.userId };
      posts.push(post);
      return post;
    },

    user: (_, { input }) => {
      const user = { id: uuid(), name: input.name, email: input.email };
      users.push(user);
      return user;
    },

    comment: (_, { input }) => {
      const comment = {
        id: uuid(),
        content: input.content,
        userId: input.userId,
        postId: input.postId,
      };
      comments.push(comment);
      return comment;
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`server is running on url ${url}`);
});
