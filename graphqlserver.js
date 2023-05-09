const { gql, ApolloServer } = require("apollo-server");
const { Neo4jGraphQL } = require("@neo4j/graphql");
const neo4j = require("neo4j-driver");
const fs = require("fs").promises;
const resolvers = require('./resolvers')

async function startServer(driver) {
  try {
    await driver.verifyConnectivity();
    console.log("Verified");
    const content = await fs.readFile("./amazon.sdl", "utf8");
    const typeDefs = gql(content);
    const graphQL = new Neo4jGraphQL({ typeDefs, driver, resolvers });
    const schema = await graphQL.getSchema();
    const server = new ApolloServer({ schema });
    const { url } = await server.listen();
    console.log(`GraphQL server ready on ${url}`);
  } catch (err) {
    console.error(`Error: ${err}`);
  }
}
const driver = neo4j.driver(
  "bolt://127.0.0.1:7687",
  neo4j.auth.basic("neo4j", "andronachi"),
  {
    encrypted: "ENCRYPTION_OFF"
  }
);

startServer(driver);
