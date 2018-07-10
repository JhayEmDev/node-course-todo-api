const { MongoClient, ObjectID } = require('mongodb');


const connectCallback = async (err, client) => {
  if (err) return console.log('Unable to connect to MongoDB server');
  console.log('Connected to MongoDB server');
  const db = client.db('TodoApp');
  const collection = db.collection('Todos');

  // deleteMany
  const res = await collection.deleteMany({
    text: 'Eat lunch'
  });

  const doc = await collection.findOneAndUpdate({
    _id: new ObjectID('5b44aa6a06e04b2210882b3a')
  }, {
    $set: {
      completed: true
    }
  }, {
    returnOriginal: false
  });
  console.log(doc);

  client.close();

};

MongoClient.connect('mongodb://localhost:27017/TodoApp', { useNewUrlParser: true }, connectCallback);