const express = require('express');
const { Pool } = require('pg');  // Usamos el paquete pg para PostgreSQL
const router = express.Router();

// Configuración de la conexión a la base de datos PostgreSQL (Neon)
const pool = new Pool({
  user: 'neondb_owner',         // Usuario proporcionado por Neon
  host: 'ep-red-thunder-a28kqfu5-pooler.eu-central-1.aws.neon.tech',  // Host proporcionado por Neon
  database: 'neondb',           // Nombre de tu base de datos en Neon
  password: 'npg_gbuyi2RmfzQ0',  // Contraseña proporcionada por Neon
  port: 5432,                   // Puerto por defecto de PostgreSQL
  ssl: { rejectUnauthorized: false },  // Conexión segura SSL
});

// Obtener todos los terminales
router.get('/', (req, res) => {
  pool.query('SELECT * FROM Terminales', (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error al consultar terminales' });
    }
    res.json(results.rows);  // Usamos results.rows para obtener los resultados
  });
});

// Obtener terminales por marca
router.get('/marca/:Marca', (req, res) => {
  const { Marca } = req.params;
  pool.query('SELECT * FROM Terminales WHERE Marca = $1', [Marca], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error al consultar terminales por marca' });
    }
    if (results.rows.length > 0) {
      res.json(results.rows);
    } else {
      res.status(404).json({ message: 'Marca no encontrada' });
    }
  });
});

// Obtener terminales por precio
router.get('/precio/:Precio', (req, res) => {
  const { Precio } = req.params;
  if (isNaN(Precio)) {
    return res.status(400).json({ message: 'El precio debe ser un número' });
  }
  pool.query('SELECT * FROM Terminales WHERE Precio < $1', [Precio], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error al consultar terminales por precio' });
    }
    if (results.rows.length > 0) {
      res.json(results.rows);
    } else {
      res.status(404).json({ message: 'No se encontraron terminales en este rango de precio' });
    }
  });
});

// Obtener un terminal por modelo
router.get('/:Modelo', (req, res) => {
  const { Modelo } = req.params;
  pool.query('SELECT * FROM Terminales WHERE Modelo = $1', [Modelo], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error al consultar terminal' });
    }
    if (results.rows.length > 0) {
      res.json(results.rows[0]);
    } else {
      res.status(404).json({ message: 'Modelo no encontrado' });
    }
  });
});

// Crear un nuevo terminal
router.post('/', (req, res) => {
  const { Marca, Modelo, Procesador, Imagen, Precio, descripcion } = req.body;

  // Validación básica de los campos
  if (!Marca || !Modelo || !Procesador || !Imagen || !Precio || !descripcion) {
    return res.status(400).json({ message: 'Marca, modelo, procesador, imagen, precio y descripción son requeridos.' });
  }

  // Consulta para insertar un nuevo terminal
  const query = 'INSERT INTO Terminales (Marca, Modelo, Procesador, Imagen, Precio, descripcion) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id';

  pool.query(query, [Marca, Modelo, Procesador, Imagen, Precio, descripcion], (err, results) => {
    if (err) {
      console.error('Error al crear terminal:', err);
      return res.status(500).json({ message: 'Error al crear terminal', error: err });
    }

    // Si se inserta correctamente, devolver la información del terminal creado
    res.status(201).json({
      id: results.rows[0].id,  // Usamos results.rows[0].id para obtener el ID insertado
      Marca,
      Modelo,
      Procesador,
      Imagen,
      Precio,
      descripcion
    });
  });
});

// Actualizar un terminal existente
router.put('/modelo/:Modelo', (req, res) => {
  const { Modelo } = req.params;
  const { Marca, Procesador, Imagen, Precio, descripcion } = req.body;

  // Verificar que todos los campos estén presentes
  if (!Marca || !Procesador || !Imagen || !Precio || !descripcion) {
    return res.status(400).json({ message: 'Faltan datos para actualizar el terminal' });
  }

  // Ejecutar la consulta
  const query = 'UPDATE Terminales SET Marca = $1, Procesador = $2, Imagen = $3, Precio = $4, descripcion = $5 WHERE Modelo = $6';

  pool.query(query, [Marca, Procesador, Imagen, Precio, descripcion, Modelo], (err, results) => {
    if (err) {
      console.error('Error al modificar terminal:', err);
      return res.status(500).json({ message: 'Error al modificar terminal' });
    }

    if (results.rowCount === 0) {
      return res.status(404).json({ message: 'Terminal no encontrado' });
    }

    // Responder con éxito
    res.status(200).json({ message: 'Terminal modificado correctamente' });
  });
});

// Eliminar un terminal
router.delete('/modelo/:Modelo', (req, res) => {
  const { Modelo } = req.params;

  const query = 'DELETE FROM Terminales WHERE Modelo = $1';

  pool.query(query, [Modelo], (err, results) => {
    if (err) {
      console.error('Error al eliminar terminal:', err);
      return res.status(500).json({ message: 'Error al eliminar terminal' });
    }

    if (results.rowCount === 0) {
      return res.status(404).json({ message: 'Terminal no encontrado' });
    }

    res.status(200).json({ message: 'Terminal eliminado correctamente' });
  });
});
/// buscar 
router.get('/buscar/:query', async (req, res) => {
  try {
    const { query } = req.params;
    let sql, values;
    
    if (!isNaN(query)) {
      // Si query es un número, filtra por un rango de precios ±100
      sql = `SELECT * FROM Terminales WHERE Precio BETWEEN $1 AND $2`;
      values = [Number(query) - 200, Number(query) + 200];
    } else {
      // Si query es un texto, buscar por marca o modelo
      sql = `SELECT * FROM Terminales WHERE Marca ILIKE $1 OR Modelo ILIKE $1`;
      values = [`%${query}%`];
    }

    const results = await pool.query(sql, values);
    
    if (results.rows.length > 0) {
      res.json(results.rows);
    } else {
      res.status(404).json({ message: 'No se encontraron terminales con ese criterio' });
    }
  } catch (err) {
    console.error('Error en la búsqueda:', err);
    res.status(500).json({ message: 'Error al buscar terminales' });
  }
});
module.exports = router;
