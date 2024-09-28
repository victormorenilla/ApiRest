const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const connectionUrl = 'mysql://root:pjIJeIqjdTkiOTPhdeLJMdzdLTTfOctD@junction.proxy.rlwy.net:50532/railway';
const db = mysql.createConnection(connectionUrl);

// Obtener todos los usuarios
router.get('/', (req, res) => {
  db.query('SELECT * FROM users', (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error al consultar usuarios' });
    }
    res.json(results);
  });
});

// Obtener un usuario por ID
router.get('/:name', (req, res) => {
  const { name } = req.params;
  db.query('SELECT * FROM users WHERE name = ?', [name], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error al consultar usuario' });
    }
    if (results.length > 0) {
      res.json(results[0]);
    } else {
      res.status(404).json({ message: 'Usuario no encontrado' });
    }
  });
});

// Crear un nuevo usuario
router.post('/', (req, res) => {
  const { name, email, password } = req.body;

  // Validación básica de los campos
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Nombre, email y contraseña son requeridos.' });
  }

  // Consulta para insertar un nuevo usuario
  const query = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';

  db.query(query, [name, email, password], (err, results) => {
    if (err) {
      console.error('Error al crear usuario:', err);
      return res.status(500).json({ message: 'Error al crear usuario', error: err });
    }

    // Si se inserta correctamente, devolver la información del usuario creado
    res.status(201).json({
      id: results.insertId,
      name,
      email,
      password
    });
  });
});

// Actualizar un usuario existente
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;
  db.query('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, id], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error al actualizar usuario' });
    }
    if (results.affectedRows > 0) {
      res.json({ id, name, email });
    } else {
      res.status(404).json({ message: 'Usuario no encontrado' });
    }
  });
});

// Eliminar un usuario
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM users WHERE id = ?', [id], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error al eliminar usuario' });
    }
    if (results.affectedRows > 0) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'Usuario no encontrado' });
    }
  });
});

module.exports = router;
