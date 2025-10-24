import { ApolloServer, gql } from "apollo-server";
import {  DataTypes } from "sequelize";
import { sequelize } from "./models/index.js";
import db from "./models/index.js";

/** 4️⃣ Define GraphQL Schema */
const typeDefs = gql`
  type Admin {
    id: ID!
    name: String
    email: String
  }

  type AdminActivityLog {
    id: ID!
    created_by: Int!
    user_id: Int
    action: String!
    module: String!
    details: JSON
    created_at: String
    updated_at: String
    admin: Admin
  }

  scalar JSON

  type Query {
    logs: [AdminActivityLog!]!
    log(id: ID!): AdminActivityLog
  }
`;

/** 5️⃣ Define Resolvers */
const resolvers = {
  Query: {
    logs: async () => {
      return await db.AdminActivityLog.findAll({
        include: {
          model: db.Admin,
          as: "admin",
          attributes: ["id", "name", "email"],
        },
        order: [["created_at", "DESC"]],
      });
    },
    log: async (_, { id }) => {
      return await db.AdminActivityLog.findByPk(id, {
        include: {
          model: db.Admin,
          as: "admin",
          attributes: ["id", "name", "email"],
        },
      });
    },
  },
  JSON: {
    __parseValue(value) {
      return typeof value === "string" ? JSON.parse(value) : value;
    },
    __serialize(value) {
      return value;
    },
    __parseLiteral(ast) {
      return ast.value;
    },
  },
};

/** 6️⃣ Create Apollo Server */
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

/** 7️⃣ Start Server */
(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully");

    const { url } = await server.listen({ port: 4000 });
    console.log(`🚀 GraphQL Server running at ${url}`);
  } catch (error) {
    console.error("❌ Unable to start server:", error);
  }
})();
