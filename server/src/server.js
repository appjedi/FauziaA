const express = require('express')
require('dotenv').config()
const jwt = require('jsonwebtoken')
//const expressGraphQL = require('express-graphql')
//const { graphqlHTTP } = require('express-graphql');
const expressGraphQL = require('express-graphql').graphqlHTTP
const { getUsers, updateUser, getUserByEmail } = require("./dao/dao");
const { login, getRefreshTokens, auth, getUserByToken } = require("./auth");
const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLInt,
    GraphQLNonNull
} = require('graphql')
const app = express()
const UserType = new GraphQLObjectType({
    name: 'User',
    description: 'This represents users from MySQL database',
    fields: () => ({
        userId: { type: GraphQLNonNull(GraphQLString) },
        lastName: { type: GraphQLNonNull(GraphQLString) },
        firstName: { type: GraphQLNonNull(GraphQLString) },
        email: { type: GraphQLNonNull(GraphQLString) },
        password: { type: GraphQLNonNull(GraphQLString) },
        roleId: { type: GraphQLNonNull(GraphQLInt) },
        status: { type: GraphQLNonNull(GraphQLInt) }
    })
});

const MessageType = new GraphQLObjectType({
    name: 'Message',
    description: 'Generic Message',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) },
        status: { type: GraphQLNonNull(GraphQLInt) },
        level: { type: GraphQLNonNull(GraphQLInt) },
        message: { type: GraphQLNonNull(GraphQLString) }
    })
});


const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'Root Query',
    fields: () => ({

        users: {
            type: new GraphQLList(UserType),
            description: 'List of User by id',
            args: {
                id: { type: GraphQLInt }
            },
            resolve: (async (parent, args) => getUsers(null))
        },
        user: {
            type: new GraphQLList(UserType),
            description: 'List of User by id',
            args: {
                email: { type: GraphQLString }
            },
            resolve: (async (parent, args) => getUserByEmail(args.email))
        },
        login: {
            type: new GraphQLList(MessageType),
            description: 'List of User by id',
            args: {
                username: { type: GraphQLString },
                password: { type: GraphQLString }
            },
            resolve: (async (parent, args, context) => login(args.username, args.password, context))

        }

    })
})

const RootMutationType = new GraphQLObjectType({
    name: 'Mutation',
    description: 'Root Mutation',
    fields: () => ({

        updateUser: {
            /*
            mutation {
              updateUser(userId: 2, username: "testerb", password:"Test1234",lastName:"Tester", firstName:"Bob", email:"tester.test@test.com", roleId:1,status:1) {
                    username
                }
            }
            */
            type: MessageType,
            description: 'Add/Update User',
            args: {
                userId: { type: GraphQLNonNull(GraphQLString) },
                email: { type: GraphQLNonNull(GraphQLString) },
                password1: { type: GraphQLNonNull(GraphQLString) },
                password2: { type: GraphQLNonNull(GraphQLString) },
                lastName: { type: GraphQLNonNull(GraphQLString) },
                firstName: { type: GraphQLNonNull(GraphQLString) },

                roleId: { type: GraphQLNonNull(GraphQLInt) },
                status: { type: GraphQLNonNull(GraphQLInt) }
            },
            resolve: (async (parent, args) => {
                const resp = await updateUser(args.userId, args.password1, args.password2, args.lastName, args.firstName, args.email, args.roleId, args.status)
                console.log("RESP", resp);
                // const ret={userId:args.userId, username:args.username, status:1, message:"Updated"}
                return resp;
            })
        }
    })
})
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) return res.sendStatus(401)

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        console.log(err)
        if (err) return res.sendStatus(403)
        req.user = user
        next()
    })
}
const schema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType
})
app.get("/user", (req, res) => {
    const token = req.query.token;
    console.log("user.token:", token);
    const user = getUserByToken(token);
    // const authHeader = req.headers['authorization']
    console.log("USER", user);
    //  console.log("authHeader", authHeader);


    const tokens = getRefreshTokens();
    console.log("getRefreshTokens", tokens);
    res.send(user);
})
app.use('/graphql', expressGraphQL({
    schema: schema,
    graphiql: true
}))
app.listen(5000, () => console.log('Server Running'))