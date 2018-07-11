const {ObjectID} = require('mongodb');

const {mongoose} = require('../server/db/mongoose');
const {Todo} = require('../server/models/todo');
const {User} = require('../server/models/user');

// Todo.remove({});

(async () => {
  const result = await Todo.remove({});
  console.log(result);
})();

(async () => {
  // const result = await Todo.findByIdAndRemove({});
  const result = await Todo.findOneAndRemove({});
  console.log(result);
})();
