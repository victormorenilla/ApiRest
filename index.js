// index.js
const express = require('express');
const { Pool } = require('pg');  // Usamos Pool en lugar de Client para gestionar conexiones
const app = express();
const port = process.env.PORT || 8080;

// Configuración del pool de conexiones a la base de datos PostgreSQL (Neon)
const pool = new Pool({
  user: 'neondb_owner',         // Usuario proporcionado por Neon
  host: 'ep-red-thunder-a28kqfu5-pooler.eu-central-1.aws.neon.tech',  // Host proporcionado por Neon
  database: 'neondb',           // Nombre de tu base de datos en Neon
  password: 'npg_gbuyi2RmfzQ0',  // Contraseña proporcionada por Neon
  port: 5432,                   // Puerto por defecto de PostgreSQL
  ssl: { rejectUnauthorized: false },  // Conexión segura SSL
});

// Middleware para manejar datos en formato JSON
app.use(express.json());

// Importar las rutas
const userRoutes = require('./routes/users');
const termRoutes = require('./routes/terminals');

// Usar las rutas
app.use('/api/users', userRoutes);
app.use('/api/terminals', termRoutes);

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});
