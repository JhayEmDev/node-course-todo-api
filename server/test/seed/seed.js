const { ObjectID } = require('mongodb');
const jwt = require('jsonwebtoken');

const { Todo } = require('../../models/todo');
const { User } = require('../../models/user');

const userOneId = new ObjectID();
const userTwoId = new ObjectID();
const users = [{
  _id: userOneId,
  email: 'jm.cruz.manalo@gmail.com',
  password: 'userOnePass',
  tokens: [{
    access: 'auth',
    token: jwt.sign({ _id: userOneId, access: 'auth' }, process.env.JWT_SECRET).toString()
  }]
}, {
  _id: userTwoId,
  email: 'jhay.xann@gmail.com',
  password: 'userTwoPass',
  tokens: [{
    access: 'auth',
    token: jwt.sign({ _id: userTwoId, access: 'auth' }, process.env.JWT_SECRET).toString()
  }]
}];

const todos = [
  {
    _id: new ObjectID(),
    text: 'First test todo',
    _creator: userOneId
  }, {
    _id: new ObjectID(),
    text: 'Second test todos',
    completed: true,
    completedAt: 333,
    _creator: userTwoId
  }
];

const populateTodos = async () => {
  await Todo.remove({});
  Todo.insertMany(todos);
};

const populateUsers = async () => {
  await User.remove({});
  const userOne = new User(users[0]).save();
  const userTwo = new User(users[1]).save();
  await Promise.all([
    userOne, userTwo
  ]);
}


module.exports = { todos, populateTodos, users, populateUsers };