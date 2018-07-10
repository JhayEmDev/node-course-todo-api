const { MongoClient, ObjectID } = require('mongodb');


const connectCallback = async (err, client) => {
  if (err) return console.log('Unable to connect to MongoDB server');
  console.log('Connected to MongoDB server');
  const db = client.db('TodoApp');
  const collection = db.collection('Todos');
  let docs;
  try {
    // docs = await db.collection('Todos').find({
    //   _id: new ObjectID('5b44aa6a06e04b2210882b3a')
    // }).toArray();
    docs = await collection.find().count();
    console.log(docs);
  } catch (e) {
    console.log(`Error in: db.collection('Todos').find().toArray()`);
    console.log(e);
  }
  console.log('TODOS');
  console.log(JSON.stringify(docs, undefined, 2));


  client.close();
  
};

MongoClient.connect('mongodb://localhost:27017/TodoApp', { useNewUrlParser: true }, connectCallback);