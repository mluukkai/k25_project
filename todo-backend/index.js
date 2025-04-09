const express = require('express');
const app = express();
const { Pool } = require('pg');

const { connect } = require("@nats-io/transport-node");

let nc

const port = process.env.PORT || 3001;
const DB_URL = process.env.DB_URL || "postgres://postgres:postgres@localhost:5432/postgres";
const NATS_URI = process.env.NATS_URI || 'nats://localhost:4222';

let pool = null

try {
  pool = new Pool({
    connectionString: DB_URL,
  });
} catch (err) {
  console.error('Error creating pool:', err);
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const allTodos = async (req, res) => {
  const result = await pool.query('SELECT * FROM todos');
  const todos = result.rows;
  
  const object = {
    todo: todos[0],
    action: 'viewed'
  };
  nc.publish("todo", JSON.stringify(object));
  
  res.json(todos);
}

app.get('/', allTodos);
app.get('/todos', allTodos);

app.get('/healthz', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.send('healthy');
  } catch (err) {
    console.error('Health check failed:', err);
    res.status(500).send('Database connection error');
  }
});

app.delete('/todos/:id', async (req, res) => {
  const { id } = req.params;

  console.log('Deleting todo with id:', id);

  try {
    const result = await pool.query('DELETE FROM todos WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      res.status(404).send('Todo not found');
    } else {
      const object = {
        todo: result.rows[0],
        action: 'deleted'
      };
      nc.publish("todo", JSON.stringify(object));
    
      res.json(result.rows[0]);
    }
  } catch (err) {
    console.error('Error deleting todo:', err);
    res.status(500).send('Error deleting todo');
  }
});

app.post('/todos/:id', async (req, res) => {
  const { id } = req.params;

  console.log('Updating todo with id:', id);

  try {
    const result = await pool.query(
      'UPDATE todos SET done = true WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).send('Todo not found');
    }
    const object = {
      todo: result.rows[0],
      action: 'done'
    };
    nc.publish("todo", JSON.stringify(object));
  
  } catch (err) {
    console.error('Error updating todo:', err);
    res.status(500).send('Error updating todo');
  }
  res.redirect('/');
});

app.post('/todos', async (req, res) => {
  const newTodo = req.body;

  console.log('New todo:', newTodo);

  try {
    const result = await pool.query(
      'INSERT INTO todos (content, done) VALUES ($1, $2) RETURNING *',
      [newTodo.content, newTodo.done || false]
    );
    const object = {
      todo: result.rows[0],
      action: 'created'
    };
    nc.publish("todo", JSON.stringify(object));
  
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

  try {
    await pool.query(
      `CREATE TABLE IF NOT EXISTS todos (
        id SERIAL PRIMARY KEY,
        content VARCHAR(255) NOT NULL,
        done BOOLEAN DEFAULT FALSE
      )`
    );
    console.log('Table "todos" is ready');
  } catch (err) {
    console.error('Error creating table:', err);
  }

  console.log(`Connecting to NATS at ${NATS_URI}`);

  nc = await connect({'servers': [ NATS_URI ]})
  const sub = nc.subscribe("todo");
  (async () => {
    for await (const m of sub) {
      console.log(`[${sub.getProcessed()}]: ${m.string()}`);
    }
    console.log("subscription closed");
  })();

});