const express = require("express");
const { MongoClient } = require("mongodb");

const app = express();
const PORT = process.env.PORT || 80;
const MONGO_URI =
  process.env.NODE_ENV === "production"
    ? `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PWD}@db`
    : `mongodb://db`;

const client = new MongoClient(MONGO_URI);
let countCollection;

async function connectDB() {
  try {
    await client.connect();
    countCollection = client.db().collection("count");
    console.log("CONNEXION DB OK !");

    const countExists = await countCollection.countDocuments();
    if (countExists === 0) {
      await countCollection.insertOne({ count: 0 });
    }
  } catch (error) {
    console.error("Erreur connexion DB", error);
    process.exit(1);
  }
}
connectDB();

app.get("/api/count", async (req, res) => {
  try {
    const doc = await countCollection.findOneAndUpdate(
      {},
      { $inc: { count: 1 } },
      { returnDocument: "after", upsert: true }
    );
    res.status(200).json(doc?.count || 0);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.all("*", (req, res) => {
  res.status(404).end();
});

const server = app.listen(PORT, () =>
  console.log(`Serveur démarré sur le port ${PORT}`)
);

process.on("SIGINT", () => {
  server.close((err) => {
    if (err) {
      process.exit(1);
    } else {
      if (client) {
        client.close((err) => {
          process.exit(err ? 1 : 0);
        });
      } else {
        process.exit(0);
      }
    }
  });
});
