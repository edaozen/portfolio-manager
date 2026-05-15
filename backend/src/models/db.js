const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '../../portfolio.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS assets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    unit TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    asset_id INTEGER NOT NULL,
    quantity REAL NOT NULL,
    buy_price REAL NOT NULL,
    date TEXT NOT NULL,
    notes TEXT,
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE RESTRICT
  );
`);

module.exports = db;