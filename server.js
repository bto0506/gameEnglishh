const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'trivia_db',
  waitForConnections: true,
  connectionLimit: 10
});

app.post('/api/ranking', async (req, res) => {
  const { nombre, puntos } = req.body;
  if (!nombre || puntos === undefined) {
    return res.status(400).json({ error: 'Nombre y puntos son requeridos.' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO ranking (nombre, puntos) VALUES (?, ?)',
      [nombre, puntos]
    );
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    console.error('Error guardando puntaje:', error);
    res.status(500).json({ error: 'Error al conectar con la base de datos' });
  }
});

app.get('/api/ranking', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT nombre, puntos, fecha FROM ranking ORDER BY puntos DESC, fecha ASC LIMIT 10'
    );
    res.json(rows);
  } catch (error) {
    console.error('Error obteniendo ranking:', error);
    res.status(500).json({ error: 'Error al consultar el ranking' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});