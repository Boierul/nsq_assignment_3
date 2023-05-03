const neo4j = require("neo4j-driver");

const driver = neo4j.driver(
  "bolt://127.0.0.1:7687",
  neo4j.auth.basic("neo4j", "password")
);

const resolvers = {
  Query: {
    authors: async () => {
      const session = driver.session();
      const result = await session.run("MATCH (a:Author) RETURN a");
      session.close();
      const combinedResults = result.records.map((record) => {
        const id = record.get("a").identity.low;
        const props = record.get("a").properties;
        return { id, ...props };
      });
      console.log(combinedResults);
      return combinedResults;/* result.records.map((record) => record.get("a").properties); */
    },
  },
  Author: {
    id: (parent) => parent.id,
    FullName: (parent) => parent.FullName,
  },
};

module.exports = resolvers;
