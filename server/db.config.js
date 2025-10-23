// db.config.js
const sql = require('mssql');

// --- ¡CORRECCIÓN EN LAS PROPIEDADES 'server' y 'port'! ---
const config = {
    user: 'sa', 
    password: 'ancw95', 
    server: '209.145.54.199', // ¡SOLO LA IP/HOSTNAME!
    port: 10033,             // ¡EL PUERTO VA AQUÍ COMO NÚMERO!
    database: 'EMPRESAS', 
    options: {
        encrypt: false, 
        trustServerCertificate: true 
    }
};

// Crea un pool de conexión
const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log('Conectado a SQL Server');
        return pool;
    })
    .catch(err => {
        // Muestra el error, pero no bloquea el inicio del servidor
        console.error('Error de conexión a la Base de Datos:', err.message); 
    });

module.exports = {
    sql,
    poolPromise
};
