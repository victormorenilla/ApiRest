// index.js
const express = require('express');
const mysql = require('mysql2');
const app = express();
const port = process.env.PORT || 3000;

// Configuración de la conexión a la base de datos MySQL
const connectionUrl = 'mysql://root:pjIJeIqjdTkiOTPhdeLJMdzdLTTfOctD@junction.proxy.rlwy.net:50532/railway';
const db = mysql.createConnection(connectionUrl);
// Probar la conexión a la base de datos
db.connect((err) => {
  if (err) {
    console.error('Error conectando a la base de datos:', err);
    return;
  }
  console.log('Conectado a la base de datos MySQL');
});

// Middleware para manejar datos en formato JSON
app.use(express.json());

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API REST funcionando correctamente');
});

// Ruta para obtener todos los usuarios de la tabla "usuarios"
app.get('/users', (req, res) => {
  db.query('SELECT * FROM users', (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al obtener los datos' });
    } else {
      res.json(results);
    }
  });
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});
