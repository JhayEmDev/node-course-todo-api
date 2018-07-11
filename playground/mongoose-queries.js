const {mongoose} = require('../server/db/mongoose');
const {Todo} = require('../server/models/todo');

// const id = '5b45b8916746480a98118868';
const id = '6b45b8916746480a98118868'; // Id the does not exist

Todo.find({
  _id: id
}).then((todos) => {
  console.log('Todos', todos);
});


Todo.findOne({
  _id: id
}).then((todo) => {
  console.log('Todo', todo);
});

Todo.findById(id).then((todo) => {
  console.log('Todo By ID', todo);
});

//