const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function crearOpinion(idUser, idTerminal, opinion) {
  try {
    const query = 'INSERT INTO opiniones ("idUser", "idTerminal", opinion) VALUES ($1, $2, $3) RETURNING *';
    const result = await pool.query(query, [idUser, idTerminal, opinion]);
    console.log('Opinión creada:', result.rows[0]);
  } catch (err) {
    console.error('Error al crear opinión:', err.message);
  } finally {
    await pool.end(); // cierra la conexión
  }
}

// Prueba la función
crearOpinion(3, 7, '¡Esta app es genial!');