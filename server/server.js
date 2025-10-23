const express = require('express');
const cors = require('cors'); // Necesario para permitir que React (puerto 3000) hable con Node.js (puerto 5000)
const { poolPromise, sql } = require('./db.config'); // Importamos la configuración y el objeto 'sql'
// Para manejar datos grandes como la foto en Base64
const bodyParser = require('body-parser'); 

const app = express();
const port = 5000;

// Configuración de Middlewares
app.use(cors()); // Habilita CORS para el frontend
// Aumentamos el límite de payload para manejar la foto en Base64
app.use(bodyParser.json({ limit: '50mb' })); 
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Ruta de prueba - Verifica la conexión a SQL Server al ser accedida
app.get('/', async (req, res) => {
    try {
        await poolPromise; // Intenta resolver la promesa del pool de conexión
        res.status(200).send('Servidor de Ferretería El Amigo funcionando. Estatus de SQL Server: CONECTADO.');
    } catch (err) {
        // Si hay un error, el servidor está funcionando, pero la DB no está accesible
        // El error detallado se muestra en la consola del servidor
        res.status(503).send(`Servidor de Ferretería El Amigo funcionando. Estatus de SQL Server: ERROR DE CONEXIÓN. Revise la consola del servidor.`);
    }
});

// Ruta donde recibirás los datos de marcación
app.post('/api/marcar', async (req, res) => {
    // Los datos se reciben del frontend (React)
    const { empleadoId, tipoMarcacion, latitud, longitud, fotoBase64 } = req.body;
    
    // Asumimos que la fecha y hora se capturan en el frontend y se envían, 
    // o se usa la hora del servidor (como lo hacemos aquí).
    const fechaHoraServidor = new Date();

    // NOTA IMPORTANTE: 
    // Si la foto Base64 es muy grande, es mejor guardarla como archivo (.jpg/.png) 
    // en una carpeta del servidor o en un servicio en la nube (S3, Azure Blob, etc.) 
    // y solo enviar la RUTA (URL) a la base de datos.
    //
    // LÓGICA DE EJEMPLO: Por simplicidad, aquí usaremos la data directamente.
    // En una aplicación real, reemplaza esta sección con tu lógica de guardado de fotos.
    const rutaFoto = `marcada_${empleadoId}_${Date.now()}.jpg`; // Placeholder de la ruta

    try {
        const pool = await poolPromise; // Espera a que la conexión esté lista

        // --- Ejecución del Stored Procedure en SQL Server ---
        const result = await pool.request()
            .input('EmpleadoID', sql.Int, empleadoId)
            .input('FechaHora', sql.DateTime, fechaHoraServidor) 
            .input('TipoMarcacion', sql.VarChar(50), tipoMarcacion) // 'Entrada' o 'Salida'
            .input('Latitud', sql.Decimal(9, 6), latitud)
            .input('Longitud', sql.Decimal(9, 6), longitud)
            .input('RutaFoto', sql.VarChar(255), rutaFoto) // Se podría enviar la fotoBase64 aquí si el SP lo maneja
            .execute('SP_REGISTRAR_MARCACION'); // <--- ¡CAMBIA ESTE NOMBRE POR EL DE TU SP!

        // Respuesta exitosa
        res.status(200).json({
            message: 'Marcación registrada correctamente en la base de datos.',
            result: result.recordset
        });

    } catch (err) {
        console.error('Error al ejecutar SP_REGISTRAR_MARCACION:', err);
        // Error de la base de datos o de la conexión
        res.status(500).json({
            error: 'Ocurrió un error en el servidor o en la base de datos al registrar la marcación.',
            details: err.message
        });
    }
});

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});