const { ApolloServer, gql } = require("apollo-server");
const { v4: uuid } = require("uuid");

let todos = [];

const typeDefs = gql`
  type Todo {
    id: ID!
    title: String!
    completed: Boolean!
  }

  input CreateTodoInput {
    title: String!
  }

  input UpdateTodoInput {
    id: ID!
    title: String
    completed: Boolean
  }

  type Query {
    todos: [Todo!]!
    todo(id: ID!): Todo!
  }

  type Mutation{
   createTodo(input:CreateTodoInput!):Todo!
   updateTodo(input:UpdateTodoInput!):Todo!
   deleteTodo(id:ID!):Boolean!
  }
`;

const resolvers = {
  Query: {
    todos: () => todos,
    todo: (_, { id }) => {
      return todos.find((todo) => todo.id === id);
    },
  },

  Mutation: {
    createTodo: (_, { input }) => {
      const todo = { id: uuid(), title: input.title, completed: false };
      todos.push(todo);
      return todo;
    },

    updateTodo: (_, { input }) => {
      const todo = todos.find(t => t.id === input.id);
      if (!todo) throw new Error("Todo not found");
      if (input.title !== undefined) todo.title = input.title;
      if (input.completed !== undefined) todo.completed = input.completed;
      return todo;
    },

    deleteTodo: (_, { id }) => {
      todos = todos.filter((todo) => {
        return todo.id !== id;
      });
      console.log(todos)
      return true;
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`server started on url ${url}`);
});
