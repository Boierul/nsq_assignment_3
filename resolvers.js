const neo4j = require("neo4j-driver");

const driver = neo4j.driver(
  "bolt://127.0.0.1:7687",
  neo4j.auth.basic("neo4j", "andronachi")
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

  Mutation: {
    applyAuthorDiscount: async (_, { FullName, discountPercent }) => {
      const session = driver.session();
      try {
        const result = await session.run(
          `
          MATCH (a:Author { FullName: $FullName })<-[:WRITTEN_BY]-(b:Book)
          SET b.ReducedPrice = toFloat(b.Price) * (1 - $discountPercent / 100)
          RETURN b.BookName, b.Price, b.ReducedPrice
          `,
          { FullName, discountPercent }
        );
        session.close();
        const combinedResults = result.records.map((record) => {
          const BookName = record.get("b.BookName");
          const Price = record.get("b.Price");
          const ReducedPrice = record.get("b.ReducedPrice");
          return { BookName, Price, ReducedPrice };
        });
        return { books: combinedResults };
      } catch (error) {
        console.error(error);
      }
    },
  },

  Author: {
    id: (parent) => parent.id,
    FullName: (parent) => parent.FullName,
  },
};

module.exports = resolvers;
