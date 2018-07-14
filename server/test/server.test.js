const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const { app } = require('../server');
const { Todo } = require('../models/todo');
const { User } = require('../models/user');
const { todos, populateTodos, users, populateUsers } = require('./seed/seed');

beforeEach(async function () {
  this.timeout(5000);
  await populateUsers();
});
beforeEach(populateTodos);

describe(`POST /todos`, () => {
  it('should create a new todo', (done) => {
    const text = 'Test todo text';
    request(app)
      .post('/todos')
      .set('x-auth', users[0].tokens[0].token)
      .send({ text })
      .expect(200)
      .expect((res) => {
        expect(res.body.text).toBe(text);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        Todo.find({ text }).then((todos) => {
          expect(todos.length).toBe(1);
          expect(todos[0].text).toBe(text);
          done();
        }).catch((e) => done(e));
      });
  }).timeout(5000);

  it('should not create todo with invalid body data', (done) => {
    const text = 'Test todo text';
    request(app)
      .post('/todos')
      .set('x-auth', users[0].tokens[0].token)
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) {
          done(err);
        }

        Todo.find().then((todos) => {
          expect(todos.length).toBe(2);
          done();
        }).catch((e) => done(e));
      });
  });

});

describe(`GET /todos`, () => {
  it(`should get all todos`, (done) => {
    request(app)
      .get('/todos')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(1);
      })
      .end(done);
  })
});

