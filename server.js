const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const db = new Database(path.join(__dirname, 'guestbook.db'));
db.exec(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    message TEXT NOT NULL,
    timestamp TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

app.use(cors());
app.use(express.json());

app.get('/messages', (req, res) => {
  const messages = db
    .prepare('SELECT name, message, timestamp FROM messages ORDER BY id ASC')
    .all();
  res.json(messages);
});

app.post('/messages', (req, res) => {
  const { name, message } = req.body;

  if (!name || !message) {
    return res.status(400).json({ error: 'name and message are required' });
  }

  const stmt = db.prepare(
    'INSERT INTO messages (name, message) VALUES (?, ?)'
  );
  const result = stmt.run(name, message);
  const saved = db
    .prepare('SELECT name, message, timestamp FROM messages WHERE id = ?')
    .get(result.lastInsertRowid);

  res.status(201).json(saved);
});

app.listen(PORT, () => {
  console.log(`Guestbook API listening on port ${PORT}`);
});
