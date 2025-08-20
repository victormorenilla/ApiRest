const express = require('express');
const { Pool } = require('pg');  // Usamos Pool en lugar de Client para gestionar conexiones
require('dotenv').config(); // Cargar variables de entorno desde .env 
const router = express.Router();

const pool = new Pool({
  user: process.env.DB_USER ,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false },
});

// Obtener todas las opiniones
router.get('/', (req, res) => {
  pool.query('SELECT * FROM opinions ORDER BY created_at DESC', (err, results) => {
    if (err) {
      console.error('Error al obtener opiniones:', err);
      return res.status(500).json({ message: 'Error al obtener opiniones' });
    }
    res.json(results.rows);
  });
});

// Crear una opinión
router.post('/', (req, res) => {
  const { user_id, opinion } = req.body;

  if (!user_id || !opinion) {
    return res.status(400).json({ message: 'user_id y opinion son requeridos' });
  }

  const query = 'INSERT INTO opinions (user_id, opinion) VALUES ($1, $2) RETURNING *';
  pool.query(query, [user_id, opinion], (err, results) => {
    if (err) {
      console.error('Error al crear opinión:', err);
      return res.status(500).json({ message: 'Error al crear opinión' });
    }
    res.status(201).json(results.rows[0]);
  });
});

// Eliminar una opinión por ID
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  pool.query('DELETE FROM opinions WHERE id = $1', [id], (err, results) => {
    if (err) {
      console.error('Error al eliminar opinión:', err);
      return res.status(500).json({ message: 'Error al eliminar opinión' });
    }

    if (results.rowCount === 0) {
      return res.status(404).json({ message: 'Opinión no encontrada' });
    }

    res.status(200).json({ message: 'Opinión eliminada correctamente' });
  });
});
// Actualizar una opinión
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { opinion } = req.body;

  if (!opinion) {
    return res.status(400).json({ message: 'El campo opinion es requerido para actualizar' });
  }

  const query = 'UPDATE opinions SET opinion = $1 WHERE id = $2 RETURNING *';
  pool.query(query, [opinion, id], (err, results) => {
    if (err) {
      console.error('Error al modificar opinión:', err);
      return res.status(500).json({ message: 'Error al modificar opinión' });
    }

    if (results.rowCount === 0) {
      return res.status(404).json({ message: 'Opinión no encontrada' });
    }

    res.status(200).json({ message: 'Opinión modificada correctamente', opinion: results.rows[0] });
  });
}); 
module.exports = router;