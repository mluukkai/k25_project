const express = require('express');
const app = express();
const { Pool } = require('pg');

const port = process.env.PORT || 3001;
const DB_URL = process.env.DB_URL || "postgres://postgres:postgres@localhost:5432/postgres";

const pool = new Pool({
  connectionString: DB_URL,
});


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const allTodos = async (req, res) => {
  const result = await pool.query('SELECT * FROM todos');
  todos = result.rows;
  res.json(todos);
}

app.get('/',allTodos);
app.get('/todos', allTodos);

app.post('/todos', async (req, res) => {
  const newTodo = req.body;

  console.log('New todo:', newTodo);

  try {
    const result = await pool.query(
      'INSERT INTO todos (content, done) VALUES ($1, $2) RETURNING *',
      [newTodo.content, newTodo.done || false]
    );
    console.log('Todo saved:', result.rows[0]);
  } catch (err) {
    console.error('Error inserting todo:', err);
    res.status(500).send('Error saving todo');
    return;
  }

  res.redirect('/');
});

app.listen(port, async () => {
  console.log(`Server is running on port ${port}`);
  await pool.query(
    `CREATE TABLE IF NOT EXISTS todos (
      id SERIAL PRIMARY KEY,
      content VARCHAR(255) NOT NULL,
      done BOOLEAN DEFAULT FALSE
    )`
  );
});