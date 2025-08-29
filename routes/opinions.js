const express = require('express');
const { Pool } = require('pg');  // Usamos Pool en lugar de Client para gestionar conexiones
require('dotenv').config(); // Cargar variables de entorno desde .env 
const router = express.Router();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Obtener todas las opiniones
router.get('/', (req, res) => {
  const idTerminal = req.query.idTerminal ? parseInt(req.query.idTerminal) : null;

  let query = 'SELECT * FROM opiniones';
  const params = [];

  if (idTerminal) {
    query += ' WHERE idTerminal = $1';
    params.push(idTerminal);
  }

  query += ' ORDER BY "idTerminal" DESC';

  pool.query(query, params, (err, results) => {
    if (err) {
      console.error('Error al obtener opiniones:', err);
      return res.status(500).json({ message: 'Error al obtener opiniones' });
    }
    res.json(results.rows);
  });
});

// Crear una opinión
router.post('/', (req, res) => {
  let { idUser, idTerminal, opinion } = req.body;

  if (idUser === undefined || idTerminal === undefined || !opinion) {
    return res.status(400).json({ message: 'idUser, idTerminal y opinion son requeridos' });
  }

  idUser = parseInt(idUser);
  idTerminal = parseInt(idTerminal);

  if (isNaN(idUser) || isNaN(idTerminal)) {
    return res.status(400).json({ message: 'idUser y idTerminal deben ser números enteros' });
  }

  const query = 'INSERT INTO opiniones ("idUser","idTerminal", opinion) VALUES ($1, $2, $3) RETURNING *';
  pool.query(query, [idUser, idTerminal, opinion], (err, results) => {
    if (err) {
      console.error('Error al crear opinión:', err); // ya lo tienes
      return res.status(500).json({ 
        message: 'Error al crear opinión',
        error: err.message // <-- agrega esto para ver el detalle
      });
    }
    res.status(201).json(results.rows[0]);
  });
});

// Eliminar una opinión por ID
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  pool.query('DELETE FROM opiniones WHERE id = $1', [id], (err, results) => {
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

  const query = 'UPDATE opiniones SET opinion = $1 WHERE id = $2 RETURNING *';
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