describe(`GET /todos/:id`, () => {
  it(`should return todo doc`, async () => {

    const response = await request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(200);
    expect(response.body.todo.text).toBe(todos[0].text);
  });

  it(`should not return todo doc created by another user`, async () => {

    const response = await request(app)
      .get(`/todos/${todos[1]._id.toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404);
  });

  it(`should return 404 if todo not found`, async () => {
    // make sure you get a 404 with a valid but not found ID
    const dummyID = new ObjectID().toHexString();
    const response = await request(app)
      .get(`/todos/${dummyID}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404);
  });

  it(`should return a 400 invalid ID`, async () => {
    const response = await request(app)
      .get(`/todos/${123}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404);

  });

});

describe(`DELETE /todos/:id`, () => {
  it(`should remove a todo`, (done) => {
    const hexID = todos[1]._id.toHexString();
    request(app)
      .delete(`/todos/${hexID}`)
      .set(`x-auth`, users[1].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo._id).toBe(hexID);
      })
      .end((err, res) => {
        if (err) return done(err);

        Todo.findById(hexID).then((todo) => {
          expect(todo).toBeNull();
          done();
        }).catch((e) => done(e));

      });
  });

  it(`should not remove a todo by another user`, (done) => {
    const hexID = todos[0]._id.toHexString();
    request(app)
      .delete(`/todos/${hexID}`)
      .set(`x-auth`, users[1].tokens[0].token)
      .expect(404)
      .end((err, res) => {
        if (err) return done(err);

        Todo.findById(hexID).then((todo) => {
          expect(todo).not.toBeNull();
          done();
        }).catch((e) => done(e));

      });
  });

  it(`should return a 404 if todo not found`, async () => {
    const dummyID = new ObjectID().toHexString();
    const response = await request(app)
      .delete(`/todos/${dummyID}`)
      .set(`x-auth`, users[1].tokens[0].token)
      .expect(404);
  });

  it(`should return 404 if objectID is invalid`, async () => {
    const response = await request(app)
      .delete(`/todos/${123}`)
      .set(`x-auth`, users[1].tokens[0].token)
      .expect(404);
  });
});

describe(`PATCH /todos/:id`, () => {
  it(`should update the todo`, (done) => {
    const hexID = todos[0]._id.toHexString();
    const text = 'This should be the new text';

    request(app)
      .patch(`/todos/${hexID}`)
      .send({
        completed: true,
        text
      })
      .set(`x-auth`, users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(text);
        expect(res.body.todo.completed).toBe(true);
        // UPDATE THIS expect(res.body.todo.completedAt).toBeA(Number);
      })
      .end(done);

  });

  it(`should not update the todo of another user`, (done) => {
    const hexID = todos[1]._id.toHexString();
    const text = 'This should be the new text';

    request(app)
      .patch(`/todos/${hexID}`)
      .send({
        completed: true,
        text
      })
      .set(`x-auth`, users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it(`should clear completedAt when todo is not completed`, (done) => {
    const hexID = todos[0]._id.toHexString();
    const text = 'This should be the new text!!';

    request(app)
      .patch(`/todos/${hexID}`)
      .set(`x-auth`, users[0].tokens[0].token)
      .send({
        completed: false,
        text
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(text);
        expect(res.body.todo.completed).toBe(false);
        expect(res.body.todo.completedAt).toBeNull;
      })
      .end(done);
  });
});

describe(`GET /users/me`, () => {
  it(`should return user if authenticated`, (done) => {
    request(app)
      .get(`/users/me`)
      .set(`x-auth`, users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body._id).toBe(users[0]._id.toHexString());
        expect(res.body.email).toBe(users[0].email);
      })
      .end(done);
  });

  it(`should return a 401 if not authenticated`, (done) => {
    request(app)
      .get(`/users/me`)
      .expect(401)
      .expect((res) => {
        expect(res.body).toEqual({});
      })
      .end(done);
  });
});

describe(`POST /users`, () => {
  it(`should create a user`, (done) => {
    const email = 'example@gmail.com';
    const password = '123mnb!';

    request(app)
      .post(`/users`)
      .send({ email, password })
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).not.toBeNull();
        expect(res.body._id).not.toBeNull();
        expect(res.body.email).toBe(email);
      })
      .end((err) => {
        if (err) done(err);
        User.findOne({ email }).then((user) => {
          expect(user).not.toBeNull();
          expect(user.password).not.toBe(password);
          expect(user.email).toBe(email);
          done();
        }).catch(e => done(e));;
      });
  });

  it(`should return validation errors if request invalid`, (done) => {
    request(app)
      .post('/users')
      .send({
        email: 'and',
        password: '123',
      })
      .expect(400)
      .end(done);
  });

  it(`should not create user if email in user`, (done) => {
    request(app)
      .post('/users')
      .send({
        email: users[0].email,
        password: 'password123!'
      })
      .expect(400)
      .end(done);
  });
});

describe(`POST /users/login`, () => {
  it(`should login user and return auth token`, (done) => {
    request(app)
      .post('/users/login')
      .send({
        email: users[1].email,
        password: users[1].password
      })
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).not.toBeUndefined();
      })
      .end((err, res) => {
        if (err) return done(err);
        User.findById(users[1]._id).then((user) => {
          expect(user).not.toBeUndefined();
          expect(user.tokens[1]).toMatchObject({
            access: 'auth',
            token: res.headers['x-auth']
          });
          done();
        }).catch(e => done(e));
      })
  });

  it(`should reject invalid login`, (done) => {
    request(app)
      .post('/users/login')
      .send({
        email: users[1].email,
        password: 'qwerqwer'
      })
      .expect(400)
      .expect((res) => {
        expect(res.headers['x-auth']).toBeUndefined();
      })
      .end((err, res) => {
        if (err) return done(err);
        User.findById(users[1]._id)
          .then((user) => {
            expect(user.tokens.length).toBe(1);
            done();
          }).catch(done);
      });
  });
});

describe(`DELETE /users/me/token`, () => {
  it(`should remove auth token on logout`, (done) => {
    request(app)
      .delete('/users/me/token')
      .set(`x-auth`, users[0].tokens[0].token)
      .expect(200)
      .end((err, req) => {
        if (err) return done(err);
        User.findById(users[0]._id).then((user) => {
          expect(user.tokens.length).toBe(0);
          done();
        }).catch(done);
      });
  });
});