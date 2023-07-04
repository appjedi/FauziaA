import { ApolloServer, gql, AuthenticationError } from "apollo-server-express";
import jwt from "jsonwebtoken";
import guid from "guid";
require("dotenv").config();
import { dbAuth, updateUser, getUserByEmail, getDonations, updateFromStripe } from "./dao/dao";
// https://www.youtube.com/watch?v=QChEaOHauZY
import users from "./users";
import { charge } from "./services/stripe";
import express from 'express';
import cors from 'cors';

const JWT_SECRET = process.env.JWT_SECRET || "secret";

const refreshTokens = {};
let stripe_url;
const typeDefs = gql`
  type Query {
    todos: [String!]
    profile: String!
    donations: String!
  }

  type Mutation {
    authenticate(name: String!, password: String!): String
    refresh: String
    donate(amount: Float!): String
    reg(password1: String!, password2: String!, lastName: String!, firstName: String!, email: String!):String
  }
`;
let userName
const resolvers = {
  Query: {
    todos: (_parent, _args, context) => {
      console.log("CONTEXT", context?.name);
      const n = "jane";
      if (!users[n]) {
        throw new AuthenticationError("Invalid credentials");
      }

      return users[n].todos;
    },
    profile: async (_parent, _args, context) => {
      console.log("profile", context?.name);

      const user = await getUserByEmail(context?.name);

      console.log("USER", user);
      if (!user) {
        throw new AuthenticationError("Invalid credentials");
      }
      const user2 = { username: user.username }
      return JSON.stringify(user);
    },
    donations: async (_parent, _args, context) => {
      console.log("profile", context?.name);

      const donations = await getDonations(context?.name);

      console.log("donations", donations);


      return JSON.stringify(donations);
    },
  },
  Mutation: {
    authenticate: async (
      _,
      { name, password }
    ) => {
      console.log("NAME:", name)
      const user = await dbAuth(name, password);

      if (user && user.status === 1) {
        return jwt.sign({ data: name }, JWT_SECRET, { expiresIn: "7 days" });
      } else {
        return '{ data: { authenticate: "Failed login" } }';
      }
    },
    reg: async (
      _,
      { lastName, firstName, email, password1, password2 }
    ) => {
      console.log("NAME:", email)
      // updateUser = async (userId: string, password1: string, password2: string, lastName: string, firstName: string, email: string, roleId: string, status: string)
      const user = await updateUser("", password1, password2, lastName, firstName, email, 1, 1);

      if (user && user?.status === 1) {
        return jwt.sign({ data: email }, JWT_SECRET, { expiresIn: "7 days" });
      } else {
        return '{ data: { authenticate: "Failed login" } }';
      }
    },
    donate: async (_parent, { amount }) => {
      console.log("donate.amount", amount, userName);
      const resp = await charge(userName, amount);
      console.log(resp);
      if (resp.status === 200) {
        console.log("redirect:", resp.url);
        stripe_url = resp.url;

        // GV_RESPONSE.redirect(resp.url);
        return `url: ${stripe_url}`
        // return app.response.redirect(resp.url);
      } else {
        return "message: payment failed";
      }

    },
    refresh: (
      _parent,
      _args,
      { refreshToken }
    ) => {
      const token = jwt.verify(refreshToken, JWT_SECRET);
      if (token.data in refreshTokens) {
        return jwt.sign({ data: refreshTokens[token.data] }, JWT_SECRET, {
          expiresIn: "5s",
        });
      }
    },
  },
};
const app = express();
app.use(cors());
let GV_RESPONSE;
async function startServer() {
  const server = new ApolloServer({
    formatResponse: (response, requestContext) => {
      console.log("formatResponse")
      if (response.errors && !requestContext.request.variables?.password) {
        if (requestContext.response?.http) {
          requestContext.response.http.status = 401;
        }
      } else if (response.data?.authenticate || response.data?.refresh) {
        const tokenExpireDate = new Date();
        tokenExpireDate.setDate(
          tokenExpireDate.getDate() + 60 * 60 * 24 * 7 // 7 days
        );
        const refreshTokenGuid = guid.raw();

        const token = jwt.verify(
          response.data?.authenticate || response.data?.refresh,
          JWT_SECRET
        );

        refreshTokens[refreshTokenGuid] = token.data;
        const refreshToken = jwt.sign({ data: refreshTokenGuid }, JWT_SECRET, {
          expiresIn: "7 days",
        });

        requestContext.response?.http?.headers.append(
          "Set-Cookie",
          `refreshToken=${refreshToken}; expires=${tokenExpireDate}`
        );
      }
      console.log("response", response, stripe_url)
      if (stripe_url) {
        //this.context.res.redirect(stripe_url);
        response.http?.headers.set("location", stripe_url);
      }
      return response;
    },
    context: ({ req, res }) => {
      const ctx = {
        name: null,
        refreshToken: null,
        res: null
      };
      console.log("context");
      // GV_RESPONSE = res;
      const cookies = (req.headers?.cookie ?? "")
        .split(";")
        .reduce((obj, c) => {
          console.log("COOKIE:", c);
          if (c.indexOf("=") > 0) {
            const [name, value] = c.split("=");
            obj[name.trim()] = value.trim();
          }
          return obj;
        }, {});

      ctx.refreshToken = cookies?.refreshToken;
      console.log("ctx.refreshToken", ctx.refreshToken);
      try {
        if (req.headers["x-access-token"]) {
          console.log("req.headers", req.headers["x-access-token"])
          const token = jwt.verify(
            req.headers["x-access-token"],
            JWT_SECRET
          );
          console.log("TOKEN", token);
          ctx.name = token.data;
          ctx.res = res;
          userName = ctx.name;
        }
      } catch (e) {
        console.log("JWT ERROR ", e);
      }
      console.log("ctx.name:", ctx.name);
      return ctx;
    },
    typeDefs,
    resolvers,
  });
  await server.start();
  server.applyMiddleware({ app });
  const PORT = 3000;

  app.get("/success/:id/:token", (req, res) => {
    const id = req.params.id;
    const token = req.params.token;
    updateFromStripe(id, "success");
    const resp = { status: "success", id: id, token: token }
    res.send(resp);
  });
  app.get("/failure/:id/:token", (req, res) => {
    const id = req.params.id;
    const token = req.params.token;
    const resp = { status: "failed", id: id, token: token }
    res.send(resp);
  });
  app.listen(PORT, () => {
    console.log(`🚀  server ready at ${PORT}`);
  });
}
startServer();
/*
server.listen({ port: 3000 }).then(({ url }) => {
  console.log(`🚀  server ready at ${url}`);
});
*/
