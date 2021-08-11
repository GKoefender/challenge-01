const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers

  const user = users.find(user => user.username === username)

  if (!user) return response.status(404).json({ error: 'Mensagem do erro' })

  request.user = user

  return next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body

  const usernameExists = users.some(user => username === user.username)

  if (usernameExists) return response.status(400).json({ error: 'Mensagem do erro' })

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(newUser)

  return response.status(201).json(newUser)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const todoUserList = request.user.todos

  return response.status(200).json(todoUserList)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body
  const user = request.user

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(newTodo)

  return response.status(201).json(newTodo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body
  const { id } = request.params
  const user = request.user

  const todoToUpdate = user.todos.find(todo => todo.id === id)

  if (!todoToUpdate) return response.status(404).json({ error: 'Mensagem do erro' })

  todoToUpdate.title = title
  todoToUpdate.deadline = new Date(deadline)

  return response.status(200).json(todoToUpdate)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const user = request.user

  const todoToUpdate = user.todos.find(todo => todo.id === id)

  if (!todoToUpdate) return response.status(404).json({ error: 'Mensagem do erro' })

  todoToUpdate.done = true

  return response.status(200).json(todoToUpdate)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const user = request.user

  const todoIndexToDelete = user.todos.findIndex(todo => todo.id === id)

  if (todoIndexToDelete === -1) return response.status(404).json({ error: 'Mensagem do erro' })

  const todoDeleted = user.todos.splice(todoIndexToDelete, 1)

  return response.status(204).send()
});

module.exports = app;