const { ApolloServer, gql } = require("apollo-server");
const { v4: uuid } = require("uuid");

let books = [
  { id: "b1", title: "1984", authorId: "a1" },
  { id: "b2", title: "Animal Farm", authorId: "a1" },
  { id: "b3", title: "Harry Potter and the Sorcerer's Stone", authorId: "a2" },
  {
    id: "b4",
    title: "Harry Potter and the Chamber of Secrets",
    authorId: "a2",
  },
  { id: "b5", title: "The Hobbit", authorId: "a3" },
  { id: "b6", title: "The Lord of the Rings", authorId: "a3" },
  { id: "b7", title: "To Kill a Mockingbird", authorId: "a4" },
  { id: "b8", title: "Go Set a Watchman", authorId: "a4" },
  { id: "b9", title: "The Great Gatsby", authorId: "a5" },
];

let authors = [
  { id: "a1", name: "George Orwell" },
  { id: "a2", name: "J.K. Rowling" },
  { id: "a3", name: "J.R.R. Tolkien" },
  { id: "a4", name: "Harper Lee" },
  { id: "a5", name: "F. Scott Fitzgerald" },
];

const typeDefs = gql`
  type Book {
    id: ID!
    title: String!
    author: Author!
  }

  type Author {
    id: ID!
    name: String!
    books: [Book!]!
  }
  input CreateBookInput {
    title: String!
    authorId: ID!
  }

  input UpdateBookInput {
    id: ID!
    title: String
    authorId: ID
  }

  input CreateAuthorInput {
    name: String!
  }

  input UpdateAuthorInput {
    id: ID!
    name: String
  }

  type Query {
    books: [Book!]!
    book(id: ID!): Book
    authors: [Author!]!
    author(id: ID!): Author
  }

  type Mutation {
    createBook(input: CreateBookInput!): Book!
    updateBook(input: UpdateBookInput!): Book!
    deleteBook(id: ID!): Boolean!

    createAuthor(input: CreateAuthorInput!): Author!
    updateAuthor(input: UpdateAuthorInput!): Author!
    deleteAuthor(id: ID!): Boolean!
  }
`;

const resolvers = {
  Query: {
    books: () => books,
    book: (_, { id }) => books.find((b) => b.id === id),
    authors: () => authors,
    author: (_, { id }) => authors.find((a) => a.id === id),
  },
  Mutation: {
    createBook: (_, { input }) => {
      const book = { id: uuid(), title: input.title, authorId: input.authorId };
      books.push(book);
      return book;
    },
    updateBook: (_, { input }) => {
      const book = books.find((book) => book.id === input.id);
      if (!book) throw new Error("Book not found");
      if (input.title) book.title = input.title;
      if (input.authorId) book.authorId = input.authorId;
      return book;
    },

    deleteBook: (_, { id }) => {
      books = books.filter((book) => book.id !== id);
      return true;
    },

    createAuthor: (_, { input }) => {
      const author = { id: uuid(), name: input.name };
      authors.push(author);
      return author;
    },
    updateAuthor: (_, { input }) => {
      const author = authors.find((author) => author.id === input.id);
      author.name = input.name;
      return author;
    },
    deleteAuthor: (_, { input }) => {
      authors = authors.filter((author) => author.id !== input.id);
      return true;
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`server ready at ${url}`);
});
