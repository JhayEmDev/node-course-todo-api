const express = require('express');
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');

const { mongoose } = require('./db/mongoose');
const { Todo } = require('./models/todo');
const { User } = require('./models/user');

const app = express();
const port = process.env.PORT || 3000;
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

app.get('/todos/:id', async (req, res) => {
  let err;
  const id = req.params.id;
  if (!ObjectID.isValid(id)) {
    err = `Invalid ID`;
    res.status(404).send({ err });
    return;
  }
  const doc = await Todo.findById(id)
    .catch((e) => {
      err = e;
      res.status(400).send({ err });
      return;
    });

  if (doc) {
    res.status(200).send({
      todo: doc
    });
    return;
  } else {
    err = `Document with id: ${id} not found.`;
    res.status(404).send({ err });
    return;
  }


  res.send(req.params);
});

app.delete('/todos/:id', async (req, res) => {
  let err;
  const id = req.params.id;
  if (!ObjectID.isValid(id)) {
    err = `Invalid ID`;
    return res.status(404).send({ err });
  }
  const doc = await Todo.findByIdAndRemove(id).catch((err) => {
    res.status(400).send({ err });
    res.end();
  });
  if (doc) {
    return res.status(200).send({ todo: doc });
  } else {
    err = `Todo could not be found`;
    return res.status(404).send({ err });
  }
});

app.listen(port, () => {
  console.log(`Started server on port ${port}`);
});

module.exports = { app };