import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import dotenv from "dotenv";
import { env } from "node:process";
dotenv.config();

const generateToken = (user) => {
  return jwt.sign({ id: user.id }, env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

const userResolvers = {
  Query: {
    me: async (_, { token }) => {
      if (!token) {
        throw new Error("Not authenticated");
      }

      const user = jwt.verify(token, env.JWT_SECRET);

      return await User.findById(user.id);
    },
  },
  Mutation: {
    signup: async (_, { username, password }) => {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        throw new Error("Username already exists");
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({ username, password: hashedPassword });
      const token = generateToken(user);
      return { token, user };
    },
    login: async (_, { username, password }) => {
      const user = await User.findOne({ username });
      if (!user) {
        throw new Error("User not found");
      }
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw new Error("Invalid password");
      }
      const token = generateToken(user);
      return { token, user };
    },
  },
};

export default userResolvers;
