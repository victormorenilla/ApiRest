// index.js
const express = require('express');
const mysql = require('mysql2');
const app = express();
const port = process.env.PORT || 8080;

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

// Importar las rutas
const userRoutes = require('./routes/users');
const termRoutes= require('./routes/terminals');
// Usar las rutas
app.use('/api/users', userRoutes);
app.use('/api/terminals', termRoutes);

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});
