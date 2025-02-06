<<<<<<< HEAD
const express = require('express');
const { Pool } = require('pg');  // Usamos Pool en lugar de Client para gestionar conexiones
const router = express.Router();

// Configuración del pool de conexiones a la base de datos PostgreSQL (Neon)
const pool = new Pool({
  user: 'neondb_owner',
  host: 'ep-red-thunder-a28kqfu5-pooler.eu-central-1.aws.neon.tech',
  database: 'neondb',
  password: 'npg_gbuyi2RmfzQ0',
  port: 5432,
  ssl: { rejectUnauthorized: false },
});

// Obtener todos los usuarios
router.get('/', (req, res) => {
  pool.query('SELECT * FROM users', (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error al consultar usuarios' });
    }
    res.json(results.rows); // Usamos `results.rows` en lugar de `results`
  });
});

// Obtener un usuario por nombre
router.get('/:name', (req, res) => {
  const { name } = req.params;
  pool.query('SELECT * FROM users WHERE name = $1', [name], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error al consultar usuario' });
    }
    if (results.rows.length > 0) {
      res.json(results.rows[0]); // Usamos `results.rows[0]` porque en PostgreSQL `rows` es un arreglo
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
  const query = 'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id';
  
  pool.query(query, [name, email, password], (err, results) => {
    if (err) {
      console.error('Error al crear usuario:', err);
      return res.status(500).json({ message: 'Error al crear usuario', error: err });
    }

    // Si se inserta correctamente, devolver la información del usuario creado
    res.status(201).json({
      id: results.rows[0].id, // En PostgreSQL, el ID insertado se obtiene de `results.rows[0].id`
      name,
      email,
      password
    });
  });
});

// Actualizar un usuario existente
router.put('/name/:name', (req, res) => {
  const { name } = req.params;
  const { email, password } = req.body;

  // Verificar que todos los campos estén presentes
  if (!email || !password) {
    return res.status(400).json({ message: 'Faltan datos para actualizar el usuario' });
  }

  // Ejecutar la consulta
  const query = 'UPDATE users SET email = $1, password = $2 WHERE name = $3';
  
  pool.query(query, [email, password, name], (err, results) => {
    if (err) {
      console.error('Error al modificar usuario:', err);
      return res.status(500).json({ message: 'Error al modificar usuario' });
    }

    if (results.rowCount === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Responder con éxito
    res.status(200).json({ message: 'Usuario modificado correctamente' });
  });
});

// Eliminar un usuario
router.delete('/name/:name', (req, res) => {
  const { name } = req.params;

  pool.query('DELETE FROM users WHERE name = $1', [name], (err, results) => {
    if (err) {
      console.error('Error al eliminar usuario:', err);
      return res.status(500).json({ message: 'Error al eliminar usuario' });
    }

    if (results.rowCount === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.status(200).json({ message: 'Usuario eliminado correctamente' });
  });
});

module.exports = router;
=======
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

// Obtener un usuario por nombre
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
router.put('/name/:name', (req, res) => {
  const { name } = req.params;
  const { email, password } = req.body;
 // Verificar que todos los campos estén presentes
  if (!email || !password) {
    return res.status(400).json({ message: 'Faltan datos para actualizar el usuario' });
  }

  // Ejecutar la consulta
  db.query(
    'UPDATE users SET email = ?, password = ? WHERE name = ?',
    [email, password, name],
    (err, results) => {
      if (err) {
        console.error('Error en la consulta:', err); // Log detallado del error en la consola
        return res.status(500).json({ message: 'Error al modificar usuario' });
      }

      // Verificar si algún usuario fue afectado
      if (results.affectedRows === 0) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      // Responder con éxito
      res.status(200).json({ message: 'Usuario modificado correctamente' });
    }
  );
});

// Eliminar un usuario
router.delete('/name/:name', (req, res) => {
  const { name } = req.params;

  db.query(
    'DELETE FROM users WHERE name = ?',
    [name],
    (err, results) => {
      if (err) {
        console.error('Error en la consulta:', err); // Imprimir el error en consola
        return res.status(500).json({ message: 'Error al eliminar usuario' });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      res.status(200).json({ message: 'Usuario eliminado correctamente' });
    }
  );
});

module.exports = router;
>>>>>>> aaf573794f644a8f6186d46474ce85e554563fe5
