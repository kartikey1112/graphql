const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const users = require("../data/users");
const idCounter = 1;

module.exports = {
  Query: {
    me: (_, __, { user }) => user,
  },

  Mutation: {
    signup: async (_, { email, password }) => {
      const hashed = await bcrypt.hash(password, 10);
      const newUser = { id: idCounter++, email, password: hashed };
      users.push(newUser);
      const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET);
      return { token, user: { id: newUser.id, email } };
    },

    login: async (_, { email, password }) => {
      const user = users.find((u) => u.email === email);
      if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new Error("Invalid Credentials");
      }
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
      return { token, user: { id: user.id, email } };
    },
  },
};
