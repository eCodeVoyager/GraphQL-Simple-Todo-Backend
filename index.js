import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import { ApolloServer } from "apollo-server-express";
import connectDB from "./db/connectDB.js";
import { readFileSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { gql } from "apollo-server-express";

//env variables
dotenv.config();


// Convert import.meta.url to file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const typeDefsTodo = readFileSync(
  join(__dirname, "schema", "todo.graphql"),
  "utf8"
);
const typeDefsUser = readFileSync(
  join(__dirname, "schema", "user.graphql"),
  "utf8"
);

// Combine schemas
const typeDefs = gql`
  ${typeDefsTodo}
  ${typeDefsUser}
`;

// Import resolvers
import todoResolvers from "./resolvers/todo.js";
import userResolvers from "./resolvers/user.js";

// Combine resolvers
const resolvers = [todoResolvers, userResolvers];

const server = async () => {
  // GraphQL Server

  const server = await new ApolloServer({
    typeDefs,
    resolvers,
    introspection: true,
    playground: true,
    context: ({ req }) => {
      const token = req.headers.authorization || "";
      if (!token) return { user: null };
      try {
        const user = jwt.verify(token, process.env.JWT_SECRET);
        return { user };
      } catch (err) {
        return { user: null };
      }
    },
  });

  // Express Server
  const app = express();

  app.use(cors());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  app.get("/", (req, res) => {
    res.send("Welcome to GraphQL Server");
  });

  await server.start();
  server.applyMiddleware({ app });

  // Connect to MongoDB
  connectDB();

  // Start the server
  app.listen({ port: Number(process.env.PORT) || 4000 }, () =>
    console.log(
      `GraphQL Server ready at http://localhost:4000${server.graphqlPath}`
    )
  );
};

server();
