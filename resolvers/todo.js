import Todo from "../models/todo.js";
import jwt from "jsonwebtoken";
import { env } from "node:process";

const todoResolvers = {
  Query: {
    todos: async (_, { token }) => {
      if (!token) {
        throw new Error("Not authenticated");
      }
      const user = jwt.verify(token, env.JWT_SECRET);
      return await Todo.find({ user: user.id });
    },
  },
  Mutation: {
    createTodo: async (_, { title, token }) => {
      if (!token) {
        throw new Error("Not authenticated");
      }
      const user = jwt.verify(token, env.JWT_SECRET);
      const todo = await Todo.create({ title, user: user.id });
      return todo;
    },
    completeTodo: async (_, { id, token }) => {
      if (!token) {
        throw new Error("Not authenticated");
      }
      const todo = await Todo.findById(id);
      if (!todo) {
        throw new Error("Todo not found");
      }
      if (todo.user.toString() !== user.id) {
        throw new Error("Not authorized to complete this todo");
      }
      if (todo.completed === true) {
        todo.completed = false;
      } else {
        todo.completed = true;
      }
      await todo.save();
      return todo;
    },
  },
};

export default todoResolvers;
