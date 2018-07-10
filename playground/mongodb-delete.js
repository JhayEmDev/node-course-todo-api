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

  console.log(res);


  // delete one
  const res1 = await collection.deleteOne({
    text: 'Eat lunch'
  });
  console.log(res1);

  // findOneAndDelete
  const res2 = await collection.findOneAndDelete({
    
  });

  client.close();

};

MongoClient.connect('mongodb://localhost:27017/TodoApp', { useNewUrlParser: true }, connectCallback);