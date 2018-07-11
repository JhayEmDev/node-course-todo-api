const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const { app } = require('../server');
const { Todo } = require('../models/todo');

const todos = [
  {
    _id: new ObjectID(),
    text: 'First test todo'
  }, {
    _id: new ObjectID(),
    text: 'Second test todo',
    completed: true,
    completedAt: 333
  }
];

beforeEach(async () => {
  await Todo.remove({});
  await Todo.insertMany(todos);
});

describe(`POST /todos`, () => {
  it(`should create a new todo`, (done) => {
    const text = 'Test todo text';
    request(app)
      .post('/todos')
      .send({ text })
      .expect(200)
      .expect((res) => {
        expect(res.body.text).toBe(text);
      })
      .end((err, res) => {
        if (err) {
          done(err);
        }

        Todo.find({ text }).then((todos) => {
          expect(todos.length).toBe(1);
          expect(todos[0].text).toBe(text);
          done();
        }).catch((e) => done(e));
      });
  });

  it('should not create todo with invalid body data', (done) => {
    const text = 'Test todo text';
    request(app)
      .post('/todos')
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
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(2);
      })
      .end(done);
  })
});

describe(`GET /todos/:id`, () => {
  it(`should return todo doc`, async () => {

    const response = await request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .expect(200);
    expect(response.body.todo.text).toBe(todos[0].text);
  });

  it(`should return 404 if todo not found`, async () => {
    // make sure you get a 404 with a valid but not found ID
    const dummyID = new ObjectID().toHexString();
    const response = await request(app)
      .get(`/todos/${dummyID}`)
      .expect(404);
  });

  it(`should return a 400 invalid ID`, async () => {
    const response = await request(app)
      .get(`/todos/${123}`)
      .expect(404);

  });

});

describe(`DELETE /todos/:id`, () => {
  it(`should remove a todo`, (done) => {
    const hexID = todos[1]._id.toHexString();
    request(app)
      .delete(`/todos/${hexID}`)
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

  it(`should return a 404 if todo not found`, async () => {
    const dummyID = new ObjectID().toHexString();
    const response = await request(app)
      .delete(`/todos/${dummyID}`)
      .expect(404);
  });

  it(`should return 404 if objectID is invalid`, async () => {
    const response = await request(app)
      .delete(`/todos/${123}`)
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
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(text);
        expect(res.body.todo.completed).toBe(true);
        // UPDATE THIS expect(res.body.todo.completedAt).toBeA(Number);
      })
      .end(done);

  });

  it(`should clear completedAt when todo is not completed`, (done) => {
    const hexID = todos[0]._id.toHexString();
    const text = 'This should be the new text!!';

    request(app)
      .patch(`/todos/${hexID}`)
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