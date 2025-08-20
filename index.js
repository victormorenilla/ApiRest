// index.js
const express = require('express');
const { Pool } = require('pg');  // Usamos Pool en lugar de Client para gestionar conexiones
const app = express();
const cors = require('cors');
const port = process.env.PORT || 8080;

// Habilitar CORS
app.use(cors());

// Configuración del pool de conexiones a la base de datos PostgreSQL (Neon)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Middleware para manejar datos en formato JSON
app.use(express.json());

// Importar las rutas
const userRoutes = require('./routes/users');

const termRoutes = require('./routes/terminals');

const opinionRoutes = require('./routes/opinions');

// Usar las rutas
app.use('/api/users', userRoutes);
app.use('/api/terminals', termRoutes);
app.use('/api/opinions', opinionRoutes);

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});
