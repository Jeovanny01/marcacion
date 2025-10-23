import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css'; // Importa los estilos CSS tradicionales
// Si index.js importa App.css, esta línea debe ser eliminada o comentada.

// URL base de tu API de Node.js/Express
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// --- FUNCIONES DE UTILIDAD ---
// 1. Obtiene la ubicación GPS
const getGeolocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("La geolocalización no está soportada por tu navegador."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitud: position.coords.latitude,
          longitud: position.coords.longitude
        });
      },
      (error) => {
        // Manejo de errores de GPS (ej: usuario deniega, timeout)
        reject(new Error(`Error de GPS (${error.code}): ${error.message}`));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
};

// --- COMPONENTES DE VISTA ---

// 1. Vista de Login
const LoginView = ({ setIsLoggedIn, setUserData, setMessage }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Hardcodeado para la prueba, reemplazar con llamada a tu API
    if (username === 'empleado' && password === '123') {
      const mockUserData = {
        id: 'EMP001',
        name: 'Carlos Pérez'
      };
      setIsLoggedIn(true);
      setUserData(mockUserData);
      setMessage({ type: 'success', text: 'Inicio de sesión exitoso. Redirigiendo...' });
      setLoading(false);
      return;
    }

    try {
      // --- INTEGRACIÓN REAL DEL LOGIN CON TU API (DEBE IR AQUI) ---
      // const response = await axios.post(`${API_BASE_URL}/login`, { username, password });
      // if (response.data.success) {
      //   setIsLoggedIn(true);
      //   setUserData(response.data.user);
      // } else {
      //   setMessage({ type: 'error', text: 'Usuario o contraseña incorrectos.' });
      // }
      // --- FIN INTEGRACIÓN REAL ---

      setMessage({ type: 'error', text: 'Credenciales incorrectas. Use empleado / 123 para probar.' });

    } catch (error) {
      console.error('Error de login:', error);
      setMessage({ type: 'error', text: 'Error al conectar con el servidor de autenticación.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Iniciar Sesión</h2>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="username">Usuario:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Contraseña:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Cargando...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
};

// 2. Vista de Marcación
const MarcacionView = ({ userData, setIsLoggedIn }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [capturing, setCapturing] = useState(true); // Controla si se está viendo la cámara o la foto
  const [imageData, setImageData] = useState(null); // Foto en Base64
  const [location, setLocation] = useState(null);
  const [message, setMessage] = useState(null);
  const [stream, setStream] = useState(null); // Estado para el stream de la cámara

  // Función combinada para detener la cámara y cerrar sesión
  const stopCameraAndLogout = () => {
    // Detiene el stream si está activo
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    // Cierra la sesión
    setIsLoggedIn(false);
  };

  useEffect(() => {
    // FUNCIÓN ASÍNCRONA PARA INICIALIZAR CÁMARA Y GPS
    const initializeCameraAndGPS = async () => {
        // 1. Obtener Ubicación
        try {
            const loc = await getGeolocation();
            setLocation(loc);
        } catch (err) {
            setMessage({ type: 'error', text: `Error de ubicación: ${err.message}` });
        }

        // 2. Activar Cámara solo si estamos en modo captura y NO hay un stream activo
        if (capturing && !stream) {
            try {
                const currentStream = await navigator.mediaDevices.getUserMedia({ 
                    video: { width: 320, height: 240, facingMode: 'user' } 
                });
                
                // ASIGNACIÓN CRÍTICA: Asignar el stream al elemento de video
                if (videoRef.current) {
                    videoRef.current.srcObject = currentStream;
                }
                setStream(currentStream);

            } catch (err) {
                setMessage({ type: 'error', text: `Error al acceder a la cámara: ${err.name} - ${err.message}` });
            }
        }
    };

    initializeCameraAndGPS();
    
    // Limpieza: Esta función se ejecuta cuando el componente se desmonta (al hacer logout)
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [capturing]); // Solo dependemos de 'capturing'. 'stream' es manejado internamente.

  // Captura la foto
  const handleCapture = () => {
    // CRÍTICO: Asegurarse de que el video ya esté cargado y el stream activo
    if (videoRef.current && canvasRef.current && stream) {
      const context = canvasRef.current.getContext('2d');
      const video = videoRef.current;
      
      // Ajusta el canvas al tamaño del video
      canvasRef.current.width = video.videoWidth;
      canvasRef.current.height = video.videoHeight;
      
      context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
      
      // Convierte el contenido del canvas a Base64
      const imgBase64 = canvasRef.current.toDataURL('image/jpeg', 0.8);
      
      setImageData(imgBase64);
      setCapturing(false);
      
      // Detiene la cámara después de tomar la foto
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null); 
      }
    } else {
        // Muestra un mensaje si falla la captura (ej: cámara no lista)
        setMessage({ type: 'warning', text: 'La cámara aún no está lista o no se obtuvieron permisos.' });
    }
  };

  // Envía los datos al Backend (Node.js/SQL Server)
  const handleMark = async (type) => {
    if (!imageData || !location) {
      setMessage({ type: 'warning', text: 'Debe capturar la foto y obtener la ubicación primero.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    const payload = {
      empleadoId: userData.id,
      nombre: userData.name,
      fechaHora: new Date().toISOString(),
      latitud: location.latitud,
      longitud: location.longitud,
      // Solo enviamos la parte del Base64 sin el prefijo "data:image/jpeg;base64,"
      fotoBase64: imageData.split(',')[1], 
      tipoMarcacion: type // 'Entrada' o 'Salida'
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/marcar`, payload);

      if (response.status === 200) {
        setMessage({ type: 'success', text: `Marcación de ${type} exitosa! Servidor respondió: ${response.data.message}` });
        // Reiniciar el estado de captura para la próxima marcación
        setTimeout(() => {
            setImageData(null); // Limpiar foto anterior
            setCapturing(true); 
        }, 3000); 
      } else {
        setMessage({ type: 'error', text: `Error al marcar. Estatus: ${response.status}` });
      }

    } catch (error) {
      console.error('Error de marcación:', error.response ? error.response.data : error.message);
      setMessage({ type: 'error', text: `Error al conectar con la API o al guardar datos. Revise la consola del servidor.` });
    } finally {
      setLoading(false);
    }
  };

  const handleRepeatCapture = () => {
    // Reinicia el estado de captura, lo que activa el useEffect para encender la cámara de nuevo
    setImageData(null);
    setCapturing(true); 
  };

  return (
    <div className="marcacion-card">
      <div className="marcacion-header">
        <h2>Bienvenido, {userData.name}</h2>
        <button className="logout-btn" onClick={stopCameraAndLogout}>
          Cerrar Sesión
        </button>
      </div>

      <p className="status-text">
        Ubicación: {location ? `Lat: ${location.latitud.toFixed(4)}, Lon: ${location.longitud.toFixed(4)}` : 'Obteniendo GPS...'}
      </p>

      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="capture-area">
        {capturing ? (
          <>
            {/* Solo muestra el video si el stream está cargando o activo */}
            <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="video-stream"
                style={{ display: stream ? 'block' : 'none' }}
            ></video>

            <button 
              onClick={handleCapture} 
              disabled={loading || !location || !stream} // CRÍTICO: Solo activo si hay stream
              className="capture-button"
            >
              Tomar Foto
            </button>
            {!location && <div className="loading-overlay">Obteniendo Ubicación...</div>}
            {!stream && <div className="loading-overlay">Esperando Cámara...</div>}
          </>
        ) : (
          <div className="captured-image-container">
            <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
            <img src={imageData} alt="Foto Capturada" className="captured-image" />
            
            <div className="action-buttons">
              <button onClick={handleRepeatCapture} className="repeat-button" disabled={loading}>
                Repetir Captura
              </button>
              
              <button 
                onClick={() => handleMark('Entrada')} 
                disabled={loading || !imageData || !location}
                className="mark-button entrada"
              >
                {loading ? 'Enviando...' : 'MARCAR ENTRADA'}
              </button>

              <button 
                onClick={() => handleMark('Salida')} 
                disabled={loading || !imageData || !location}
                className="mark-button salida"
              >
                {loading ? 'Enviando...' : 'MARCAR SALIDA'}
              </button>
            </div>
          </div>
        )}
      </div>
      <p className="info-text">Fecha y Hora de Marcación: {new Date().toLocaleString()}</p>
    </div>
  );
};


// 3. Componente Principal (App)
const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [message, setMessage] = useState(null); // Mensaje global (para Login)

  useEffect(() => {
    // Limpia el mensaje al cambiar el estado
    if (message) {
        const timer = setTimeout(() => setMessage(null), 5000);
        return () => clearTimeout(timer);
    }
  }, [message]);

  // Si no está logueado, muestra el login. Si está logueado, muestra la marcación.
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Ferretería El Amigo - Sistema de Marcación</h1>
      </header>
      <main className="app-main">
        {!isLoggedIn ? (
          <LoginView 
            setIsLoggedIn={setIsLoggedIn} 
            setUserData={setUserData} 
            setMessage={setMessage}
          />
        ) : (
          <MarcacionView 
            userData={userData} 
            setIsLoggedIn={setIsLoggedIn}
          />
        )}
      </main>
      <footer className="app-footer">
        <p>&copy; 2025 Ferretería El Amigo - Sistema de Marcación. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};

export default App;