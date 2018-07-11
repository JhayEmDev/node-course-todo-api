const express = require('express');
const bodyParser = require('body-parser');

const {mongoose} = require('./db/mongoose');
const {Todo} = require('./models/todo');
const {User} = require('./models/user');

const app = express();
app.use(bodyParser.json());

app.post('/todos', async (req, res) => {
  console.log(req.body);
  const todo = new Todo({
    text: req.body.text
  });

  let doc;
  try {
    doc = await todo.save();
    res.send(doc);
  } catch (e) {
    console.log('Error saving todo from post man');
    res.status(400).send(e);
  }
});

app.listen(3000, () => {
  console.log(`Started server on port 3000`);
});