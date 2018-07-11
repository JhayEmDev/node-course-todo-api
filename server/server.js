const express = require('express');
const bodyParser = require('body-parser');

const {mongoose} = require('./db/mongoose');
const {Todo} = require('./models/todo');
const {User} = require('./models/user');

const app = express();
app.use(bodyParser.json());

app.post('/todos', async (req, res) => {
  const todo = new Todo({
    text: req.body.text
  });

  let doc;
  try {
    doc = await todo.save();
    res.send(doc);
  } catch (e) {
    res.status(400).send(e);
  }
});

app.get('/todos', async (req, res) => {
  Todo.find().then((todos) => {
    res.send({
      todos
    });
  }).catch((e) => {
    res.status(400).send(e);
  });
});

app.listen(3000, () => {
  console.log(`Started server on port 3000`);
});

module.exports = {app};