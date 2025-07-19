const { ApolloServer, gql } = require("apollo-server");
const { v4: uuid } = require("uuid");

const users = [
  {
    __typename: "Buyer",
    id: "u1",
    name: "Alice",
    email: "alice@example.com",
  },
  {
    __typename: "Buyer",
    id: "u2",
    name: "Bob",
    email: "bob@example.com",
  },
  {
    __typename: "Seller",
    id: "s1",
    name: "TechWorld",
    email: "techworld@example.com",
  },
  {
    __typename: "Seller",
    id: "s2",
    name: "GadgetHub",
    email: "gadgethub@example.com",
  },
];

const products = [
  {
    id: "p1",
    name: "Laptop",
    price: 1200.0,
    sellerId: "s1",
  },
  {
    id: "p2",
    name: "Phone",
    price: 800.0,
    sellerId: "s2",
  },
  {
    id: "p3",
    name: "Keyboard",
    price: 150.0,
    sellerId: "s1",
  },
];

const orders = [
  {
    id: "o1",
    buyerId: "u1",
    productIds: ["p1", "p2"],
    status: "SHIPPED",
  },
  {
    id: "o2",
    buyerId: "u2",
    productIds: ["p3"],
    status: "PROCESSING",
  },
  {
    id: "o3",
    buyerId: "u1",
    productIds: ["p2", "p2"],
    status: "DELIVERED",
  },
];

const typeDefs = gql`
  interface User {
    id: ID
    name: String!
    email: String
  }

  type Buyer implements User {
    id: ID!
    name: String!
    email: String!
    orders: [Order!]!
  }

  type Seller implements User {
    id: ID!
    name: String!
    email: String!
    products: [Product!]!
  }

  type Product {
    id: ID!
    name: String!
    price: Float!
    seller: Seller!
  }

  enum OrderStatus {
    PROCESSING
    CANCELLED
    SHIPPED
    DELIVERED
  }

  type Order {
    id: ID!
    buyer: Buyer!
    products: [Product!]!
    status: OrderStatus!
  }

  union SearchResult = Product | Seller

  input CreateProductInput {
    name: String!
    price: Float!
    sellerId: ID!
  }

  input CreateOrderInput {
    buyerId: ID!
    productIds: [ID!]!
  }

  type Query {
    products: [Product!]!
    users: [User!]!
    search(term: String!): [SearchResult!]!
  }

  type Mutation {
    createProducts(input: CreateProductInput): Product!
    createOrder(input: CreateOrderInput): Order!
  }
`;

const resolvers = {
  Query: {
    products: () => products,
    users: () => users,
    search: (_, { term }) => {
      const foundProducts = products.filter((p) =>
        p.name.toLowerCase().includes(term.toLowerCase())
      );

      const foundSellers = users.filter(
        (u) =>
          u.__typename === "Seller" &&
          u.name.toLowerCase().includes(term.toLowerCase())
      );

      return [...foundProducts, ...foundSellers];
    },
  },

  Mutation: {
    createProducts: (_, { input }) => {
      const seller = users.find(
        (u) => u.id === input.sellerId && u.__typename === "Seller"
      );
      if (!seller) throw new Error("Seller not Found");
      const product = {
        id: uuid(),
        name: input.name,
        price: input.price,
        sellerId: input.sellerId,
      };
      products.push(product);
      return product;
    },

    createOrder: (_, { input }) => {
      const buyer = users.find(
        (u) => u.id === input.buyerId && u.__typename === "Buyer"
      );
      if (!buyer) throw new Error("Buyer not found");

      const order = {
        id: uuid(),
        buyerId: input.buyerId, // Must match "buyerId"
        productIds: input.productIds, // Must match "productIds"
        status: "PROCESSING",
      };
      orders.push(order);
      return order;
    },
  },

  User: {
    __resolveType(obj) {
      if (obj.__typename === "Seller") return "Seller";
      if (obj.__typename === "Buyer") return "Buyer";
      return null;
    },
  },

  Seller: {
    products: (seller) => products.filter((p) => p.sellerId === seller.id),
  },

  Buyer: {
    orders: (buyer) => orders.filter((o) => o.buyerId === buyer.id),
  },

  Product: {
    seller: (product) =>
      users.find(
        (user) => user.id === product.sellerId && user.__typename === "Seller"
      ),
  },

  Order: {
    buyer: (order) =>
      users.find(
        (user) => user.id === order.buyerId && user.__typename === "Buyer"
      ),
    products: (order) => products.filter((p) => order.productIds.includes(p.id)),
  },

  SearchResult: {
    __resolveType(obj) {
      if (obj.price) return "Product";
      if (obj.__typename === "Seller") return "Seller";
      return null;
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`server is ready at url ${url}`);
});
