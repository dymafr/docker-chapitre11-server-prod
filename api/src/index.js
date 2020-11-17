const express = require('express');
const MongoClient = require('mongodb').MongoClient;
let clientDb;
let count;
const MongUrl = process.env.NODE_ENV === 'production' ? 
`mongodb://${ process.env.MONGO_USERNAME }:${ process.env.MONGO_PWD }@db` : 
`mongodb://db`

MongoClient.connect(MongUrl, { useUnifiedTopology: true }, (err, client) => {
  if (err) {
    console.log(err);
  } else {
    console.log('CONNEXION DB OK !');
    clientDb = client;
    count = client.db('test').collection("count");
  }
});

const app = express();

app.get('/api/count', (req, res) => {
  count.findOneAndUpdate({}, { $inc: { count: 1 } }, { returnNewDocument: true }).then((doc) => {
    const count = doc.value;
    res.status(200).json(count.count);
  })
})

app.all('*', (req, res) => {
  res.status(404).end();
})

const server = app.listen(80);

process.addListener('SIGINT', () => {
  server.close((err) => {
    if (err) {
      process.exit(1);
    } else {
      if (clientDb) {
        clientDb.close((err) => process.exit(err ? 1 : 0));
      } else {
        process.exit(0);
      }
    }
  })
})